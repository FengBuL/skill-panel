---
title: Skill Panel 项目状态
date: 2026-07-10
updated: 2026-07-17
tags: [SkillPanel, 项目状态, 基线]
status: active
---

# Skill Panel 项目状态

> [!failure] v3.8.3 candidate-1 L3 安装验收失败
> 2026-07-16 第 8 步安装验收发现：安装版显示虚拟 Skill 数据，Library 缺少分页。失败候选代码 commit 为 `17bde2b4130a564faf81b23cd2c7c4bcb433db8d`，记录 commit 为 `cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。当前进入 `REL-3.8.3-L3-REAL-DATA-PAGE-01` 修复批次；保留原候选目录和 SHA256，禁止 tag 和正式发布。

> [!info] v3.8.3 candidate-2 修复完成，等待重新执行第 8 步
> 2026-07-17 candidate-2 产物已生成并等待 macOS 人工安装、真实数据、分页、升级和回退验收。第 8 步仍处于待重新验证状态，禁止提前写成 L3 通过，禁止创建正式 tag 或正式发布。

> [!success] v3.8.2 已发布，历史发布证据已收口
> 用户已确认 v3.8.2 发布；发布提交与版本号已核验。Dashboard 视觉 QA 修复提交为 `421cafc9b51cb1245beb06a4a59d736b9b432d50`，当前视觉 QA 为 11/11。`v3.8.2` tag、macOS DMG/App Zip、源码归档、Git 回退包和 SHA256 清单已建立。发布归档提交为 `2f71ba750b7da9ff9186b33dc94aa85e7d86db81`，安装烟测记录提交为 `ec58c8deb2dcaeefc845d3762d7af13e6ed87590`。REL-3.8.2-EVIDENCE-CLOSE 文档 commit 为 `53e7ed3136e89cae52638dfdd9372983a918a0c5`，新增 `docs/releases/v3.8.2/release-manifest.md`；Windows 安装包、macOS 签名/公证、真实升级和上一版安装包回退材料仍为证据缺失或尚未验证。

> [!info] 当前优化阶段：SOP 第 6 步 REL-3.8.2-EVIDENCE-CLOSE 已完成
> FIX-DASHBOARD-01、AUDIT-REAL-FLOW-01、UI-GAP-01、DATA-EDITOR-01、SEC-FILE-01A、SEC-FILE-01B、SEC-FILE-01C、SEC-FILE-01D 和 REL-3.8.2-EVIDENCE-CLOSE 已完成。WorkBuddy 原型稳定 commit 为 `6626908c9b2a5ac7cdb7452dbf1fb3798c35c2ab`。SEC-FILE-01D 收口 HEAD 为 `fba74aeb030d89e626a04f665f6ac17b1054601d`；第 6 步文档收口 HEAD 为 `53e7ed3136e89cae52638dfdd9372983a918a0c5`。当前没有升版本、打包发布或创建新 tag；因签名、公证、Windows 和真实升级/回退证据不足，暂不建议进入第 7 步。

## 唯一目录说明

| 角色 | 完整路径 | 分支 | 版本 | 当前用途 |
|---|---|---|---|---|
| Codex 稳定开发线 | `/Users/shovy/Documents/skill-panel-codex-v3.8` | `codex/agent-codex-v3.8` | `3.8.2` | 已发布代码线与发布后验证，Dashboard 视觉 QA 已修复 |
| WorkBuddy 原型线 | `/Users/shovy/Documents/skill-panel-workbuddy-v3.8.1-prototype` | `workbuddy/v3.8.1-prototype` | `3.8.1` | UI-GAP-01 已验收；作为 DATA-EDITOR-01 与 SEC-FILE-01 的原型依据 |
| 历史参考线 | `/Users/shovy/Documents/skill-panel-workbuddy-v3.9-discarded-20260708` | `workbuddy/v3.9-mixed` | `3.9.0` | 只读历史参考 |
| Git 管理目录 | `/Users/shovy/Documents/skill-panel` | `codex/v3.8-ui-parity` | `3.8.0` | 原始仓库与 worktree 管理 |
| v3 集成历史线 | `/Users/shovy/.codex/worktrees/skill-panel-v3-integration` | `codex/skill-panel-v3-integration` | `3.0.0` | 历史集成与审计 |

## 当前代码基线

### Codex 稳定开发线

- 当前 HEAD：`53e7ed3136e89cae52638dfdd9372983a918a0c5`。
- 发布提交：`65140b081962a0177b56c1cf14c572515f320e4e`，`feat: release v3.8.2 notion ui migration`。
- 发布后修复提交：`421cafc9b51cb1245beb06a4a59d736b9b432d50`，`fix: restore dashboard visual qa parity`。
- 文档同步提交：`43996ef40aabb1491ea068991d7e3751bb074851`，`docs: sync v3.8.2 dashboard qa status`。
- 测试隔离修复提交：`2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`，`test: isolate settings store temp cleanup`。
- 发布归档提交：`2f71ba750b7da9ff9186b33dc94aa85e7d86db81`，`chore: archive v3.8.2 release artifacts`。
- 安装烟测记录提交：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`，`docs: record v3.8.2 install smoke`。
- REL-3.8.2-EVIDENCE-CLOSE 文档提交：`53e7ed3136e89cae52638dfdd9372983a918a0c5`，`docs: close v3.8.2 release evidence`。
- 发布 tag：`v3.8.2` -> `2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`。
- 版本：`package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml` 均为 `3.8.2`。
- 工作区：`2026-07-16 16:24 CST` 干净。DOC-NAV-01 已提交为 `3c0c3cab6171eb3d29ab1bff3c292720423289ac`；DATA-EDITOR-01 已提交为 `9993992a164fd9f12fe8312223d0238e5b107666`；SEC-FILE-01A 已提交为 `e962960fc51159516367f2f9d993fd63fa8e4da1`；SEC-FILE-01B 已提交为 `e06441df474b017ca01624c99d0c1d207d7288b8`；SEC-FILE-01C 已提交为 `4910ff3dbec09ad912fdda3543cae2aaf4dedc0e`；SEC-FILE-01D 修复提交为 `518f0218594f8f3af64a8923d70517441e07c661`，收口脚本提交为 `fba74aeb030d89e626a04f665f6ac17b1054601d`；REL-3.8.2-EVIDENCE-CLOSE 文档提交为 `53e7ed3136e89cae52638dfdd9372983a918a0c5`。
- 已验证稳定基线：前端 67/67、打包配置 6/6、Rust lib 54/54、contract 4/4、类型检查和生产构建通过；视觉 QA 11/11，`npm run git:diff:check` 已接入并通过。
- 视觉证据：`output/playwright/visual-qa-report.json`、`docs/design-migration-results/skill-panel-redesign-notion/`。
- 发布归档：用户确认已发布；`v3.8.2` tag 已创建；macOS 归档位于 `output/releases/v3.8.2/`；`docs/releases/v3.8.2/release-manifest.md` 已完成。Windows 安装包、macOS 签名/公证、真实升级和安装包回退证据仍待补齐。

