---
title: Skill Panel 最近交付
date: 2026-07-13
updated: 2026-07-13
tags: [SkillPanel, 交付, Dashboard, 视觉QA]
status: active
---

# Skill Panel 最近交付

## 第 2 步交接包：Dashboard 视觉 QA 修复与文档同步

完成内容：

- Dashboard 视觉 QA 已从 10/11 恢复到 11/11。
- 修复点位于 `src/components/PageHeader.tsx`：恢复原型与 QA 依赖的 `page-header`、`page-title`、`page-subtitle` 类名。
- 当前 Dashboard 页面标题、副标题、指标卡、最近修改、需要关注、依赖提醒和 TopBar 激活态显示正常。
- 项目 README 已记录 v3.8.2 当前视觉 QA 11/11。
- Obsidian 状态、计划、开发台账、发布准备、UI 规范、Backlog、PRD 和本交付包已同步。

关键代码点：

- 发布提交：`65140b081962a0177b56c1cf14c572515f320e4e`
- 修复提交：`421cafc9b51cb1245beb06a4a59d736b9b432d50`
- 文档同步提交：`43996ef40aabb1491ea068991d7e3751bb074851`
- 当前分支：`codex/agent-codex-v3.8`
- 当前版本：`3.8.2`
- 当前工作区：干净

根因：

- Dashboard 页面本身可见，失败来自视觉 QA 对 `.page-subtitle` 的 DOM 契约检查。
- 通用 `PageHeader` 迁移后只保留了 `sp-page-header` 系列类名，导致 Dashboard 副标题文本存在，但 selector 找不到目标节点。

修复类型：

- 轻量修复。
- 未修改页面行为、真实数据链路、扫描、Keychain、Tauri 命令或 Skill 文件。

修改文件：

- `src/components/PageHeader.tsx`
- `README.md`
- `output/playwright/visual-qa-report.json`
- `output/playwright/*.png`
- Obsidian：[[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]]、[[RELEASE-READINESS]]、[[README]]、[[UI-SPECIFICATION]]、[[BACKLOG]]、[[PRD]]、本文件。

验证结果：

- `npm run visual:qa`：11/11 通过。
- `npm run typecheck`：通过。
- `git diff --check`：通过。
- `output/playwright/visual-qa-report.json` 中 `v38-dashboard-1280x800` 为 PASS，`failedAssertions` 为空。

截图路径：

