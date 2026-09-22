#!/usr/bin/env node
// 步骤 3：用 Jev 校验 Agent 对 profile.yml 的改动是否忠于仓库事实。
//
// 读取 `git diff HEAD -- profile.yml` 的新增/修改行，按行中的 repo 关联来源
// （仓库 description + README 摘要），逐条问 Noul：来源是否支持该说法。
//
// 产物：
//   jev.verify.payload.json —— 请求体（dry-run 也用）
//   jev.verify.json         —— 校验结果
// 退出码：有任一校验未通过（低于阈值）则为 1，供流水线阻断。
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";
import { systemOne, noul, choice, DEFAULT_MODEL } from "./typesafe.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PASS = Number(process.env.JEV_VERIFY_PASS ?? 0.5);

const profile = parse(readFileSync(join(ROOT, "profile.yml"), "utf8"));
const owner = profile.owner;
// 只用公开快照作为校验来源：不得把私有仓库的描述/README 发给第三方模型。
const pub = existsSync(join(ROOT, "data", "repos.json"))
  ? JSON.parse(readFileSync(join(ROOT, "data", "repos.json"), "utf8")).repos
  : {};

let diff = "";
try {
  diff = execFileSync("git", ["diff", "-U0", "HEAD", "--", "profile.yml"], { cwd: ROOT, encoding: "utf8" });
} catch {
  diff = "";
}
const added = diff
  .split("\n")
  .filter((l) => l.startsWith("+") && !l.startsWith("+++"))
  .map((l) => l.slice(1).trim())
  .filter(Boolean);

const urlRe = new RegExp(`github\\.com/${owner}/([\\w.-]+)`);
const changes = [];
for (const line of added) {
  const repo = line.match(/repo:\s*([\w.-]+)/)?.[1] ?? line.match(urlRe)?.[1];
  if (repo) changes.push({ repo, claim: line });
}

if (changes.length === 0) {
  console.log("jev-verify: profile.yml 没有可校验的改动");
  process.exit(0);
}

// 每个仓库的来源只取一次
const readmeCache = new Map();
function readmeExcerpt(repo) {
  if (!pub[repo]) return ""; // 非公开仓库不取来源，避免外泄
  if (readmeCache.has(repo)) return readmeCache.get(repo);
  let text = "";
  try {
    text = execFileSync("gh", ["api", "-H", "Accept: application/vnd.github.raw", `repos/${owner}/${repo}/readme`], {
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    }).slice(0, 1500);
  } catch {
    text = "";
  }
  readmeCache.set(repo, text);
  return text;
}

const state = {
  owner,
  changes: changes.map((c) => ({
    repo: c.repo,
    claim: c.claim,
    source: { description: pub[c.repo]?.description ?? "", readme_excerpt: readmeExcerpt(c.repo) },
  })),
};

const questions = {};
state.changes.forEach((_, i) => {
  questions[`supported_${i}`] = noul(
    {
      claim: `changes[${i}].claim`,
      source: `changes[${i}].source`,
      question: "`source` 是否支持 `claim` 中对项目的事实性描述（不夸大、不虚构、不矛盾）？",
    },
    { true: "source 明确支持，或可由 source 合理推出", false: "source 不支持、相矛盾，或无法验证" },
  );
  questions[`kind_${i}`] = choice({ claim: `changes[${i}].claim`, source: `changes[${i}].source`, question: "`claim` 与 `source` 的关系属于哪种？" }, {
    supported: "说法与来源一致",
    overstated: "来源沾边，但说法夸大了",
    unsupported: "来源里找不到这个说法",
    unclear: "来源信息不足以判断",
  });
});

const payload = { state, model: DEFAULT_MODEL, questions };
writeFileSync(join(ROOT, "jev.verify.payload.json"), JSON.stringify(payload, null, 2) + "\n", "utf8");

if (!process.env.TYPESAFE_API_KEY) {
  console.log(`jev-verify: dry-run（无 TYPESAFE_API_KEY），已写出 jev.verify.payload.json`);
  console.log(`  待校验改动 ${changes.length} 条，model=${DEFAULT_MODEL}，通过阈值 noul ≥ ${PASS}`);
  process.exit(0);
}

const res = await systemOne(payload);
const results = state.changes.map((c, i) => {
  const sup = res.answers?.[`supported_${i}`]?.noul ?? null;
  const kind = res.answers?.[`kind_${i}`]?.choice ?? null;
  return { repo: c.repo, claim: c.claim, supported: sup, kind, pass: sup !== null && sup >= PASS };
});
const failed = results.filter((r) => !r.pass);
writeFileSync(
  join(ROOT, "jev.verify.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), model: res.model, usage: res.usage, pass_threshold: PASS, results }, null, 2) + "\n",
  "utf8",
);

console.log(`jev-verify: model=${res.model} tokens=${res.usage?.input_tokens}/${res.usage?.output_tokens}`);
for (const r of results) {
  console.log(`  ${r.pass ? "✓" : "✗"} ${r.repo}  p=${r.supported?.toFixed(2)} kind=${r.kind}`);
}
console.log(`jev-verify: ${results.length - failed.length}/${results.length} 通过`);
if (failed.length > 0) {
  console.error(`jev-verify: ${failed.length} 条未通过，应阻断并交人工复核`);
  process.exit(1);
}
