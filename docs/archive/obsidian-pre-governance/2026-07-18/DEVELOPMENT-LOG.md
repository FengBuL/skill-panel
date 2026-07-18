---
title: Skill Panel 开发台账
date: 2026-07-10
updated: 2026-07-17
tags: [SkillPanel, 开发台账, 版本记录]
status: active
---

# Skill Panel 开发台账

本文件记录已经完成的重要里程碑、代码快照和验证结论。进行中的任务写在 [[CURRENT-PLAN]]。

## 2026-07-16 L3 安装验收失败更正

- 任务：`REL-3.8.3-L3-REAL-DATA-PAGE-01`。
- 第 8 步状态：验证失败，修复中。
- 失败候选代码 commit：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。
- 失败候选记录 commit：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。
- 用户发现：安装版显示虚拟 Skill 数据；Library 缺少分页。
- 更正：保留原候选记录和产物；新修复批次生成 candidate-2；禁止 tag 和正式发布。

## 2026-07-17 candidate-2 第 8 步待重新执行

- 任务：`REL-3.8.3-L3-CANDIDATE-2`。
- candidate-1 状态保持：L3 验证失败。
- candidate-2 状态：修复完成，等待重新执行第 8 步。
- 当前边界：未完成 8A 和 8B 人工验收前，不记录 L3 通过，不进入第 9 步，不创建正式 tag。

## 版本里程碑

| 日期 | 版本/阶段 | 主要成果 | 代码或分支 | 结论 |
|---|---|---|---|---|
| 2026-06-12 | 首版桌面能力 | 扫描、列表、详情、编辑、删除、设置、中英文、双平台打包 | `codex/skill-panel-app` | 完成首轮集成与审查 |
| 2026-06-13 | UI 与视觉 QA | 顶栏、来源导航、资源列表、详情 Inspector、6 个视觉场景 | U001–U019 | Windows 安装链路有历史验证 |
| 2026-06-16 | v2.0.0 | 卡片、分类、标签、持久化、迁移包与 Release | tag `v2.0.0` | 已发布 |
| 2026-06-30 | v3.0.0 QA | Dashboard、Library、Editor、P0 测试、7 个视觉场景 | tag `v3.0.0` | QA 收口完成 |
| 2026-07-06 | v3.7 稳定化 | 实时数据、版本快照、浏览器预览兼容 | `codex/v3.7-stabilization` | 已建立稳定化提交 |
| 2026-07-06 | v3.8 UI | Library、Drawer、Dashboard、Editor、Create、Settings、Logs、11 个视觉场景 | `codex/v3.8-ui-parity` / `09930f0…` | 3.8.0 管理目录基线干净 |
| 2026-07-10 | v3.8.1 收口 | 模块化 UI 与组件变化仍在稳定目录工作区 | `codex/agent-codex-v3.8` / `1bd6f31…` | 等待盘点、验证和提交 |
| 2026-07-11 | v3.8.1 UI 迁移基线 | 十页迁移归档、导航修复、现行测试、四档视口视觉 QA | `codex/agent-codex-v3.8` / `80816e52…` | 已形成可回退基线 |
| 2026-07-11 | WorkBuddy UI 代码线 | 从稳定提交创建 UI 分支和独立 worktree | `workbuddy/v3.8.2-ui-development` / `80816e52…` | 基线验证通过 |
| 2026-07-12 | 恢复原型迁移流程 | 删除独立 UI worktree 和分支，恢复 WorkBuddy 原型、Codex 迁移分工 | `codex/agent-codex-v3.8` / `31b93d2a…`、`3bc3955…` | 已按用户决定回退工作方式 |
| 2026-07-12 | v3.8.2 发布 | Notion 风格 UI 迁移与后端稳健性调整进入发布提交 | `codex/agent-codex-v3.8` / `65140b0…` | 用户确认已发布；Dashboard 视觉复验后续由 `421cafc…` 收口 |
| 2026-07-13 | Dashboard 视觉 QA 修复 | 恢复 PageHeader 原型类名契约，Dashboard 视觉 QA 从 10/11 恢复到 11/11 | `codex/agent-codex-v3.8` / `421cafc…` | 已收口 Dashboard 视觉复验；tag 与安装包归档待补 |
| 2026-07-13 | Dashboard QA 文档同步 | 更新 AGENTS 稳定版本和 Obsidian 状态、计划、交付、发布台账 | `codex/agent-codex-v3.8` / `43996ef…` | 文档口径已同步到 Dashboard 11/11 |
| 2026-07-13 | v3.8.2 发布归档 | 创建 v3.8.2 tag，生成 macOS DMG/App Zip、源码归档、Git 回退包、SHA256 与安装验证记录 | `codex/agent-codex-v3.8` / `2f71ba7…` | macOS 归档已建立；Windows 包与签名/公证待补 |
| 2026-07-13 | v3.8.2 安装烟测补充 | 使用临时 HOME 启动 macOS app 主执行文件 5 秒，补充安装验证记录与 manifest | `codex/agent-codex-v3.8` / `ec58c8d…` | 启动烟测通过；签名/公证待补 |
| 2026-07-11 | DOC-SYNC-01 文档同步基线 | 记录 Codex 稳定线指纹；同步 README 运行参考；确认 AGENTS 字节一致 | `codex/agent-codex-v3.8` / `80816e52…` | 已同步；其余项目侧缺失文件保留 Obsidian 版本 |
| 2026-07-13 | DOC-NAV-01 导航口径统一 | 明确五个顶部导航、Library 任务页归属和 Editor 进入条件 | `codex/agent-codex-v3.8` / `ec58c8d…` | 文档已同步，业务代码未修改 |
| 2026-07-14 | UI-GAP-01-REV2 原型验收 | Editor 保存恢复与 Detail 危险操作形成稳定交付 | `workbuddy/v3.8.1-prototype` / `6626908…` | 设计验收通过；下一步 DATA-EDITOR-01 |
| 2026-07-14 | DATA-EDITOR-01 收口记录 | 保存、冲突、版本和恢复已有验证快照 | `codex/agent-codex-v3.8` / `ec58c8d…` | 后续工作区变化待重新验证；无 commit |
| 2026-07-14 | DATA-EDITOR-01 验证状态更正 | 工作区差异统计在收口后增加 | `codex/agent-codex-v3.8` / `ec58c8d…` | 等待 L2 验证；无 commit |
| 2026-07-15 | DATA-EDITOR-01 最终收口 | Editor 保存、冲突、版本历史、安全恢复和 AI diff 草稿进入稳定基线 | `codex/agent-codex-v3.8` / `9993992…` | L2 与用户验收通过；工作区干净 |
| 2026-07-15 | SEC-FILE-01A 文件命令边界 | 文件命令路径守卫、来源权限矩阵和受保护来源复制进入稳定基线 | `codex/agent-codex-v3.8` / `e962960…` | L2 通过；工作区干净 |
| 2026-07-15 | SEC-FILE-01B Detail 文件操作闭环 | Detail 归档、打开目录、复制、删除和恢复说明进入稳定基线 | `codex/agent-codex-v3.8` / `e06441d…` | L2 通过；macOS 临时 Skill 废纸篓验证通过；Windows 等待独立验证 |
| 2026-07-16 | SEC-FILE-01C 敏感数据安全收口 | Keychain 状态契约、统一脱敏、日志安全和 AI 发送确认进入稳定基线 | `codex/agent-codex-v3.8` / `4910ff3…` | L2 通过；敏感信息扫描通过；真实 Keychain 人工测试和 Windows Credential Store 等待 01D |
| 2026-07-16 | SEC-FILE-01D 人工验收失败更正 | 发现 Detail 页头按钮排版、Library 卡片打开语义、Editor 返回语义 3 项失败 | `codex/agent-codex-v3.8` / `4910ff3…` | 暂停 5D 收口；进入最小范围修复 |

