# Skill Panel 更新编号台账

本文件用于追踪 Skill Panel UI 与桌面安装版本的每一次阶段性更新。编号格式为 `U001`、`U002`，后续新增更新继续递增。

## 2026-06-13

### U001 左侧来源导航

- 分支：`codex/skill-panel-30-source-rail-icons-storage`
- commit：`a6822cebb9ccbc0bc7ae0324387630c7a405c373`
- 子会话：`019ebf54-105d-73d3-9673-a71c7122c906`
- 内容：左侧来源导航改为图标、名称、数量结构；新增当前存储位置入口；移除列表区低价值筛选控件。
- 验证：`npm.cmd test`、`npm.cmd run typecheck`、`npm.cmd run packaging:check`、`git diff --check`。
- 推送：feature 分支已推送。

### U002 资源表格列表

- 分支：`codex/skill-panel-31-resource-table-alignment`
- commit：`6dd15c7db88ad5fbc624e1aa9e168eb4b7299274`
- 子会话：`019ebf54-103a-7041-b0bb-f3fb694449bd`
- 内容：中间列表调整为资源表格；一页 10 个；描述两行截断；路径可点击；选中行淡蓝底和细描边；修改时间本地化。
- 验证：`npm.cmd test`、`npm.cmd run typecheck`、`npm.cmd run packaging:check`、`git diff --check`。
- 推送：feature 分支已推送。

### U003 详情 Inspector

- 分支：`codex/skill-panel-32-detail-inspector-alignment`
- commit：`fce21626217c77531b50e5307ff59ec69f659402`
- 子会话：`019ebf54-103a-7041-b0bb-f4093f56d65a`
- 内容：详情区拆为顶部元信息、完整描述、Markdown 预览 / 编辑区、底部操作区；正文区域撑到底部；Agents 用户 Skill 详情可展示。
- 验证：`npm.cmd test`、`npm.cmd run typecheck`、`npm.cmd run packaging:check`、`git diff --check`。
- 推送：feature 分支已推送。

### U004 顶部命令栏

- 分支：`codex/skill-panel-29-top-command-bar-alignment`
- commit：`41d713abde8612620801c57f95d7f11a919d881f`
- 审计子会话：`019ec046-2974-7b81-a7b5-5158f0390b0d`
- 内容：顶部改为紧凑命令栏；左侧产品名；中央扫描状态；右侧重新扫描、新建 Skill、语言切换、设置。
- 验证：`npm.cmd test`、`npm.cmd run typecheck`、`npm.cmd run packaging:check`、`git diff --check`。
- 推送：feature 分支已推送。

### U005 视觉 QA 与截图验收

- 分支：`codex/skill-panel-33-visual-qa-screenshots`
- commit：`458c7a19d7abb564308ac0e05ddae9c487ea5c16`
- 子会话：`019ebf54-8436-78a0-b7a6-075d8e9fb50f`
- 收尾审计子会话：`019ec04a-9062-7490-8a32-d11c52b74c12`
- 内容：新增 `npm.cmd run visual:qa`、Playwright 截图验收、视觉 QA checklist、6 个场景截图；修复 1024 / 1280 / 1440 宽度下工具栏裁切问题。
- 验证：`npm.cmd run visual:qa`、`npm.cmd test`、`npm.cmd run typecheck`、`npm.cmd run build`、`npm.cmd run packaging:check`、`git diff --check`。
- 推送：feature 分支已推送；最终远端实时复查受 GitHub 443 网络影响。

### U006 集成顶部命令栏

- 分支：`codex/skill-panel-app`
- commit：`c237c9f merge: top command bar alignment`
- 内容：将 U004 合并到主集成分支。
- 推送：集成分支推送待恢复 GitHub 443 网络后继续。

### U007 集成左侧来源导航

