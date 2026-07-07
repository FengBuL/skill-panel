# Skill Panel 模块索引 v3.8.1

本索引用于快速定位模块文档。改代码前先查本文件，再进入对应模块文档和源码文件。

## 模块总览

| 模块 | 模块文档 | 简介 | 文件数 | 代码行数 | 关键词 |
| --- | --- | --- | ---: | ---: | --- |
| 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 | 9 | 333 | `入口` `AppShell` `导航` `TopBar` `路由` `Toast` `safeListen` |
| 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 | 7 | 424 | `Button` `Toggle` `Segment` `EmptyState` `ErrorBoundary` `共享组件` |
| Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 | 7 | 1094 | `Library` `SkillCard` `筛选` `分页` `抽屉` `批量` |
| Dashboard 仪表盘 | [dashboard-v3.8.1.md](./dashboard-v3.8.1.md) | 负责展示扫描结果概览、数量指标、状态汇总和快速入口。 | 2 | 81 | `Dashboard` `指标` `概览` `统计` |
| 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 负责 Frontmatter 表单、Markdown 编辑、预览、质量校验和保存状态。 | 4 | 242 | `Editor` `Markdown` `Frontmatter` `校验` `保存` `预览` |
| AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 | 9 | 1426 | `AI Rail` `ai_optimize` `get_ai_key` `ai_cancel` `diff` `Keychain` |
| 设置与偏好 | [settings-v3.8.1.md](./settings-v3.8.1.md) | 负责主题、扫描、待关注规则、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。 | 4 | 194 | `Settings` `设置` `AI Key` `预算` `脱敏` `扫描目录` |
| 新建与预览流程 | [create-preview-v3.8.1.md](./create-preview-v3.8.1.md) | 负责创建 Skill 的入口、预览页面和次级视图流程。 | 2 | 135 | `Create` `Preview` `新建` `预览` |
| 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 | 5 | 322 | `Logs` `call logs` `依赖` `analyze_deps` `tokens` |
| 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 | 7 | 689 | `zustand` `hooks` `偏好` `拖拽` `键盘` `查询` |
| 类型契约与命令边界 | [types-contracts-v3.8.1.md](./types-contracts-v3.8.1.md) | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 | 5 | 616 | `types` `commands` `contract` `SkillCommandMap` `AppSettings` |
| 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 | 9 | 10599 | `i18n` `resources` `SkillPanelWorkspace` `runtime` `legacy` |
| Tauri 命令层 | [tauri-command-layer-v3.8.1.md](./tauri-command-layer-v3.8.1.md) | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 | 4 | 673 | `Tauri` `commands` `invoke_handler` `app_version` `backend` |
| Skill 数据、扫描和版本历史 | [tauri-skill-data-v3.8.1.md](./tauri-skill-data-v3.8.1.md) | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 | 3 | 2200 | `skill_scanner` `skill_store` `version_store` `frontmatter` `snapshot` |
| 后端设置与文件监听 | [tauri-settings-watchers-v3.8.1.md](./tauri-settings-watchers-v3.8.1.md) | 负责设置文件读写、默认扫描目录、文件变化监听和 scan-changed 事件。 | 2 | 325 | `settings_store` `watcher` `scan-changed` `settings.json` |
| 测试与视觉 QA | [testing-qa-v3.8.1.md](./testing-qa-v3.8.1.md) | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 | 4 | 901 | `Vitest` `Playwright` `QA` `packaging` `visual` |
| 打包、迁移和本地更新 | [packaging-scripts-v3.8.1.md](./packaging-scripts-v3.8.1.md) | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 | 7 | 280 | `package` `Cargo` `tauri.conf` `migration` `macOS` `release` |
| 样式系统与视觉规范 | [styles-system-v3.8.1.md](./styles-system-v3.8.1.md) | 负责全局 token、基础样式、v3.8.1 UI 样式规范和视觉一致性。 | 3 | 4086 | `style` `tokens` `UI guide` `CSS` `视觉规范` |

## 使用方法

1. 根据功能词搜索模块名或关键词。
2. 打开模块文档查看源码路径、行数、对外契约和修改规则。
3. 修改源码后运行该模块要求的测试。
4. 代码移动或模块边界变化时，同步更新本索引和模块文档。

## 稳定边界

- 前端页面模块通过 store、hook、lib 封装协作。
- Tauri 后端模块通过 commands.rs 暴露能力。
- 类型契约集中在 `src/types/**`。
- UI 标准集中在 `ui-style-guide.md`。