### DOC-SYNC-01

- 日期：2026-07-11
- 任务/版本：文档同步基线（v3.8.1）
- 用户可见结果：Obsidian 已记录稳定开发线、同名文档 SHA256 与同步状态。
- 修改范围：[[README]]、[[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]]。
- 分支：`codex/agent-codex-v3.8`
- commit：`80816e52cb1e58f7f7d2ede5543fb983788fbfce`
- 验证结果：`git status --short --branch` 为空；HEAD、版本 `3.8.1`、同名文档路径和 SHA256 已核验；README 同步章节已复读。
- 截图或报告路径：`docs/development-baselines/ui-migration-checkpoint-2026-07-11.md`（既有基线证据）。
- 已知问题：项目侧缺失 PRD、状态、计划、日志、积压、UI 规范与发布准备同名文件，等待项目文档来源确认。
- 回退点：Obsidian 写入前版本与稳定提交 `80816e52…`。

### REL-POST-01

- 日期：2026-07-12
- 任务/版本：v3.8.2 发布记录与发布后复验
- 用户可见结果：用户确认 v3.8.2 已发布，文档已切换到发布后跟踪状态。
- 修改范围：项目 README；Obsidian [[README]]、[[PRD]]、[[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]]、[[BACKLOG]]、[[UI-SPECIFICATION]]、[[RELEASE-READINESS]]。
- 分支：`codex/agent-codex-v3.8`
- 开始 HEAD：`3bc395507730240f3cb7f15e150eb98645729540`
- 结束 HEAD / commit：`65140b081962a0177b56c1cf14c572515f320e4e`
- 用户确认：v3.8.2 已发布。
- 验证结果：前端 40/40、打包配置 6/6、Rust 44/44、类型检查和生产构建通过；视觉 QA 10/11，Dashboard 可见性断言失败。
- 截图或报告路径：`output/playwright/visual-qa-report.json`、`docs/design-migration-results/skill-panel-redesign-notion/`。
- 失败：`v38-dashboard-1280x800` 未满足 `dashboard is visible`；无控制台错误和页面错误。
- 发布证据缺口：本地未发现 `v3.8.2` tag、安装包、SHA256 和真实安装记录。
- 工作区指纹：`5cc7b99720b0c967dcc5e6d4c207cb1518381e6738a63c4d25729b73c72100dd`。
- 回退点：`3bc395507730240f3cb7f15e150eb98645729540`；历史 UI 基线 `80816e52…`。
- 后续状态：Dashboard 视觉失败已在 `421cafc9b51cb1245beb06a4a59d736b9b432d50` 修复；发布归档证据仍待补齐。

### REL-POST-02

- 日期：2026-07-13
- 任务/版本：v3.8.2 Dashboard 视觉 QA 修复与文档同步
- 用户可见结果：Dashboard 视觉 QA 从 10/11 恢复到 11/11，当前 Dashboard 截图与 Git HEAD 截图一致，页面正确显示。
- 修改范围：`src/components/PageHeader.tsx`、项目 README、`output/playwright/` 视觉证据；本次同步 Obsidian [[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]]、[[delivery]]、[[RELEASE-READINESS]]、[[README]]、[[UI-SPECIFICATION]]、[[BACKLOG]]、[[PRD]]。
- 分支：`codex/agent-codex-v3.8`
- 开始 HEAD：`65140b081962a0177b56c1cf14c572515f320e4e`
- Dashboard 修复 commit：`421cafc9b51cb1245beb06a4a59d736b9b432d50`
- 文档同步 commit：`43996ef40aabb1491ea068991d7e3751bb074851`
- 根因：通用 `PageHeader` 缺少原型/QA 依赖类名 `page-header`、`page-title`、`page-subtitle`，Dashboard 页面本体正常显示，失败来自 selector/DOM 契约。
- 修复类型：轻量修复。
- 验证结果：`npm run visual:qa` 11/11；`npm run typecheck` 通过；`git diff --check` 通过。
- 截图或报告路径：`output/playwright/visual-qa-report.json`、`output/playwright/v38-dashboard-1280x800.png`、`/tmp/skill-panel-dashboard-evidence/head-v38-dashboard-1280x800.png`、`/tmp/skill-panel-dashboard-evidence/65140b0-v38-dashboard-1280x800.png`。
- 截图对照结论：当前工作区 Dashboard 截图 SHA256 与 Git HEAD 截图一致；`65140b0` 截图视觉上同样显示 Dashboard 页面可见，差异集中在 DOM 类名契约与复跑证据。
- 发布证据缺口：本地未发现 `v3.8.2` tag、安装包、SHA256 和真实安装记录。
- 回退点：`65140b081962a0177b56c1cf14c572515f320e4e`。
- 下一步：补齐 tag、安装包 SHA256、安装验证与回退资料。

### REL-POST-03

- 日期：2026-07-13
- 任务/版本：v3.8.2 发布归档材料收口
- 用户可见结果：`v3.8.2` tag 已创建；macOS DMG、App Zip、源码归档、Git 回退包、SHA256 清单、安装验证记录和回退说明已生成。
- 修改范围：`README.md`、`src-tauri/src/settings_store.rs` 测试清理逻辑、`output/releases/v3.8.2/` 发布归档材料；Obsidian [[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]]、[[delivery]]、[[RELEASE-READINESS]]。
- 分支：`codex/agent-codex-v3.8`
- 发布 tag：`v3.8.2` -> `2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`
- 测试修复 commit：`2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`
- 发布归档 commit：`2f71ba750b7da9ff9186b33dc94aa85e7d86db81`
- 安装烟测记录 commit：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`
- 归档目录：`output/releases/v3.8.2/`
- 验证结果：`npm test` 40/40；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` 41 lib + 3 contract 通过；`npm run tauri:build:macos` 生成 `.app` 和 `.dmg`；`shasum -a 256 -c SHA256SUMS.txt` 通过。
- 安装验证：DMG 可挂载；bundle version 为 `3.8.2`；bundle id 为 `com.fengbul.skillpanel`；主执行文件存在且可执行；临时 HOME 启动烟测 5 秒存活。
- 已知问题：`codesign --verify --deep --strict` 报 `code has no resources but signature indicates they must be present`；Windows NSIS/MSI 未在 macOS 本机生成；上一版安装包回退材料未在本地找到。
- 回退点：`v3.8.2` tag、`skill-panel-v3.8.2-rollback.bundle`、`65140b081962a0177b56c1cf14c572515f320e4e`、`80816e52cb1e58f7f7d2ede5543fb983788fbfce`。
- 下一步：在 Windows 或 CI 生成安装器；使用正式证书完成 macOS 签名/公证；补齐真实安装、升级、数据保留和上一版安装包回退验证。