### WorkBuddy 原型线

- HEAD：`6626908c9b2a5ac7cdb7452dbf1fb3798c35c2ab`，`design(prototype): UI-GAP-01-REV2 final prototype and handover`。
- 工作区：干净，无未跟踪文件。
- UI-GAP-01：Editor 12 个状态、Detail 10 个状态；原始与三套纯应用截图合计 88 张。
- 交接文件：`docs/design-prototypes/ui-gap-01/prototype-handover.md`；截图清单：`docs/design-prototypes/ui-gap-01/screenshots/SCREENSHOT_MANIFEST.md`。
- 已确认契约：归档使用 `AppSettings.skillArchives + save_app_settings`；`toggle_skill_enabled` 只用于启停；内部备份由 Rust 后端安全函数完成。

## 当前 SOP 进度

| 步骤 | 批次 | 状态 | 证据 |
|---|---|---|---|
| 1 | FIX-DASHBOARD-01 | 已完成 | `421cafc…`、视觉 QA 11/11 |
| 2 | AUDIT-REAL-FLOW-01 | 已完成 | [[../日常总结/参考资料/Skill Panel AUDIT-REAL-FLOW-01 真实功能审计]] |
| 3 | UI-GAP-01 | 已完成 | WorkBuddy `6626908…`、[[../日常总结/参考资料/UI-GAP-01-REV2 交付总结]] |
| 4 | DATA-EDITOR-01 | 已完成 | `9993992…`、L2 通过、用户 2026-07-15 人工验收通过 |
| 5 | SEC-FILE-01 | 已完成，平台待验证项已转 Backlog | `fba74ae…`，SEC-FILE-01A/B/C/D 自动验证通过，2026-07-16 人工验收通过 |
| 6 | REL-3.8.2-EVIDENCE-CLOSE | 已完成，缺失项已明示 | `docs/releases/v3.8.2/release-manifest.md`、`output/releases/v3.8.2/`、[[RELEASE-READINESS]] |

