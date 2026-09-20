<div align="center">

# YuanLumen's Garage 🛠️

**做 AI 工具与产品，用数据解决问题，在开源课程中持续学习。**

Building AI tools & products · Practicing data science · Learning in public

[AI 工具](#ai-tools) · [AI 产品](#ai-products) · [数据科学项目](#data-science) · [开源课程](#open-courses)

Python · TypeScript · PyTorch · LangGraph · MCP · RAG · Agent Skills

</div>

---

围绕 Agent 的上下文、记忆、知识与写作流程构建工具，也探索 AI 在文档阅读、课程学习和数据科学中的应用。这里整理公开项目、课程实践与文章；尚未发布的项目先保留名称，后续补充。

<a id="ai-tools"></a>

## 🛠️ AI 工具

让 Agent 更好地使用上下文、积累知识，并把工作过程变得可检查、可复用。

| 项目 | 解决什么问题 | 主要内容 |
|---|---|---|
| **[dsh-ctm](https://github.com/ac0033/dsh-ctm)** | 看清并管理 Agent 上下文 | DeepSeek Harness 插件；上下文可视化、token 用量、编辑与回退、快照恢复 |
| **[agent-memory](https://github.com/ac0033/agent-memory)** | 跨会话保留经验与任务状态 | 长期 / 工作 / 短期记忆；脱敏、复核、遗忘、原文回溯；MCP / LangGraph / Skill 接入 |
| **[writing-agent](https://github.com/ac0033/writing-agent)** | 从主题与材料走向可核查的文章 | 主题提炼 → 大纲 → 搜证 → 写作 → 审核；断点续跑、人工确认与来源记录 |
| **[llm-wiki](https://github.com/ac0033/llm_wiki)** | 为研究与写作积累可追溯的来源 | Markdown / Obsidian 文献知识库；来源入库、复核、索引、校验与 MCP 查询 |
| **[skills](https://github.com/ac0033/skills)** | 把常用工作方法沉淀为 Agent 技能 | 系统构思、讲解、汇报与中文写作；按任务提供规则、示例和检查程序 |

<sub>llm-wiki 对应仓库名 `llm_wiki`。</sub>

### Skills · 具体技能

| 技能 | 用途 |
|---|---|
| [systems-thinking](https://github.com/ac0033/skills/tree/main/systems-thinking) | 组织项目计划、系统讲解与结构化写作，统一概念与论证层次 |
| [cognitive-receiver](https://github.com/ac0033/skills/tree/main/cognitive-receiver) | 从具体问题逐步讲到抽象概念，降低复杂讲解的理解负担 |
| [clear-reporting](https://github.com/ac0033/skills/tree/main/clear-reporting) | 把已有结果整理成有依据、能核查的汇报，附材料格式与检查程序 |
| [human-writing](https://github.com/ac0033/skills/tree/main/human-writing) | 中文写作、修订与语言风格检查，附场景参考和文本检查脚本 |
| [structured-writing](https://github.com/ac0033/skills/tree/main/structured-writing) | 文章结构、论证与量化表达，附金字塔原则、模板和示例 |
| [white-box-explainer](https://github.com/ac0033/white-box-explainer) | 结合真实代码与数据讲清项目原理、执行过程和复算方法 |
| [Humanizer-zh](https://github.com/ac0033/Humanizer-zh) | 中文 AI 写作去痕；第三方技能的个人 fork，保留上游来源 |

另有 [语言风格 System Prompt](https://github.com/ac0033/skills/blob/main/语言风格%20System%20Prompt.md)，用于约定中文表达方式。各技能的来源、许可与使用方法见对应目录。

---

<a id="ai-products"></a>

## 🚀 AI 产品

面向具体使用场景，把检索、文档与 Agent 能力组织成应用。

| 项目 | 场景与内容 | 状态 |
|---|---|---|
| **[review-rag-agent](https://github.com/ac0033/review-rag-agent)** | 商品审核问答；角色可见性过滤、混合检索、重排与索引同步 | 已公开 |
| **PDFtranslator** | — | 🚧 待更新中 |
| **datascience_platform** | — | 🚧 待更新中 |
| **ai_tutor** | — | 🚧 待更新中 |
| **[learning_assistant_agent](https://github.com/ac0033/learning_assistant_agent)** | 开源课程 AI 助教；课程 PDF 上传、混合检索、中文讲解与英文术语保留 | 已公开 |

<sub>“待更新中”仅为项目名占位；公开后补充介绍与仓库入口。</sub>

---

<a id="data-science"></a>

## 📊 数据科学项目

从数据理解、建模到评估与交付，保留判断依据和可复查的过程。

| 项目 | 问题 | 方法与产物 |
|---|---|---|
| **[wine-quality](https://github.com/ac0033/wine-quality)** | 根据 11 项理化指标预测葡萄酒 quality 评分 | 红酒与白酒分别训练随机森林；包含数据核验、探索分析、模型比较、最终评估、可解释性与模型交付记录 |

项目入口：[分析与建模过程](https://github.com/ac0033/wine-quality/tree/main/steps) · [模型交付清单](https://github.com/ac0033/wine-quality/tree/main/delivery)

---

<a id="open-courses"></a>

## 📚 开源课程

公开课自学记录、个人作业实现与课程材料整理。按学校与课程展示，具体完成情况见各仓库。

| 学校 | 课程 | 仓库与内容 |
|---|---|---|
| **UC Berkeley** | CS 61A · 计算机程序的构造与解释 | [cs61a](https://github.com/ac0033/cs61a) · Python、Scheme、讨论与项目练习 |
| UC Berkeley | CS 61C · 计算机体系结构 | [sp26-lab](https://github.com/ac0033/sp26-lab) · Spring 2026 的 C、RISC-V 与数字电路实验 |
| UC Berkeley | Data 8 · 数据科学基础 | [course-data8](https://github.com/ac0033/course-data8) · 作业、实验与课程项目；[materials-sp25](https://github.com/ac0033/materials-sp25) · 课程材料 fork |
| UC Berkeley | Data 100 · 数据科学原理与技术 | [course-data100](https://github.com/ac0033/course-data100) · Spring 2025 讲义、数据与项目配套材料 |
| **Stanford** | CS229 · 机器学习 | [course-cs229](https://github.com/ac0033/course-cs229) · 2020 Summer 问题集，LaTeX 数学推导与 Python 实现 |
| **University of Michigan** | EECS 498-007 / 598-005 · 深度学习计算机视觉 | [course-eecs498-umich](https://github.com/ac0033/course-eecs498-umich) · A1–A6 作业实现，覆盖分类、检测、图像描述、Transformer 与生成模型 |
| **MIT** | 6.S191 · 深度学习导论 | [introtodeeplearning](https://github.com/ac0033/introtodeeplearning) · 课程实验 fork，含 PyTorch 音乐生成实践 |
| **CMU** | Introduction to Deep Learning | [CMU-IDeeL.github.io](https://github.com/ac0033/CMU-IDeeL.github.io) · 课程网站与历年材料的个人副本 |

<sub>个人学习仓库不代表课程官方；课程材料、第三方代码与个人实现的来源和许可见各仓库说明。</sub>

---

<details>
<summary><b>✍️ 文章与思考 · Writing</b></summary>

- **[AI 时代普通人的价值：从执行任务到解决问题](articles/2026-09-08-AI时代普通人的价值：从执行任务到解决问题-60be066b72dd.md)**：关于 AI 时代个人价值创造的思考。
- **[让 Agent 可靠地干活：从单 Agent 到 AI OS 的一条工程主线](articles/让-Agent-可靠地干活：从单-Agent-到-AI-OS-的一条工程主线.md)**：从单 Agent 上下文管理，到多 Agent 协作与系统治理。

观点与材料整理：YuanLumen。写作工具：[writing-agent](https://github.com/ac0033/writing-agent) · 来源积累：[llm-wiki](https://github.com/ac0033/llm_wiki)。

</details>

<div align="center">
<sub>持续学习，持续构建，记录可复查的实践。</sub>
</div>
