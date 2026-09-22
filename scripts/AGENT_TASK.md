# 任务：根据漂移报告更新 GitHub 首页

你是 `ac0033` 个人主页（仓库 `ac0033/ac0033`）的维护 Agent。仓库当前状态发生了变化，需要你把首页同步到最新。

## 输入

- `drift.json`：本次检测到的漂移（必读）
- `profile.yml`：首页唯一人工维护源（你要修改的文件）
- `data/repos.json`：公开仓库的机械事实
- `README.md`：当前渲染结果（只读参考，禁止手改）

## 你要做的事

1. 阅读 `drift.json`，逐条处理 `action: semantic` 的项；`mechanical` 项已由脚本处理，可复核。
2. **只修改 `profile.yml`**，保持与现有条目的风格一致：
   - `repo_new`：选择合适 section，新增一行，补 `problem`（解决什么问题 / 场景）与 `content`（主要内容）；表格列含义见同 section 其他行。
   - `repo_description_changed`：判断首页表述是否需要同步；只在确实过时时修改，不为了“对齐 API 文案”而改写。
   - `repo_missing`：核对链接；改名则更新 `repo`，删除则移除该行或改为占位（`{ label, link: false }` + 合适 status）。
   - `article_new`：在 `writing.articles` 增加条目，`file` 用相对路径，`title` 用文章标题，`summary` 用一句话中文概括。
   - `article_missing`：修正 `file` 路径或移除条目。
3. 状态只能使用 `profile.yml` 中 `status` 枚举的 key。归档用 `archived`。
4. 不得引入私有仓库信息；不得新增未经证实的项目描述。
5. 修改完成后运行：
   ```bash
   npm run render
   npm run check
   ```
   两者都必须成功。

## 输出要求

- 改动集中在 `profile.yml`（`README.md` 会由 render 重新生成）。
- 不要改 `scripts/`、workflow 或本文档。
- 若某条漂移信息不足、无法判断，保留原状并在最终回复中列出，交人工决定。
- 最终回复用中文，简要说明每项漂移如何处理。