- 分支：`codex/skill-panel-app`
- commit：`78984e2 merge: source rail navigation alignment`
- 内容：将 U001 合并到主集成分支，并处理 App 测试冲突。
- 推送：集成分支推送待恢复 GitHub 443 网络后继续。

### U008 集成资源表格

- 分支：`codex/skill-panel-app`
- commit：`4df5d3a merge: resource table alignment`
- 内容：将 U002 合并到主集成分支。
- 推送：集成分支推送待恢复 GitHub 443 网络后继续。

### U009 集成详情 Inspector

- 分支：`codex/skill-panel-app`
- commit：`78393b7 merge: detail inspector alignment`
- 内容：将 U003 合并到主集成分支。
- 推送：集成分支推送待恢复 GitHub 443 网络后继续。

### U010 集成视觉 QA

- 分支：`codex/skill-panel-app`
- commit：`846eb63 merge: visual qa screenshots`
- 内容：将 U005 合并到主集成分支。
- 推送：集成分支推送待恢复 GitHub 443 网络后继续。

### U011 集成视觉 QA 证据刷新

- 分支：`codex/skill-panel-app`
- commit：`f7fed5b test: refresh integrated ui qa evidence`
- 内容：在集成分支刷新视觉 QA 报告与截图证据。
- 验证：`npm.cmd run visual:qa`。
- 推送：集成分支推送待恢复 GitHub 443 网络后继续。

### U012 子会话续作审计留痕

- 分支：`codex/skill-panel-app`
- commit：`15f0482 docs: record ui subthread continuation audit`
- 内容：记录 29-33 子会话续作状态、提交、验证、推送和 33 收尾风险。
- 验证：`git diff --check`。
- 推送：集成分支推送待恢复 GitHub 443 网络后继续。

### U013 集成分支推送阻塞记录

- 分支：`codex/skill-panel-app`
- commit：`bd6a2c6 docs: record integration push blocker`
- 内容：记录 HTTPS 443 连接失败、SSH publickey 未配置、`Test-NetConnection` 和 `git ls-remote` 结果。
- 验证：`git diff --check`。
- 推送：GitHub 443 网络恢复后重试。

### U014 视觉 QA 收尾审计修正

- 分支：`codex/skill-panel-app`
- commit：`13d69a8 docs: update visual qa cleanup audit`
- 内容：修正 U005 / 会话 33 状态为收尾 DONE；记录 `output/playwright` 复跑产物已恢复到 `HEAD`。
- 验证：`git diff --check`。
- 推送：GitHub 443 网络恢复后重试。

### U015 桌面最新版安装同步

- 分支：`codex/skill-panel-app`
- commit：`9f333e5 docs: record desktop install update U015`
- 内容：重新确认安装入口，并将用户安装目录中的 `skill-panel-latest.exe` 与 `skill-panel.exe` 同步为当前 release 构建；桌面和开始菜单入口统一打开最新版。
- 构建产物：`C:\Users\12925\Documents\skill面板\src-tauri\target\release\skill-panel.exe`
- 用户安装文件：`C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel-latest.exe`、`C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel.exe`
- exe 校验：三个 exe 长度均为 `8642048` bytes，SHA256 前缀均为 `A3EF318810D1BA9F`。
- 快捷方式：桌面和用户开始菜单指向 `skill-panel-latest.exe`；公共开始菜单指向 `skill-panel.exe`，该文件已同步为同一最新版。
- 验证：`npm.cmd test` 6 files / 63 tests passed；`npm.cmd run typecheck` passed；`npm.cmd run build` passed；`npm.cmd run packaging:check` 1 file / 4 tests passed；`npm.cmd run cargo:test` 30 lib tests + 3 contract tests passed；`npm.cmd run visual:qa` exit 0；`npm.cmd run tauri:build:windows` 生成 release exe 和 NSIS 安装包。
- 推送：GitHub 443 网络恢复后重试。

### U016 桌面应用启动验证

