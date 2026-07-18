---
title: Skill Panel 当前开发计划
date: 2026-07-10
updated: 2026-07-17
tags: [SkillPanel, 开发计划, 批次]
status: active
---

# Skill Panel 当前开发计划

## 2026-07-16 L3 安装验收失败更正

- 任务：`REL-3.8.3-L3-REAL-DATA-PAGE-01`。
- 第 8 步状态：验证失败。
- 失败候选代码 commit：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。
- 失败候选记录 commit：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。
- 失败原因：安装版显示虚拟 Skill 数据；Library 缺少分页，超过 100 个 Skill 无法访问剩余内容。
- 修复规则：保留原候选目录和 SHA256，candidate-2 使用独立目录 `output/releases/v3.8.3-candidate-2/`。
- 发布规则：修复验证完成前禁止 tag、禁止正式发布。

## 2026-07-17 candidate-2 待重新执行第 8 步

- 任务：`REL-3.8.3-L3-CANDIDATE-2`。
- candidate-1 状态：L3 验证失败。
- candidate-2 状态：修复完成，等待重新执行第 8 步。
- 第 8 步当前结论：待重新验证，不能写成 L3 通过。
- 发布规则：8A 真实数据和分页、8B 升级和回退全部通过前，禁止进入第 9 步、禁止创建正式 tag、禁止正式发布。

## 当前里程碑

`M3.8-S6：v3.8.2 历史发布证据收口`

目标：在 v3.8.2 已发布基线上，使用 DATA-EDITOR-01 commit `9993992a164fd9f12fe8312223d0238e5b107666` 作为 Editor 保存、快照、外部冲突、版本隔离和安全恢复稳定基线。SEC-FILE-01A commit `e962960fc51159516367f2f9d993fd63fa8e4da1` 已完成文件命令路径安全边界和来源权限矩阵；SEC-FILE-01B commit `e06441df474b017ca01624c99d0c1d207d7288b8` 已完成 Detail 归档、打开目录、复制、删除和恢复说明闭环；SEC-FILE-01C commit `4910ff3dbec09ad912fdda3543cae2aaf4dedc0e` 已完成 Keychain 状态契约、统一脱敏、日志安全和 AI 发送确认；SEC-FILE-01D 已完成回归修复、当前 HEAD 最终验证和 2026-07-16 用户人工验收，收口 HEAD 为 `fba74aeb030d89e626a04f665f6ac17b1054601d`。REL-3.8.2-EVIDENCE-CLOSE 已完成历史发布证据 manifest，文档 commit 为 `53e7ed3136e89cae52638dfdd9372983a918a0c5`；新代码和新安装包继续进入 v3.8.3 候选。

2026-07-16 收口进展：SEC-FILE-01D 已按失败项补充前端失败测试并最小范围修改 Library、Detail、Editor、共享按钮样式和 UI Store；补充调整已将 Editor 页头右侧操作区统一为“AI 辅助”“返回”。最终确认流程为 Library 单击选中，双击/Enter/“查看完整详情”进入完整 Detail，再由 Detail 的“编辑”或“只读查看”进入 Editor。修复 commit `518f021`，收口脚本 commit `fba74ae`；`npm test` 67/67、`npm run typecheck`、`npm run build`、`npm run packaging:check` 6/6、`npm run cargo:test` lib 54/54 与 contract 4/4、`npm run visual:qa` 11/11、`npm run git:diff:check` 均通过。2026-07-16 用户人工验收通过。第 5 步已关闭。第 6 步已只读复核 `v3.8.2` tag、SHA256、Git bundle、源码包、App Zip、DMG 元数据、签名和公证状态，并新增 `docs/releases/v3.8.2/release-manifest.md`。第 6 步可关闭；因 Windows 安装包、macOS 签名/公证、真实升级和安装包回退证据不足，暂不建议进入第 7 步。

## 批次台账

