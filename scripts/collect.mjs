#!/usr/bin/env node
// 通过 gh CLI 采集所有者全部仓库的机械事实，写入：
//   data/repos.json       —— 公开仓库快照（提交进仓库，作为下次 diff 的基线）
//   data/repos.full.json  —— 含私有仓库（.gitignore，仅用于判断“引用的是私有仓库”）
//
// 依赖：已登录的 gh（CI 中通过 GH_TOKEN 环境变量提供）
import { execFileSync } from "node:child_process";
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
const pub = all.filter((r) => !r.private);
const reposObj = byName(pub);

// 仓库事实未变时保留旧快照与时间戳，避免每天产生无意义提交。
const PUBLIC = join(ROOT, "data", "repos.json");
const existing = existsSync(PUBLIC) ? JSON.parse(readFileSync(PUBLIC, "utf8")) : null;
const changed = !existing || JSON.stringify(existing.repos) !== JSON.stringify(reposObj);
const generatedAt = changed ? new Date().toISOString() : existing.generatedAt;

mkdirSync(join(ROOT, "data"), { recursive: true });
writeFileSync(
  PUBLIC,
  JSON.stringify({ generatedAt, owner, count: pub.length, repos: reposObj }, null, 2) + "\n",
  "utf8",
);
writeFileSync(
  join(ROOT, "data", "repos.full.json"),
  JSON.stringify({ generatedAt, owner, repos: byName(all) }, null, 2) + "\n",
  "utf8",
);

console.log(`collect: 公开 ${pub.length} 个仓库，全部 ${all.length} 个（含私有）${changed ? "，快照已更新" : "，快照无变化"}`);