- 分支：`codex/skill-panel-app`
- commit：`65ebc95 docs: record desktop launch verification U016`
- 内容：从用户安装目录启动最新版桌面应用，确认运行入口为最新 exe。
- 启动命令：`Start-Process C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel-latest.exe`
- 运行证据：进程 `skill-panel-latest`，PID `5972`，路径 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel-latest.exe`，启动时间 `2026/6/13 18:12:33`。
- 验证：`Get-Process -Id 5972` 返回运行进程和正确路径。
- 推送：已随 `codex/skill-panel-app` 推送到 GitHub。

### U017 集成分支远端同步成功

- 分支：`codex/skill-panel-app`
- commit：`e1a8904 docs: record remote sync update U017`
- 内容：将 UI 更新、桌面安装同步、U001-U016 编号台账推送到 GitHub 仓库 `skill-panel`。
- 推送命令：`git push origin codex/skill-panel-app`
- 推送结果：`2e1bfc0..65ebc95  codex/skill-panel-app -> codex/skill-panel-app`
- 远端确认：`git ls-remote origin -h refs/heads/codex/skill-panel-app` 返回 `65ebc95b653637524426e8365449bb70e5002850`，与本地 `HEAD` 一致。
- 验证：`git status --short --branch` 显示本地分支跟踪远端且无 ahead；`git diff --check` exit 0。
- 推送：已推送；后续 U018 记录最终完成审计和台账收口。

### U018 本地最终完成审计与台账收口

- 分支：`codex/skill-panel-app`
- commit：由固化本条记录的提交承载，最终 hash 以 `git log` 和主控汇总为准。
- 内容：确认 UI 更新、桌面最新版安装、桌面应用启动、U001-U018 编号台账和本地最终审计均完成。
- 本地状态：`git status --short --branch` 显示本地分支跟踪 `origin/codex/skill-panel-app`。
- 远端状态：最终远端状态以 `git rev-parse HEAD` 和 `git ls-remote origin -h refs/heads/codex/skill-panel-app` 返回同一 hash 为完成证据。
- 视觉 QA：`output/playwright/visual-qa-report.json` 包含 6 个场景，全部 `passed: true`。
- 桌面运行：`skill-panel-latest` 进程从 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel-latest.exe` 启动并保持运行。
- 推送：本条记录提交后执行 `git push origin codex/skill-panel-app`，以最终主控汇总中的远端 ref 为准。

### U019 Windows 黑色控制台窗口修复

- 分支：`codex/skill-panel-app`
- commit：由固化本条记录的提交承载，最终 hash 以 `git log` 和主控汇总为准。
- 内容：为 Tauri Windows release 入口添加 `windows_subsystem = "windows"`，避免双击桌面入口时先弹出黑色控制台窗口。
- 根因：`src-tauri/src/main.rs` 缺少 Windows GUI 子系统声明，release exe 被 Windows 按控制台程序启动。
- 测试：新增 packaging 回归测试，读取 `src-tauri/src/main.rs` 并断言正式入口包含 GUI 子系统声明；该测试先红灯，再随修复转绿。
- 构建：`npm.cmd run tauri:build:windows` 成功生成 release exe 和 NSIS 安装包。
- 安装：覆盖 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel-latest.exe` 和 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel.exe`。
- exe 校验：release exe、`skill-panel-latest.exe`、`skill-panel.exe` 长度均为 `8642048` bytes，SHA256 前缀均为 `0DD0413214E0C110`。
- 子系统验证：release exe 和安装目录 exe 的 PE subsystem 均为 `2`，即 `WINDOWS_GUI`。
- 启动验证：从 `skill-panel-latest.exe` 启动，进程 `skill-panel-latest`，PID `21568`，路径 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel-latest.exe`。
- 验证命令：`npm.cmd run packaging:check` 5 passed；`npm.cmd test` 64 passed；`npm.cmd run typecheck` passed；`npm.cmd run cargo:test` 30 lib tests + 3 contract tests passed；`git diff --check` exit 0。
- 推送：本条记录提交后执行 `git push origin codex/skill-panel-app`。

## 2026-06-16

### U020 v2.0.0 UI 发布版

- 分支：`codex/skill-panel-app`
- commit：`860db8b release: v2.0.0 skill panel ui`
- 内容：完成 Stitch 风格 UI 版本，覆盖左侧类目筛选、类目颜色、skill 自定义标签、标签进入左侧类目、固定底部分页、详情预览/编辑状态控制、中文/English 语言切换。
- 版本：`package.json`、`package-lock.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock` 均为 `2.0.0`。
- 验证：`npm.cmd test` 71 passed；`npm.cmd run build` passed；`npm.cmd run tauri:build` 生成 release exe 和 NSIS 安装包。
- 发布：创建并推送 `v2.0.0` tag；GitHub Release 地址为 `https://github.com/FengBuL/skill-panel/releases/tag/v2.0.0`。