| 编号 | 目标 | 用户可见结果 | 允许范围 | 验收 | 状态 |
|---|---|---|---|---|---|
| DOC-CORE | 建立持续更新的核心文档 | 新会话可快速找到需求、状态、规则、台账和发布边界 | Obsidian `skill panel/` | 8 份主文件与双链 | 已完成 |
| DEV-AUDIT-01 | 盘点 Codex 稳定线未提交变化 | 每项变化有来源、模块、完成度和风险 | 稳定目录 | 基线报告 | 已完成 |
| DEV-VERIFY-01 | 验证 v3.8.1 稳定线 | 获得测试、构建、视觉证据 | L2 命令 | 全部通过 | 已完成 |
| DEV-CLOSE-01 | 收口稳定代码快照 | 形成可回退 commit，状态文件同步 | 已确认范围 | `80816e52…` | 已完成 |
| WB-UI-BASE-01 | 创建 WorkBuddy UI 代码线 | 独立分支和 worktree | 已删除 | 用户决定撤销 | 已撤销 |
| WORKFLOW-ROLLBACK-01 | 恢复原型迁移方式 | 删除 UI worktree/分支并同步规则 | AGENTS 与 Obsidian | `31b93d2a…`、`3bc3955…` | 已完成 |
| AUDIT-REAL-FLOW-01 | 盘点所有页面和真实命令连接 | 获得真实可用、部分连接、展示占位和风险清单 | 只读审计 | 审计报告与第 3–5 步范围 | 已完成 |
| UI-GAP-01 | 补齐 Editor 保存恢复和 Detail 危险操作原型 | 看到完整成功、失败、冲突和恢复状态 | WorkBuddy 原型目录 | `6626908…`、88 张截图、handover | 已完成 |
| DATA-EDITOR-01 | 完成 Editor 数据安全闭环 | 编辑内容可真实保存、重启保留、冲突可处理、旧版本可安全恢复 | Editor、update/version/restore 与相关测试 | L2、视觉 QA、测试 Skill 人工验收 | 已完成 |
| SEC-FILE-01 | 收口其余文件与敏感数据安全 | 删除、归档、目录、来源、Keychain、日志和 AI 有安全边界 | 第 4 步之外的高风险命令 | 当前 HEAD 自动验证、敏感扫描、用户人工验收；Windows 与真实 Keychain 单独待验证 | 已完成 |
| REL-3.8.2-EVIDENCE-CLOSE | 补齐 v3.8.2 剩余发布证据 | 历史证据、缺失项和平台边界可追溯 | release Manifest 和平台证据 | Windows/macOS 分开记录 | 已完成，缺失项已明示 |
| REL-01 | 更新 v3.8.2 发布结论 | 记录已发布版本、提交与当前证据 | 发布文档与证据 | 用户确认、commit、版本号 | 已完成 |
| REL-POST-01 | 收口发布后验证 | Dashboard 视觉 QA 已恢复 11/11，macOS 发布材料可追溯 | 测试与发布文档 | visual:qa、tag、macOS 安装包、SHA256、回退包 | 部分完成 |
| DOC-SYNC-01 | 建立 Obsidian 文档同步指纹 | 同名文件状态、SHA256 与稳定线基线可追溯 | Obsidian `skill panel/` | HEAD、干净工作区、章节复读 | 已完成 |
| DOC-NAV-01 | 统一主导航与 Editor 任务页表达 | 用户和 agent 能清楚区分五个顶部导航与上下文任务页面 | PRD、UI 规范、README、AGENTS、模块文档与 SOP | 代码路径核对、视觉证据、语义复读、SHA256 | 已完成 |

## DEV-AUDIT-01 输入

