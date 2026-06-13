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
- commit：由固化本条记录的提交承载，最终 hash 以 `git log` 和主控汇总为准。
- 内容：从用户安装目录启动最新版桌面应用，确认运行入口为最新 exe。
- 启动命令：`Start-Process C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel-latest.exe`
- 运行证据：进程 `skill-panel-latest`，PID `5972`，路径 `C:\Users\12925\AppData\Local\Programs\SkillPanelUX\skill-panel-latest.exe`，启动时间 `2026/6/13 18:12:33`。
- 验证：`Get-Process -Id 5972` 返回运行进程和正确路径。
- 推送：GitHub 443 网络恢复后重试。