- 当前 Dashboard 截图：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-dashboard-1280x800.png`
- 当前 Git HEAD 截图抽取：`/tmp/skill-panel-dashboard-evidence/head-v38-dashboard-1280x800.png`
- 发布点截图抽取：`/tmp/skill-panel-dashboard-evidence/65140b0-v38-dashboard-1280x800.png`
- 视觉 QA 报告：`/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`

截图对照结论：

- 当前工作区 Dashboard 截图 SHA256 与 Git HEAD 截图一致。
- 当前截图显示 Dashboard 页面完整可见。
- `65140b0` 抽取截图视觉上也显示 Dashboard 可见，失败集中在 DOM 类名契约和复跑证据口径。

未修改范围：

- 未写入、删除或修改真实 Skill。
- 未修改 `src-tauri/`、文件扫描、Keychain、AI 写回、diff 流程、数据结构或类型契约。
- 未新增功能。

模块文档更新：

- 模块边界、源码文件清单和对外契约未变化，`docs/modules/dashboard-v3.8.1.md` 与 `docs/modules/testing-qa-v3.8.1.md` 本次无需结构性更新。
- 本次更新项目状态、计划、发布准备和交接台账。

数据安全：

- 本轮只读取项目内 mocked visual QA 证据。
- 未访问真实 Skill 内容，未触发写回命令。

风险：

- `v3.8.2` tag、安装包路径、文件大小、SHA256 和真实安装验证仍待补齐。
- 当前视觉 QA 是 Playwright mock 场景，通过状态不能替代 L3 安装验证。

回退点：

- 发布代码点：`65140b081962a0177b56c1cf14c572515f320e4e`
- Dashboard 视觉 QA 修复点：`421cafc9b51cb1245beb06a4a59d736b9b432d50`

下一步建议：

- 补齐 `v3.8.2` tag、安装包、SHA256、安装验证和回退包。
- 单独处理 npm audit high severity 依赖项。

关联：[[PROJECT_STATE]] · [[CURRENT-PLAN]] · [[DEVELOPMENT-LOG]] · [[RELEASE-READINESS]]

## 第 3 步交接包：v3.8.2 发布归档材料

完成内容：

- 创建 `v3.8.2` annotated tag。
- 生成 macOS DMG：`Skill Panel_3.8.2_aarch64.dmg`。
- 生成 macOS App Zip：`Skill Panel_3.8.2_aarch64.app.zip`。
- 生成源码归档：`skill-panel-v3.8.2-source.zip`。
- 生成 Git 回退包：`skill-panel-v3.8.2-rollback.bundle`。
- 生成 SHA256 清单：`SHA256SUMS.txt`，并执行 `shasum -a 256 -c SHA256SUMS.txt` 通过。
- 生成安装验证记录：`INSTALL-VERIFY.md`。
- 生成回退说明：`ROLLBACK.md`。
- 生成发布 manifest：`release-manifest.json`。

关键代码点：

- 发布 tag：`v3.8.2` -> `2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`
- 发布归档提交：`2f71ba750b7da9ff9186b33dc94aa85e7d86db81`
- 安装烟测记录提交：`ec58c8deb2dcaeefc845d3762d7af13e6ed87590`
- 发布代码点：`65140b081962a0177b56c1cf14c572515f320e4e`
- Dashboard 视觉 QA 修复点：`421cafc9b51cb1245beb06a4a59d736b9b432d50`
- 文档同步点：`43996ef40aabb1491ea068991d7e3751bb074851`
- Rust 测试清理修复点：`2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`

修改文件：

- `README.md`
- `src-tauri/src/settings_store.rs`
- `output/releases/v3.8.2/`
- Obsidian：[[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[DEVELOPMENT-LOG]]、[[delivery]]、[[RELEASE-READINESS]]

验证结果：

- `npm test`：9 个测试文件、40 个用例通过。
- `npm run typecheck`：通过。
- `npm run build`：通过。
- `npm run packaging:check`：1 个测试文件、6 个用例通过。
- `npm run cargo:test`：lib 41 个测试、contract 3 个测试通过。
- `npm run tauri:build:macos`：生成 `.app` 和 `.dmg`。
- `shasum -a 256 -c SHA256SUMS.txt`：7 项 OK。

安装验证：

- DMG 可挂载。
- `CFBundleShortVersionString` 为 `3.8.2`。
- `CFBundleIdentifier` 为 `com.fengbul.skillpanel`。
- app 主执行文件存在且可执行。
- 临时 HOME 启动 app 主执行文件 5 秒后进程仍存活，日志为空。

已知问题：

- macOS `codesign --verify --deep --strict` 失败，错误为 `code has no resources but signature indicates they must be present`。
- `npm run tauri:build:windows` 在 macOS 本机退出 0，但未生成 `.exe`、`.msi` 或 NSIS 安装器。
- 本地未找到上一版可安装回退包。

未修改范围：

- 未写入、删除或修改真实 Skill。
- 未修改业务功能、扫描、Keychain、AI 写回、类型契约。

回退材料：

- Git 回退包：`output/releases/v3.8.2/skill-panel-v3.8.2-rollback.bundle`
- 回退说明：`output/releases/v3.8.2/ROLLBACK.md`
- 源码归档：`output/releases/v3.8.2/skill-panel-v3.8.2-source.zip`

下一步建议：

- 在 Windows 或 CI 环境生成 NSIS/MSI 并归档 SHA256。
- 使用正式证书重做 macOS 签名和公证。
- 执行真实安装、升级、数据保留和上一版安装包回退验证。

## DATA-EDITOR-01 交付副本

完成内容：

- Editor 接入真实读取基线、dirty 状态、保存禁用、保存中、保存成功和保存失败。
- 保存前读取当前磁盘内容并基于打开时 rawContent SHA256 检测外部冲突。
- 外部冲突弹窗展示 SHA、完整路径语境、diff 预览、重新读取、取消和二次确认覆盖。
- 保存失败弹窗说明原文件安全、草稿保留，并提供重试和复制草稿。
- 撤销未保存修改需要确认，Esc 可关闭，焦点返回触发按钮。
- 版本历史接入 `get_version_history`，恢复接入 `restore_version`，恢复前由 Rust 创建当前快照。
- AI diff 采纳后只写入 Editor 草稿，显示“点击保存后写回 SKILL.md”，不直接调用保存命令。
- DiffModal 与 Editor 模态框补充 `role="dialog"`、`aria-modal`、Esc、焦点锁定和焦点恢复。
- Rust 版本历史按规范化完整路径 SHA256 隔离，单 Skill 保留 20 份/30 天。
- Rust 恢复先读目标快照，再创建当前快照，再使用临时文件替换目标文件。

修改文件：

- `src/editor/EditorView.tsx`
- `src/pages/Editor/Editor.css`
- `src/components/ai/DiffModal.tsx`
- `src/lib/invoke.ts`
- `src/App.editor.test.tsx`
- `src/AppShell.test.tsx`
- `src-tauri/src/version_store.rs`
- `src-tauri/src/skill_store.rs`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `docs/modules/tauri-skill-data-v3.8.1.md`
- `output/playwright/visual-qa-report.json`
- `output/playwright/v38-editor-1440x960.png`
- `output/playwright/prototype-parity-library-1280x768.png`

未修改范围：

- 未修改删除、归档、系统废纸篓、打开目录、Keychain、日志脱敏、版本号、tag、打包发布流程。
- 未写入真实 Skill；测试写入限定在临时 HOME、临时版本库和临时 Skill。
- 保留既有 DOC-NAV-01 文档改动：`AGENTS.md`、`README.md`、`docs/modules/app-shell-v3.8.1.md`、`docs/modules/editor-v3.8.1.md`。

验证结果：

- `npm test`：9 个测试文件、44 个用例通过。
- `npm run typecheck`：通过。
- `npm run build`：通过。
- `npm run packaging:check`：1 个测试文件、6 个用例通过。
- `npm run cargo:test`：lib 45 个测试、contract 3 个测试通过。
- `npm run visual:qa`：11/11 通过。
- `git diff --check`：通过。

截图路径：

- `/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/v38-editor-1440x960.png`
- `/Users/shovy/Documents/skill-panel-codex-v3.8/output/playwright/visual-qa-report.json`

模块文档更新：

- 已更新 `docs/modules/tauri-skill-data-v3.8.1.md`，记录路径 SHA256 隔离、20 份/30 天、恢复前快照和恢复失败保护。
- 未触碰已有改动的 `docs/modules/editor-v3.8.1.md`。

已知问题：

- 尚无 commit，状态为当前工作区已验证、等待用户验收。
- 真实安装/升级验证未执行。
- 删除、归档、系统废纸篓和打开目录留给 `SEC-FILE-01`。

回退点：

- `ec58c8deb2dcaeefc845d3762d7af13e6ed87590`

下一步建议：

- 用户验收 DATA-EDITOR-01 后进入 `SEC-FILE-01`。
