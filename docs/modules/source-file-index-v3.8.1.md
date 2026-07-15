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
| `src-tauri/Cargo.toml` | 打包、迁移和本地更新 | [packaging-scripts-v3.8.1.md](./packaging-scripts-v3.8.1.md) | 32 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `src-tauri/src/ai_proxy.rs` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 276 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src-tauri/src/call_logger.rs` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 58 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src-tauri/src/commands.rs` | Tauri 命令层 | [tauri-command-layer-v3.8.1.md](./tauri-command-layer-v3.8.1.md) | 720 | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 |
| `src-tauri/src/dep_analyzer.rs` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 66 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src-tauri/src/lib.rs` | Tauri 命令层 | [tauri-command-layer-v3.8.1.md](./tauri-command-layer-v3.8.1.md) | 54 | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 |
| `src-tauri/src/main.rs` | Tauri 命令层 | [tauri-command-layer-v3.8.1.md](./tauri-command-layer-v3.8.1.md) | 6 | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 |
| `src-tauri/src/models.rs` | Tauri 命令层 | [tauri-command-layer-v3.8.1.md](./tauri-command-layer-v3.8.1.md) | 252 | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 |
| `src-tauri/src/settings_store.rs` | 后端设置与文件监听 | [tauri-settings-watchers-v3.8.1.md](./tauri-settings-watchers-v3.8.1.md) | 279 | 负责设置文件读写、默认扫描目录、文件变化监听和 scan-changed 事件。 |
| `src-tauri/src/skill_scanner.rs` | Skill 数据、扫描和版本历史 | [tauri-skill-data-v3.8.1.md](./tauri-skill-data-v3.8.1.md) | 686 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 |
| `src-tauri/src/skill_path_guard.rs` | Skill 数据、扫描和版本历史 | [tauri-skill-data-v3.8.1.md](./tauri-skill-data-v3.8.1.md) | 303 | 负责 Skill 文件命令的 canonicalization、允许根校验、符号链接逃逸拦截和来源权限矩阵。 |
| `src-tauri/src/skill_store.rs` | Skill 数据、扫描和版本历史 | [tauri-skill-data-v3.8.1.md](./tauri-skill-data-v3.8.1.md) | 1295 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 |
| `src-tauri/src/version_store.rs` | Skill 数据、扫描和版本历史 | [tauri-skill-data-v3.8.1.md](./tauri-skill-data-v3.8.1.md) | 87 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 |
| `src-tauri/src/watcher.rs` | 后端设置与文件监听 | [tauri-settings-watchers-v3.8.1.md](./tauri-settings-watchers-v3.8.1.md) | 46 | 负责设置文件读写、默认扫描目录、文件变化监听和 scan-changed 事件。 |
| `src-tauri/tauri.conf.json` | 打包、迁移和本地更新 | [packaging-scripts-v3.8.1.md](./packaging-scripts-v3.8.1.md) | 67 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `src-tauri/tests/skill_contract.rs` | 类型契约与命令边界 | [types-contracts-v3.8.1.md](./types-contracts-v3.8.1.md) | 127 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src/App.editor.test.tsx` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 1118 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/App.test.tsx` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 2008 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/App.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 11 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/AppShell.test.tsx` | 测试与视觉 QA | [testing-qa-v3.8.1.md](./testing-qa-v3.8.1.md) | 435 | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 |
| `src/AppShell.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 109 | 负责应用启动入口、顶栏、主视图切换、Detail/AI/Dependencies/EmptyStates 次级视图进入和全局监听。 |
| `src/common/EmptyState.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 65 | 提供统一空状态、扫描中和无搜索结果展示。 |
| `src/common/ErrorBoundary.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 59 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/SkillExport.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 37 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/Toast.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 54 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/Ui.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 95 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/components/ai/ai.css` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 657 | 负责 AI Rail、AI Assistant 页面、Diff 对比和 Key 状态的无阴影样式。 |
| `src/components/ai/AIRail.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 102 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/AIAssistantView.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 109 | 负责 AI Assistant 页面、优化方向选择、Diff 对比和 Key 状态展示。 |
| `src/components/ai/AIModeSelector.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 36 | 提供 AI Assistant 优化模式选择结构。 |
| `src/components/ai/CostBadge.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 44 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/DiffHunk.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 66 | 负责 AI Rail、页面级 Diff hunk 展示、选择采纳和拒绝操作。 |
| `src/components/ai/DiffModal.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 102 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/DiffPreview.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 39 | 提供 AI Assistant 页面级 Diff 摘要与 hunk 列表。 |
| `src/components/Modal.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 28 | 提供 Notion 风格弹窗结构。 |
| `src/components/Drawer.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 14 | 提供 Notion 风格抽屉结构。 |
| `src/components/SkillForm.tsx` | 新建与预览流程 | [create-preview-v3.8.1.md](./create-preview-v3.8.1.md) | 41 | 提供 New Skill 表单结构。 |
| `src/components/TemplateSelector.tsx` | 新建与预览流程 | [create-preview-v3.8.1.md](./create-preview-v3.8.1.md) | 52 | 提供 New Skill 模板选择卡片。 |
| `src/components/ErrorState.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 33 | 提供统一错误状态展示。 |
| `src/components/KeyStatusBadge.tsx` | AI 助手与 Diff 写回 | [ai-assistant-v3.8.1.md](./ai-assistant-v3.8.1.md) | 16 | 提供 API Key 配置状态和脱敏 Key 展示。 |
| `src/components/Toast.css` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 8 | 负责应用 Toast 容器的无阴影样式。 |
| `src/components/Toast.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 32 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/components/TopBar.css` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 100 | 负责顶部导航的白底、细边框、品牌、导航链接和 New Skill 按钮布局。 |
| `src/components/TopBar.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 68 | 负责原型单层顶部导航、主入口切换、Library 子视图高亮、Logs/Dependencies 入口和 New Skill 次级入口。 |
| `src/components/ActionButton.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 34 | 提供 Notion 风格通用操作按钮，支持 primary、ghost、secondary、danger、text。 |
| `src/components/PageHeader.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 22 | 提供页面标题、副标题、eyebrow 和右侧操作区布局。 |
| `src/components/StatusPill.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 25 | 提供健康、异常、警告、信息、归档、只读、收藏等状态徽标。 |
| `src/components/SearchBar.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 17 | 提供 Library 原型搜索框结构。 |
| `src/components/FilterBar.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 26 | 提供 Library 原型筛选和排序按钮组。 |
| `src/components/LogTable.tsx` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 49 | 提供调用日志表格组件。 |
| `src/components/DependencyTable.tsx` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 45 | 提供依赖详情表格组件。 |
| `src/components/DependencyGraph.tsx` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 17 | 提供依赖拓扑展示组件。 |
| `src/components/SettingCard.tsx` | 设置与偏好 | [settings-v3.8.1.md](./settings-v3.8.1.md) | 14 | 提供 Settings 分组卡片结构。 |
| `src/components/SettingsNav.tsx` | 设置与偏好 | [settings-v3.8.1.md](./settings-v3.8.1.md) | 13 | 提供 Settings 左侧分组导航。 |
| `src/components/CategoryPill.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 13 | 提供 Library 原型分类 pill。 |
| `src/components/MetricCard.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 19 | 提供 Dashboard 指标卡片结构。 |
| `src/components/RiskSummary.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 16 | 提供 Dashboard 依赖提醒行结构。 |
| `src/components/SkillRowMini.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 22 | 提供 Dashboard 表格行结构。 |
| `src/components/SkillCard.tsx` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 61 | 提供 Library Notion 风格 Skill 卡片，使用统一浅蓝图标和状态 pill。 |
| `src/components/FileTree.tsx` | Skill Detail | [skill-detail-v3.8.1.md](./skill-detail-v3.8.1.md) | 31 | 提供文件结构展示组件。 |
| `src/components/QualityCheck.tsx` | Skill Detail | [skill-detail-v3.8.1.md](./skill-detail-v3.8.1.md) | 28 | 提供质量检查结果组件。 |
| `src/components/DependencyList.tsx` | Skill Detail | [skill-detail-v3.8.1.md](./skill-detail-v3.8.1.md) | 43 | 提供依赖关系列表组件。 |
| `src/components/DangerZone.tsx` | Skill Detail | [skill-detail-v3.8.1.md](./skill-detail-v3.8.1.md) | 32 | 提供危险操作区、应用内归档和本地文件删除入口。 |
| `src/components/ValidationResult.tsx` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 41 | 提供 Editor 校验结果列表。 |
| `src/components/ui.css` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 539 | 提供 Button、ActionButton、PageHeader、StatusPill、Modal、Drawer、Template、EmptyState 等无阴影组件样式。 |
| `src/components/ui.tsx` | 共享 UI 与通用组件 | [shared-ui-v3.8.1.md](./shared-ui-v3.8.1.md) | 79 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/detail/DetailPanel.tsx` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 80 | 提供 Library 右侧 340px 详情面板。 |
| `src/dashboard/DashboardView.tsx` | Dashboard 仪表盘 | [dashboard-v3.8.1.md](./dashboard-v3.8.1.md) | 165 | 负责 Dashboard 原型 DOM 编排、指标计算、最近修改、关注项和依赖提醒。 |
| `src/detail/DetailView.tsx` | Skill Detail | [skill-detail-v3.8.1.md](./skill-detail-v3.8.1.md) | 439 | 负责 Skill Detail 数据选择、归档持久化、打开目录、复制确认、删除确认和操作反馈。 |
| `src/detail/detail.css` | Skill Detail | [skill-detail-v3.8.1.md](./skill-detail-v3.8.1.md) | 375 | 负责 Skill Detail 网格、基础信息、质量检查、依赖表格、危险区和模态框样式。 |
| `src/detail/DetailDrawer.tsx` | Skill Detail | [skill-detail-v3.8.1.md](./skill-detail-v3.8.1.md) | 29 | 提供详情抽屉外壳，保留给兼容代码和后续扩展。 |
| `src/editor/EditorView.tsx` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 236 | 负责 Editor 原型 DOM 编排、草稿状态、读取、校验、AI diff 入口和保存提示。 |
| `src/editor/FrontmatterForm.tsx` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 40 | 提供 Frontmatter 表单结构。 |
| `src/editor/MarkdownEditor.tsx` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 18 | 提供 Markdown textarea 编辑区。 |
| `src/editor/PreviewPane.tsx` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 47 | 提供 Markdown 预览区。 |
| `src/editor/EditorWorkspace.tsx` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 14 | 提供 Editor 工作区外壳。 |
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
| `src/lib/invoke.ts` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 125 | 负责 Skill 扫描调用、前端数据映射和浏览器预览 fallback 数据。 |
| `src/lib/logs.ts` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 26 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src/lib/skillPermissions.test.ts` | 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 24 | 覆盖用户来源、受保护来源、归档和复制能力判断。 |
| `src/lib/skillPermissions.ts` | 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 38 | 提供前端统一来源权限矩阵，供按钮状态和操作入口复用。 |
| `src/lib/skills.ts` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 7 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/lib/tauriEvents.ts` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 15 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/library/SkillCard.tsx` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 89 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/layout/AppShell.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 1 | 提供 AppShell 的稳定布局目录导出入口。 |
| `src/layout/TopBar.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 1 | 提供 TopBar 的稳定布局目录导出入口。 |
| `src/main.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 13 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/node-fs.d.ts` | 类型契约与命令边界 | [types-contracts-v3.8.1.md](./types-contracts-v3.8.1.md) | 4 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src/packaging.config.test.ts` | 测试与视觉 QA | [testing-qa-v3.8.1.md](./testing-qa-v3.8.1.md) | 71 | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 |
| `src/pages/Create/index.tsx` | 新建与预览流程 | [create-preview-v3.8.1.md](./create-preview-v3.8.1.md) | 96 | 负责 New Skill 次级弹窗流程、模板选择、AI 辅助入口和创建提交。 |
| `src/pages/Create/Create.css` | 新建与预览流程 | [create-preview-v3.8.1.md](./create-preview-v3.8.1.md) | 28 | 负责 New Skill 弹窗页面辅助样式。 |
| `src/pages/Dashboard/Dashboard.css` | Dashboard 仪表盘 | [dashboard-v3.8.1.md](./dashboard-v3.8.1.md) | 199 | 负责 Dashboard 原型网格、卡片、表格、状态 pill 和依赖提醒样式。 |
| `src/pages/Dashboard/index.tsx` | Dashboard 仪表盘 | [dashboard-v3.8.1.md](./dashboard-v3.8.1.md) | 5 | 负责 Dashboard 页面入口并挂载 DashboardView。 |
| `src/pages/Editor/Editor.css` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 207 | 负责 Editor 原型三栏、Frontmatter、Markdown、Preview、校验和 AI 入口样式。 |
| `src/pages/Editor/index.tsx` | 编辑器工作区 | [editor-v3.8.1.md](./editor-v3.8.1.md) | 5 | 负责 Editor 页面入口并挂载 EditorView。 |
| `src/pages/Library/index.tsx` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 90 | 负责 Library 1:1 原型 DOM 编排、搜索、分类 pill、卡片网格、右侧详情面板和详情页入口。 |
| `src/pages/Library/Library.css` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 335 | 负责 Library 1:1 原型布局、搜索、分类 pill、卡片网格、详情面板和响应式样式。 |
| `src/pages/Dependencies/index.tsx` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 65 | 负责依赖分析页面、拓扑图、风险摘要和依赖详情。 |
| `src/pages/Dependencies/Dependencies.css` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 123 | 负责依赖分析页面、拓扑图、风险摘要和表格样式。 |
| `src/pages/Logs/index.tsx` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 116 | 负责调用日志页面、筛选入口、日志表格和详情展示。 |
| `src/pages/Logs/Logs.css` | 日志与依赖分析 | [logs-and-deps-v3.8.1.md](./logs-and-deps-v3.8.1.md) | 98 | 负责调用日志页面、表格、筛选和详情样式。 |
| `src/pages/EmptyStates/index.tsx` | 新建与预览流程 | [create-preview-v3.8.1.md](./create-preview-v3.8.1.md) | 64 | 提供 Empty/Error 状态验收页。 |
| `src/pages/EmptyStates/EmptyStates.css` | 新建与预览流程 | [create-preview-v3.8.1.md](./create-preview-v3.8.1.md) | 29 | 负责 Empty/Error 状态验收页网格样式。 |
| `src/pages/Preview/index.tsx` | 新建与预览流程 | [create-preview-v3.8.1.md](./create-preview-v3.8.1.md) | 55 | 负责创建 Skill 的入口、预览页面和次级视图流程。 |
| `src/pages/Settings/index.tsx` | 设置与偏好 | [settings-v3.8.1.md](./settings-v3.8.1.md) | 170 | 负责主题、扫描、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。 |
| `src/pages/Settings/Settings.css` | 设置与偏好 | [settings-v3.8.1.md](./settings-v3.8.1.md) | 155 | 负责 Settings 左侧导航、设置表单、卡片和安全说明样式。 |
| `src/router.tsx` | 应用壳与导航 | [app-shell-v3.8.1.md](./app-shell-v3.8.1.md) | 42 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/settings/Settings.tsx` | 设置与偏好 | [settings-v3.8.1.md](./settings-v3.8.1.md) | 15 | 负责主题、扫描、待关注规则、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。 |
| `src/SkillPanelWorkspace.tsx` | 国际化与旧版工作区兼容 | [i18n-legacy-workspace-v3.8.1.md](./i18n-legacy-workspace-v3.8.1.md) | 5933 | 负责 i18n 运行时、语言资源、旧版 SkillPanelWorkspace 兼容代码和相关测试。 |
| `src/store/settingsStore.ts` | 设置与偏好 | [settings-v3.8.1.md](./settings-v3.8.1.md) | 80 | 负责主题、扫描、待关注规则、AI 厂商、Key 保存、脱敏、diff 确认和预算设置。 |
| `src/store/skillStore.ts` | Skill Library | [library-v3.8.1.md](./library-v3.8.1.md) | 143 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/store/uiStore.ts` | 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 77 | 负责 UI 状态、Detail 子视图、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/stores/SkillPanelProvider.tsx` | 前端状态与 Hooks | [state-hooks-v3.8.1.md](./state-hooks-v3.8.1.md) | 130 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/styles.css` | 样式系统与视觉规范 | [styles-system-v3.8.1.md](./styles-system-v3.8.1.md) | 216 | 负责全局样式重置、body warm paper 背景、Inter 字体、固定应用壳高度、基础控件和原型辅助类。 |
| `src/styles/tokens.css` | 样式系统与视觉规范 | [styles-system-v3.8.1.md](./styles-system-v3.8.1.md) | 74 | 负责第 0 批必须变量、兼容语义 token、间距、圆角和基础色。 |
| `src/test/setup.ts` | 测试与视觉 QA | [testing-qa-v3.8.1.md](./testing-qa-v3.8.1.md) | 2 | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 |
| `src/types/commands.ts` | 类型契约与命令边界 | [types-contracts-v3.8.1.md](./types-contracts-v3.8.1.md) | 182 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src/types/skill.test.ts` | 类型契约与命令边界 | [types-contracts-v3.8.1.md](./types-contracts-v3.8.1.md) | 148 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src/types/skill.ts` | 类型契约与命令边界 | [types-contracts-v3.8.1.md](./types-contracts-v3.8.1.md) | 198 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `ui-style-guide.md` | 样式系统与视觉规范 | [styles-system-v3.8.1.md](./styles-system-v3.8.1.md) | 193 | 负责全局 token、基础样式、v3.8.1 UI 样式规范和视觉一致性。 |
| `vite.config.ts` | 打包、迁移和本地更新 | [packaging-scripts-v3.8.1.md](./packaging-scripts-v3.8.1.md) | 20 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |

## 维护规则

- 新增源码文件时，必须分配所属模块。
- 模块行数变化明显时，更新对应模块文档。
- 文件职责变化时，更新简介和模块归属。
- 删除源码文件时，同步清理本索引。
