<div align="center">

# YuanLumen's Garage 🛠️

**学开源课程 · 造 AI 工具 · 写下实践与思考**  
Learning in public · Building AI tools · Writing about what I learn

</div>

这里收录我的公开项目、课程实践和文章。近期围绕 Agent 的上下文、记忆、知识来源与写作流程持续开发，也用数据分析项目练习从数据走向判断。

## 文章 / Writing

- **[AI 时代普通人的价值：从执行任务到解决问题](articles/2026-09-08-AI时代普通人的价值：从执行任务到解决问题-60be066b72dd.md)**：关于 AI 时代个人价值创造的思考。
- **[让 Agent 可靠地干活：从单 Agent 到 AI OS 的一条工程主线](articles/让-Agent-可靠地干活：从单-Agent-到-AI-OS-的一条工程主线.md)**：从单 Agent 的上下文管理，到多 Agent 协作与系统层面的治理。

观点与材料整理：YuanLumen。写作工具：[writing-agent](https://github.com/ac0033/writing-agent) · 来源积累：[llm_wiki](https://github.com/ac0033/llm_wiki)。

## AI 工具 / AI Projects

| 项目 | 当前内容 |
|---|---|
| [dsh-ctm](https://github.com/ac0033/dsh-ctm) | DeepSeek Harness 上下文管理插件：查看上下文与 token 使用，编辑、回退和快照恢复；实际生效需显式开启 |
| [agent-memory](https://github.com/ac0033/agent-memory) | 长期、工作、短期三层记忆；支持人工复核、宿主蒸馏、一致性检查，以及 MCP / LangGraph / Skill 接入 |
| [writing-agent](https://github.com/ac0033/writing-agent) | 从主题提炼、大纲、搜证到写作与最终核验；支持断点续跑，文章确认保存与 GitHub 发布分别确认 |
| [llm_wiki](https://github.com/ac0033/llm_wiki) | Markdown 文献知识库：来源抓取、幂等入库、人工复核、索引与校验；接收写作产生的来源证据 |
| [skills](https://github.com/ac0033/skills) | 汇报、自然写作、结构化写作与项目讲解的技能集合，包含源码、示例和检查程序 |
| [learning_assistant_agent](https://github.com/ac0033/learning_assistant_agent) | 面向开源课程的 AI 助教：课程 PDF 上传、混合检索、中文讲解与英文术语保留 |
| [review-rag-agent](https://github.com/ac0033/review-rag-agent) | 商品审核场景的 RAG 问答：角色可见性过滤、混合检索、重排和索引同步 |

### 技能入口 / Skills

| 技能 | 用途 |
|---|---|
| [clear-reporting](https://github.com/ac0033/skills/tree/main/clear-reporting) | 把已有结果整理成有依据、能追问的汇报，配套材料与数字检查 |
| [human-writing](https://github.com/ac0033/skills/tree/main/human-writing) | 中文写作与修订规范，附文本检查脚本 |
| [structured-writing](https://github.com/ac0033/skills/tree/main/structured-writing) | 组织文章结构、论证与量化表达 |
| [white-box-explainer](https://github.com/ac0033/white-box-explainer) | 结合真实代码和数据，讲清项目原理与复算过程 |
| [Humanizer-zh](https://github.com/ac0033/Humanizer-zh) | 中文 AI 写作去痕技能的个人 fork，保留上游来源说明 |

## 数据分析 / Data Analysis

[Resume-Project](https://github.com/ac0033/Resume-Project) 收录三个 Notebook：Cookie Cats A/B 测试、优惠券使用率预测、RFM 与 K-Means 用户分层。项目首页提供各分析入口及复现所需的数据说明。

## 公开课程实践 / Coursework

| 课程 | 仓库 | 内容 |
|---|---|---|
| UC Berkeley CS 61A | [cs61a](https://github.com/ac0033/cs61a) | Python、Scheme、讨论与项目练习 |
| UC Berkeley CS 61C | [sp26-lab](https://github.com/ac0033/sp26-lab) | Spring 2026 的 C、RISC-V 与数字电路实验材料 |
| UC Berkeley Data 8 | [Data8_sp25](https://github.com/ac0033/Data8_sp25) | Spring 2025 的作业、实验、讲义与三个课程项目 |
| UC Berkeley Data 8 | [materials-sp25](https://github.com/ac0033/materials-sp25) | 课程公开材料的 fork 与复习目录 |
| UC Berkeley Data 100 | [sp25-student](https://github.com/ac0033/sp25-student) | Spring 2025 的讲义、数据和项目材料索引 |

各仓库保留课程材料的来源与版权说明；具体内容和运行方法见对应 README。

## 常用技术 / Tools

Python · Jupyter · TypeScript · LangGraph · MCP · RAG · Agent Skills
