# TypeSafe / Jev 分层流水线（探索）

用 Jev 做**判断**、生成模型（pi）做**写作**、再用 Jev 做**校验**的一条实验性流程。默认不在 CI 运行，需 `TYPESAFE_API_KEY`。

## 分层职责

| 层 | 用什么 | 做什么 |
|---|---|---|
| 确定性层 | `scripts/{collect,diff,apply,render}.mjs` | 采集事实、机械变更、渲染 |
| 判断层 | **Jev**（`jev-triage.mjs`） | 分类、是否值得处理 —— Choice / Noul |
| 生成层 | pi（Agent） | 按 `jev.triage.json` 写中文表述 |
| 校验层 | **Jev**（`jev-verify.mjs`） | 校验新说法是否忠于仓库事实 |

分工依据：Jev 是决策模型，返回类型化答案与概率，**不生成文本**；写作交给生成模型。

## 用法

```bash
npm run collect && npm run diff          # 产出 drift.json
export TYPESAFE_API_KEY=...              # 没有 key 时以下命令为 dry-run

npm run jev:triage                       # → jev.triage.json（结构化决策）
# 让 pi 按 scripts/AGENT_TASK.md + jev.triage.json 更新 profile.yml
npm run render && npm run check
npm run jev:verify                       # 校验改动，未通过则退出码 1（→ jev.verify.json）
```

无 key 时两个脚本写出 `*.payload.json`，可粘贴到 https://console.typesafe.ai/playground 验证。

## 判断内容

- `repo_new` → Choice「归入哪个板块」+ Noul「是否值得展示」
- `repo_description_changed` → Noul「首页现有表述是否已不准确」
- `article_new` → Noul「是否值得列入写作区」
- `repo_missing` → 无可靠证据，交人工

阈值（在真实数据上校准，别照抄）：`JEV_ROUTE_CONFIDENCE`（默认 0.55）、`JEV_NOUL`（默认 0.6）、`JEV_VERIFY_PASS`（默认 0.5）。

## 风险与对策

| 风险 | 说明 | 对策 |
|---|---|---|
| 私有信息外泄 | `data/repos.latest.json` 含私有仓库 | triage 只读 `data/repos.json`（公开）；私有项不入模型 |
| 中文/低资源质量未知 | 首页全中文，Jev 的中文效果未验证 | 先小样本标注测试，再决定是否依赖；保留人工兜底 |
| 输入长度 | README/文章会被截断（1500 字），可能缺上下文 | 截断处标注；关键判断只依据 description；后续按模型上限调整 |
| confidence ≠ 正确 | confidence 是分布集中度，不是正确率 | 只做门槛，不自动落库；异常走 PR + 人审 |
| 阈值未校准 | 拍脑袋的阈值会误判 | 用历史 drift 标注，评估后再定；阈值可配 |
| 校验同源盲区 | Jev 校验可能有与判断相同的盲点 | 校验必须回指 `source`（citation check），且不作为唯一放行依据 |
| 每次更新都调用 | 事件频繁时调用量放大 | 只在 `diff` 出 semantic 项后调用；不挂在每次 push 上 |
| 不可复现 | 概率有波动，同一输入可能翻转 | 保存 `jev.*.json` 作为运行产物；固定 model 版本与问法 |
| 提示注入 | 仓库 README 是不可信输入 | Jev 只回类型化答案（非文本），影响有限；仍不据此自动改文件 |
| API 不可用 | 超时/限流会导致流程中断 | 失败降级为“交人工”，不静默跳过 |
| 秘密管理 | 需要 `TYPESAFE_API_KEY` | 存 GitHub Secrets / 本地 `.env`，不提交；日志不打印 key |

## 结论

- 判断层与校验层**适合**用 Jev；生成层不适合。
- 真正价值：便宜的**分流门槛** + 对生成结果的**忠实度校验**，减少无谓的模型调用与改动。
- 代价：多一个第三方依赖与 key；因此默认**本地手动**，不进 CI 自动跑。
