#!/usr/bin/env node
// 采集所有者全部仓库的事实，写入：
//   data/repos.json       —— 公开项目的稳定快照（提交进仓库，作为下次 diff 的基线）
//                            含 README 内容哈希与最新 release，用于发现“README/发版了但描述没变”
//   data/repos.latest.json —— 含私有仓库的完整事实（.gitignore，仅供运行期判断）
//
// 依赖：已登录的 gh（CI 中通过 GH_TOKEN 环境变量提供）
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIELDS = [
  "name",
  "description",
  "url",
  "isArchived",
  "isPrivate",
  "isFork",
  "primaryLanguage",
  "pushedAt",
  "stargazerCount",
  "repositoryTopics",
  "homepageUrl",
].join(",");

function normalize(r) {
  return {
    name: r.name,
    url: r.url,
    description: r.description ?? "",
    archived: Boolean(r.isArchived),
    private: Boolean(r.isPrivate),
    fork: Boolean(r.isFork),
    language: r.primaryLanguage?.name ?? null,
    pushedAt: r.pushedAt ?? null,
    stars: r.stargazerCount ?? 0,
    topics: (r.repositoryTopics ?? []).map((t) => t.name ?? t),
    homepage: r.homepageUrl || "",
  };
}

function byName(list) {
  const out = {};
  for (const r of [...list].sort((a, b) => a.name.localeCompare(b.name))) out[r.name] = r;
  return out;
}

// ---- 认证（本地用 gh auth token，CI 用 GH_TOKEN）----
function authToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}
const TOKEN = authToken();

async function api(path, accept) {
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: {
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      Accept: accept ?? "application/vnd.github+json",
      "User-Agent": "ac0033-profile-collect",
    },
  });
  return res;
}

// README 内容哈希 + 最新 release；失败时回退到旧值，避免网络抖动造成误报
async function extraFacts(owner, name, prev) {
  const out = { readme_sha: prev?.readme_sha ?? null, release: prev?.release ?? null };

  try {
    const res = await api(`repos/${owner}/${name}/readme`, "application/vnd.github.raw");
    if (res.ok) {
      const text = (await res.text()).replace(/\r\n/g, "\n").trim();
      out.readme_sha = createHash("sha256").update(text).digest("hex").slice(0, 12);
    } else if (res.status === 404) {
      out.readme_sha = null;
    }
    // 其它状态码（网络/限流）保留旧值
  } catch {
    /* 保留旧值 */
  }

  try {
    const res = await api(`repos/${owner}/${name}/releases/latest`);
    if (res.ok) {
      out.release = (await res.json()).tag_name ?? null;
    } else if (res.status === 404) {
      out.release = null;
    }
  } catch {
    /* 保留旧值 */
  }

  return out;
}

const { owner } = parse(readFileSync(join(ROOT, "profile.yml"), "utf8"));
if (!owner) {
  console.error("collect: profile.yml 缺少 owner");
  process.exit(1);
}

let raw;
try {
  raw = execFileSync("gh", ["repo", "list", owner, "--limit", "500", "--json", FIELDS], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
} catch (e) {
  console.error("collect: 调用 gh 失败，请确认已登录且 GH_TOKEN 可用");
  console.error(e.stderr?.toString?.() || e.message);
  process.exit(1);
}

const all = JSON.parse(raw).map(normalize);
// 首页仓库自身不属于展示项目，且其 pushedAt 会因本流程的提交而反复变化，故排除。
const publicProjects = all.filter((r) => !r.private && r.name !== owner);

const PUBLIC = join(ROOT, "data", "repos.json");
const existing = existsSync(PUBLIC) ? JSON.parse(readFileSync(PUBLIC, "utf8")) : null;

// 提交的快照只保留“漂移检测需要且稳定”的字段，避免 pushedAt / stars 等高频字段造成每天无意义提交。
const stable = (r) => ({
  name: r.name,
  url: r.url,
  description: r.description,
  archived: r.archived,
  fork: r.fork,
  readme_sha: r.readme_sha ?? null,
  release: r.release ?? null,
});

const enriched = await Promise.all(
  publicProjects.map(async (r) => ({ ...r, ...(await extraFacts(owner, r.name, existing?.repos?.[r.name])) })),
);
const reposObj = {};
for (const r of [...enriched].sort((a, b) => a.name.localeCompare(b.name))) reposObj[r.name] = stable(r);

const changed = !existing || JSON.stringify(existing.repos) !== JSON.stringify(reposObj);
const generatedAt = changed ? new Date().toISOString() : existing.generatedAt;

mkdirSync(join(ROOT, "data"), { recursive: true });
writeFileSync(
  PUBLIC,
  JSON.stringify({ generatedAt, owner, count: publicProjects.length, repos: reposObj }, null, 2) + "\n",
  "utf8",
);
// 完整事实（含 pushedAt/语言/stars/私有）不提交，仅供运行期使用。
writeFileSync(
  join(ROOT, "data", "repos.latest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), owner, repos: byName(all) }, null, 2) + "\n",
  "utf8",
);

console.log(
  `collect: 公开项目 ${publicProjects.length} 个，全部仓库 ${all.length} 个（含私有）${changed ? "，快照已更新" : "，快照无变化"}`,
);
