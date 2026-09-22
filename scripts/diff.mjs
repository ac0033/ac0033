#!/usr/bin/env node
// 比对「GitHub 现状」与「profile.yml + 上一版快照」，输出漂移报告：
//   drift.json —— 机器可读，供 apply / agent / workflow 判断
//   drift.md   —— 人可读，供 Issue 正文
//
// 变更分为三类：
//   mechanical —— 可自动处理（归档状态等）
//   semantic   —— 需要判断（新仓库、表述、文章）
//   info       —— 仅提示
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARTICLES = join(ROOT, "articles");

function readJson(p) {
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
}

function gitShow(rel) {
  try {
    return JSON.parse(execFileSync("git", ["show", `HEAD:${rel}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    return null;
  }
}

const profile = parse(readFileSync(join(ROOT, "profile.yml"), "utf8"));
const owner = profile.owner;
const current = readJson(join(ROOT, "data", "repos.json"));
if (!current) {
  console.error("diff: 缺少 data/repos.json，请先运行 npm run collect");
  process.exit(1);
}
const full = readJson(join(ROOT, "data", "repos.latest.json"));
const previous = gitShow("data/repos.json");

const pub = current.repos ?? {};
const fullRepos = full?.repos ?? pub;
const prev = previous?.repos ?? {};

// ---- 从 profile.yml 中提取被引用的仓库及其状态 ----
const refs = new Set();
const statusMap = new Map();
const urlRe = new RegExp(`github\\.com/${owner}/([\\w.-]+)`, "g");

function walk(node) {
  if (Array.isArray(node)) {
    const repoCells = node.filter((c) => c && typeof c === "object" && typeof c.repo === "string");
    const statusCell = node.find((c) => c && typeof c === "object" && typeof c.status === "string");
    for (const c of repoCells) {
      refs.add(c.repo);
      if (statusCell) statusMap.set(c.repo, statusCell.status);
    }
    node.forEach(walk);
    return;
  }
  if (node && typeof node === "object") {
    if (typeof node.repo === "string") refs.add(node.repo);
    if (typeof node.repo === "string" && typeof node.status === "string") statusMap.set(node.repo, node.status);
    for (const v of Object.values(node)) {
      if (typeof v === "string") {
        for (const m of v.matchAll(urlRe)) refs.add(m[1]);
      } else {
        walk(v);
      }
    }
  }
}
walk(profile);

// ---- 计算漂移 ----
const items = [];

for (const name of Object.keys(pub)) {
  if (name === owner) continue; // 首页仓库自身不计
  if (!refs.has(name)) {
    items.push({
      type: "repo_new",
      action: "semantic",
      repo: name,
      detail: `新公开仓库 ${name} 未出现在首页`,
      suggestion: "确认分类，补一句“解决什么问题 / 主要内容”，或放入对应表格",
    });
  }
}

for (const name of refs) {
  if (pub[name]) continue;
  if (fullRepos[name]?.private) {
    items.push({
      type: "repo_private",
      action: "info",
      repo: name,
      detail: `首页引用了私有仓库 ${name}`,
      suggestion: "确认是否保留占位（status: planned/wip），避免公开链接失效",
    });
  } else {
    items.push({
      type: "repo_missing",
      action: "semantic",
      repo: name,
      detail: `首页引用的仓库 ${name} 不在公开列表中（已删除 / 改名 / 转私有）`,
      suggestion: "核对链接；改名则更新，删除则移除或改为占位",
    });
  }
}

for (const [name, status] of statusMap) {
  const repo = pub[name];
  if (!repo) continue;
  if (repo.archived && status !== "archived") {
    items.push({
      type: "repo_archived",
      action: "mechanical",
      repo: name,
      detail: `${name} 已在 GitHub 归档，首页状态仍为 "${status}"`,
      suggestion: "status → archived",
    });
  }
  if (!repo.archived && status === "archived") {
    items.push({
      type: "repo_unarchived",
      action: "mechanical",
      repo: name,
      detail: `${name} 已取消归档，首页状态仍为 "archived"`,
      suggestion: "status → active",
    });
  }
}

for (const name of Object.keys(pub)) {
  if (!refs.has(name)) continue;
  const before = prev[name]?.description ?? "";
  const after = pub[name].description ?? "";
  if (before && after && before !== after) {
    items.push({
      type: "repo_description_changed",
      action: "semantic",
      repo: name,
      before,
      after,
      detail: `${name} 的仓库简介已更新`,
      suggestion: "判断首页表述是否需要同步（首页以 profile.yml 为准）",
    });
  }
}

// README / release 变化：不改 About 描述，但说明项目有实质更新。
// 首次引入 readme_sha 时 prev 缺失，自动跳过；网络抖动已由 collect 回退旧值。
for (const name of Object.keys(pub)) {
  if (!refs.has(name)) continue;
  const p = prev[name];
  const c = pub[name];
  if (!p) continue;
  if (p.readme_sha && c.readme_sha && p.readme_sha !== c.readme_sha) {
    items.push({
      type: "repo_readme_changed",
      action: "semantic",
      repo: name,
      url: c.url,
      detail: `${name} 的 README 已更新`,
      suggestion: "打开仓库看改了什么，判断首页的“一句话定位 / 主要内容”是否需要同步",
    });
  }
  // release 字段首次引入时 prev 里不存在，需跳过（用 null 表示“无 release”，故按字段是否存在判断）
  if (Object.prototype.hasOwnProperty.call(p, "release") && c.release && c.release !== (p.release ?? null)) {
    items.push({
      type: "repo_released",
      action: "semantic",
      repo: name,
      url: c.url,
      detail: `${name} 发布了新版本 ${c.release}`,
      suggestion: "看是否需要更新首页表述或状态",
    });
  }
}

const articleFiles = new Set((profile.writing?.articles ?? []).map((a) => a.file));
if (existsSync(ARTICLES)) {
  for (const f of readdirSync(ARTICLES).filter((f) => f.endsWith(".md"))) {
    const rel = `articles/${f}`;
    if (!articleFiles.has(rel)) {
      items.push({
        type: "article_new",
        action: "semantic",
        file: rel,
        detail: `新增文章 ${rel} 未加入首页`,
        suggestion: "补充标题与一句话摘要",
      });
    }
  }
}
for (const f of articleFiles) {
  if (!existsSync(join(ROOT, f))) {
    items.push({
      type: "article_missing",
      action: "semantic",
      file: f,
      detail: `首页引用的文章文件不存在：${f}`,
      suggestion: "修正路径或移除条目",
    });
  }
}

const order = { mechanical: 0, semantic: 1, info: 2 };
items.sort((a, b) => (order[a.action] - order[b.action]) || String(a.repo ?? a.file).localeCompare(String(b.repo ?? b.file)));

const actionable = items.filter((i) => i.action !== "info");
const drift = {
  generatedAt: new Date().toISOString(),
  owner,
  hasDrift: actionable.length > 0,
  counts: {
    mechanical: items.filter((i) => i.action === "mechanical").length,
    semantic: items.filter((i) => i.action === "semantic").length,
    info: items.filter((i) => i.action === "info").length,
  },
  items,
};
writeFileSync(join(ROOT, "drift.json"), JSON.stringify(drift, null, 2) + "\n", "utf8");

// ---- 人可读报告 ----
const sections = [
  ["mechanical", "🔧 可自动处理 · mechanical"],
  ["semantic", "✍️ 需要判断 · semantic"],
  ["info", "ℹ️ 提示 · info"],
];
const lines = [
  `# 首页同步检查 · ${drift.generatedAt.slice(0, 10)}`,
  "",
  `共 ${items.length} 项（mechanical ${drift.counts.mechanical} · semantic ${drift.counts.semantic} · info ${drift.counts.info}）。`,
  "",
];
for (const [action, title] of sections) {
  const group = items.filter((i) => i.action === action);
  if (group.length === 0) continue;
  lines.push(`## ${title}`, "");
  for (const i of group) {
    lines.push(`- [ ] ${i.detail}`);
    if (i.url) lines.push(`  - 仓库：${i.url}`);
    if (i.before && i.after) {
      lines.push(`  - 旧：${i.before}`);
      lines.push(`  - 新：${i.after}`);
    }
    if (i.suggestion) lines.push(`  - 建议：${i.suggestion}`);
  }
  lines.push("");
}
if (items.length === 0) lines.push("一切同步，无需处理。", "");
writeFileSync(join(ROOT, "drift.md"), lines.join("\n"), "utf8");

console.log(`diff: ${items.length} 项漂移（mechanical ${drift.counts.mechanical} · semantic ${drift.counts.semantic} · info ${drift.counts.info}）`);
process.exit(0);