### DOC-NAV-01

- 日期：2026-07-13
- 任务/版本：导航信息架构与 Editor 文档口径统一。
- 用户可见结果：文档清楚列出 Dashboard、Library、Logs、Dependencies、Settings 五个顶部导航，并将 Detail、Editor、Create、AI Assistant、Preview 归入 Library 任务链路。
- 修改范围：项目 `README.md`、`AGENTS.md`、`docs/modules/app-shell-v3.8.1.md`、`docs/modules/editor-v3.8.1.md`；Obsidian [[PRD]]、[[UI-SPECIFICATION]]、[[README]]、[[AGENTS]]、[[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]]；当前 SOP 与其 mindmap 副本。
- 分支：`codex/agent-codex-v3.8`
- 开始 HEAD / 结束 HEAD：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`；本批次未创建 commit。
- 用户确认：要求调整 PRD 整体表达并同步相关文档。
- 验证结果：顶部导航源码为五项；Library 子视图高亮包含 Detail、Editor、Create、AI Assistant、Preview；Detail 编辑按钮进入 Editor；当前视觉 QA 为 11/11；Markdown 章节和 Obsidian 双链复读通过。新读者可正确回答导航与 Editor 路径，并指出两处优先级歧义，已在 PRD 中拆分 P0 核心流程与 P1 维护流程，修订后复测通过。
- 截图或报告路径：`output/playwright/visual-qa-report.json`；本批次无新增截图。
- 已知问题：Editor 真实保存、安全恢复和无上下文空状态仍需 DATA-EDITOR-01 实现；Dependencies 当前真实数据连接缺口继续按审计报告处理，独立视觉 QA 场景已进入 [[BACKLOG]]。
- 回退点：稳定 HEAD `ec58c8deb2dcaeefc845d3762d7af13e6ed87590`；Obsidian iCloud 历史版本。
- 文档同步结果：PRD、UI 规范、README、AGENTS、项目状态、计划、日志、模块文档与 SOP 使用同一导航层级；历史审计报告保持事实快照。
- 下一步：执行 UI-GAP-01 原型验收，再进入 DATA-EDITOR-01。

### UI-GAP-01-REV2

- 日期：2026-07-14
- 任务/版本：UI-GAP-01-REV2 Editor 保存恢复与 Detail 危险操作原型收口。
- 用户可见结果：保存、失败、撤销、外部冲突、版本历史、安全恢复、AI diff 草稿写回、归档、本地删除和受保护来源均有可查看状态与交接说明。
- 原型目录：`/Users/shovy/Documents/skill-panel-workbuddy-v3.8.1-prototype`。
- 分支：`workbuddy/v3.8.1-prototype`。
- 开始 HEAD：`1bd6f31908f05bbd14c057a2048730be6e0db6e7`。
- 结束 HEAD / commit：`6626908c9b2a5ac7cdb7452dbf1fb3798c35c2ab`，`design(prototype): UI-GAP-01-REV2 final prototype and handover`。
- Codex 稳定线：`codex/agent-codex-v3.8` / `ec58c8deb2dcaeefc845d3762d7af13e6ed87590`；本任务未修改稳定业务代码。
- 文件概况：`editor-save-recovery.html`、`detail-dangerous-ops.html`、`prototype-handover.md`、`screenshots/SCREENSHOT_MANIFEST.md` 和 88 张 PNG；废弃的 `detail-screen-06.png` 未进入最终 commit。
- 验证结果：WorkBuddy 工作区干净；Editor 12 个状态、Detail 10 个状态；原始 1280×800 与 chromeless 1280×800、1024×768、1440×960 各 22 张；关键截图抽查无主要内容裁切。
- 设计与安全依据：无修改时保存禁用；外部冲突使用打开时内容 SHA256；覆盖前展示 diff、备份外部版本并二次确认；版本按规范化完整路径隔离；恢复前备份当前版本并校验路径；归档使用 `AppSettings.skillArchives + save_app_settings`；启停与归档语义分离；内部备份由 Rust 后端安全函数完成。
- 失败或更正：REV1 曾残留“删除管理记录”截图并混用归档/启停契约，REV2 已删除旧状态并修正 handover；未删除历史审查结论。
- 证据路径：`docs/design-prototypes/ui-gap-01/prototype-handover.md`、`docs/design-prototypes/ui-gap-01/screenshots/SCREENSHOT_MANIFEST.md`、[[../日常总结/参考资料/UI-GAP-01-REV2 交付总结]]。
- 回退点：WorkBuddy 原型基线 `1bd6f31908f05bbd14c057a2048730be6e0db6e7`；最终验收点 `6626908c9b2a5ac7cdb7452dbf1fb3798c35c2ab`。
- 同步文件与章节：[[PROJECT_STATE]] 的原型线/SOP 进度/风险/下一步，[[CURRENT-PLAN]] 的里程碑/批次/开始条件，[[DEVELOPMENT-LOG]] 的里程碑与收口台账，[[BACKLOG]] 的当前批次与 v3.9 候选，[[RELEASE-READINESS]] 的 v3.8.3 准备与升级基线。相关执行规则现已合并到 [[../日常总结/01-Skill-Panel执行SOP]]；旧版 SOP 与思维导图保存在 2026-07-17 外部归档中。
- 文档同步结果：以上文档已推进到第 4 步；来源 commit 为 `6626908c9b2a5ac7cdb7452dbf1fb3798c35c2ab`，验证依据为稳定/原型 Git 状态、截图 Manifest、发布归档 SHA256 和修改后章节复读。
- 下一步：新开 Codex 会话执行 `DATA-EDITOR-01`；禁止在同一批次加入删除、归档、Keychain、日志脱敏、版本升级或发布。

### DATA-EDITOR-01 过程记录（00:22 快照）

- 日期：2026-07-14
- 任务/版本：DATA-EDITOR-01，目标版本为 v3.8.3 候选。
- 用户结果：当前仅有开发中代码，尚无可稳定验收结论。
- 目录：`/Users/shovy/Documents/skill-panel-codex-v3.8`。
- 分支：`codex/agent-codex-v3.8`。
- 开始/当前 HEAD：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`。
- commit：无；工作区未提交。
- 工作区指纹：`5be2a8988fd6d88ce5b0ad62123d49738f1285bb153980630a9b4c297e56b345`，记录时间 `2026-07-14 00:22 CST`；开发仍在进行。
- 文件概况：4 份既有 DOC-NAV 文档继续保留；DATA-EDITOR-01 快照包含 Cargo 依赖、`skill_store.rs`、`version_store.rs`、DiffModal、Editor、invoke、CSS 和测试共 10 个修改文件。连同文档共 14 个修改文件，约 1063 行新增、57 行删除；最终清单等待批次收尾。
- 当前实现候选：版本目录使用规范化完整路径 SHA256；快照 ID 使用微秒并处理碰撞；保留 20 份/30 天；恢复前创建当前快照并使用临时文件替换；Editor 接入保存失败、撤销、外部冲突 diff、覆盖确认、版本历史、恢复和 AI 草稿提示；新增相关前端与 Rust 测试。
- 验证结果：`git diff --check` 通过；尚未发现当前工作区的 `npm test`、typecheck、build、cargo:test 或 visual:qa 完成报告。
- 失败/阻塞：当前没有测试失败证据；缺少当前工作区验证和用户验收，状态保持“开发中、尚未验证”。
- 数据安全：差异显示测试使用临时 HOME/临时目录；正式完成前仍需核对允许根目录、真实 Skill 隔离和恢复失败原文件保护。
- 回退点：稳定 HEAD `ec58c8deb2dcaeefc845d3762d7af13e6ed87590`；DOC-NAV 文档差异需独立保留。
- 文档同步结果：SOP、mindmap、[[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]] 和 [[RELEASE-READINESS]] 已标记 DATA-EDITOR-01 开发中。
- 下一步：续接现有工作区，完成代码审查与当前工作区验证；验证通过后等待用户验收，禁止提前进入 SEC-FILE-01、升版本或发布。

