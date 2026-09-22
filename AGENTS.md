# ac0033 profile repo

这是 GitHub 个人主页仓库（`ac0033/ac0033`）。首页 `README.md` 是**产物**，不是源文件。

## 规则

1. **禁止直接编辑 `README.md`**。它由 `profile.yml` 通过 `node scripts/render.mjs` 生成。
2. 修改分类、表述、状态、文章列表 → 编辑 `profile.yml`，然后 `npm run render`。
3. `status` 只能取 `profile.yml` 里 `status` 枚举定义的 key（active / wip / planned / archived / deprecated）。
4. **不得写入私有仓库信息**。`data/repos.json` 只含公开仓库；`data/repos.full.json` 含私有仓库，已被 gitignore，仅用于本地判断。
5. 提交前必须 `npm run check` 通过（校验 README.md 与 profile.yml 一致）。
6. 不猜：信息不足时保留占位或写 TODO，不要编造项目内容。

## 常用命令

```bash
npm ci
npm run collect   # 采集仓库事实 → data/repos.json
npm run diff      # 检测漂移 → drift.json / drift.md
npm run apply     # 应用 mechanical 变更到 profile.yml（行级替换）
npm run render    # 生成 README.md
npm run check     # 校验一致性（CI 用）
```

## 结构与分工

| 内容 | 来源 |
|---|---|
| 链接、归档状态、语言等机械事实 | GitHub API（`data/repos.json`） |
| 分类、一句话定位、状态、文章摘要 | `profile.yml` |
| 页面排版 | `scripts/render.mjs` |

`drift.json` 中 `action: mechanical` 可自动处理，`action: semantic` 需要判断。
