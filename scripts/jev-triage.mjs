#!/usr/bin/env node
// 步骤 1：用 Jev 对语义漂移做判断（分类 / 是否值得处理），产出结构化决策。
//
// 只处理 drift.json 中 action: semantic 的项；mechanical 已由 apply.mjs 处理。
// 没有 TYPESAFE_API_KEY 时进入 dry-run：写出真实请求体，便于在 Playground 验证。
//
// 产物：
//   jev.triage.payload.json  —— 将要发送的请求（dry-run 也用）
//   jev.triage.json          —— 结构化决策（有 key 时）
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";
import { systemOne, noul, choice, DEFAULT_MODEL } from "./typesafe.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p, fallback = null) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), "utf8") : fallback);
const readJson = (p, fallback = null) => (existsSync(join(ROOT, p)) ? JSON.parse(readFileSync(join(ROOT, p), "utf8")) : fallback);

// 阈值：在真实数据上校准，不要照抄。confidence 是分布集中度，不等于正确。
const TH = {
  choice: Number(process.env.JEV_ROUTE_CONFIDENCE ?? 0.55),
  noul: Number(process.env.JEV_NOUL ?? 0.6),
};

const profile = parse(read("profile.yml"));
const drift = readJson("drift.json");
if (!drift) {
  console.error("jev-triage: 缺少 drift.json，请先运行 npm run diff");
  process.exit(1);
}
const pub = readJson("data/repos.json", { repos: {} }).repos;

const sectionRubric = (s) => {
  const lead = (s.blocks ?? []).find((b) => b.type === "text")?.value ?? "";
  return `${s.heading}${lead ? `：${lead}` : ""}`;
};
const sections = (profile.sections ?? []).map((s) => ({ id: s.id, rubric: sectionRubric(s) }));

// 首页中已存在的、与某仓库相关的文案
function homepageText(repo) {
  const hits = [];
  for (const s of profile.sections ?? []) {
    for (const b of s.blocks ?? []) {
      if (b.type === "table") {
        for (const row of b.rows ?? []) {
          if (row.some((c) => c && typeof c === "object" && c.repo === repo)) {
            hits.push(row.map((c) => (typeof c === "string" ? c : (c?.repo ?? c?.label ?? ""))).join(" | "));
          }
        }
      }
      if (b.type === "html-table") {
        for (const g of b.groups ?? []) {
          for (const row of g.rows ?? []) {
            if ((row.repos ?? []).some((r) => r.repo === repo)) hits.push(`${g.school} | ${row.course} | ${(row.repos ?? []).map((r) => r.repo).join("、")}`);
          }
        }
      }
    }
  }
  return hits.join(" / ");
}

// 只取 semantic；info 不进模型
const items = (drift.items ?? []).filter((i) => i.action === "semantic");
if (items.length === 0) {
  console.log("jev-triage: 没有 semantic 漂移，无需调用 Jev");
  process.exit(0);
}

const state = {
  owner: profile.owner,
  sections,
  items: items.map((i) => {
    if (i.type === "article_new") {
      const text = read(i.file, "") ?? "";
      return { type: i.type, file: i.file, excerpt: text.slice(0, 1500) };
    }
    if (i.type === "repo_new" || i.type === "repo_missing") {
      // 只发送公开事实，绝不发送 data/repos.latest.json 里的私有条目
      return { type: i.type, repo: i.repo, description: pub[i.repo]?.description ?? "" };
    }
    if (i.type === "repo_description_changed") {
      return { type: i.type, repo: i.repo, before: i.before ?? "", after: i.after ?? "", homepage_text: homepageText(i.repo) };
    }
    return { type: i.type, repo: i.repo, file: i.file };
  }),
};