- 工作目录：`/Users/shovy/Documents/skill-panel-codex-v3.8`
- 当前分支：`codex/agent-codex-v3.8`
- 当前 HEAD：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`
- 项目规则：[[AGENTS]]
- 模块入口：`/Users/shovy/Documents/skill-panel-codex-v3.8/docs/modules/README.md`
- 原型交接：`/Users/shovy/Documents/skill-panel-workbuddy-v3.8.1-prototype/docs/design-prototypes/skill-panel-redesign-notion/prototype-handover.md`

## DEV-AUDIT-01 交付

- 修改文件按模块分组。
- 每组标记：已完成、部分完成、来源不明、建议放弃。
- 新增文件说明入口和使用者。
- 数据安全、AI 写回、删除、备份、迁移影响单独列出。
- 提交拆分建议和每个提交的验证命令。

## UI-GAP-01 当前记录

- 用户结果：Editor 保存/恢复与 Detail 危险操作已经形成完整可见原型并通过验收。
- 原型目录：`/Users/shovy/Documents/skill-panel-workbuddy-v3.8.1-prototype`。
- 分支 / commit：`workbuddy/v3.8.1-prototype` / `6626908c9b2a5ac7cdb7452dbf1fb3798c35c2ab`。
- 工作区：干净。
- 交付范围：Editor 12 个状态、Detail 10 个状态、88 张 PNG、`prototype-handover.md` 和 `SCREENSHOT_MANIFEST.md`。
- 数据规则：SHA256 外部冲突检测；覆盖前备份；版本按规范化完整路径隔离；恢复前备份；归档与启停分离；前端不得自由创建内部备份。
- 未修改范围：Codex 稳定业务代码、版本号、tag 和安装包。
- 下一步：执行 `DATA-EDITOR-01`。

## DATA-EDITOR-01 过程快照（00:22）

- 状态：本段保留开发过程；最新状态见下方“DATA-EDITOR-01 收口记录”。
- 开始/当前 HEAD：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`；尚无 commit。
- `2026-07-14 00:22 CST` 快照已有 DOC-NAV-01 的 4 份文档修改，以及 DATA-EDITOR-01 的 10 份依赖/代码/测试修改；开发仍在进行，必须保留并单独报告。
- 原型依据固定到 WorkBuddy commit `6626908…`。
- 测试写入只允许临时根目录和可丢弃测试 Skill，禁止真实 Skill。
- 本批次包括保存、快照、撤销、SHA256 冲突、diff、版本隔离、安全恢复和 AI diff 草稿写回。
- 本批次排除删除、归档、系统废纸篓、打开目录、Keychain、日志脱敏和发布动作。
- 当前修改模块：Cargo 的 SHA256 依赖、Rust Skill/版本存储、Editor UI、DiffModal、invoke 封装、Editor CSS 和前端测试。
- 当前候选实现：规范化路径 SHA256、20 份/30 天保留、恢复前快照、保存失败草稿保护、外部冲突 diff/确认、版本历史/恢复、AI diff 草稿提示和模态框焦点处理。
- 当时验证：`git diff --check` 通过；该快照时点尚未记录前端、Rust、typecheck、build 和 visual:qa 结论。
- 后续结果：完整验证已通过，见下方“DATA-EDITOR-01 收口记录”。

## DATA-EDITOR-01 最终收口（2026-07-15）

- 状态：已完成；未升版本、未打包发布、未创建 tag。
- 开始 HEAD：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`。
- DOC-NAV-01 commit：`3c0c3cab6171eb3d29ab1bff3c292720423289ac`，`docs: clarify navigation ownership`。
- DATA-EDITOR-01 commit / 最终 HEAD：`9993992a164fd9f12fe8312223d0238e5b107666`，`feat: close editor data safety workflow`。
- 提交前工作区：17 个修改文件；文件清单 SHA256 为 `242b4ae15c5775cfc2b567557157e7fc04bf624a1db74c6f314a89dcd34431ed`；`prototype-parity-library-1280x768.png` 工作区 SHA256 与 HEAD 均为 `705ee97b524abcc156ea5caf1b5f9ee41b1c222871772263b1d5e7a465133807`，因此退出修改清单。
- 用户验收：2026-07-15，DATA-EDITOR-01 临时测试 Skill 人工验收通过；覆盖 Editor 进入、保存禁用、修改与保存、重启保留、撤销、外部冲突、diff 预览与覆盖确认、版本历史、安全恢复、同名 Skill 版本隔离、AI diff 草稿、弹窗和键盘操作。
- DOC-NAV-01 文件：`AGENTS.md`、`README.md`、`docs/modules/app-shell-v3.8.1.md`、`docs/modules/editor-v3.8.1.md`。
- DATA-EDITOR-01 文件：`docs/modules/tauri-skill-data-v3.8.1.md`、`output/playwright/v38-editor-1440x960.png`、`output/playwright/visual-qa-report.json`、`src-tauri/Cargo.lock`、`src-tauri/Cargo.toml`、`src-tauri/src/skill_store.rs`、`src-tauri/src/version_store.rs`、`src/App.editor.test.tsx`、`src/AppShell.test.tsx`、`src/components/ai/DiffModal.tsx`、`src/editor/EditorView.tsx`、`src/lib/invoke.ts`、`src/pages/Editor/Editor.css`。
- 数据安全结论：保存前路径校验沿用 `update_skill`；Rust 创建版本快照和内部目录备份；版本历史按规范化完整路径 SHA256 隔离；单个 Skill 保留 20 份/30 天；恢复前备份当前版本；恢复先读快照再临时文件替换；外部冲突用打开时内容 SHA256 和 diff 预览；强制覆盖需二次确认；AI diff 只写入草稿。
- 验证结果：2026-07-15 18:56–18:58 CST 重新完成 L2：`npm test` 44/44、`npm run typecheck` 通过、`npm run build` 通过、`npm run packaging:check` 6/6、`npm run cargo:test` lib 45/45 与 contract 3/3、`npm run visual:qa` 11/11、`git diff --check` 通过。
- 截图证据：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-editor-1440x960.png`，报告 `/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`，`generatedAt` 为 `2026-07-15T10:58:00.241Z`。
- 安全核查：未发现真实 Skill、密钥、隐私日志或临时验收数据进入 Git。
- 当前工作区：干净。
- 下一步：进入 `SEC-FILE-01`，处理删除、归档、路径、来源保护、Keychain、日志脱敏和 AI 发送安全。