### U021 本机 v2.0.0 启动入口同步

- 分支：`codex/skill-panel-app`
- 操作类型：本机安装目录同步。
- 背景：桌面和开始菜单快捷方式指向 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX`，该目录仍保留 `0.1.0`。
- 内容：停止旧进程，将 release 构建覆盖到 `skill-panel.exe` 和 `skill-panel-latest.exe`，再重新启动应用。
- 运行证据：进程路径为 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel.exe`。
- 版本确认：`ProductVersion` 和 `FileVersion` 均为 `2.0.0`。
- 结果：本机实际打开的应用已更新到 v2.0.0。

### U022 v2.0.0 迁移设置持久化

- 分支：`codex/skill-panel-app`
- commit：`ef051f8 fix: make v2 migration settings portable`
- 内容：`AppSettings` 增加 `categoryColors` 和 `skillTags`；右键改类目颜色、添加 skill 标签后写入 `settings.json`；设置页保存时保留 UI 自定义数据。
- 兼容：旧版 `settings.json` 缺少新字段时自动补默认值；读取层兼容 UTF-8 BOM。
- 配置路径：`%USERPROFILE%\.codex\skill-panel\settings.json`。
- 测试：新增 UTF-8 BOM 设置读取测试；补充前端保存设置断言。
- 验证：`npm.cmd test` 71 passed；`npm.cmd run typecheck` passed；`npm.cmd run build` passed；`npm.cmd run cargo:test` 31 lib/bin tests + 3 contract tests passed。
- 推送：已推送到 `origin/codex/skill-panel-app`。

### U023 v2.0.0 迁移包

- 分支：`codex/skill-panel-app`
- commit：`ef051f8 fix: make v2 migration settings portable`
- 内容：新增 `scripts/create-migration-package.ps1` 和 `docs/migration-guide-v2.md`；README 增加迁移包命令；`.gitignore` 忽略 `output/migration/`。
- 本地迁移包：`C:\Users\12925\Documents\skill面板\output\migration\Skill-Panel-v2.0.0-migration.zip`
- 大小：`5870902` bytes。
- 包含内容：Windows 安装器、便携 exe、`config/settings.json`、`.codex/skills`、`.agents/skills`、`README-MIGRATION.md`。
- 生成命令：`powershell -ExecutionPolicy Bypass -File scripts\create-migration-package.ps1`。
- 验证：zip 内含 `app\Skill Panel_2.0.0_x64-setup.exe`、`portable\skill-panel.exe`、`config\settings.json`、`docs\migration-guide-v2.md` 和 skill 目录。

### U024 GitHub v2.0.0 Release 刷新