### DATA-EDITOR-01 收口记录

- 日期：2026-07-14
- 任务/版本：DATA-EDITOR-01 Editor 数据安全闭环，v3.8.3 候选前置批次。
- 用户可见结果：Editor 已支持读取后 dirty 状态、无修改保存禁用、保存失败草稿保留、撤销未保存修改、外部 SHA256 冲突提示、diff 预览、强制覆盖二次确认、版本历史、恢复确认、AI diff 草稿提示和模态框可访问性。
- 修改范围：Editor UI 与状态、AI DiffModal、invoke 封装、Rust 版本存储、Skill store 版本测试、Cargo 依赖、Editor CSS、测试、`tauri-skill-data` 模块文档和视觉 QA 输出。
- 分支：`codex/agent-codex-v3.8`。
- 开始 HEAD / 结束 HEAD：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`。
- commit：无；用户要求暂不升版本、不打包、不发布、不创建 tag。
- 工作区指纹：`9693bd5436db09d16ef2afbed0744dae1751d366091c30aaaf8c6149527d47bc`。
- 保留文件：已有 DOC-NAV-01 文档改动 `AGENTS.md`、`README.md`、`docs/modules/app-shell-v3.8.1.md`、`docs/modules/editor-v3.8.1.md` 未覆盖。
- 验证结果：`npm test` 44/44；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 45/45、contract 3/3；`npm run visual:qa` 11/11；`git diff --check` 通过。
- 截图或报告路径：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-editor-1440x960.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`。
- 数据安全证据：写入测试只使用临时 HOME、临时版本库和临时 Skill；版本身份为规范化完整路径 SHA256；单 Skill 保留 20 份/30 天；恢复前创建当前快照；恢复失败路径保持原文件；前端未调用 `write_skill_file` 创建备份。
- 已知问题：未做真实安装/升级验证；未提交；删除、归档、系统废纸篓、打开目录、Keychain 和日志脱敏未进入本批次。
- 回退点：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`；视觉 QA 更新前截图可从 Git diff 回退。
- 下一步：等待用户验收；通过后建议进入 `SEC-FILE-01`。

### DATA-EDITOR-01 验证状态更正

- 日期：2026-07-14 22:32 CST
- 任务/版本：更正 DATA-EDITOR-01 当前工作区验证状态。
- 原记录：[[DEVELOPMENT-LOG#DATA-EDITOR-01 收口记录]]，00:27 记录工作区指纹 `9693bd5436db09d16ef2afbed0744dae1751d366091c30aaaf8c6149527d47bc`，并标记等待用户验收。
- 更正结论：同一 HEAD 下当前指纹为 `00735ef8ff59a1837ab9825f630d11cf725c47a2e18139f0efd78a6da7970039`；差异统计由 1063 行新增、57 行删除增至 1069 行新增、61 行删除。当前状态改为“等待验证”。
- 修改范围：仅 Obsidian 状态、计划和日志；项目同名 README、AGENTS 与模块文档 SHA256 未变化，未同步正式文档。
- 分支 / HEAD：`codex/agent-codex-v3.8` / `ec58c8deb2dcaeefc845d3762d7af13e6ed87590`。
- 验证与证据：`git status --short --branch` 显示 18 个未提交文件；`git diff --stat` 为 1069/61；`git diff --check` 通过；视觉 QA 报告生成于 00:25，11/11 仅覆盖前一快照。
- 影响：此前完整测试和视觉 QA 不能作为当前工作区的完成或发布依据；用户验收顺序延后至重新完成 L2 验证。
- 回退点：稳定 HEAD `ec58c8deb2dcaeefc845d3762d7af13e6ed87590`；保留先前收口记录，不删除。
- 下一步：开发者确认后续差异来源，执行 L2 验证并保存新的结果与截图/报告。

AGENTS 语义变化：

```diff
- Library 是主入口，Editor 服务已有 Skill 维护。
+ 顶部固定五个主导航；上下文任务页面归属 Library；Editor 需要已选中的 Skill。
```

### DATA-EDITOR-01 最终收口

- 日期：2026-07-15
- 任务/版本：DATA-EDITOR-01 Editor 数据安全闭环最终收口，v3.8.3 候选前置批次。
- 用户可见结果：Editor 正确进入；无修改时保存禁用；修改与保存、重启后内容保留、撤销未保存内容、外部文件冲突提示、diff 预览与覆盖确认、版本历史、安全恢复、同名 Skill 版本隔离、AI diff 草稿、弹窗和键盘操作均由用户人工验收通过。
- 修改范围：DOC-NAV-01 文档；DATA-EDITOR-01 的 Editor UI 与状态、AI DiffModal、invoke 封装、Rust 版本存储、Skill store 版本测试、Cargo 依赖、Editor CSS、测试、`tauri-skill-data` 模块文档和视觉 QA 输出。
- 分支：`codex/agent-codex-v3.8`。
- 开始 HEAD：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`。
- DOC-NAV-01 commit：`3c0c3cab6171eb3d29ab1bff3c292720423289ac`，`docs: clarify navigation ownership`。
- DATA-EDITOR-01 commit / 结束 HEAD：`9993992a164fd9f12fe8312223d0238e5b107666`，`feat: close editor data safety workflow`。
- 提交前工作区：17 个修改文件；文件清单 SHA256 `242b4ae15c5775cfc2b567557157e7fc04bf624a1db74c6f314a89dcd34431ed`；`prototype-parity-library-1280x768.png` 工作区 SHA256 与 HEAD 均为 `705ee97b524abcc156ea5caf1b5f9ee41b1c222871772263b1d5e7a465133807`，因此退出修改清单。
- 验证结果：`npm test` 44/44；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 45/45、contract 3/3；`npm run visual:qa` 11/11；`git diff --check` 通过。执行窗口为 2026-07-15 18:56–18:58 CST。
- 截图或报告路径：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-editor-1440x960.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`，报告 `generatedAt` 为 `2026-07-15T10:58:00.241Z`。
- 数据安全证据：写入测试只使用临时 HOME、临时版本库和临时 Skill；版本身份为规范化完整路径 SHA256；单 Skill 保留 20 份/30 天；恢复前创建当前快照；恢复失败路径保持原文件；前端未调用 `write_skill_file` 创建备份；未发现真实 Skill、密钥、隐私日志或临时验收数据进入 Git。
- 已知问题：未做真实安装/升级验证；删除、归档、系统废纸篓、打开目录、Keychain 和日志脱敏未进入本批次。
- 回退点：`3c0c3cab6171eb3d29ab1bff3c292720423289ac` 可回退 DOC-NAV-01 文档；`9993992a164fd9f12fe8312223d0238e5b107666` 为 DATA-EDITOR-01 稳定基线；旧稳定 HEAD 为 `ec58c8deb2dcaeefc845d3762d7af13e6ed87590`。
- 当前工作区：干净。
- 下一步：执行 `SEC-FILE-01`，只处理 Editor 之外的文件操作、来源保护、Keychain、日志脱敏和 AI 发送安全。

### SEC-FILE-01A 最终收口

- 日期：2026-07-15
- 任务/版本：SEC-FILE-01A 文件命令路径安全边界和来源权限矩阵，v3.8.3 候选前置批次。
- 用户可见结果：受保护来源在 Detail 页显示只读提示；编辑入口切换为复制到可编辑目录；打开目录和复制入口调用后端命令。
- 修改范围：Rust 路径守卫、文件命令、Skill store、Detail 页、前端权限 helper、前端/Rust 测试、模块文档和视觉 QA 报告。
- 分支：`codex/agent-codex-v3.8`。
- 开始 HEAD：`9993992a164fd9f12fe8312223d0238e5b107666`。
- commit / 结束 HEAD：`e962960fc51159516367f2f9d993fd63fa8e4da1`，`feat: secure skill file command boundaries`。
- 核心实现：新增 `src-tauri/src/skill_path_guard.rs`，统一 canonicalization、允许根校验、`..` 拒绝、符号链接逃逸拦截、文件路径与 Skill 目录路径区分、扫描根本身拒绝、缺失路径安全失败和错误路径脱敏；`clone_skill` 实现真实复制到默认 Codex 用户 Skill 根目录。
- 来源权限：CodexUser、AgentsUser、Custom 允许本地编辑；PluginCache、System、Unknown 本地文件默认只读；受保护来源允许读取、应用内归档和复制到可编辑目录。
- 命令覆盖：`open_skill_folder`、`delete_skill`、`validate_skill`、`read_skill_files`、`write_skill_file`、`analyze_deps`、`clone_skill`、`toggle_skill_enabled`。
- 路径攻击测试：越权路径、允许路径、自定义根、符号链接逃逸、`..` 文件名、扫描根本身、受保护来源写/删/启停拒绝、受保护来源复制、同名复制冲突。
- 临时测试目录：Rust 测试使用 `std::env::temp_dir()` 下 `skill-command-*` 和 `skill-store-*`；前端测试使用 mock store 与 mock invoke，未触碰真实 Skill。
- 验证结果：`npm test` 47/47；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 49/49、contract 3/3；`npm run visual:qa` 11/11；`git diff --check` 通过。
- 截图或报告路径：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`，`generatedAt` 为 `2026-07-15T12:46:41.235Z`。
- 已知问题：系统废纸篓未实现；删除本地文件 UI 未接通；应用内归档持久化 UI 未接通；Keychain、日志脱敏、AI 发送安全未进入本批次；符号链接逃逸自动测试当前只覆盖 Unix。
- 回退点：`9993992a164fd9f12fe8312223d0238e5b107666`。
- 文档同步结果：项目模块文档已更新；Obsidian [[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]] 已记录 SEC-FILE-01A 结果。
- 下一步：进入 `SEC-FILE-01B`，接通 Detail 归档/删除真实流程，保留 5A 守卫作为所有文件操作入口。