const questions = {};
items.forEach((it, i) => {
  if (it.type === "repo_new") {
    questions[`route_${i}`] = choice(
      { repo: `items[${i}].repo`, description: `items[${i}].description`, question: "这个仓库最应该归入首页的哪个板块？" },
      { ...Object.fromEntries(sections.map((s) => [s.id, s.rubric])), none: "信息不足，或不属于以上任何板块" },
    );
    questions[`worth_${i}`] = noul(
      { repo: `items[${i}].repo`, description: `items[${i}].description`, question: "这是一个值得放进个人主页展示的公开项目吗？" },
      { true: "有明确用途与产出，适合对外展示", false: "临时实验、fork 残留，或内容不足以展示" },
    );
  } else if (it.type === "repo_description_changed") {
    questions[`significant_${i}`] = noul(
      {
        before: `items[${i}].before`,
        after: `items[${i}].after`,
        homepage_text: `items[${i}].homepage_text`,
        question: "以 `after` 为最新事实，首页现有表述 `homepage_text` 是否已经明显不准确、或遗漏了关键信息？",
      },
      { true: "出现新的能力、定位或范围变化，首页文字已不准确", false: "只是措辞、细节或同义改写，首页表述仍然成立" },
    );
  } else if (it.type === "article_new") {
    questions[`worth_${i}`] = noul(
      { file: `items[${i}].file`, excerpt: `items[${i}].excerpt`, question: "这篇文章值得列入首页写作区吗？" },
      { true: "是完整的文章或思考，适合对外展示", false: "草稿、素材，或不足以对外" },
    );
  }
});

const payload = { state, model: DEFAULT_MODEL, questions };
writeFileSync(join(ROOT, "jev.triage.payload.json"), JSON.stringify(payload, null, 2) + "\n", "utf8");

function derive(answers) {
  return items.map((it, i) => {
    const out = { type: it.type, repo: it.repo, file: it.file };
    if (it.type === "repo_new") {
      const r = answers[`route_${i}`];
      const w = answers[`worth_${i}`];
      out.route = r?.choice;
      out.route_confidence = r?.confidence;
      out.route_probabilities = r?.probabilities;
      out.worth = w?.noul;
      out.needs_agent = Boolean(out.route && out.route !== "none" && (r?.confidence ?? 0) >= TH.choice && (w?.noul ?? 0) >= TH.noul);
    } else if (it.type === "repo_description_changed") {
      const s = answers[`significant_${i}`];
      out.significant = s?.noul;
      out.needs_agent = (s?.noul ?? 0) >= TH.noul;
    } else if (it.type === "article_new") {
      const w = answers[`worth_${i}`];
      out.worth = w?.noul;
      out.needs_agent = (w?.noul ?? 0) >= TH.noul;
    } else {
      out.needs_agent = null; // 无判断可用，交人工
    }
    return out;
  });
}

if (!process.env.TYPESAFE_API_KEY) {
  console.log(`jev-triage: dry-run（无 TYPESAFE_API_KEY），已写出 jev.triage.payload.json`);
  console.log(`  semantic 项 ${items.length} 个，问题 ${Object.keys(questions).length} 个，model=${DEFAULT_MODEL}`);
  console.log(`  阈值：route confidence ≥ ${TH.choice}，noul ≥ ${TH.noul}`);
  console.log(`  可在 https://console.typesafe.ai/playground 粘贴该文件内容验证`);
  process.exit(0);
}

const res = await systemOne(payload);
const decisions = derive(res.answers ?? {});
writeFileSync(
  join(ROOT, "jev.triage.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), model: res.model, usage: res.usage, thresholds: TH, answers: res.answers, decisions }, null, 2) + "\n",
  "utf8",
);
console.log(`jev-triage: model=${res.model} tokens=${res.usage?.input_tokens}/${res.usage?.output_tokens}`);
for (const d of decisions) {
  const label = d.type === "repo_new" ? `route=${d.route}@${d.route_confidence?.toFixed(2)} worth=${d.worth?.toFixed(2)}` : `p=${(d.significant ?? d.worth)?.toFixed(2)}`;
  console.log(`  ${d.needs_agent ? "→ agent" : "  跳过 "} ${d.repo ?? d.file}  ${label}`);
}
console.log(`jev-triage: 需要 Agent 处理 ${decisions.filter((d) => d.needs_agent).length} 项 → jev.triage.json`);