## SEC-FILE-01A 最终收口（2026-07-15）

- 状态：已完成；未升版本、未打包发布、未创建 tag。
- 开始 HEAD：`9993992a164fd9f12fe8312223d0238e5b107666`。
- SEC-FILE-01A commit / 当前 HEAD：`e962960fc51159516367f2f9d993fd63fa8e4da1`，`feat: secure skill file command boundaries`。
- 修改范围：`src-tauri/src/skill_path_guard.rs`、`src-tauri/src/commands.rs`、`src-tauri/src/skill_store.rs`、`src-tauri/src/lib.rs`、`src/detail/DetailView.tsx`、`src/lib/skillPermissions.ts`、前端/Rust 测试、模块文档和视觉 QA 报告。
- 安全边界：文件命令统一做 canonicalization、允许根校验、`..` 拒绝、符号链接逃逸拒绝、Skill 文件/目录区分、扫描根本身拒绝、缺失路径安全失败和错误路径脱敏。
- 来源权限矩阵：CodexUser、AgentsUser、Custom 可编辑；PluginCache、System、Unknown 本地文件只读；受保护来源允许读取、应用内归档和复制到默认 Codex 用户 Skill 根目录。
- 命令状态：`validate_skill`、`read_skill_files`、`write_skill_file`、`analyze_deps`、`delete_skill`、`open_skill_folder`、`clone_skill`、`toggle_skill_enabled` 已接统一守卫；`clone_skill` 实现真实复制和同名冲突拒绝；`toggle_skill_enabled` 只处理启用/禁用 marker。
- 前端状态：Detail 页受保护来源显示只读提示；编辑入口切换为“复制到可编辑目录”；打开目录和复制入口调用后端命令；按钮状态复用 `skillPermissions`。
- 验证结果：`npm test` 47/47；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 49/49、contract 3/3；`npm run visual:qa` 11/11；`git diff --check` 通过。
- 视觉证据：`output/playwright/visual-qa-report.json`，`generatedAt` 为 `2026-07-15T12:46:41.235Z`。
- 未完成：删除本地文件 UI 接通、系统废纸篓、应用内归档持久化 UI、Keychain、日志脱敏、AI 发送安全。
- 下一步：`SEC-FILE-01B` 接通 Detail 归档和删除真实流程，继续使用 5A 的统一守卫。

## SEC-FILE-01B 最终收口（2026-07-15）

