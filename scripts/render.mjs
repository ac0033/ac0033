#!/usr/bin/env node
// 由 profile.yml 渲染 README.md。
// 用法：
//   node scripts/render.mjs           # 生成 README.md
//   node scripts/render.mjs --check   # 只校验是否与已提交的 README.md 一致（CI 用）
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROFILE = join(ROOT, "profile.yml");
const TARGET = join(ROOT, "README.md");
const CHECK = process.argv.includes("--check");

function fail(msg) {
  console.error(`render: ${msg}`);
  process.exit(1);
}

function loadProfile() {
  if (!existsSync(PROFILE)) fail("profile.yml 不存在");
  let doc;
  try {
    doc = parse(readFileSync(PROFILE, "utf8"));
  } catch (e) {
    fail(`profile.yml 不是合法 YAML：${e.message}`);
  }
  if (!doc || typeof doc !== "object") fail("profile.yml 为空或格式错误");
  if (!doc.owner) fail("profile.yml 缺少 owner");
  if (!doc.status || typeof doc.status !== "object") fail("profile.yml 缺少 status 枚举");
  return doc;
}

// ---------- 单元格 ----------
// string                              → 原样
// { status: "active" }                → 查 status 映射
// { repo, label?, bold?, url? }       → 加粗链接（默认 https://github.com/<owner>/<repo>）
// { url, label, bold? }               → 链接（默认不加粗）
// { label, link: false, bold? }       → 纯文本（默认加粗）
function cell(value, ctx) {
  if (typeof value === "string") return value;
  if (value === null || typeof value !== "object") fail(`非法单元格：${JSON.stringify(value)}`);

  if ("status" in value) {
    const text = ctx.status[value.status];
    if (text === undefined) fail(`未知状态 "${value.status}"，可选：${Object.keys(ctx.status).join(", ")}`);
    return text;
  }

  const hasRepo = "repo" in value;
  const hasUrl = "url" in value;
  const label = value.label ?? value.repo ?? value.url;
  if (!label) fail(`单元格缺少 label/repo/url：${JSON.stringify(value)}`);

  if (value.link === false || (!hasRepo && !hasUrl)) {
    const bold = value.bold ?? true;
    return bold ? `**${label}**` : `${label}`;
  }

  const url = hasUrl ? value.url : `https://github.com/${ctx.owner}/${value.repo}`;
  const bold = value.bold ?? hasRepo; // repo 单元格默认加粗；url 单元格默认不加粗
  const link = `[${label}](${url})`;
  return bold ? `**${link}**` : link;
}

// ---------- 块 ----------
function renderTable(block, ctx) {
  if (!Array.isArray(block.columns) || !Array.isArray(block.rows)) fail("table 需要 columns 与 rows");
  const head = `| ${block.columns.join(" | ")} |`;
  const sep = `|${block.columns.map(() => "---").join("|")}|`;
  const rows = block.rows.map(
    (r) => `| ${r.map((c) => cell(c, ctx)).join(" | ")} |`,
  );
  return [head, sep, ...rows].join("\n");
}

function renderHtmlTable(block, ctx) {
  const head = `<tr>${block.columns.map((c) => `<th>${c}</th>`).join("")}</tr>`;
  const lines = [];
  for (const group of block.groups ?? []) {
    group.rows.forEach((row, i) => {
      let tds = "";
      if (i === 0) {
        tds +=
          group.rows.length > 1
            ? `<td rowspan="${group.rows.length}"><strong>${group.school}</strong></td>`
            : `<td><strong>${group.school}</strong></td>`;
      }
      tds += `<td>${row.course}</td>`;
      const content = (row.repos ?? [])
        .map((entry) => {
          const label = entry.label ?? entry.repo;
          const a = `<a href="https://github.com/${ctx.owner}/${entry.repo}">${label}</a>`;
          return entry.text ? `${a} · ${entry.text}` : a;
        })
        .join("；");
      tds += `<td>${content}</td>`;
      lines.push(`<tr>${tds}</tr>`);
    });
  }
  return ["<table>", "<thead>", head, "</thead>", "<tbody>", ...lines, "</tbody>", "</table>"].join("\n");
}

function renderBlock(block, ctx) {
  switch (block.type) {
    case "text":
    case "note":
      return block.value;
    case "heading3":
      return `### ${block.value}`;
    case "table":
      return renderTable(block, ctx);
    case "html-table":
      return renderHtmlTable(block, ctx);
    default:
      fail(`未知块类型 "${block.type}"`);
  }
}

// ---------- 顶层区段 ----------
function renderHeader(h) {
  const nav = (h.nav ?? []).map((n) => `[${n.text}](#${n.anchor})`).join(" · ");
  return ["<div align=\"center\">", `# ${h.title}`, ...(h.taglines ?? []), nav, h.stack, "</div>"].join("\n\n");
}

function renderWriting(w) {
  const items = (w.articles ?? [])
    .map((a) => `- **[${a.title}](${a.file})**：${a.summary}`)
    .join("\n");
  return `## ${w.heading}\n\n${items}\n\n${w.footer}`;
}

function renderSection(sec, ctx) {
  const parts = [`<a id="${sec.id}"></a>`, `## ${sec.heading}`];
  for (const block of sec.blocks ?? []) parts.push(renderBlock(block, ctx));
  return parts.join("\n\n");
}

function renderFooter(f) {
  return `<div align="center">\n<sub>${f.text}</sub>\n</div>`;
}

function render(doc) {
  const ctx = { owner: doc.owner, status: doc.status };
  // preamble 与其后的第一节属于同一段，中间不加 ---。
  const sectionSegments = (doc.sections ?? []).map((s) => renderSection(s, ctx));
  if (doc.preamble && sectionSegments.length > 0) {
    sectionSegments[0] = `${doc.preamble}\n\n${sectionSegments[0]}`;
  }
  const segments = [
    renderHeader(doc.header),
    renderWriting(doc.writing),
    ...(sectionSegments.length > 0 ? sectionSegments : [doc.preamble]),
    renderFooter(doc.footer),
  ];
  return segments.join("\n\n---\n\n") + "\n";
}

// ---------- diff 输出 ----------
function unifiedDiff(a, b, label = "README.md") {
  const A = a.split("\n");
  const B = b.split("\n");
  const n = A.length;
  const m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push(`-${A[i++]}`);
    } else {
      out.push(`+${B[j++]}`);
    }
  }
  while (i < n) out.push(`-${A[i++]}`);
  while (j < m) out.push(`+${B[j++]}`);
  return `--- a/${label} (已提交)\n+++ b/${label} (渲染结果)\n${out.join("\n")}`;
}

// ---------- main ----------
const doc = loadProfile();
const rendered = render(doc);

if (CHECK) {
  // 归一化换行，避免 Windows 检出 CRLF 时误报不一致
  const current = existsSync(TARGET) ? readFileSync(TARGET, "utf8").replace(/\r\n/g, "\n") : "";
  if (current === rendered) {
    console.log("render: README.md 与 profile.yml 一致 ✓");
    process.exit(0);
  }
  console.error(unifiedDiff(current, rendered));
  console.error("\nrender: README.md 与 profile.yml 不一致，请运行 `npm run render`。");
  process.exit(1);
}

writeFileSync(TARGET, rendered, "utf8");
console.log(`render: 已写入 ${TARGET}`);
