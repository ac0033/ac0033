#!/usr/bin/env node
// 根据 drift.json 中的 mechanical 项，定点修改 profile.yml。
//
// 只做行级替换（不改动 YAML 排版、不丢注释）：
//   在同一行同时包含 `repo: <name>` 与 `status:` 时，替换该 status 值。
// 找不到唯一匹配就跳过并告警，交由人 / Agent 处理，绝不猜。
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROFILE = join(ROOT, "profile.yml");
const DRIFT = join(ROOT, "drift.json");

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

if (!existsSync(DRIFT)) {
  console.log("apply: 未找到 drift.json，先运行 npm run diff");
  process.exit(0);
}
const drift = JSON.parse(readFileSync(DRIFT, "utf8"));
const mechanical = (drift.items ?? []).filter((i) => i.action === "mechanical");
if (mechanical.length === 0) {
  console.log("apply: 没有可自动处理的变更");
  process.exit(0);
}

const lines = readFileSync(PROFILE, "utf8").split("\n");
const applied = [];
const skipped = [];

for (const item of mechanical) {
  const target = item.type === "repo_archived" ? "archived" : item.type === "repo_unarchived" ? "active" : null;
  if (!target) {
    skipped.push({ item, reason: `未知的 mechanical 类型 ${item.type}` });
    continue;
  }
  const repoRe = new RegExp(`(^|[\\s\\[{,])(repo:\\s*${esc(item.repo)})(\\s*[,}])`);
  const withStatus = [];
  lines.forEach((line, i) => {
    if (repoRe.test(line) && /(^|[\s\[{,])status:\s*[A-Za-z_][\w-]*/.test(line)) withStatus.push(i);
  });

  if (withStatus.length === 0) {
    skipped.push({ item, reason: "未找到同时包含 repo 与 status 的行" });
    continue;
  }
  if (withStatus.length > 1) {
    skipped.push({ item, reason: "匹配到多行，已跳过" });
    continue;
  }

  const i = withStatus[0];
  const next = lines[i].replace(/(status:\s*)([A-Za-z_][\w-]*)/, `$1${target}`);
  if (next !== lines[i]) {
    lines[i] = next;
    applied.push({ repo: item.repo, status: target });
  }
}

if (applied.length > 0) writeFileSync(PROFILE, lines.join("\n"), "utf8");

for (const a of applied) console.log(`apply: ${a.repo} → status: ${a.status}`);
for (const s of skipped) console.warn(`apply: 跳过 ${s.item.repo ?? s.item.type}（${s.reason}），需人工或 Agent 处理`);
console.log(`apply: 应用 ${applied.length} 项，跳过 ${skipped.length} 项`);