### SEC-FILE-01B 最终收口

- 日期：2026-07-15
- 任务/版本：SEC-FILE-01B Detail 页归档、打开目录、复制、删除和恢复说明闭环，v3.8.3 候选前置批次。
- 用户可见结果：Detail 页归档和取消归档持久化；打开目录显示成功/失败反馈；复制到可编辑目录需要确认新名称，成功后显示新路径与 User 来源；删除本地文件显示完整二次确认，未勾选时按钮禁用，成功后显示备份路径、废纸篓结果和恢复说明。
- 修改范围：`src/detail/DetailView.tsx`、`src/components/DangerZone.tsx`、`src/detail/detail.css`、`src-tauri/src/skill_store.rs`、`src-tauri/src/commands.rs`、`src-tauri/src/models.rs`、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock`、类型契约、前端/Rust 测试、模块文档和 Detail 截图。
- 分支：`codex/agent-codex-v3.8`。
- 开始 HEAD：`e962960fc51159516367f2f9d993fd63fa8e4da1`。
- commit / 结束 HEAD：`e06441df474b017ca01624c99d0c1d207d7288b8`，`feat: close detail file operation workflow`。
- 核心实现：应用内归档使用 `AppSettings.skillArchives + save_app_settings`；`toggle_skill_enabled` 未参与归档；删除只允许可编辑来源，后端先创建完整目录备份，再调用系统废纸篓；删除返回 Skill 名称、原路径、备份路径、废纸篓结果和恢复说明；复制继续复用 `clone_skill` 与来源权限矩阵。
- 验证结果：`npm test` 51/51；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 49/49、contract 4/4；`npm run visual:qa` 11/11；`git diff --check` 通过。
- 截图或报告路径：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/sec-file-01b-detail-1280x800.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/sec-file-01b-detail-delete-modal-1280x800.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`。
- macOS 验证：Rust 测试 `delete_skill_creates_a_recoverable_backup_before_moving_directory_to_trash` 使用临时 `skill-store-delete-backup-*` 根目录和可丢弃 Skill，实际调用系统废纸篓路径；测试通过且备份保留在被删目录之外。
- Windows 验证状态：等待 Windows 独立验证，禁止用 macOS 结果替代 Windows 结论。
- Linux 验证状态：当前实现依赖 `trash` crate，等待目标 Linux 桌面环境复验。
- 已知问题：Keychain、日志脱敏、AI 发送安全未进入本批次；Windows 回收站行为未验证；Linux 废纸篓行为未验证。
- 回退点：`e962960fc51159516367f2f9d993fd63fa8e4da1`。
- 文档同步结果：项目模块文档已更新；Obsidian [[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]] 已记录 SEC-FILE-01B 结果。
- 下一步：进入 `SEC-FILE-01C`，处理 Keychain 状态、日志脱敏和 AI 发送安全。