- 状态：已完成；未升版本、未打包发布、未创建 tag。
- 开始 HEAD：`e962960fc51159516367f2f9d993fd63fa8e4da1`。
- SEC-FILE-01B commit / 当前 HEAD：`e06441df474b017ca01624c99d0c1d207d7288b8`，`feat: close detail file operation workflow`。
- 修改范围：Detail 页归档/复制/删除 UI、DangerZone、删除结果类型契约、Rust 删除事务、`trash` 依赖、前端/Rust 契约测试、模块文档和视觉证据。
- 用户可见结果：归档和取消归档写入 `AppSettings.skillArchives`；打开目录显示成功/失败反馈；受保护来源可复制到可编辑目录并确认目标名称；可编辑来源可通过二次确认把本地 Skill 目录移入系统废纸篓并获得备份路径和恢复说明；受保护来源删除本地文件禁用。
- 数据安全结论：删除只允许 CodexUser、AgentsUser、Custom 来源；后端先创建完整目录备份，再调用系统废纸篓；同名复制仍安全失败；前端未调用 `write_skill_file` 创建任意备份；测试只使用 mock 或临时 Skill。
- 验证结果：`npm test` 51/51；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 49/49、contract 4/4；`npm run visual:qa` 11/11；`git diff --check` 通过。
- 截图证据：`output/playwright/sec-file-01b-detail-1280x800.png`、`output/playwright/sec-file-01b-detail-delete-modal-1280x800.png`、`output/playwright/visual-qa-report.json`。
- 平台状态：macOS 已通过临时 Skill 系统废纸篓行为验证；Windows 等待独立验证；Linux 需目标环境复验 `trash` crate 行为。
- 下一步：进入 `SEC-FILE-01C`，处理 Keychain 状态、日志脱敏和 AI 发送安全。

## SEC-FILE-01C 最终收口（2026-07-16）