## DATA-EDITOR-01 过程快照（00:22）

- 开始/当前 HEAD：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`；尚无 commit。
- 当前实现文件快照：`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock`、`src-tauri/src/skill_store.rs`、`src-tauri/src/version_store.rs`、`src/components/ai/DiffModal.tsx`、`src/editor/EditorView.tsx`、`src/lib/invoke.ts`、`src/pages/Editor/Editor.css`、`src/App.editor.test.tsx`、`src/AppShell.test.tsx`。
- 当前差异规模快照：连同 4 份 DOC-NAV 文档共 14 个文件，约 1063 行新增、57 行删除；最终清单以批次收尾证据为准。
- 已看到的候选实现：规范化路径 SHA256 版本身份、微秒级快照 ID、20 份/30 天保留、恢复前快照与临时文件替换、Editor 保存失败保留草稿、外部冲突 diff 与二次确认、版本历史和恢复 UI、AI diff 草稿提示、模态框焦点处理与相关测试。
- 当前验证：`git diff --check` 通过；尚未读取到当前工作区的前端、Rust、构建或视觉 QA 完成报告。
- 阶段结论：本段保留开发过程证据；最新状态见下方“DATA-EDITOR-01 收口状态”。

## DATA-EDITOR-01 当前验证状态

- 状态：已完成；已形成稳定 commit。
- 记录时间：2026-07-15 19:00 CST。
- 开始 HEAD：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`。
- DOC-NAV-01 commit：`3c0c3cab6171eb3d29ab1bff3c292720423289ac`，`docs: clarify navigation ownership`。
- DATA-EDITOR-01 commit / 当前 HEAD：`9993992a164fd9f12fe8312223d0238e5b107666`，`feat: close editor data safety workflow`。
- 提交前工作区：17 个修改文件；文件清单 SHA256 为 `242b4ae15c5775cfc2b567557157e7fc04bf624a1db74c6f314a89dcd34431ed`；`prototype-parity-library-1280x768.png` 工作区 SHA256 与 HEAD 均为 `705ee97b524abcc156ea5caf1b5f9ee41b1c222871772263b1d5e7a465133807`，因此已退出修改清单。
- 用户验收：2026-07-15，DATA-EDITOR-01 临时测试 Skill 人工验收通过，覆盖 Editor 进入、保存禁用、修改与保存、重启保留、撤销、外部冲突、diff 与覆盖确认、版本历史、安全恢复、同名 Skill 版本隔离、AI diff 草稿、弹窗和键盘操作。
- 核心实现：Editor 读取和 dirty 状态、保存禁用、保存失败草稿保留、撤销确认、SHA256 外部冲突检测、diff 预览、强制覆盖二次确认、版本历史、恢复确认、AI diff 草稿写入、模态框焦点锁定/Esc/ARIA/焦点恢复。
- Rust 数据安全：版本身份改为规范化完整路径 SHA256；快照保留 20 份/30 天；恢复前创建当前快照；恢复先读快照再临时文件替换；测试使用临时版本库和临时 Skill。
- 验证结果：2026-07-15 18:56–18:58 CST 重新完成 L2：`npm test` 44/44；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 45/45、contract 3/3；`npm run visual:qa` 11/11；`git diff --check` 通过。
- 视觉证据：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-editor-1440x960.png`；报告 `/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`，`generatedAt` 为 `2026-07-15T10:58:00.241Z`。
- 未完成：未升版本、未打包发布；真实安装/升级验证未做；删除、归档、系统废纸篓、打开目录、Keychain 和日志脱敏留给 `SEC-FILE-01`。
- 下一步：开始 SOP 第 5 步 `SEC-FILE-01`，只处理 Editor 之外的文件操作、来源保护、Keychain、日志脱敏和 AI 发送安全。

## SEC-FILE-01A 当前验证状态

- 状态：已完成；未升版本、未打包发布、未创建 tag。
- 记录时间：2026-07-15 20:47 CST。
- 开始 HEAD：`9993992a164fd9f12fe8312223d0238e5b107666`。
- SEC-FILE-01A commit / 当前 HEAD：`e962960fc51159516367f2f9d993fd63fa8e4da1`，`feat: secure skill file command boundaries`。
- 核心实现：新增 `src-tauri/src/skill_path_guard.rs`，统一 canonicalization、允许根校验、`..` 拒绝、符号链接逃逸拦截、文件路径与 Skill 目录路径区分、扫描根本身拒绝、缺失路径安全失败和来源权限矩阵。
- 来源权限：CodexUser、AgentsUser、Custom 允许本地编辑；PluginCache、System、Unknown 本地文件默认只读；受保护来源允许读取、应用内归档和复制到默认 Codex 用户 Skill 根目录。
- 命令覆盖：`open_skill_folder`、`delete_skill`、`validate_skill`、`read_skill_files`、`write_skill_file`、`analyze_deps`、`clone_skill`、`toggle_skill_enabled` 已接入统一守卫；`toggle_skill_enabled` 只处理启用/禁用 marker，不承担归档。
- 前端覆盖：Detail 页受保护来源展示只读提示；编辑入口切换为“复制到可编辑目录”；打开目录调用 `open_skill_folder`；复制调用 `clone_skill`；新增 `src/lib/skillPermissions.ts` 作为前端统一权限判断。
- 测试证据：临时 HOME、临时自定义根、临时插件缓存和可丢弃 Skill 覆盖越权路径、允许路径、符号链接逃逸、`..` 文件名、扫描根本身、受保护来源写/删/启停拒绝、受保护来源复制和同名复制冲突。
- L2 结果：`npm test` 47/47；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 49/49、contract 3/3；`npm run visual:qa` 11/11；`git diff --check` 通过。
- 视觉证据：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`，`generatedAt` 为 `2026-07-15T12:46:41.235Z`。
- 未完成：删除本地文件 UI 接通、系统废纸篓、应用内归档持久化 UI、Keychain 状态、日志脱敏、AI 发送安全留给后续批次。
- 下一步：进入 `SEC-FILE-01B`，接通 Detail 归档/删除真实流程并继续使用统一路径守卫。

