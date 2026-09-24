<div align="center">

# YuanLumen's Garage 🛠️

**做 AI 工具与产品，用数据解决问题，在开源课程中持续学习。**

Building AI tools & products · Practicing data science · Learning in public

[AI 工具](#ai-tools) · [AI 产品](#ai-products) · [数据科学项目](#data-science) · [开源课程](#open-courses)

Python · TypeScript · PyTorch · LangGraph · MCP · RAG · Agent Skills

</div>

---

## ✍️ 文章与思考 · Writing

- **[AI 时代普通人的价值：从执行任务到解决问题](articles/2026-09-08-AI时代普通人的价值：从执行任务到解决问题-60be066b72dd.md)**：关于 AI 时代个人价值创造的思考。
- **[让 Agent 可靠地干活：从单 Agent 到多 Agent，再到 AI OS](articles/让-Agent-可靠地干活：从单-Agent-到-AI-OS-的一条工程主线.md)**：从单 Agent 上下文管理，到多 Agent 协作与系统治理。

观点与材料整理：YuanLumen。写作工具：[writing-agent](https://github.com/ac0033/writing-agent) · 来源积累：[llm-wiki](https://github.com/ac0033/llm_wiki)。

---

围绕 Agent 的上下文、记忆、知识与写作流程构建工具，也探索 AI 在文档阅读、课程学习和数据科学中的应用。这里整理公开项目与课程实践；尚未发布的项目先保留名称，后续补充。

<a id="ai-tools"></a>

## 🛠️ AI 工具

让 Agent 更好地使用上下文、积累知识，并把工作过程变得可检查、可复用。

| 项目 | 解决什么问题 | 主要内容 |
|---|---|---|
| **[dsh-ctm](https://github.com/ac0033/dsh-ctm)** | 看清并管理 Agent 上下文 | DeepSeek Harness 插件；上下文可视化、token 用量、编辑与回退、快照恢复 |
| **[agent-memory](https://github.com/ac0033/agent-memory)** | 让 agent 跨会话记住偏好、约定与踩过的坑 | 证据锚定记忆：以原话为证据、读取只组织不裁决；长期 / 工作 / 短期三层 + 写入评价门；LoCoMo 42:33、60 题 58/60；MCP / Python / Skill 接入 |
| **[writing-agent](https://github.com/ac0033/writing-agent)** | 从主题与材料走向可核查的文章 | v2 写作图：摘要确认 → 研究 → 框架 → 写作 → 审核 → 润色；版本绑定与人工确认；CLI 额度检查、模型回退、MCP 接入 |
| **[llm-wiki](https://github.com/ac0033/llm_wiki)** | 为研究与写作积累可追溯的来源 | AI Agent（Agent Harness）文献知识库；raw 原文 / wiki 页面 / registry 登记三层；幂等入库、分页抓取、人工复核、周更评分；Claude 生成 + Codex 独立核验 |
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
| **[dsflow](https://github.com/ac0033/dsflow)** | 数据科学项目全周期追踪平台（类似 MLflow + DVC，补状态与认知追踪）：计划、审批、数据变化、讲解与验收在网页上可检查；只读接入，项目文件为唯一事实来源；agent 经协议 / MCP / 命令行 / 终端 / Skill 接入 | 🔍 公开预览 |
| **ai_tutor** | — | 🚧 待更新中 |
| **[learning_assistant_agent](https://github.com/ac0033/learning_assistant_agent)** | 开源课程 AI 助教；课程 PDF 上传、混合检索、中文讲解与英文术语保留 | 即将下线 |

<sub>“公开预览”：代码与功能已公开，可在本机安装试用；多用户登录与服务器部署尚未完成，暂不提供在线服务。“待更新中”仅为项目名占位；公开后补充介绍与仓库入口。</sub>

---

<a id="data-science"></a>

## 📊 数据科学项目

从数据理解、建模到评估与交付，保留判断依据和可复查的过程。

| 项目 | 问题 | 方法与产物 |
|---|---|---|
| **[wine-quality](https://github.com/ac0033/wine-quality)** | 根据 11 项理化指标预测葡萄酒 quality 评分 | 红酒与白酒分别训练随机森林；包含数据核验、探索分析、模型比较、最终评估、可解释性与模型交付记录 |

---

<a id="open-courses"></a>

## 📚 开源课程

公开课自学记录、个人作业实现与课程材料整理。按学校与课程展示，具体完成情况见各仓库。

<table>
<thead>
<tr><th>学校</th><th>课程</th><th>仓库与内容</th></tr>
</thead>
<tbody>
<tr><td rowspan="4"><strong>UCB</strong></td><td>CS 61A · 计算机程序的构造与解释</td><td><a href="https://github.com/ac0033/cs61a">cs61a</a> · Python、Scheme、讨论与项目练习</td></tr>
<tr><td>CS 61C · 计算机体系结构</td><td><a href="https://github.com/ac0033/sp26-lab">sp26-lab</a> · Spring 2026 的 C、RISC-V 与数字电路实验</td></tr>
<tr><td>Data 8 · 数据科学基础</td><td><a href="https://github.com/ac0033/course-data8">course-data8</a> · 作业、实验与课程项目；<a href="https://github.com/ac0033/materials-sp25">materials-sp25</a> · 课程材料 fork</td></tr>
<tr><td>Data 100 · 数据科学原理与技术</td><td><a href="https://github.com/ac0033/course-data100">course-data100</a> · Spring 2025 讲义、数据与项目配套材料</td></tr>
<tr><td><strong>Stanford</strong></td><td>CS229 · 机器学习</td><td><a href="https://github.com/ac0033/course-cs229">course-cs229</a> · 2020 Summer 问题集，LaTeX 数学推导与 Python 实现</td></tr>
<tr><td><strong>MIT</strong></td><td>6.S191 · 深度学习导论</td><td><a href="https://github.com/ac0033/introtodeeplearning">introtodeeplearning</a> · 课程实验 fork，含 PyTorch 音乐生成实践</td></tr>
<tr><td><strong>CMU</strong></td><td>Introduction to Deep Learning</td><td><a href="https://github.com/ac0033/CMU-IDeeL.github.io">CMU-IDeeL.github.io</a> · 课程网站与历年材料的个人副本</td></tr>
<tr><td><strong>University of Michigan</strong></td><td>EECS 498-007 / 598-005 · 深度学习计算机视觉</td><td><a href="https://github.com/ac0033/course-eecs498-umich">course-eecs498-umich</a> · A1–A6 作业实现，覆盖分类、检测、图像描述、Transformer 与生成模型</td></tr>
</tbody>
</table>

<sub>个人学习仓库不代表课程官方；课程材料、第三方代码与个人实现的来源和许可见各仓库说明。</sub>

---

<div align="center">
<sub>持续学习，持续构建，记录可复查的实践。</sub>
</div>