- 状态：已完成；未升版本、未打包发布、未创建 tag。
- 开始 HEAD：`e06441df474b017ca01624c99d0c1d207d7288b8`。
- SEC-FILE-01C commit / 当前 HEAD：`4910ff3dbec09ad912fdda3543cae2aaf4dedc0e`，`feat: secure ai keys logs and outbound ai`。
- 修改范围：Rust/TypeScript 脱敏模块、AI proxy、Keychain 命令契约、调用日志、审计日志、Logs 页面、Settings Key 状态、Toast/错误展示、AI Rail、AI Assistant、Editor AI 入口、类型契约、模块文档和视觉 QA 输出。
- Keychain 契约：API Key 仅由后端写入系统 Keychain/Credential Store；前端只读取配置状态；Settings 仅显示状态或不可还原掩码；vendor 限定为 `openai`、`claude`、`glm`、`ollama`；自动化测试使用 mock Keychain。
- 脱敏规则：统一覆盖 API Key、Authorization/Bearer、token/secret/password/api_key、JWT、macOS/Linux/Windows 用户路径、邮箱、URL 敏感查询参数、JSON 嵌套字符串和错误信息，占位符使用 `<API_KEY>`、`<TOKEN>`、`<PATH>`、`<EMAIL>` 等稳定值。
- 日志策略：写入前脱敏；读取旧 JSONL 时再次脱敏；audit detail 递归脱敏；prompt 保存脱敏摘要并限制长度；损坏日志行跳过且不回显原文；日志文件在 Unix 支持平台设置为当前用户可读写。
- AI 发送确认：默认脱敏；发送前显示服务商、内容范围、脱敏状态和预览；用户可取消；关闭脱敏需本次风险确认；后端校验确认状态和预览一致性；未确认时禁止网络请求；AI 日志仅保存必要元数据与脱敏摘要；AI 返回先进入 Editor 草稿。
- 验证结果：`npm test` 54/54；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 54/54、contract 4/4；`npm run visual:qa` 11/11；`git diff --check` 通过。
- 敏感信息扫描：Markdown、JSON、测试 fixture、Rust、TS/TSX、`output/playwright` 扫描无真实 API Key、Bearer 或 JWT 命中；无受限表达命中。
- 截图证据：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-settings-1280x800.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-logs-1280x800.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-editor-1440x960.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/sec-file-01c-ai-assistant-1280x800.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`。
- 平台状态：macOS 自动化使用 mock Keychain 和 mock HTTP 通过；尚未执行真实 Keychain 人工测试；Windows Credential Store 等待独立环境验证。
- 下一步：执行 `SEC-FILE-01D` 综合验证与人工验收，生成跨平台 Keychain、日志、AI 发送和截图验收包。

## SEC-FILE-01D 最终收口（2026-07-16）

- 状态：已完成；未升版本、未打包发布、未创建 tag。
- 开始 HEAD：`4910ff3dbec09ad912fdda3543cae2aaf4dedc0e`。
- 修复提交：`33248b2`、`f60d42c`、`518f0218594f8f3af64a8923d70517441e07c661`。
- 收口 HEAD：`fba74aeb030d89e626a04f665f6ac17b1054601d`，`chore: add git diff check script`。
- 用户人工验收：2026-07-16 通过；覆盖单击选中、双击/Enter/“查看完整详情”进入 Detail、Detail 进入普通 Editor、受保护 Skill 只读查看、Editor 返回 Detail、Detail 返回 Library、Editor 页头按钮位置和 Detail 操作按钮排版。
- 自动验证结果：`npm test` 67/67；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 54/54、contract 4/4；`npm run visual:qa` 11/11；`npm run git:diff:check` 通过。
- 敏感信息扫描：本轮改动和截图未发现真实 API Key、Bearer Token、JWT、密码、真实邮箱或真实用户路径；既有测试夹具假数据保留。
- 平台状态：macOS 当前验证覆盖临时 HOME、可丢弃测试 Skill、自动化回归、视觉 QA 和用户人工 UI 验收；Windows 系统废纸篓尚未验证；Windows Credential Store 尚未验证；真实 macOS Keychain 写入测试已阻塞；模拟 Keychain 和模拟 AI 网络测试已通过。
- 下一步：进入第 6 步 `REL-3.8.2-EVIDENCE-CLOSE`，按平台补齐 Windows、签名/公证、真实升级和回退证据。

## REL-3.8.2-EVIDENCE-CLOSE 最终收口（2026-07-16）

- 状态：已完成；第 6 步可关闭；暂不建议进入第 7 步。
- 文档 commit / 当前 HEAD：`53e7ed3136e89cae52638dfdd9372983a918a0c5`，`docs: close v3.8.2 release evidence`。
- 新增项目文档：`docs/releases/v3.8.2/release-manifest.md`。
- tag 复核：`git rev-parse v3.8.2` 为 annotated tag 对象 `3ef7123660caa1de5fb8787e8d797ae06e9dccf6`；`v3.8.2^{commit}` 为 `2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`；tag commit 是当前审计 HEAD 的祖先。
- 归档复核：`FILES.txt`、`INSTALL-VERIFY.md`、`ROLLBACK.md`、`SHA256SUMS.txt`、`release-manifest.json`、macOS DMG、macOS App Zip、源码包和 Git 回退 bundle 已读取或校验。
- SHA256：在归档目录执行 `shasum -a 256 -c SHA256SUMS.txt`，7 项 OK；仓库根目录直接执行带路径清单会因清单内相对路径上下文失败，未出现哈希内容不匹配证据。
- macOS 结论：DMG 与 App Zip 版本均为 `3.8.2`，bundle id 均为 `com.fengbul.skillpanel`；历史安装烟测记录显示临时 `HOME` 启动 5 秒存活；严格 codesign 仍失败；DMG 没有 stapled notarization ticket；真实升级和安装包回退证据缺失。
- Windows 结论：归档目录没有 `.exe`、`.msi` 或 NSIS 安装器；Windows 安装、Credential Store、系统废纸篓、升级和回退尚未验证。
- Git bundle：`git bundle verify` 通过，包含 `v3.8.2`、`v3.0.0`、`v2.0.0` refs，可作为代码层回退材料。
- 后续门槛：进入第 7 步前先明确目标平台，补齐可信 v3.8.2 升级与回退基线；跨平台候选发布需 Windows 与 macOS 分开完成证据。

## 固定验证级别

### L1 单批开发

```bash
npm test
npm run typecheck
npm run build
```

### L2 稳定线收口

```bash
npm test
npm run typecheck
npm run build
npm run packaging:check
npm run cargo:test
npm run visual:qa
git diff --check
```

### L3 发布

在 L2 基础上执行目标平台 Tauri 构建、安装、启动、版本、数据保留与核心流程人工验证。

## 停止条件

- 目录、分支、HEAD 或版本与本计划不一致。
- 未提交变化中出现无法解释的用户数据或密钥。
- 任务需要覆盖现有原型成果、删除文件或改变产品边界。
- 测试暴露 S0/S1 问题。

## REL-POST-01 当前记录

- 用户结果：v3.8.2 已确认发布。
- 发布 commit：`65140b081962a0177b56c1cf14c572515f320e4e`。
- Dashboard 修复 commit：`421cafc9b51cb1245beb06a4a59d736b9b432d50`。
- 文档同步 commit：`43996ef40aabb1491ea068991d7e3751bb074851`。
- 发布 tag：`v3.8.2` -> `2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`。
- 发布归档 commit：`2f71ba750b7da9ff9186b33dc94aa85e7d86db81`。
- 安装烟测记录 commit：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`。
- 根因：通用 `PageHeader` 迁移后缺少原型/QA 依赖的 `page-header`、`page-title`、`page-subtitle` 类名，Dashboard 页面自身可见，失败来自 selector/DOM 契约。
- 当前验证：前端 40/40、打包配置 6/6、Rust 44/44、类型检查和生产构建通过；`npm run visual:qa` 已恢复 11/11。
- 归档材料：`output/releases/v3.8.2/` 包含 macOS DMG、App Zip、源码归档、Git 回退包、SHA256SUMS、安装验证记录和回退说明。
- 当前缺口：Windows NSIS/MSI 未在 macOS 本机生成；macOS 签名校验失败，仍需签名/公证环境处理；上一版安装包回退材料未在本地找到。
- 下一步：Windows 或 CI 生成安装器，补齐签名/公证、真实安装/升级验证和上一版安装包回退材料。