- 分支：`codex/skill-panel-app`
- commit：`ef051f8 fix: make v2 migration settings portable`
- tag：`v2.0.0` 已更新到当前提交。
- Release：`https://github.com/FengBuL/skill-panel/releases/tag/v2.0.0`
- 资产：`Skill.Panel_2.0.0_x64-setup.exe`
- 资产大小：`1950208` bytes。
- SHA256 digest：`094925fb9f527d3f68190a7363c97daba11fa3cbc7bb92425fd06ae384f045e6`
- 推送：`git push origin codex/skill-panel-app` 成功；`git push origin v2.0.0 --force` 成功；`gh release upload v2.0.0 ... --clobber` 成功。

### U025 方案、更新计划与迭代情况补齐

- 分支：`codex/skill-panel-app`
- commit：由固化本条记录的提交承载，最终 hash 以 `git log` 和主控汇总为准。
- 内容：在 `docs/project-plan.md` 增加第 21 节，补齐 v2.0.0 迁移版背景、更新方案、更新计划、已完成迭代、验证结果和后续迁移验收计划；在本台账追加 U020-U025。
- 目的：让方案、计划、执行记录和发布状态在仓库中保持同一套追溯口径。
- 验证：`git diff --check`；文档内容按 UTF-8 读取确认。
- 推送：本条记录提交后执行 `git push origin codex/skill-panel-app`。

### U026 可发送完整交付文件夹

- 分支：`codex/skill-panel-app`
- 内容：生成可整体发送的本地交付文件夹，包含安装器、便携版、配置、skill 数据、迁移指南、项目方案、更新计划、迭代台账和 Release 信息。
- 文件夹：`C:\Users\12925\Documents\skill面板\output\send\Skill-Panel-v2.0.0-complete`
- 压缩包：`C:\Users\12925\Documents\skill面板\output\send\Skill-Panel-v2.0.0-complete.zip`
- 文件数量：453 个文件。
- 文件夹内容大小：`22979827` bytes。
- 压缩包大小：`11672235` bytes。
- 目录结构：`01-app-installer`、`02-portable`、`03-migration-data`、`04-docs`、`05-archives`、`README-SEND.md`、`RELEASE-INFO.txt`。
- 仓库处理：`.gitignore` 增加 `output/send/`，避免本机交付包和个人 skill 数据进入 Git。
- 验证：检查根目录结构、文件数量、压缩包大小和核心文件清单。

### U027 v2.0.0 功能问题修复与发送包刷新

- 分支：`codex/skill-panel-app`
- 内容：修复真实扫描失败时回退演示数据的问题；补齐左侧类目中文名称和改名持久化；工具栏排序和问题筛选按钮具备实际行为；新建 Skill 可选择可写来源；删除 Skill 时清理旧标签；Skill 右键菜单支持移除已有自定义标签；列表视图显示类目和标签；分页栏底部留白避免第二页内容穿透。
- 设置模型：`AppSettings` 新增 `categoryLabels`，默认兼容旧配置，保存时只记录用户改过的类目名称。
- 本机同步：`C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel.exe` 和 `skill-panel-latest.exe` 已覆盖为最新 release exe，SHA256 前缀均为 `9671F6A1ED835BD5`。
- 运行验证：已从 `skill-panel.exe` 启动，进程 PID `12244`，路径为 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel.exe`。
- 验证：`npm.cmd test -- src/App.test.tsx src/App.editor.test.tsx src/types/skill.test.ts --reporter=dot` 63 passed；`npm.cmd run build` passed；`cargo test` 31 unit/bin tests + 3 contract tests passed；`npm.cmd run tauri:build:windows` 生成 NSIS 安装器。
- 浏览器验证：Node REPL 浏览器通道仍报 `failed to write kernel assets: 系统找不到指定的路径。 (os error 3)`，未完成截图验证。
- 交付包：已刷新 `output\migration\Skill-Panel-v2.0.0-migration.zip` 和 `output\send\Skill-Panel-v2.0.0-complete.zip`。
- 发送包校验：文件数 `453`，文件夹内容大小约 `22989703` bytes，zip 大小约 `11679554` bytes；最终 SHA256 以生成后的校验命令输出为准。