### SEC-FILE-01C 最终收口

- 日期：2026-07-16
- 任务/版本：SEC-FILE-01C Keychain、日志/截图脱敏和 AI 对外发送安全，v3.8.3 候选前置批次。
- 用户可见结果：Settings 只显示 API Key 配置状态；Logs 页面展示前防御性脱敏并保留空日志真实状态；AI Rail 发送前展示服务商、内容范围、脱敏状态和预览，用户可确认或取消；AI Assistant 不直接绕过确认发起网络请求。
- 修改范围：`src-tauri/src/redaction.rs`、`src/lib/redaction.ts`、AI proxy、Keychain 命令、调用日志、审计日志、Logs/Settings/AI Rail/AI Assistant/Toast/ErrorBoundary、类型契约、测试、模块文档和 Playwright 输出。
- 分支：`codex/agent-codex-v3.8`。
- 开始 HEAD：`e06441df474b017ca01624c99d0c1d207d7288b8`。
- commit / 结束 HEAD：`4910ff3dbec09ad912fdda3543cae2aaf4dedc0e`，`feat: secure ai keys logs and outbound ai`。
- 数据流矩阵：API Key 来源为 Settings 输入，存储仅系统 Keychain/Credential Store，不出现在 AppSettings、localStorage、JSON 或日志；调用日志来源为后端 AI/工具调用，写入和读取均脱敏，不出网；AI prompt 来源为 Editor/AI Rail，默认脱敏后经用户确认再出网，未确认无网络请求；错误/Toast/banner 来源为后端或前端异常，展示前脱敏；截图只保留脱敏后的 UI 状态。
- Keychain 状态契约：`set_ai_key`、`set_api_key` 写入受允许 vendor 限制；`get_ai_key` 对前端只返回布尔配置状态；`get_api_key` 仅后端内部读取；`has_api_key` 返回布尔状态；Keychain 错误不包含 Key；测试使用内存 mock Keychain。
- 脱敏规则：API Key、Authorization/Bearer、token/secret/password/api_key、JWT、macOS/Linux/Windows 用户路径、邮箱、敏感 URL 查询参数、JSON 嵌套字符串和错误信息统一映射到 `<API_KEY>`、`<TOKEN>`、`<PATH>`、`<EMAIL>` 等稳定占位符。
- 日志兼容策略：新增日志写入前脱敏；旧 JSONL 读取时再次脱敏；损坏 JSONL 行跳过且不把原始行放入错误；audit detail 递归脱敏；prompt 保存必要摘要并限制长度；不删除、不改写用户现有日志；Unix 支持平台限制日志目录/文件为当前用户可读写。
- AI 发送确认流程：默认脱敏；发送前预览脱敏内容；可取消；关闭脱敏需单次风险确认；后端校验 `sendConfirmed`、`rawContentConfirmed` 和 `preview`；服务商与 endpoint 使用允许列表；网络和服务商错误先脱敏再显示；AI 结果进入 Editor 草稿，点击保存后才写文件。
- 验证结果：`npm test` 54/54；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 54/54、contract 4/4；`npm run visual:qa` 11/11；`git diff --check` 通过。
- 敏感信息扫描：`src`、`src-tauri`、`docs`、`output` 的 Markdown、JSON、测试 fixture、Rust、TS/TSX 和 Playwright 输出扫描无真实 Key、Bearer 或 JWT 命中；受限表达扫描无命中。
- 截图或报告路径：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-settings-1280x800.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-logs-1280x800.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-editor-1440x960.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/sec-file-01c-ai-assistant-1280x800.png`、`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`。
- 平台状态：macOS 自动化通过 mock Keychain/mock HTTP；未写用户真实 Keychain；没有真实 AI 调用；Windows Credential Store 等待独立验证；macOS 结果不能证明 Windows 已通过。
- 已知问题：macOS Keychain 人工测试需用户确认虚构 Key 后执行并清理；Windows Credential Store 与平台权限需 01D 环境验证；npm audit high severity 依赖项仍需独立处理。
- 回退点：`e06441df474b017ca01624c99d0c1d207d7288b8`。
- 文档同步结果：项目模块文档已更新；Obsidian [[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]]、[[RELEASE-READINESS]] 已记录 SEC-FILE-01C 结果。
- 下一步：`SEC-FILE-01D` 综合验证与人工验收，覆盖平台 Keychain、Settings/Logs/AI Rail/AI Assistant 实操、截图复核和跨平台待验项。

### SEC-FILE-01D 人工验收失败更正

- 日期：2026-07-16
- 任务/版本：SEC-FILE-01D 综合验证与人工验收准备。
- 引用记录：SEC-FILE-01D 当前 HEAD `4910ff3dbec09ad912fdda3543cae2aaf4dedc0e` 的自动验证记录保留，人工验收阶段发现回归。
- 失败 1：Detail 页头长路径挤压右侧操作区，导致“复制到可编辑目录”“打开目录”“备份”“归档”逐字换行。
- 失败 2：Library 卡片单击直接离开 Library，违反“单击只选中、双击或 Enter 打开”的交互规则。
- 失败 3：Editor 返回目标固定到 Detail，无法按 Library 或 Detail 入口返回上一级。
- 附带检查：Detail 页“备份”按钮看起来可点击且无响应，需要接入已有备份契约，或禁用并标注待实现。
- 当前状态：验证失败，修复中；禁止关闭 5D，禁止进入第 6 步。
- 修复要求：先补失败测试，再最小范围修改 Library、Detail、Editor、共享按钮样式和相关模块文档；修复后重新执行完整验证并等待用户截图验收。

### SEC-FILE-01D 失败修复进展

- 日期：2026-07-16
- 任务/版本：SEC-FILE-01D 人工验收失败最小范围修复。
- 当前状态：修复中，尚未关闭 5D，尚未进入第 6 步。
- 修复范围：Detail 页头长路径响应式布局；Library 卡片单击/双击/Enter 语义拆分；受保护 Skill 只读 Editor；Editor 来源感知返回；Detail 独立备份按钮禁用并标注待实现。
- 测试进展：新增失败覆盖并修复后，`npm test -- src/AppShell.test.tsx` 通过 24/24；相关定向集合通过 32/32；`npm test` 通过 65/65；`npm run typecheck`、`npm run build`、`npm run packaging:check`、`npm run cargo:test`、`npm run visual:qa` 和 `git diff --check` 均通过。项目缺少 `npm run git:diff:check` 脚本，已用 `git diff --check` 执行等价检查。
- 文档进展：代码模块文档、[[PRD]]、[[UI-SPECIFICATION]]、[[BACKLOG]] 和 [[CURRENT-PLAN]] 已按修复状态增量同步；[[PROJECT_STATE]] 暂不晋升，继续保持最后已验证稳定 HEAD。
- 待完成：隔离临时 HOME 应用、用户人工复验、修复 commit 和最终文档收口。

### SEC-FILE-01D 人工验收补充调整

- 日期：2026-07-16
- 任务/版本：Editor 页头操作区排版补充调整。
- 当前状态：修复中，5D 尚未关闭。
- 调整范围：Editor 页头右侧操作区统一显示“AI 辅助”“返回”，AI 在左、返回在右；来源感知返回和未保存离开确认逻辑保持不变；普通 Editor 与受保护只读 Editor 使用相同操作顺序。
- 测试结果：先补充按钮同组与顺序断言并确认红灯；修复后 `npm test` 通过 65/65，`npm run typecheck`、`npm run build`、`npm run packaging:check`、`npm run cargo:test`、`npm run visual:qa` 和 `git diff --check` 均通过。项目缺少 `npm run git:diff:check` 脚本，已用 `git diff --check` 执行等价检查。
- 截图证据：`output/playwright/sec-file-01d-editor-actions-normal-1280x800.png`、`output/playwright/sec-file-01d-editor-actions-readonly-1280x800.png`、`output/playwright/sec-file-01d-editor-actions-1024x768.png`、`output/playwright/sec-file-01d-editor-actions-1440x960.png`。
- 待完成：修复 commit、隔离应用保持运行和用户人工复验。

### SEC-FILE-01D Library Detail Editor 流程更正

- 日期：2026-07-16
- 任务/版本：Library → Detail → Editor 完整交互流程更正。
- 当前状态：修复中，5D 尚未关闭，尚未进入第 6 步。
- 修复 commit：`518f021 fix: restore library detail editor flow`。
- 产品规则：Library 卡片单击只选中并刷新右侧 DetailPanel；双击、Enter 和“查看完整详情”进入完整 Detail；可编辑 Skill 在 Detail 点击“编辑”进入正常 Editor；受保护 Skill 在 Detail 点击“只读查看”进入只读 Editor；Editor 返回原 Skill Detail。
- 修复范围：`src/pages/Library/index.tsx`、`src/components/SkillCard.tsx`、`src/detail/DetailPanel.tsx`、`src/detail/DetailView.tsx`、`src/pages/Library/Library.css`、`src/AppShell.test.tsx`、`scripts/visual-qa.mjs` 和相关模块文档。
- 测试结果：先补充 AppShell 失败覆盖并确认旧流程红灯；修复后 `npm test -- src/AppShell.test.tsx` 通过 26/26，相关定向集合通过 38/38，`npm test` 通过 67/67，`npm run typecheck`、`npm run build`、`npm run packaging:check`、`npm run cargo:test`、`npm run visual:qa` 和 `git diff --check` 均通过。项目缺少 `npm run git:diff:check` 脚本，已记录并执行等价检查。
- 文档状态：[[CURRENT-PLAN]] 保持“验证失败，修复中”；[[PROJECT_STATE]] 暂不晋升；[[PRD]] 和 [[UI-SPECIFICATION]] 已同步新交互规则。
- 待完成：新截图、修复 commit、隔离应用保持运行和用户人工复验。

### SEC-FILE-01D 最终收口

- 日期：2026-07-16
- 任务/版本：SEC-FILE-01D 综合验证、人工验收和文档收口。
- 当前状态：已完成；第 5 步可关闭；下一步进入第 6 步 `REL-3.8.2-EVIDENCE-CLOSE`。
- 收口 HEAD：`fba74aeb030d89e626a04f665f6ac17b1054601d`。
- 用户人工验收：2026-07-16 用户确认最新验收未发现问题。通过流程包括 Library 单击卡片只选中并更新右侧概览；双击、Enter 和“查看完整详情”进入 Detail；Detail 点击“编辑”进入正常 Editor；受保护 Skill 可以进入只读查看流程；Editor 返回 Detail；Detail 返回 Library；Editor 页头“AI 辅助”“返回”位置正确；Detail 操作按钮排版正常。
- 自动验证：`npm test` 67/67；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 54/54、contract 4/4；`npm run visual:qa` 11/11；`npm run git:diff:check` 通过。
- 敏感信息扫描：本轮改动和截图未发现真实 API Key、Bearer Token、JWT、密码、真实邮箱或真实用户路径；既有测试夹具假数据保留。
- 平台结论：macOS 当前验证范围为临时 HOME、可丢弃测试 Skill、自动化回归、视觉 QA 和用户人工 UI 验收；SEC-FILE-01B 已有 macOS 临时 Skill 系统废纸篓事务证据。Windows 系统废纸篓、Windows Credential Store 和真实 macOS Keychain 写入测试继续待验证或已阻塞，已同步到 [[BACKLOG]] 与 [[RELEASE-READINESS]]。
- 文档收口：[[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[BACKLOG]]、[[RELEASE-READINESS]]、[[PRD]]、[[UI-SPECIFICATION]] 和 SOP 已按实际平台证据增量更新；原失败记录保留。

### REL-3.8.2-EVIDENCE-CLOSE 最终收口

- 日期：2026-07-16
- 任务/版本：收口 v3.8.2 剩余历史发布证据。
- 当前状态：已完成；第 6 步可关闭；暂不建议进入第 7 步。
- 分支：`codex/agent-codex-v3.8`。
- 开始 HEAD：`fba74aeb030d89e626a04f665f6ac17b1054601d`。
- commit / 结束 HEAD：`53e7ed3136e89cae52638dfdd9372983a918a0c5`，`docs: close v3.8.2 release evidence`。
- 新增文档：`docs/releases/v3.8.2/release-manifest.md`。
- tag 复核：`v3.8.2` 为 annotated tag，对象 `3ef7123660caa1de5fb8787e8d797ae06e9dccf6`；tag commit 为 `2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`；当前审计 HEAD 是 tag commit 后续提交。
- 归档复核：`FILES.txt`、`INSTALL-VERIFY.md`、`ROLLBACK.md`、`SHA256SUMS.txt`、`release-manifest.json`、macOS DMG、macOS App Zip、源码包和 Git 回退 bundle 均已读取或校验。
- SHA256：归档目录内执行 `shasum -a 256 -c SHA256SUMS.txt`，7 项 OK；仓库根目录带路径执行清单会因相对路径上下文无法读取条目，未出现哈希内容不匹配证据。
- macOS 证据：DMG 与 App Zip 版本均为 `3.8.2`，bundle id 均为 `com.fengbul.skillpanel`；历史安装烟测记录显示临时 `HOME` 启动 5 秒存活；严格 codesign 失败；DMG 没有 stapled notarization ticket；真实升级和安装包回退证据缺失。
- Windows 证据：归档目录没有 `.exe`、`.msi` 或 NSIS 安装器；Windows 安装、Credential Store、系统废纸篓、升级和回退尚未验证。
- Git bundle：`git bundle verify` 通过，包含 `v3.8.2`、`v3.0.0`、`v2.0.0` refs，可作为代码层回退材料。
- 文档同步结果：[[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]]、[[RELEASE-READINESS]]、SOP 和 SOP mindmap 已增量同步；原历史记录保留。
- 下一步：进入第 7 步前先补齐目标平台可信 v3.8.2 升级与回退基线；Windows 与 macOS 分开记录。

## 当前收口台账

| 批次 | 目标 | 状态 | 交付证据 | commit |
|---|---|---|---|---|
| DOC-CORE | 建立持续更新的核心文档 | 已完成 | 本目录 8 份主文件 | 无代码提交 |
| DEV-AUDIT-01 | 盘点稳定线未提交变化 | 已完成 | `docs/development-baselines/ui-migration-checkpoint-2026-07-11.md` | `80816e52…` |
| DEV-VERIFY-01 | 运行稳定线完整验证 | 已完成 | 前端 40、打包 6、Rust 44、视觉 11/11 | `80816e52…` |
| DEV-CLOSE-01 | 建立干净稳定快照 | 已完成 | Codex 工作区干净 | `80816e52…` |
| WB-UI-BASE-01 | 创建 WorkBuddy UI 代码线 | 已撤销 | worktree 与分支已删除 | `80816e52…` |
| WORKFLOW-ROLLBACK-01 | 恢复原型迁移方式 | 已完成 | AGENTS、PROJECT_STATE、CURRENT-PLAN、delivery 同步 | `31b93d2a…`、`3bc3955…` |
| REL-01 | 更新 v3.8.2 发布结论 | 已完成 | 用户确认、版本号、发布提交 | `65140b0…` |
| REL-POST-01 | 发布后验证与归档 | 部分完成 | Dashboard 视觉 QA 11/11；macOS 归档已建立；Windows、签名/公证和真实升级待补 | `ec58c8d…` |
| REL-POST-02 | Dashboard 视觉 QA 修复与交接 | 已完成 | 视觉 QA 11/11、文档同步、交接包 | `43996ef…` |
| REL-POST-03 | v3.8.2 发布归档材料 | 部分完成 | macOS 包、SHA256、回退 bundle、安装结构验证与启动烟测 | `ec58c8d…` |
| REL-3.8.2-EVIDENCE-CLOSE | v3.8.2 历史发布证据收口 | 已完成，缺失项已明示 | Markdown manifest、SHA256 复核、Git bundle 验证、macOS/Windows 分平台证据状态 | `53e7ed3…` |
| DOC-NAV-01 | 导航信息架构与 Editor 文档口径统一 | 已完成 | PRD、UI 规范、AGENTS、模块文档、SOP 与源码路径复读 | `3c0c3ca…` |
| AUDIT-REAL-FLOW-01 | 全页面真实功能审计 | 已完成 | 审计报告、P0/P1 风险与第 3–5 步范围 | 无代码提交 |
| UI-GAP-01 | Editor 与 Detail P0 原型 | 已完成 | handover、88 张截图、Git 工作区干净 | `6626908…` |
| DATA-EDITOR-01 | Editor 保存、冲突、版本与恢复 | 已完成 | 44/44 前端、6/6 打包配置、Rust 45+3、typecheck、build、visual:qa 11/11、`git diff --check`、用户验收 | `9993992…` |
| SEC-FILE-01A | 文件命令路径边界和来源权限矩阵 | 已完成 | 47/47 前端、6/6 打包配置、Rust 49+3、typecheck、build、visual:qa 11/11、`git diff --check` | `e962960…` |
| SEC-FILE-01B | Detail 归档、打开目录、复制、删除和恢复说明 | 已完成 | 51/51 前端、6/6 打包配置、Rust 49+4、typecheck、build、visual:qa 11/11、`git diff --check`、macOS 临时 Skill 废纸篓验证 | `e06441d…` |
| SEC-FILE-01C | Keychain、日志脱敏和 AI 发送安全 | 已完成 | 54/54 前端、6/6 打包配置、Rust 54+4、typecheck、build、visual:qa 11/11、`git diff --check`、敏感信息扫描 | `4910ff3…` |
| SEC-FILE-01D | 综合验证、回归修复和人工验收 | 已完成 | 67/67 前端、6/6 打包配置、Rust 54+4、typecheck、build、visual:qa 11/11、`npm run git:diff:check`、用户 2026-07-16 验收通过 | `fba74ae…` |
| REL-3.8.3-CANDIDATE-MACOS | v3.8.3 macOS 单平台候选 | 已完成，等待第 8 步人工验收 | 67/67 前端、6/6 打包配置、Rust 54+4、typecheck、build、visual QA、diff check、macOS App/DMG、SHA256 清单 | `17bde2b…`、`cc2a155…` |

### REL-3.8.3-CANDIDATE-MACOS 候选生成

- 日期：2026-07-16
- 任务/版本：`REL-3.8.3-CANDIDATE-MACOS`，版本 `3.8.3`。
- 用户可见结果：生成 macOS 内部验收候选 App、App Zip 和 DMG；正式发布继续受签名与公证阻塞。
- 修改范围：版本元数据、版本一致性测试、发布台账、SOP、SOP 脑图、候选 manifest、第 8 步准备材料、候选产物目录。
- 分支：`codex/agent-codex-v3.8`。
- 开始 HEAD：`53e7ed3136e89cae52638dfdd9372983a918a0c5`。
- 候选代码提交：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。
- 候选记录提交 / 当前 HEAD：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。
- 验证结果：`npm test` 67/67；`npm run typecheck` 通过；`npm run build` 通过；`npm run packaging:check` 6/6；`npm run cargo:test` lib 54/54、integration 4/4；`npm run visual:qa` 通过；`npm run git:diff:check` 通过；候选目录 `SHA256SUMS.txt` 校验通过。
- 产物：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg`，大小 `4964044` bytes，SHA256 `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584`。
- App Zip：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.app.zip`，大小 `4952711` bytes，SHA256 `023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e`。
- 签名状态：本机无有效 Developer ID 签名；候选 App 为 ad-hoc/linker-signed；严格 codesign 未通过。
- 公证状态：notarytool 缺少可用凭据；DMG 无 stapled ticket。
- 回退点：Git `53e7ed3136e89cae52638dfdd9372983a918a0c5`；安装基线 `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`。

## 每次追加格式

```text
日期：
任务/版本：
用户可见结果：
修改范围：
分支：
commit：
验证结果：
截图或报告路径：
已知问题：
回退点：
```