## SEC-FILE-01B 当前验证状态

- 状态：已完成；未升版本、未打包发布、未创建 tag。
- 记录时间：2026-07-15 21:50 CST。
- 开始 HEAD：`e962960fc51159516367f2f9d993fd63fa8e4da1`。
- SEC-FILE-01B commit / 当前 HEAD：`e06441df474b017ca01624c99d0c1d207d7288b8`，`feat: close detail file operation workflow`。
- 核心实现：Detail 页接通应用内归档和取消归档，使用 `AppSettings.skillArchives` 与 `save_app_settings` 持久化；打开目录继续复用 `open_skill_folder` 守卫并显示成功/失败反馈；复制到可编辑目录增加目标名称确认，成功后进入新 Skill Detail 并显示新路径与 User 来源；删除本地文件改为后端备份加系统废纸篓事务。
- 删除事务：`delete_skill` 只允许可编辑来源，复用 5A canonicalization、允许根和来源权限守卫；删除前由 Rust 复制完整 Skill 目录到允许根下 `.skill-panel-backups`，备份路径位于被删除目录之外；备份成功后调用 `trash` 依赖移入系统废纸篓；成功返回 Skill 名称、原路径、备份路径、废纸篓结果和恢复说明；废纸篓失败时保留原目录和备份并返回通用错误。
- 前端安全：删除弹窗展示 Skill 名称、来源、完整路径、影响目录、废纸篓与应用内备份说明、恢复方式和确认勾选框；未勾选时最终按钮禁用；模态框支持焦点锁、Esc、ARIA 和关闭后焦点恢复，危险操作初始焦点在取消按钮。
- 测试证据：前端 mock 覆盖归档持久化、取消归档、复制命名确认、删除勾选、受保护来源删除禁用和 store 刷新；Rust 测试使用 `std::env::temp_dir()` 下 `skill-store-delete-backup-*` 可丢弃 Skill 验证备份和 macOS 系统废纸篓行为，未触碰真实 Skill。
- L2 结果：`npm test` 51/51；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 49/49、contract 4/4；`npm run visual:qa` 11/11；`git diff --check` 通过。
- 视觉证据：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`，`generatedAt` 为 `2026-07-15T13:50:15.755Z`；Detail 截图为 `output/playwright/sec-file-01b-detail-1280x800.png` 和 `output/playwright/sec-file-01b-detail-delete-modal-1280x800.png`。
- 平台状态：macOS 已通过临时 Skill 废纸篓事务测试；Windows 等待独立验证；Linux 当前走 `trash` crate 支持路径，等待目标环境验证。
- 未完成：Keychain、日志脱敏和 AI 发送安全留给 `SEC-FILE-01C`；Windows 回收站行为仍需 Windows 环境验证。
- 下一步：进入 `SEC-FILE-01C`，处理 Keychain 状态、日志脱敏和 AI 发送安全。

## SEC-FILE-01C 当前验证状态

- 状态：已完成；未升版本、未打包发布、未创建 tag。
- 记录时间：2026-07-16 11:36 CST。
- 开始 HEAD：`e06441df474b017ca01624c99d0c1d207d7288b8`。
- SEC-FILE-01C commit / 当前 HEAD：`4910ff3dbec09ad912fdda3543cae2aaf4dedc0e`，`feat: secure ai keys logs and outbound ai`。
- 核心实现：新增 Rust/TypeScript 统一语义脱敏，覆盖 API Key、Bearer/Authorization、token/secret/password/api_key、JWT、用户路径、邮箱、URL 敏感查询参数、JSON 嵌套字符串和错误信息；后端日志写入前脱敏，读取旧 JSONL 时再次脱敏，损坏日志行静默跳过；前端 Logs、Toast、错误边界和控制台输出增加展示前脱敏。
- Keychain 状态契约：`set_ai_key` / `set_api_key` 仅写系统 Keychain 或 Credential Store；`get_ai_key` 对前端只返回是否配置；`get_api_key` 仅后端内部使用；`has_api_key` 返回布尔状态；vendor 限定为 `openai`、`claude`、`glm`、`ollama`；测试使用内存 mock Keychain，未写用户真实 Keychain。
- AI 发送安全：默认开启脱敏；发送前显示服务商、内容范围、脱敏状态和预览；用户可取消；关闭脱敏需单次风险确认；后端校验 `sendConfirmed`、`rawContentConfirmed` 和预览一致性，未确认时禁止网络请求；服务商和 endpoint 走允许列表；自动化测试使用 mock 网络；AI 返回继续进入 Editor 草稿，保存后才写文件。
- L2 结果：`npm test` 54/54；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 54/54、contract 4/4；`npm run visual:qa` 11/11；`git diff --check` 通过。
- 敏感信息扫描：`src`、`src-tauri`、`docs`、`output` 中 Markdown、JSON、TS/TSX、Rust、文本和 JSONL 扫描无真实 key、Bearer 或 JWT 命中；`src-tauri/target` 与 `output/releases` 已排除；受限表达扫描无命中。
- 截图证据：`output/playwright/v38-settings-1280x800.png`、`output/playwright/v38-logs-1280x800.png`、`output/playwright/v38-editor-1440x960.png`、`output/playwright/sec-file-01c-ai-assistant-1280x800.png`；报告 `output/playwright/visual-qa-report.json` 的 `generatedAt` 为 `2026-07-16T03:36:12.984Z`。
- 平台状态：macOS 已通过 mock Keychain 和 mock 网络自动化验证；未执行真实 Keychain 人工测试，因为本批次没有用户确认的虚构 Key；Windows Credential Store 等待 Windows 环境独立验证，macOS 结果不能代表 Windows。
- 下一步：进入 `SEC-FILE-01D` 综合验证与人工验收，重点覆盖 macOS 虚构 Key 人工 Keychain 测试、Windows Credential Store、真实 Settings/Logs/AI Rail/AI Assistant 操作路径和回归截图复核。

## SEC-FILE-01D 当前验证状态

- 状态：已完成；未升版本、未打包发布、未创建 tag。
- 记录时间：2026-07-16 14:52 CST。
- 开始 HEAD：`4910ff3dbec09ad912fdda3543cae2aaf4dedc0e`。
- 修复提交：`33248b2`、`f60d42c`、`518f0218594f8f3af64a8923d70517441e07c661`；最终收口 HEAD：`fba74aeb030d89e626a04f665f6ac17b1054601d`。
- 人工验收：2026-07-16 用户确认通过，覆盖 Library 单击选中、双击/Enter/“查看完整详情”进入 Detail、Detail 点击“编辑”进入正常 Editor、受保护 Skill 进入只读查看流程、Editor 返回 Detail、Detail 返回 Library、Editor 页头“AI 辅助”“返回”位置、Detail 操作按钮排版。
- 自动验证：`npm test` 67/67；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 54/54、contract 4/4；`npm run visual:qa` 11/11；`npm run git:diff:check` 通过。
- 视觉证据：`output/playwright/visual-qa-report.json`；SEC-FILE-01D 流程截图为 `output/playwright/sec-file-01d-flow-library-selected-1280x800.png`、`output/playwright/sec-file-01d-flow-library-detail-entry-1280x800.png`、`output/playwright/sec-file-01d-flow-detail-editable-1280x800.png`、`output/playwright/sec-file-01d-flow-detail-protected-1280x800.png`、`output/playwright/sec-file-01d-flow-editor-normal-1280x800.png`、`output/playwright/sec-file-01d-flow-editor-readonly-1280x800.png`、`output/playwright/sec-file-01d-flow-detail-1024x768.png`、`output/playwright/sec-file-01d-flow-editor-1024x768.png`、`output/playwright/sec-file-01d-flow-detail-1440x960.png`、`output/playwright/sec-file-01d-flow-editor-1440x960.png`。
- 敏感信息扫描：本轮改动和截图未发现真实 API Key、Bearer Token、JWT、密码、真实邮箱或真实用户路径；命中项仅为既有测试夹具中的假邮箱、假 Key 和假路径。
- 平台状态：macOS 当前验证覆盖临时 HOME、可丢弃测试 Skill、自动化回归、视觉 QA 和用户人工 UI 验收；macOS 临时 Skill 系统废纸篓事务已在 SEC-FILE-01B 验证。Windows 系统废纸篓尚未验证；Windows Credential Store 尚未验证；真实 macOS Keychain 写入测试已阻塞，原因是缺少本轮用户明确同意写入虚构 Key 的步骤；模拟 Keychain 和模拟 AI 网络测试已通过。
- 结论：SOP 第 5 步可按当前证据关闭；Windows 与真实 Keychain 项继续进入 [[BACKLOG]] 和 [[RELEASE-READINESS]]，进入第 6 步时不得写成跨平台全部完成。

### Git 管理目录

- HEAD：`09930f087b50c802ae840db93c4d355c00957dbf`
- 工作区：干净。
- 视觉 QA 文档显示 v3.8 页面覆盖 11 个场景，原始证据位于该目录 `output/playwright/`。

## 已确认能力

- 跨平台桌面外壳：Tauri 2、React 19、TypeScript、Rust。
- 顶部主导航：Dashboard、Library、Logs、Dependencies、Settings。
- Library 任务链路：Detail、Editor、Create、AI Assistant、Preview；进入这些页面时 Library 保持高亮。
- Skill 扫描、搜索、查看、草稿编辑、预览、新建、API Key 保存和日志读取已有真实连接或可验证入口。
- Editor 需要已选中的 Skill，从 Detail 或 Create 流程进入；真实保存、备份、外部冲突、版本隔离和安全恢复已由 DATA-EDITOR-01 收口。
- 中英文切换。
- 视觉 QA 覆盖 1024×768、1280×800、1440×960。
- Windows NSIS、可选 MSI、macOS app/dmg 打包配置。
- 本地 Skill 文件版本快照、设置、监听、AI 辅助与调用日志相关模块已有文档。

## 已知风险

| 风险 | 级别 | 处理要求 |
|---|---|---|
| Windows 安装包和 SHA256 台账缺失 | S1 | 在 Windows 或 CI 环境生成 NSIS/MSI，记录文件大小与 SHA256 |
| macOS 签名和公证未通过 | S1 | 使用正式证书重新签名、公证并复验 Gatekeeper |
| 上一版安装包回退材料缺失 | S1 | 从历史 Release 或 CI artifact 补齐可安装回退包 |
| v3.8.2 真实升级与安装包回退证据仍缺 | S1 | 第 6 步已明确证据缺失；进入第 7 步前按目标平台补齐可信基线 |
| 部分迁移页面仍含展示型数据和暂未连接按钮 | S1 | WorkBuddy 完成 UI，Codex 分批连接真实命令并补测试 |
| Keychain 人工平台验证仍未完成 | S1 | 真实 macOS Keychain 写入测试已阻塞，等待用户明确同意虚构 Key 和清理路径；Windows Credential Store 需 Windows 环境独立验证 |
| npm audit 报告 1 个 high severity 依赖项 | S1 | 单独定位依赖链，评估升级影响后处理 |
| 插件缓存 Skill 可编辑或删除 | S1 | 增加备份、二次确认与显著风险提示 |
| API Key、路径、日志敏感信息需要持续防回归 | S1 | 保留 SEC-FILE-01C 脱敏测试、扫描和截图检查，后续批次继续执行敏感信息扫描 |
| macOS 签名与公证尚需真实环境验收 | S2 | 正式发布前完成签名、公证与安装验证 |
| 多个 worktree 与相似目录并存 | S2 | 每次开工先核对 `pwd`、分支与 HEAD |
| 历史文档口径跨 0.1.0、2.x、3.x、3.8.x | S2 | 主文件写当前事实，历史快照保留原文 |

## 当前文档基线

- 文档库：`/Users/shovy/Library/Mobile Documents/iCloud~md~obsidian/Documents/notes/skill panel项目总揽/skill panel`
- 产品需求：[[PRD]]
- 当前主计划：[[CURRENT-PLAN]]
- 长期规则：[[AGENTS]]
- 完成台账：[[DEVELOPMENT-LOG]]
- 发布判断：[[RELEASE-READINESS]]

## 文档同步状态

同步基线：`2026-07-16 16:24 CST`；`last_sync_head`：`53e7ed3136e89cae52638dfdd9372983a918a0c5`；`last_sync_branch`：`codex/agent-codex-v3.8`；`last_sync_worktree_fingerprint`：`CLEAN`。REL-3.8.2-EVIDENCE-CLOSE 已完成历史证据 manifest，缺失项已按平台记录；当前工作区干净。

| 文件 | 项目路径 | Obsidian 路径 | 项目 SHA256 | Obsidian SHA256 | 语义状态 | 最后同步时间 |
|---|---|---|---|---|---|---|
| README.md | `/Users/shovy/Documents/skill-panel-codex-v3.8/README.md` | `skill panel/README.md` | `b4376306878d203e5fb6e61d6afd132527d8bad15caf31558062c844e4ab5a31` | `6857cf473ccc3b68fc067350112d675ac5c569daa62c464f8e352df9789f383e` | 已同步，正文导航语义一致；Obsidian 含专用属性、双链与中文导航 | 2026-07-15 19:00 CST |
| AGENTS.md | `/Users/shovy/Documents/skill-panel-codex-v3.8/AGENTS.md` | `skill panel/AGENTS.md` | `7d5b4e146ef7a5f7a04492627e7cff2210ecfb223164789fb5c09a51c8328bec` | `d468c7d19d4050e07e3f1fb7de01950855424e16fd7b8194df69d02f4596780c` | 已同步，有效规则一致；Obsidian 保留 DOC-NAV-01 规则变更记录并修正旧 Obsidian 目录引用 | 2026-07-16 14:52 CST |
| PRD.md | 项目侧缺失 | `skill panel/PRD.md` | 缺失 | `e44573e105bc756a288aff802f28d28ac7e3a1e0513ad3b26c0c6c76c060e5e1` | 项目侧缺失；Obsidian 已明确 Library → Detail → Editor 最终流程和 SEC-FILE-01D 验收确认 | 2026-07-16 14:52 CST |
| PROJECT_STATE.md | 项目侧缺失 | `skill panel/PROJECT_STATE.md` | 缺失 | 自描述文件；本轮写入前校验为 `a6765c410960c501412b61e304f753200614a0bc42f9d9096d3ace28a6516707` | 项目侧缺失；Obsidian 已记录第 6 步完成、证据缺失项和第 7 步条件不足 | 2026-07-16 16:24 CST |
| CURRENT-PLAN.md | 项目侧缺失 | `skill panel/CURRENT-PLAN.md` | 缺失 | 写入前校验为 `5d257320636e3d0e0a974529ceed3d49e07183f5d1ab2ff8fa80a7d943fe54a8` | 项目侧缺失；Obsidian 当前计划将 REL-3.8.2-EVIDENCE-CLOSE 标记为已完成，候选发布仍待条件满足 | 2026-07-16 16:24 CST |
| DEVELOPMENT-LOG.md | 项目侧缺失 | `skill panel/DEVELOPMENT-LOG.md` | 缺失 | 写入前校验为 `51a2d93f8535df101c3c940fcf1bcbfe2dd360f4e2f9f373bafde4b8ef1e2f32` | 项目侧缺失；Obsidian 已追加 REL-3.8.2-EVIDENCE-CLOSE 收口记录，原失败记录保留 | 2026-07-16 16:24 CST |
| BACKLOG.md | 项目侧缺失 | `skill panel/BACKLOG.md` | 缺失 | `0c67a4f6f8db746b29163b343340568729d1b6cc43f8a08493aa23e2cbecc439` | 项目侧缺失；Windows 废纸篓、Windows Credential Store 和真实 macOS Keychain 已拆为待验证项 | 2026-07-16 14:52 CST |
| UI-SPECIFICATION.md | 项目侧缺失 | `skill panel/UI-SPECIFICATION.md` | 缺失 | `b9116f7170704ace0991278b5beada72d4e149aa077506c44c29365b82ee9869` | 项目侧缺失；Obsidian 已同步最终操作顺序和页头排版验收结论 | 2026-07-16 14:52 CST |
| RELEASE-READINESS.md | 项目侧缺失 | `skill panel/RELEASE-READINESS.md` | 缺失 | 写入前校验为 `b7ee813507cfb8d7c8885393ecbf3c0c1ea2af7ee6331b5f57f713515088a057` | 项目侧缺失；Obsidian 已记录第 6 步发布证据收口和平台边界 | 2026-07-16 16:24 CST |
| delivery.md | 项目侧缺失 | `skill panel/delivery.md` | 缺失 | `757a6f9cfc3b099fee0dc65f2f6096c3aef63986e314f5ce89826780fa6c1bd8` | 项目侧缺失；Obsidian 已生成第 2 步交接包 | 2026-07-13 10:50 CST |
| Skill Panel 优化流程旧版 SOP | 项目侧缺失 | 2026-07-17 外部归档 | 缺失 | 原同步校验为 `8d900149b1bd1e97995cc674302ca7d9889903983e9b25c7ef9904542a60ac9e` | 现行规则见 [[../日常总结/01-Skill-Panel执行SOP]] | 2026-07-17 |
| Skill Panel 优化流程旧版思维导图 | 项目侧缺失 | 2026-07-17 外部归档 | 缺失 | 原同步校验为 `db176945739b10aa8bfadfeaec4b76808878c8af37fa951aaf1145cad0825be2` | 正文镜像已归档，现行流程图见 [[../日常总结/01-Skill-Panel执行SOP]] | 2026-07-17 |

## 下一步

1. 第 6 步 `REL-3.8.2-EVIDENCE-CLOSE` 可关闭，依据为 `docs/releases/v3.8.2/release-manifest.md` 和文档 commit `53e7ed3…`。
2. 进入第 7 步前，先补齐目标平台可信 v3.8.2 基线：macOS 签名/公证或分发边界、真实升级、安装包回退；Windows 安装包、安装、Credential Store、系统废纸篓、升级和回退。
3. 保持 DATA-EDITOR-01 当前 commit `9993992…`、SEC-FILE-01D 收口 HEAD `fba74ae…` 和 REL-3.8.2-EVIDENCE-CLOSE 文档 HEAD `53e7ed3…` 作为 v3.8.3 候选前置基线。
4. 暂不建议进入第 7 步；另行复核 npm audit high severity 依赖项。

## REL-3.8.3-CANDIDATE-MACOS 当前记录（2026-07-16）

- 状态：macOS 内部验收候选已生成，可进入第 8 步本机人工验收；正式对外发布仍阻塞。
- 分支：`codex/agent-codex-v3.8`。
- 开始 HEAD：`53e7ed3136e89cae52638dfdd9372983a918a0c5`。
- 候选代码提交：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。
- 候选记录提交 / 当前 HEAD：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。
- 版本：`3.8.3`。
- 目标平台：macOS；Windows 延期，不能写成 Windows 已验证。
- 版本文件：`package.json`、`package-lock.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock` 均为 `3.8.3`。
- 候选 DMG：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg`，大小 `4964044` bytes，SHA256 `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584`。
- 候选 App Zip：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.app.zip`，大小 `4952711` bytes，SHA256 `023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e`。
- bundle id：`com.fengbul.skillpanel`；应用版本：`3.8.3`；架构：`arm64`。
- 第 8 步基线：`output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`，SHA256 `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`。
- 签名状态：本机缺少 Developer ID Application 和有效 codesign identity；候选 App 只有 ad-hoc/linker-signed 签名，严格 codesign 未通过。
- 公证状态：notarytool 缺少可用凭据；DMG 没有 stapled ticket。
- 文档同步：仓库内 `PROJECT_STATE.md`、`CURRENT-PLAN.md`、`DEVELOPMENT-LOG.md`、`RELEASE-READINESS.md`、`SOP.md`、`SOP-mindmap.md`、候选清单和第 8 步准备材料均已中文化；本目录已追加本次记录。
- 流程文件位置：`../流程文件/SOP.md`、`../流程文件/SOP-mindmap.md`、`../流程文件/v3.8.3-candidate-release-manifest.md`、`../流程文件/v3.8.3-step-8-prep.md`。
