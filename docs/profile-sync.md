# 首页同步机制说明

首页 `README.md` 由 `profile.yml` 渲染生成。仓库变化通过三种策略同步到首页：

| 策略 | workflow | 行为 | 触发 |
|---|---|---|---|
| A 自动 | `sync-auto.yml` | 机械变更（归档状态等）直接提交 | 每天定时 / 手动 / 跨仓库事件 |
| B 提醒 | `remind.yml` | 有漂移就开 / 更新 Issue | 每天定时 / 手动 / 跨仓库事件 |
| C AI Agent | 本地 pi（`ai-update.yml` 默认禁用） | 按漂移更新 `profile.yml` | 需要时手动 |

三者可同时开启：`remind` 负责提醒，`sync-auto` 顺手处理机械项，`ai-update` 在需要时产出可审阅的 PR。

## 需要的 Secrets

在 `ac0033/ac0033` → Settings → Secrets and variables → Actions：

| Secret | 用途 | 权限 |
|---|---|---|
| `PROFILE_PAT` | 仅 `collect` 读取**全部仓库列表** | fine-grained PAT，**Repository access: All repositories**，**Permissions: Metadata: Read-only** |
| `ANTHROPIC_API_KEY` | 方案 C 的模型调用 | 也可改用 `DEEPSEEK_API_KEY` / `OPENAI_API_KEY` 等，并在 `ai-update.yml` 中替换环境变量 |

> `PROFILE_PAT` 只需最小权限：因为 `GITHUB_TOKEN` 读不到你其他仓库，`collect` 才需要它；而提交、推送、开 PR 都使用仓库自带的 `GITHUB_TOKEN`（仅限本仓库）。

## 跨仓库近实时（可选）

默认靠每天定时轮询，延迟 ≤ 24 小时。要近实时：

1. 创建只授权 `ac0033/ac0033` 的 PAT，作为 `PROFILE_DISPATCH_TOKEN` 加到各项目仓库（或组织级 secret）。
2. 把 `templates/project-notify.yml` 复制到各项目仓库的 `.github/workflows/`。
3. 之后项目仓库 push / release 会派发 `repo-updated` 事件，触发上面三个 workflow。

## 漂移分类

`diff.mjs` 把变化分成三类，写入 `drift.json` / `drift.md`：

- **mechanical**：归档 / 取消归档等，`apply.mjs` 可自动改 `profile.yml`（行级替换，不动格式和注释）。
- **semantic**：新仓库、简介变化、新文章等，需要人判断或交给 Agent。
- **info**：如引用了私有仓库，仅提示。

## 本地使用

```bash
npm ci
npm run collect   # 需要已登录 gh
npm run diff
npm run apply
npm run render
npm run check
```

第一次提交前请先 `npm run collect && npm run diff`，确认漂移符合预期。

## 本地让 Agent 更新（方案 C）

`ai-update.yml` 默认在 GitHub 上禁用（避免没有模型 key 时误触发）。需要时在本地执行：

```bash
npm ci
npm run collect
npm run diff
```

然后在仓库根目录启动 pi，对它说：

> 读 `scripts/AGENT_TASK.md`，根据 `drift.json` 更新 `profile.yml`，然后运行 `npm run render && npm run check`。

完成并确认无误后提交：

```bash
git add -A && git commit -m "chore(profile): sync by agent" && git push
```

`drift.md` 是给人看的清单，`drift.json` 是给 Agent 看的结构化数据。想恢复 CI 版本：`gh workflow enable "AI profile update"` 并配置 `ANTHROPIC_API_KEY`。

## 注意

- 定时工作流在仓库长期无活动后会被 GitHub 停用，`sync-auto.yml` 每月写一次 `data/last-scan.txt` 保活。
- `data/repos.json` 是公开仓库快照，会提交；`data/repos.latest.json` 含私有仓库，已 gitignore，不要提交。
- `README.md` 禁止手改，`ci.yml` 会在 PR / push 时校验一致性。
