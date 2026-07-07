# Skill Panel 源码文件索引 v3.8.1

本文件按源码路径记录所属模块、模块文档和行数。需要改代码时，可先在这里搜索源码名、模块名或关键词。

## 源码文件清单

| 源码路径 | 所属模块 | 模块文档 | 行数 | 简介 |
| --- | --- | --- | ---: | --- |
| `package.json` | 打包、迁移和本地更新 | [packaging-scripts-v3.8.1.md](./packaging-scripts-v3.8.1.md) | 51 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `scripts/create-migration-package.ps1` | 打包、迁移和本地更新 | [packaging-scripts-v3.8.1.md](./packaging-scripts-v3.8.1.md) | 71 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `scripts/update-local-macos-app.sh` | 打包、迁移和本地更新 | [packaging-scripts-v3.8.1.md](./packaging-scripts-v3.8.1.md) | 36 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `scripts/visual-qa.mjs` | 测试与视觉 QA | [testing-qa-v3.8.1.md](./testing-qa-v3.8.1.md) | 612 | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 |
| `src-tauri/build.rs` | 打包、迁移和本地更新 | [packaging-scripts-v3.8.1.md](./packaging-scripts-v3.8.1.md) | 4 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `src-tauri/Cargo.toml` | 打包、迁移和本地更新 | [packaging-scripts-v3.8.1.md](./packaging-scripts-v3.8.1.md) | 31 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `src-tauri/src/ai_proxy.rs` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 276 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src-tauri/src/call_logger.rs` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 58 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src-tauri/src/commands.rs` | Tauri 命令层 | [tauri-command-layer-v3.8.1.md](./tauri-command-layer-v3.8.1.md) | 374 | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 |
| `src-tauri/src/dep_analyzer.rs` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 66 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src-tauri/src/lib.rs` | Tauri 命令层 | [tauri-command-layer-v3.8.1.md](./tauri-command-layer-v3.8.1.md) | 54 | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 |
| `src-tauri/src/main.rs` | Tauri 命令层 | [tauri-command-layer-v3.8.1.md](./tauri-command-layer-v3.8.1.md) | 6 | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 |
| `src-tauri/src/models.rs` | Tauri 命令层 | [tauri-command-layer-v3.8.1.md](./tauri-command-layer-v3.8.1.md) | 239 | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 |
| `src-tauri/src/settings_store.rs` | 后端设置与文件监听 | [tauri-settings-watchers-v3.8.1.md](./tauri-settings-watchers-v3.8.1.md) | 279 | 负责设置文件读写、默认扫描目录、文件变化监听和 scan-changed 事件。 |
| `src-tauri/src/skill_scanner.rs` | Skill 数据、扫描和版本历史 | [tauri-skill-data-v3.8.1.md](./tauri-skill-data-v3.8.1.md) | 686 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 |
| `src-tauri/src/skill_store.rs` | Skill 数据、扫描和版本历史 | [tauri-skill-data-v3.8.1.md](./tauri-skill-data-v3.8.1.md) | 1427 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 |
| `src-tauri/src/version_store.rs` | Skill 数据、扫描和版本历史 | [tauri-skill-data-v3.8.1.md](./tauri-skill-data-v3.8.1.md) | 87 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 |
| `src-tauri/src/watcher.rs` | 后端设置与文件监听 | [tauri-settings-watchers-v3.8.1.md](./tauri-settings-watchers-v3.8.1.md) | 46 | 负责设置文件读写、默认扫描目录、文件变化监听和 scan-changed 事件。 |
| `src-tauri/tauri.conf.json` | 打包、迁移和本地更新 | [packaging-scripts-v3.8.1.md](./packaging-scripts-v3.8.1.md) | 67 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `src-tauri/tests/skill_contract.rs` | 类型契约与命令边界 | [types-contracts-v3.8.1.md](./types-contracts-v3.8.1.md) | 106 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src/App.editor.test.tsx` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 1118 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/App.test.tsx` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 2009 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/App.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 11 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/AppShell.test.tsx` | 测试与视觉 QA | [testing-qa-v3.8.1.md](./testing-qa-v3.8.1.md) | 216 | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 |
| `src/AppShell.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 83 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/common/EmptyState.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 31 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/ErrorBoundary.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 59 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/SkillExport.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 37 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/Toast.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 54 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/Ui.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 95 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/components/ai/ai.css` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 461 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/AIRail.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 102 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/CostBadge.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 44 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/DiffHunk.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 59 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/DiffModal.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 102 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/Toast.css` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 9 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/components/Toast.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 32 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/components/TopBar.css` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 47 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/components/TopBar.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 83 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/components/ui.css` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 69 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/components/ui.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 79 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/detail/DetailDrawer.tsx` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 30 | 负责 Frontmatter 表单、Markdown 编辑、预览、质量校验和保存状态。 |
| `src/editor/EditorWorkspace.tsx` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 15 | 负责 Frontmatter 表单、Markdown 编辑、预览、质量校验和保存状态。 |
| `src/hooks/useAIRail.ts` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 171 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/hooks/useDebouncedValue.ts` | 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 16 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/hooks/useDragDrop.ts` | 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 171 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/hooks/useKeyboardNav.ts` | 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 97 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/hooks/usePreferencePersistence.ts` | 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 48 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/hooks/useSkillQuery.ts` | 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 149 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/i18n.test.ts` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 101 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/i18n/core.ts` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 120 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/i18n/index.ts` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 21 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/i18n/resources.ts` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 764 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/i18n/runtime.tsx` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 321 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/i18n/useI18n.test.tsx` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 212 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/lib/ai.test.ts` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 40 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/lib/ai.ts` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 171 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/lib/invoke.test.ts` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 31 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/lib/invoke.ts` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 128 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/lib/logs.ts` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 26 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src/lib/skills.ts` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 7 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/lib/tauriEvents.ts` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 15 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/library/SkillCard.tsx` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 89 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/main.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 14 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/node-fs.d.ts` | 类型契约与命令边界 | [types-contracts-v3.8.1.md](./types-contracts-v3.8.1.md) | 4 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src/packaging.config.test.ts` | 测试与视觉 QA | [testing-qa-v3.8.1.md](./testing-qa-v3.8.1.md) | 71 | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 |
| `src/pages/Create/index.tsx` | 新建与预览流程 | [create-preview-v3.8.1.md](./create-preview-v3.8.1.md) | 80 | 负责创建 Skill 的入口、预览页面和次级视图流程。 |
| `src/pages/Dashboard/Dashboard.css` | Dashboard 仪表盘 | [dashboard-v3.8.1.md](./dashboard-v3.8.1.md) | 31 | 负责展示扫描结果概览、数量指标、状态汇总和快速入口。 |
| `src/pages/Dashboard/index.tsx` | Dashboard 仪表盘 | [dashboard-v3.8.1.md](./dashboard-v3.8.1.md) | 50 | 负责展示扫描结果概览、数量指标、状态汇总和快速入口。 |
| `src/pages/Editor/Editor.css` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 49 | 负责 Frontmatter 表单、Markdown 编辑、预览、质量校验和保存状态。 |
| `src/pages/Editor/index.tsx` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 148 | 负责 Frontmatter 表单、Markdown 编辑、预览、质量校验和保存状态。 |
| `src/pages/Library/index.tsx` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 173 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/pages/Library/Library.css` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 523 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/pages/Logs/index.tsx` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 60 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src/pages/Logs/Logs.css` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 112 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src/pages/Preview/index.tsx` | 新建与预览流程 | [create-preview-v3.8.1.md](./create-preview-v3.8.1.md) | 55 | 负责创建 Skill 的入口、预览页面和次级视图流程。 |
| `src/pages/Settings/index.tsx` | 设置与偏好 | [settings-v3.8.1.md](./settings-v3.8.1.md) | 81 | 负责主题、扫描、待关注规则、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。 |
| `src/pages/Settings/Settings.css` | 设置与偏好 | [settings-v3.8.1.md](./settings-v3.8.1.md) | 18 | 负责主题、扫描、待关注规则、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。 |
| `src/router.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 39 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/settings/Settings.tsx` | 设置与偏好 | [settings-v3.8.1.md](./settings-v3.8.1.md) | 15 | 负责主题、扫描、待关注规则、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。 |
| `src/SkillPanelWorkspace.tsx` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 5933 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/store/settingsStore.ts` | 设置与偏好 | [settings-v3.8.1.md](./settings-v3.8.1.md) | 80 | 负责主题、扫描、待关注规则、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。 |
| `src/store/skillStore.ts` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 143 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/store/uiStore.ts` | 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 78 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/stores/SkillPanelProvider.tsx` | 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 130 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/styles.css` | 样式系统与视觉规范 | [styles-system-v3.8.1.md](./styles-system-v3.8.1.md) | 3827 | 负责全局 token、基础样式、v3.8.1 UI 样式规范和视觉一致性。 |
| `src/styles/tokens.css` | 样式系统与视觉规范 | [styles-system-v3.8.1.md](./styles-system-v3.8.1.md) | 66 | 负责全局 token、基础样式、v3.8.1 UI 样式规范和视觉一致性。 |
| `src/test/setup.ts` | 测试与视觉 QA | [testing-qa-v3.8.1.md](./testing-qa-v3.8.1.md) | 2 | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 |
| `src/types/commands.ts` | 类型契约与命令边界 | [types-contracts-v3.8.1.md](./types-contracts-v3.8.1.md) | 175 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src/types/skill.test.ts` | 类型契约与命令边界 | [types-contracts-v3.8.1.md](./types-contracts-v3.8.1.md) | 140 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src/types/skill.ts` | 类型契约与命令边界 | [types-contracts-v3.8.1.md](./types-contracts-v3.8.1.md) | 191 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `ui-style-guide.md` | 样式系统与视觉规范 | [styles-system-v3.8.1.md](./styles-system-v3.8.1.md) | 193 | 负责全局 token、基础样式、v3.8.1 UI 样式规范和视觉一致性。 |
| `vite.config.ts` | 打包、迁移和本地更新 | [packaging-scripts-v3.8.1.md](./packaging-scripts-v3.8.1.md) | 20 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |

## 维护规则

- 新增源码文件时，必须分配所属模块。
- 模块行数变化明显时，更新对应模块文档。
- 文件职责变化时，更新简介和模块归属。
- 删除源码文件时，同步清理本索引。