## DOC-NAV-01 当前记录

- 用户结果：产品文档已明确顶部主导航为 Dashboard、Library、Logs、Dependencies、Settings；Detail、Editor、Create、AI Assistant、Preview 统一归属 Library 任务链路。
- 开始 HEAD / 当前 HEAD：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`。
- 实际修改：项目 README、AGENTS、应用壳模块文档、Editor 模块文档；Obsidian PRD、UI 规范、README、AGENTS、项目状态、当前计划、开发日志和两份当前 SOP。
- 验证依据：`src/components/TopBar.tsx` 的五个导航项；`src/store/uiStore.ts` 的主视图与次级视图；`src/detail/DetailView.tsx` 的 Editor 入口；`src/AppShell.tsx` 的任务页面渲染；v3.8.2 视觉 QA 11/11。
- 新读者测试：可准确识别五个顶部导航、Editor 入口、Library 高亮和无上下文空状态；测试发现 Dependencies 优先级与 diff/恢复验收层级含糊，已拆分为导航层级、P0 核心流程和 P1 维护流程，修订后复测通过。
- 文档结论：Editor 保留完整产品需求，同时明确为需要选中 Skill 的上下文工作区；Dependencies 补充为顶部主导航页面。
- 未修改范围：业务代码、路由状态、版本号、tag、构建与发布材料。
- commit：`3c0c3cab6171eb3d29ab1bff3c292720423289ac`，`docs: clarify navigation ownership`。
- 下一步：进入 `SEC-FILE-01`，继续保持 Library 任务页归属和五个顶部导航。

## REL-3.8.3-CANDIDATE-MACOS 当前计划补充（2026-07-16）

- 当前状态：第 7 步 macOS 单平台候选已完成；等待用户执行第 8 步人工验收。
- 平台口径：macOS 可继续；Windows 延期，后续需独立候选和独立验证。
- 候选代码提交：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。
- 候选记录提交：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。
- 构建命令：`PATH="$HOME/.cargo/bin:$PATH" npm run tauri:build:macos`。
- 输出目录：`output/releases/v3.8.3-candidate/`。
- 候选 DMG：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg`，SHA256 `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584`。
- 第 8 步基线：`output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`，SHA256 `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`。
- 第 8 步待办：创建可丢弃测试 Skill，记录升级前数据，安装候选 DMG，验证数据保留，再使用 v3.8.2 DMG 做安装包回退。
- 正式发布阻塞：Developer ID 签名、公证 profile、Gatekeeper 验证、stapler 验证；Windows 候选与 Windows 验证另行处理。
