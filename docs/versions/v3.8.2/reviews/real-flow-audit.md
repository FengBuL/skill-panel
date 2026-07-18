---
title: Skill Panel AUDIT-REAL-FLOW-01 真实功能审计
date: 2026-07-13
batch: AUDIT-REAL-FLOW-01
owner: Codex
status: draft-review
source_worktree: /Users/shovy/Documents/skill-panel-codex-v3.8
source_branch: codex/agent-codex-v3.8
source_head: ec58c8deb2dcaeefc845d3762d7af13e6ed87590
version: 3.8.2
tags: [SkillPanel, 审计, 真实功能, v3.8.2]
---

# Skill Panel AUDIT-REAL-FLOW-01 真实功能审计

## 1. 审计结论

本批次只读审计覆盖 Dashboard、Library、Detail、Editor、Create、Settings、Logs、Dependencies、AI Assistant。

当前 v3.8.2 的可见页面已经完成 Notion 风格 UI 迁移，部分核心能力已接入 Tauri 真命令。真实可用能力集中在扫描、读取、创建、校验、日志读取、API Key 保存和 Editor AI 侧栏生成到 diff 草稿。保存、备份、归档、删除、打开目录、依赖分析页面、Settings 大部分偏好持久化、AI Assistant 独立页仍存在展示型入口或部分连接。

最关键风险集中在两个方向：

1. `DATA-EDITOR-01`：Editor 保存、撤销、快照、恢复、AI diff 写回链路需要接通真实文件写入边界。
2. `SEC-FILE-01`：文件命令路径校验、插件缓存和系统来源保护、打开目录、删除、恢复、依赖分析、日志脱敏需要统一收口。

## 2. 前置核对

| 项目 | 实际结果 |
|---|---|
| 有效目录 | `/Users/shovy/Documents/skill-panel-codex-v3.8` |
| 分支 | `codex/agent-codex-v3.8` |
| HEAD | `ec58c8deb2dcaeefc845d3762d7af13e6ed87590` |
| 版本 | `package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml` 均为 `3.8.2` |
| 工作区 | 干净 |
| 审计模式 | 只读 |
| 修改代码 | 无 |
| 创建 commit | 无 |

## 3. 已读资料

| 文档 | 路径 | 结论 |
|---|---|---|
| 项目规则 | `/Users/shovy/Documents/skill-panel-codex-v3.8/AGENTS.md` | Library 是主入口；本地文件安全、Keychain、日志脱敏、写回前备份或快照为红线 |
| PROJECT_STATE | `/Users/shovy/Library/Mobile Documents/iCloud~md~obsidian/Documents/notes/skill panel项目总揽/skill panel/PROJECT_STATE.md` | v3.8.2 已发布，仍存在真实功能连接缺口 |
| CURRENT-PLAN | `/Users/shovy/Library/Mobile Documents/iCloud~md~obsidian/Documents/notes/skill panel项目总揽/skill panel/CURRENT-PLAN.md` | 当前处于发布后验证和归档阶段 |
| PRD | `/Users/shovy/Library/Mobile Documents/iCloud~md~obsidian/Documents/notes/skill panel项目总揽/skill panel/PRD.md` | 保存、删除、打开目录、设置读写为 P0；版本快照、依赖分析、AI 写回为 P1 |
| RELEASE-READINESS | `/Users/shovy/Library/Mobile Documents/iCloud~md~obsidian/Documents/notes/skill panel项目总揽/skill panel/RELEASE-READINESS.md` | 发布归档部分完成，Windows 安装包、签名公证、真实升级验证仍待补齐 |
| 模块 README | `/Users/shovy/Documents/skill-panel-codex-v3.8/docs/modules/README.md` | 模块文档库入口有效 |
| 模块详情 | `docs/modules/*.md` | 多个页面文档明示当前含原型、占位、只读提示 |

## 4. 状态枚举

本报告的“当前状态”只使用以下值：

- 真实可用
- 部分连接
- 展示占位
- 未开放
- 验证失败

## 5. 全页面功能审计表

| 页面 | 功能或按钮 | 用户从哪里进入 | 预期结果 | 当前状态 | 真实数据源或 Tauri 命令 | 验证证据 | 数据安全影响 | 风险等级 | 建议动作 | 建议进入的后续批次 |
|---|---|---|---|---|---|---|---|---|---|---|
| TopBar | Dashboard | 顶栏 | 切到 Dashboard | 真实可用 | `useUIStore.setMainView('dashboard')` | `src/components/TopBar.tsx:23` | 无写入 | P2 | 保留 | WorkBuddy-UX |
| TopBar | Library | 顶栏和品牌按钮 | 切到 Library | 真实可用 | `useUIStore.setMainView('library')` | `src/components/TopBar.tsx:12`、`:30` | 无写入 | P2 | 保留 | WorkBuddy-UX |
| TopBar | Logs | 顶栏 | 进入日志页 | 真实可用 | `useUIStore.enterSub('logs')` | `src/components/TopBar.tsx:37` | 后续读取本地日志 | P2 | 保留 | Codex-LOGS |
| TopBar | Dependencies | 顶栏 | 进入依赖页 | 真实可用 | `useUIStore.enterSub('dependencies')` | `src/components/TopBar.tsx:44` | 后续读取 Skill 文件 | P2 | 保留 | Codex-DEPS |
| TopBar | Settings | 顶栏 | 进入设置页 | 真实可用 | `useUIStore.enterSub('settings')` | `src/components/TopBar.tsx:51` | 后续写设置和 Keychain | P2 | 保留 | Codex-SETTINGS |
| Dashboard | New Skill | Dashboard 页头 | 进入 Create | 真实可用 | `enterSub('create')` | `src/dashboard/DashboardView.tsx:109` | 后续可能写文件 | P1 | 保留入口，Create 中补目标目录确认 | DATA-EDITOR-01 |
| Dashboard | Skill 总数 | 指标卡 | 跳 Library 并显示全部 Skill | 部分连接 | `useSkillStore.skills`，空数据 fallback `42` | `src/dashboard/DashboardView.tsx:88`、`:113` | 空数据时会显示非真实数字 | P1 | 空数据显示空态或扫描提示 | Codex-REAL-DASH |
| Dashboard | 健康状态 | 指标卡 | 跳 Library 并显示需关注 Skill | 部分连接 | 本地 `isAttention` 规则 | `src/dashboard/DashboardView.tsx:51`、`:114` | 质量判断来源不足 | P1 | 接真实校验结果和健康设置 | Codex-REAL-DASH |
| Dashboard | 今日调用 | 指标卡 | 进入 Logs | 部分连接 | 有 Skill 时用 size 推算，空数据 fallback `156` | `src/dashboard/DashboardView.tsx:93`、`:115` | 调用统计会误导 | P1 | 接 `get_call_logs` 聚合 | Codex-LOGS |
| Dashboard | 未归档 | 指标卡 | 跳 Library 并显示未归档 | 部分连接 | `skill.disabled` 推断，空数据 fallback `3` | `src/dashboard/DashboardView.tsx:91`、`:116` | 归档语义不真实 | P1 | 接 `skill_archives` 设置 | Codex-DETAIL |
| Dashboard | 最近修改 | 表格 | 展示最新 Skill | 部分连接 | `skills.modifiedAt`，空数据 fallback | `src/dashboard/DashboardView.tsx:24`、`:55` | 空数据时展示样例 Skill | P1 | 空数据禁止注入样例 | Codex-REAL-DASH |
| Dashboard | 查看全部 | 最近修改卡片 | 回 Library | 真实可用 | `openLibrary` | `src/dashboard/DashboardView.tsx:123` | 无写入 | P2 | 保留 | WorkBuddy-UX |
| Dashboard | 需要关注 | 表格 | 展示待处理项 | 部分连接 | 本地规则 + fallbackAttention | `src/dashboard/DashboardView.tsx:31`、`:70` | 风险列表可能失真 | P1 | 接真实校验、依赖、日志数据 | Codex-REAL-DASH |
| Dashboard | 依赖提醒 | Dashboard 底部 | 展示依赖风险 | 展示占位 | 硬编码 RiskSummary | `src/dashboard/DashboardView.tsx:157` | 依赖风险误导 | P1 | 接 `analyze_deps` 或隐藏 | Codex-DEPS |
| Library | 自动扫描 | 进入 Library | 扫描 Skill 根目录 | 真实可用 | `scan_skills` | `src/pages/Library/index.tsx:31`、`src/lib/invoke.ts:87`、`src-tauri/src/commands.rs:15` | 只读扫描允许目录 | P2 | 保留，并显示扫描来源 | Codex-REAL-FLOW |
| Library | 浏览器 fallback mock | Tauri 不可用或 invoke 失败 | 预览页面结构 | 部分连接 | `MOCK_SKILLS` | `src/lib/invoke.ts:8`、`:93` | 可能把 mock 当真实数据 | P1 | UI 显示“示例数据”标识 | WorkBuddy-UX |
| Library | 搜索框 | Library 工具栏 | 本地搜索名称和描述 | 真实可用 | `skillStore.setSearch` | `src/store/skillStore.ts:72`、`:96` | 无写入 | P2 | 保留 | WorkBuddy-UX |
| Library | 分类 pill | Library 分类行 | 本地分类过滤 | 部分连接 | 页面局部 `categoryMatches` | `src/pages/Library/index.tsx:13`、`:15` | 分类依据可能不准 | P2 | 统一使用 frontmatter 和设置分类 | Codex-REAL-LIB |
| Library | 已归档 pill | Library 分类行 | 展示已归档 Skill | 展示占位 | `categoryMatches` 对已归档返回 false | `src/pages/Library/index.tsx:22` | 用户无法查看真实归档 | P1 | 接 `skill_archives` | Codex-DETAIL |
| Library | Filter | Library 工具栏 | 打开筛选或应用筛选 | 展示占位 | 默认 no-op | `src/components/FilterBar.tsx:9` | 无写入 | P2 | 接 store 或隐藏 | WorkBuddy-UX |
| Library | Sort | Library 工具栏 | 排序列表 | 展示占位 | 默认 no-op | `src/components/FilterBar.tsx:15` | 无写入 | P2 | 接真实排序 | WorkBuddy-UX |
| Library | Skill 卡片点击 | Skill 网格 | 进入 Detail | 真实可用 | `openDrawer` + `enterSub('detail')` | `src/pages/Library/index.tsx:44`、`:83` | 无写入 | P2 | 保留 | WorkBuddy-UX |
| Library | 右侧详情面板 | Library 右侧 | 展示 Skill 概览 | 部分连接 | 当前 Skill + 硬编码版本、标签、使用统计 | `src/detail/DetailPanel.tsx:47`、`:50`、`:54` | 元数据会误导 | P1 | 占位字段隐藏或接 `read_skill` | Codex-DETAIL |
| Detail | 编辑 | Detail 页头 | 进入 Editor | 真实可用 | `enterSub('editor')` | `src/detail/DetailView.tsx:65` | 后续保存风险 | P1 | 保留并提示保存状态 | DATA-EDITOR-01 |
| Detail | 打开目录 | Detail 页头 | 打开 Skill 文件夹 | 展示占位 | 可用后端 `open_skill_folder`，前端未调用 | `src/detail/DetailView.tsx:66`、`src-tauri/src/commands.rs:47` | 打开路径需严格允许根校验 | P1 | 接命令并补受保护来源提示 | SEC-FILE-01 |
| Detail | 备份 | Detail 页头 | 创建可恢复备份 | 展示占位 | 无前端调用 | `src/detail/DetailView.tsx:67` | 用户可能误判已备份 | P0 | 接备份/快照命令或禁用 | DATA-EDITOR-01 |
| Detail | 归档 | Detail 页头 | 应用内归档 | 展示占位 | 只显示确认提示 | `src/detail/DetailView.tsx:68`、`:72` | 状态无真实变化 | P1 | 接 `skill_archives` 持久化 | Codex-DETAIL |
| Detail | 基础信息 | Detail 页面 | 展示真实元数据 | 部分连接 | 扫描 summary + 硬编码版本、作者、文件结构、标签 | `src/detail/DetailView.tsx:105`、`:107`、`:111` | 元数据可信度不足 | P1 | 接 `read_skill` 和文件列表 | Codex-DETAIL |
| Detail | 使用统计 | Detail 页面 | 展示真实调用统计 | 展示占位 | size 推算 | `src/detail/DetailView.tsx:54`、`:96` | 统计误导 | P1 | 接日志聚合 | Codex-LOGS |
| Detail | 质量检查 | Detail 页面 | 展示真实校验 | 展示占位 | `QualityCheck` 静态组件 | `src/detail/DetailView.tsx:126`、`src/components/QualityCheck.tsx` | 质量结论不可信 | P1 | 接 `validate_skill` | DATA-EDITOR-01 |
| Detail | 依赖关系 | Detail 页面 | 展示真实依赖 | 展示占位 | `DependencyList` 静态组件 | `src/detail/DetailView.tsx:134`、`src/components/DependencyList.tsx` | 依赖风险误导 | P1 | 接 `analyze_deps` | Codex-DEPS |
| Detail | 删除管理记录 | DangerZone | 删除应用记录或本地文件 | 展示占位 | 只切换确认 UI | `src/components/DangerZone.tsx:16` | 删除语义不清 | P0 | 明确应用记录和本地删除边界 | SEC-FILE-01 |
| Editor | 进入时读取 Skill | Detail 或 AI 返回 | 读取 Markdown/frontmatter | 部分连接 | `read_skill` | `src/editor/EditorView.tsx:104`、`src/lib/invoke.ts:101` | 只读安全 | P1 | 移除初始化样例对真实数据的干扰 | DATA-EDITOR-01 |
| Editor | 初始 Markdown | 直接进入 Editor | 显示默认内容 | 展示占位 | `browserMarkdown`、`aihotMarkdown` | `src/editor/EditorView.tsx:23`、`:40` | 可能把样例当真实文件 | P1 | 无选中 Skill 时展示空态 | DATA-EDITOR-01 |
| Editor | Frontmatter 编辑 | Editor 表单 | 修改草稿 | 真实可用 | React state | `src/editor/FrontmatterForm.tsx:24`、`src/editor/EditorView.tsx:121` | 内存草稿，无文件写入 | P2 | 保留 | DATA-EDITOR-01 |
| Editor | Markdown 编辑 | Editor 文本区 | 修改草稿 | 真实可用 | React state | `src/editor/MarkdownEditor.tsx:6`、`src/editor/EditorView.tsx:125` | 内存草稿，无文件写入 | P2 | 保留 | DATA-EDITOR-01 |
| Editor | Preview | Editor 中栏 | 渲染 Markdown 预览 | 真实可用 | 前端 Markdown 简易解析 | `src/editor/PreviewPane.tsx:5` | 无写入 | P2 | 可后续换标准 Markdown 渲染 | WorkBuddy-UX |
| Editor | 重新校验 | Editor 右栏 | 校验当前 Skill | 部分连接 | `validate_skill`，失败 fallback | `src/editor/EditorView.tsx:133`、`src-tauri/src/commands.rs:216` | 后端直接读 path，缺允许根统一校验 | P1 | 后端复用 `read_skill_in_roots` 路径校验 | SEC-FILE-01 |
| Editor | 保存 | Editor 右下 | 写回 `SKILL.md` | 展示占位 | 只 `setDirty(false)` 和 Toast | `src/editor/EditorView.tsx:129` | 用户会误判文件已保存 | P0 | 接 `update_skill`、备份、快照、失败回读 | DATA-EDITOR-01 |
| Editor | 撤销更改 | Editor 右下 | 恢复读取时内容 | 部分连接 | 只清 dirty | `src/editor/EditorView.tsx:216` | UI 状态与真实草稿不一致 | P1 | 保存原始快照并恢复内容 | DATA-EDITOR-01 |
| Editor | AI 辅助按钮 | Editor 页头 | 进入 AI Assistant 独立页 | 真实可用 | `enterSub('ai')` | `src/editor/EditorView.tsx:169` | 进入后多为样例 | P1 | 独立页接真实 hook 或隐藏 | AI-SAFE |
| Editor | AI 侧栏显示 | Editor 右栏 AI 按钮 | 展开 AI Rail | 真实可用 | `showAI` state | `src/editor/EditorView.tsx:196`、`:211` | 后续可能外发内容 | P1 | 保留，增强外发提示 | AI-SAFE |
| Editor | AI 生成 | AI Rail 动作按钮 | 调用厂商 API | 部分连接 | `get_ai_key`、`ai_optimize`、Tauri events | `src/hooks/useAIRail.ts:72`、`:79`、`src/lib/ai.ts:82` | 内容会发至厂商，脱敏依赖开关 | P1 | 强制展示脱敏和发送范围 | AI-SAFE |
| Editor | AI 取消 | AI Rail 取消按钮 | 取消生成 | 部分连接 | `ai_cancel` + CANCEL_FLAG | `src/hooks/useAIRail.ts:133`、`src-tauri/src/ai_proxy.rs:28` | 仅取消 emit 循环，HTTP 请求完成后才处理 | P1 | 明确取消边界 | AI-SAFE |
| Editor | Diff 接受 | DiffModal | 应用所选 hunk 到草稿 | 部分连接 | `applyDiffHunks` 写前端 state | `src/hooks/useAIRail.ts:140` | 不直接写文件 | P1 | 接保存确认链路 | DATA-EDITOR-01 |
| Create | 表单 | Create 弹窗 | 填名称、描述、目标目录 | 部分连接 | React state | `src/pages/Create/index.tsx:18` | 目标目录手输，易错 | P1 | 加目录选择器和目标预览 | DATA-EDITOR-01 |
| Create | 取消 | Create footer | 返回上一级 | 真实可用 | `ui.exitSub` | `src/pages/Create/index.tsx:69` | 无写入 | P2 | 保留 | WorkBuddy-UX |
| Create | 创建并编辑 | Create footer | 新建 Skill | 真实可用 | `create_skill` | `src/pages/Create/index.tsx:39`、`src/lib/skills.ts:4`、`src-tauri/src/skill_store.rs:55` | 写入允许根目录内新目录 | P1 | 成功后进入 Editor 或 Detail，增加重名和路径提示 | DATA-EDITOR-01 |
| Create | 选择模板 | Create | 套用模板正文 | 部分连接 | template state，未影响 markdown | `src/pages/Create/index.tsx:25`、`:78` | 无写入 | P2 | 模板接真实 markdown | WorkBuddy-UX |
| Create | 用 AI 生成初稿 | Create | AI 生成草稿 | 展示占位 | Toast | `src/pages/Create/index.tsx:89` | 当前无外发 | P2 | 接 AI 草稿流程或隐藏 | WorkBuddy-UX |
| Settings | 返回 | Settings 页头 | 回 Library | 真实可用 | `ui.setMainView('library')` | `src/pages/Settings/index.tsx:56` | 无写入 | P2 | 保留 | WorkBuddy-UX |
| Settings | Skill 根目录 | 目录与扫描 | 配置扫描根目录 | 展示占位 | readOnly 输入 | `src/pages/Settings/index.tsx:66` | 用户无法控制扫描范围 | P1 | 接 `load_app_settings/save_app_settings` 和目录选择器 | SEC-FILE-01 |
| Settings | 扫描间隔 | 目录与扫描 | 配置扫描频率 | 展示占位 | readOnly 输入 | `src/pages/Settings/index.tsx:70` | 自动扫描口径不真实 | P2 | 隐藏或接真实计划 | Codex-SETTINGS |
| Settings | 自动扫描 | Toggle | 切换自动扫描 | 部分连接 | zustand 内存 | `src/pages/Settings/index.tsx:75`、`src/store/settingsStore.ts:68` | 重启丢失 | P1 | 持久化到 AppSettings | Codex-SETTINGS |
| Settings | AI 厂商 | 厂商按钮 | 切换默认厂商 | 部分连接 | zustand 内存 | `src/pages/Settings/index.tsx:86`、`src/store/settingsStore.ts:74` | 重启丢失 | P1 | 接 AppSettings | Codex-SETTINGS |
| Settings | API Key 配置 | API Key 区 | 保存到系统 Keychain | 真实可用 | `set_ai_key` + keyring | `src/pages/Settings/index.tsx:34`、`src/lib/ai.ts:108`、`src-tauri/src/ai_proxy.rs:43` | Key 不进入前端持久化 | P1 | 保存后调用 `get_ai_key` 刷新状态 | AI-SAFE |
| Settings | API Key 状态 | API Key 区 | 显示已配置 | 部分连接 | `settings.aiKeyStored` 内存 | `src/pages/Settings/index.tsx:41`、`src/store/settingsStore.ts:75` | 状态重启后可能不准 | P1 | 页面加载调用 `get_ai_key` | AI-SAFE |
| Settings | 月预算 | 输入框 | 设置预算 | 部分连接 | zustand 内存 | `src/pages/Settings/index.tsx:134`、`src/store/settingsStore.ts:78` | 重启丢失 | P2 | 接 AppSettings | Codex-SETTINGS |
| Settings | 已用预算 | 输入框 | 显示真实成本 | 展示占位 | 固定 `¥ 2.4 (23.7%)` | `src/pages/Settings/index.tsx:143` | 成本误导 | P1 | 从日志聚合成本 | Codex-LOGS |
| Settings | 日志脱敏 | Toggle | 控制日志和 AI 脱敏 | 部分连接 | zustand 内存，AI 侧栏读取 | `src/pages/Settings/index.tsx:154`、`src/editor/EditorView.tsx:154` | 日志层没有统一强制脱敏 | P1 | 后端日志写入统一脱敏 | AI-SAFE |
| Settings | diff 确认 | Toggle | 控制 AI 写回确认 | 部分连接 | zustand 内存，当前保存未接写回 | `src/pages/Settings/index.tsx:161` | 开关与真实写回无绑定 | P1 | 写回链路强制 diff | DATA-EDITOR-01 |
| Settings | 主题 | 外观 | 切换主题 | 部分连接 | zustand 内存 | `src/pages/Settings/index.tsx:172` | 重启丢失 | P2 | 接 AppSettings 和 CSS 主题 | WorkBuddy-UX |
| Logs | 加载日志 | 进入 Logs | 读取本地日志 | 真实可用 | `get_call_logs` | `src/pages/Logs/index.tsx:34`、`src/lib/logs.ts:18`、`src-tauri/src/call_logger.rs:22` | 日志可能含用户输入 | P1 | 后端写入时统一脱敏 | AI-SAFE |
| Logs | 刷新 | Logs 页头 | 重新读取日志 | 真实可用 | `loadLogs` | `src/pages/Logs/index.tsx:62`、`:67` | 只读 | P2 | 保留 | Codex-LOGS |
| Logs | 空日志 fallback | Logs 表格 | 展示日志 | 部分连接 | 无真实日志时使用 fallbackRows | `src/pages/Logs/index.tsx:9`、`:53` | 样例日志会误导 | P1 | 空日志显示空态 | Codex-LOGS |
| Logs | 搜索框 | Logs 工具栏 | 搜索日志 | 展示占位 | input 无绑定 | `src/pages/Logs/index.tsx:91` | 无 | P2 | 接本地过滤 | WorkBuddy-UX |
| Logs | 全部/成功/失败 | Logs 工具栏 | 按状态过滤 | 展示占位 | button 无绑定 | `src/pages/Logs/index.tsx:94` | 无 | P2 | 接本地过滤 | WorkBuddy-UX |
| Logs | 筛选 | Logs 工具栏 | 打开高级筛选 | 展示占位 | ActionButton 无 onClick | `src/pages/Logs/index.tsx:97` | 无 | P2 | 隐藏或接筛选弹层 | WorkBuddy-UX |
| Logs | 日志详情 | Logs 下方 | 展示选中日志 | 部分连接 | 固定第一行，调用 ID 和状态硬编码 | `src/pages/Logs/index.tsx:120`、`:127`、`:134` | 详情失真 | P1 | 接选中行和真实状态 | Codex-LOGS |
| Dependencies | 返回 | Dependencies 页头 | 返回主视图 | 真实可用 | `ui.exitSub` | `src/pages/Dependencies/index.tsx:23` | 无 | P2 | 保留 | WorkBuddy-UX |
| Dependencies | 拓扑图 | Dependencies | 展示真实依赖拓扑 | 展示占位 | 硬编码 nodes | `src/pages/Dependencies/index.tsx:32` | 依赖判断失真 | P1 | 接 `analyze_deps` | Codex-DEPS |
| Dependencies | 风险摘要 | Dependencies | 展示真实风险数 | 展示占位 | 硬编码数字 | `src/pages/Dependencies/index.tsx:46` | 风险判断失真 | P1 | 接全量依赖分析 | Codex-DEPS |
| Dependencies | 依赖详情表 | Dependencies | 展示真实依赖关系 | 展示占位 | `dependencyRows` 硬编码 | `src/pages/Dependencies/index.tsx:8`、`:67` | 依赖判断失真 | P1 | 接真实命令和路径保护 | Codex-DEPS |
| AI Assistant | 返回编辑器 | AI Assistant 页头 | 回 Editor | 真实可用 | `ui.enterSub('editor')` | `src/components/ai/AIAssistantView.tsx:64` | 无写入 | P2 | 保留 | WorkBuddy-UX |
| AI Assistant | 选择优化方向 | AI Assistant | 切换模式 | 真实可用 | React state | `src/components/ai/AIAssistantView.tsx:48`、`:71` | 无写入 | P2 | 保留 | WorkBuddy-UX |
| AI Assistant | 补充说明 | AI Assistant | 输入 prompt 补充 | 真实可用 | React state | `src/components/ai/AIAssistantView.tsx:49`、`:74` | 当前不外发 | P2 | 接真实生成时纳入脱敏 | AI-SAFE |
| AI Assistant | 生成优化建议 | AI Assistant | 调用 AI | 展示占位 | button 无 onClick | `src/components/ai/AIAssistantView.tsx:82` | 用户以为可生成 | P1 | 接 `useAIRail` 或隐藏独立页 | AI-SAFE |
| AI Assistant | Diff 对比 | AI Assistant | 展示真实 diff | 展示占位 | `sampleHunks` | `src/components/ai/AIAssistantView.tsx:12` | diff 与真实文件无关 | P1 | 接真实 AI 结果 | DATA-EDITOR-01 |
| AI Assistant | 全部接受/拒绝 | AI Assistant Diff | 写回确认或拒绝 | 展示占位 | Toast | `src/components/ai/AIAssistantView.tsx:51`、`:55` | 写回边界虚假 | P1 | 使用 Editor AI 侧栏同一链路 | DATA-EDITOR-01 |
| AI Assistant | API Key 状态 | AI Assistant 底部 | 显示 Keychain 状态 | 部分连接 | `settings.aiKeyStored` 内存 | `src/components/ai/AIAssistantView.tsx:101` | 重启状态不准 | P1 | 调 `get_ai_key` 刷新 | AI-SAFE |

## 6. 后端命令审计摘要

| 命令 | 当前状态 | 证据 | 数据安全影响 | 风险等级 | 建议 |
|---|---|---|---|---|---|
| `scan_skills` | 真实可用 | `src-tauri/src/commands.rs:15`、`skill_scanner.rs` | 只读扫描默认和自定义根目录 | P2 | 保留 |
| `read_skill` | 真实可用 | `src-tauri/src/skill_store.rs:25` | 使用允许根目录校验 | P2 | 保留 |
| `create_skill` | 真实可用 | `src-tauri/src/skill_store.rs:29`、`:55` | 写入允许根目录 | P1 | 前端补目标确认 |
| `update_skill` | 真实可用，前端未接保存 | `src-tauri/src/skill_store.rs:33` | 保存前快照和备份 | P0 | 接 Editor 保存 |
| `delete_skill` | 真实可用，当前页面未接 | `src-tauri/src/skill_store.rs:41`、`:124` | 删除前备份，限制允许根 | P0 | 前端二次确认和来源保护 |
| `open_skill_folder` | 真实可用，当前按钮未接 | `src-tauri/src/skill_store.rs:45`、`:166` | 打开允许根内目录 | P1 | 接 Detail 按钮 |
| `validate_skill` | 部分连接 | `src-tauri/src/commands.rs:216` | 直接读传入 path，未统一允许根校验 | P1 | 后端复用 skill_store 校验 |
| `read_skill_files` | 未开放 | `src-tauri/src/commands.rs:276` | 直接读 dir | P1 | 加允许根校验 |
| `write_skill_file` | 未开放 | `src-tauri/src/commands.rs:297` | 直接写 dir/fileName | P0 | 加允许根、文件名、来源保护 |
| `get_version_history` | 未开放 | `src-tauri/src/commands.rs:303` | 读取版本目录 | P1 | 接 Editor/Detail 历史 UI |
| `restore_version` | 未开放 | `src-tauri/src/commands.rs:318`、`version_store.rs:92` | 直接写 path，缺统一允许根校验 | P0 | 加校验和覆盖确认 |
| `get_call_logs` | 真实可用 | `src-tauri/src/commands.rs:323`、`call_logger.rs:22` | 读取本地日志 | P1 | 写入时统一脱敏 |
| `analyze_deps` | 后端可用，前端未接 | `src-tauri/src/commands.rs:339`、`dep_analyzer.rs:6` | 直接读 path，缺统一允许根校验 | P1 | 加校验后接 Dependencies |
| `set_ai_key` | 真实可用 | `src-tauri/src/commands.rs:355`、`ai_proxy.rs:43` | Keychain 保存 | P1 | 页面加载时查真实状态 |
| `get_ai_key` | 真实可用 | `src-tauri/src/commands.rs:366`、`ai_proxy.rs:36` | 只返回 boolean | P2 | 保留 |
| `ai_optimize` | 部分连接 | `src-tauri/src/commands.rs:344`、`ai_proxy.rs:122` | 内容发送到厂商 API | P1 | 强化脱敏和失败回退 |
| `ai_cancel` | 部分连接 | `src-tauri/src/commands.rs:360`、`ai_proxy.rs:28` | 取消粒度有限 | P2 | 明确 UI 文案 |
| `watch_scan_dirs` | 部分连接 | `src/AppShell.tsx:52`、`watcher.rs` | 监听固定目录 | P1 | 与 Settings 自动扫描开关联动 |

## 7. P0 风险清单

| ID | 风险 | 证据 | 影响 | 建议批次 |
|---|---|---|---|---|
| P0-01 | Editor 保存按钮未写回文件 | `src/editor/EditorView.tsx:129` | 用户看到“已保存”，实际 `SKILL.md` 未改变 | DATA-EDITOR-01 |
| P0-02 | Detail 备份按钮无真实动作 | `src/detail/DetailView.tsx:67` | 用户执行危险操作前可能以为已有备份 | DATA-EDITOR-01 |
| P0-03 | DangerZone 删除语义不清且未接真实流程 | `src/components/DangerZone.tsx:16` | 删除本地文件、删除管理记录、归档三种语义混在一起 | SEC-FILE-01 |
| P0-04 | `write_skill_file` 直接写路径 | `src-tauri/src/commands.rs:297` | 未来一旦接入 UI，会扩大任意文件写入风险 | SEC-FILE-01 |
| P0-05 | `restore_version` 直接写 path | `src-tauri/src/version_store.rs:92` | 恢复会覆盖目标文件，缺允许根和确认边界 | SEC-FILE-01 |
| P0-06 | 受保护来源写入策略未贯穿可见页面 | `src/lib/invoke.ts:70`、`src-tauri/src/models.rs:18` | 插件缓存和系统来源可能被后续写入入口影响 | SEC-FILE-01 |

## 8. P1 风险清单

| ID | 风险 | 证据 | 影响 | 建议批次 |
|---|---|---|---|---|
| P1-01 | Dashboard 多项指标使用 fallback 或 size 推算 | `src/dashboard/DashboardView.tsx:88`、`:93` | 首页健康度和调用量不可信 | Codex-REAL-DASH |
| P1-02 | Dependencies 页面整页使用硬编码数据 | `src/pages/Dependencies/index.tsx:8` | 依赖风险展示不可信 | Codex-DEPS |
| P1-03 | Logs 无真实日志时显示样例日志 | `src/pages/Logs/index.tsx:9`、`:53` | 用户可能误判已有调用记录 | Codex-LOGS |
| P1-04 | Logs 详情固定调用 ID 和状态 | `src/pages/Logs/index.tsx:127`、`:134` | 详情与选中行不一致 | Codex-LOGS |
| P1-05 | Settings 大部分偏好只保存在内存 | `src/store/settingsStore.ts:66` | 重启后丢失 | Codex-SETTINGS |
| P1-06 | API Key 状态不从 Keychain 初始化 | `src/pages/Settings/index.tsx:41` | 重启后显示不准确 | AI-SAFE |
| P1-07 | AI Assistant 独立页使用 sample diff | `src/components/ai/AIAssistantView.tsx:12` | 用户误判已生成真实建议 | AI-SAFE |
| P1-08 | `validate_skill` 和 `analyze_deps` 缺统一路径校验 | `src-tauri/src/commands.rs:216`、`:339` | 后续 UI 接入后可能读取越界路径 | SEC-FILE-01 |
| P1-09 | 日志脱敏没有在日志写入层统一保证 | `src-tauri/src/call_logger.rs:43` | prompt、路径、邮箱可能落盘 | AI-SAFE |
| P1-10 | Detail 元数据含硬编码版本、作者、文件结构、标签 | `src/detail/DetailView.tsx:107`、`:111` | 详情页可信度不足 | Codex-DETAIL |

## 9. P2 风险清单

| ID | 风险 | 证据 | 影响 | 建议批次 |
|---|---|---|---|---|
| P2-01 | Library Filter/Sort 无动作 | `src/components/FilterBar.tsx:9` | 体验落差 | WorkBuddy-UX |
| P2-02 | Logs 搜索和状态筛选无绑定 | `src/pages/Logs/index.tsx:91`、`:94` | 体验落差 | WorkBuddy-UX |
| P2-03 | Create 模板选择未影响正文 | `src/pages/Create/index.tsx:25` | 模板功能不完整 | WorkBuddy-UX |
| P2-04 | Create AI 初稿入口只 Toast | `src/pages/Create/index.tsx:89` | 体验落差 | WorkBuddy-UX |
| P2-05 | Preview 页面仍为静态样例 | `src/pages/Preview/index.tsx:13` | 若入口开放会误导 | WorkBuddy-UX |

## 10. 建议进入 WorkBuddy 的可见体验缺口

1. Dashboard 空数据、加载中、扫描失败和部分成功状态。
2. Library Filter/Sort、归档筛选、分类 pill 选中状态和示例数据标识。
3. Detail 中“备份、归档、删除、打开目录”的危险操作文案和确认弹层。
4. Editor 保存、撤销、AI diff、快照恢复的可见流程设计。
5. Settings 目录选择器、Key 状态刷新、脱敏说明、预算展示。
6. Logs 搜索、状态筛选、选中详情和空日志状态。
7. Dependencies 真实分析加载中、无依赖、缺失依赖、风险详情状态。
8. AI Assistant 独立页和 Editor AI 侧栏的入口收敛，避免双流程冲突。

## 11. 建议进入 Codex 的真实功能缺口

1. Editor 保存接 `update_skill`，保存前创建版本快照和目录备份。
2. Editor 撤销恢复到读取时快照，保存失败保留草稿。
3. Detail 打开目录接 `open_skill_folder`，路径限制在允许根。
4. Detail 归档接 `skill_archives` 设置持久化。
5. Detail 备份接后端显式备份命令，返回备份路径或版本记录。
6. 删除流程拆分为“应用内归档”和“删除本地文件”，本地删除使用 `delete_skill` 并二次确认。
7. Dependencies 接 `analyze_deps`，后端先补允许根校验。
8. Logs 接真实筛选、选中详情、成本汇总，后端统一脱敏。
9. Settings 接 `load_app_settings` 和 `save_app_settings`，页面初始化从后端读取。
10. AI Key 状态页面加载时调用 `get_ai_key`，不依赖内存布尔值。
11. 后端 `validate_skill`、`read_skill_files`、`write_skill_file`、`restore_version`、`analyze_deps` 统一路径校验和来源保护。
12. 插件缓存和系统来源默认只读，若允许操作，需要强提示、备份和二次确认。

## 12. DATA-EDITOR-01 准确范围

### 应纳入

- Editor `read_skill` 到本地草稿的初始化。
- Frontmatter 和 Markdown 双向编辑。
- 保存按钮调用 `update_skill`。
- 保存前版本快照和目录备份。
- 保存失败时保留草稿并显示恢复动作。
- 撤销更改恢复到最近一次读取或保存快照。
- 校验按钮调用安全后的 `validate_skill`。
- AI diff 接受后只更新草稿，保存时统一进入 `update_skill`。
- 版本历史展示和恢复确认。
- Create 成功后进入 Detail 或 Editor 的真实路径传递。

### 不纳入

- 删除本地文件。
- 打开系统目录。
- 全局扫描根目录授权策略。
- 插件缓存和系统来源的最终安全策略。
- 日志脱敏底层实现。

## 13. SEC-FILE-01 准确范围

### 应纳入

- 统一允许根目录校验函数。
- `validate_skill`、`read_skill_files`、`write_skill_file`、`restore_version`、`analyze_deps` 的路径校验。
- `open_skill_folder` 的前端接入和受保护来源提示。
- `delete_skill` 前端接入、二次确认、备份提示、结果反馈。
- 插件缓存、系统来源、自定义目录的写入权限模型。
- `SKILL.md` 文件名、目录穿越、符号链接、根目录删除保护。
- 日志写入层脱敏路径、API Key、邮箱、可能的用户输入敏感内容。
- 截图和文档中禁止出现完整 API Key 的检查规则。

### 不纳入

- Dashboard 视觉调整。
- Logs 搜索交互样式。
- AI prompt 产品文案优化。
- Windows 安装包和签名公证。

## 14. 当前可以放心使用的功能

| 功能 | 原因 | 注意事项 |
|---|---|---|
| 顶栏页面切换 | 纯前端状态切换 | 无 |
| Library 扫描 | `scan_skills` 接真实命令，扫描只读 | Tauri 失败时会 fallback mock，需要 UI 标识 |
| Library 搜索 | 本地 store 过滤 | 只搜名称和描述 |
| Library 卡片进入 Detail | 路由可用 | Detail 中部分字段仍为占位 |
| Detail 进入 Editor | 路由可用 | 保存暂不可信 |
| Editor 读取 Skill | `read_skill` 接真实命令 | 无选中 Skill 时会显示样例 |
| Editor 草稿编辑和预览 | 只改前端 state | 保存前不会写文件 |
| Editor 重新校验 | 有真实命令 | 后端路径校验需补强 |
| Create 创建 Skill | `create_skill` 接真实命令，有允许根校验 | 目标目录手输，需确认 |
| Settings 保存 API Key | Keychain 保存 | 状态刷新需补 |
| Logs 刷新读取 | `get_call_logs` 接真实命令 | 空日志 fallback 需隐藏 |
| Editor AI 侧栏生成 | `get_ai_key`、`ai_optimize` 接真实命令 | 内容外发需强化提示 |

## 15. 当前需要暂时隐藏或禁用的功能

| 功能 | 原因 | 建议 |
|---|---|---|
| Editor 保存 | 未调用 `update_skill` | 禁用或接真实保存 |
| Editor 撤销更改 | 只清 dirty | 接原始快照 |
| Detail 备份 | 无真实动作 | 禁用或接备份命令 |
| Detail 打开目录 | 前端未调用命令 | 接 `open_skill_folder` 后开放 |
| Detail 归档 | 只显示提示 | 接 `skill_archives` |
| Detail 删除管理记录 | 删除语义不清 | 重做危险操作流程 |
| Dashboard 今日调用 | 使用 size 推算或 fallback | 接 Logs 聚合 |
| Dashboard 依赖提醒 | 硬编码 | 接 Dependencies 结果 |
| Dependencies 页面结果 | 硬编码 | 接真实分析前标记为示例 |
| Logs 搜索/筛选 | 无绑定 | 接本地过滤前隐藏 |
| Logs 空数据 fallback | 样例日志 | 改为空态 |
| AI Assistant 独立页生成 | 无 onClick | 接真实流程或隐藏 |
| AI Assistant sample diff | 与真实文件无关 | 接真实 diff |
| Settings 根目录和扫描间隔 | readOnly 占位 | 接设置持久化 |
| Settings 已用预算 | 固定值 | 接日志成本聚合 |

## 16. 与 PRD 的差距

| PRD 要求 | 当前实际 | 差距等级 | 后续批次 |
|---|---|---|---|
| 启动并扫描允许目录 | 已接 `scan_skills` | 低 | Codex-REAL-FLOW |
| Library 搜索、筛选、排序、分页 | 搜索可用，筛选排序部分占位 | 中 | WorkBuddy-UX / Codex-REAL-LIB |
| Detail 核对来源、路径和正文 | 来源路径部分可见，正文未展示真实 Markdown | 中 | Codex-DETAIL |
| Editor 修改内容 | 草稿编辑可用 | 低 | DATA-EDITOR-01 |
| 校验、diff、保存 | 校验部分可用，diff 到草稿部分可用，保存占位 | 高 | DATA-EDITOR-01 |
| 重启后内容仍存在 | 保存未接真实写回 | 高 | DATA-EDITOR-01 |
| 版本恢复演练 | 后端存在，UI 未开放，路径校验需补 | 高 | SEC-FILE-01 |
| 删除、覆盖、批量操作确认 | 当前危险区为展示流程 | 高 | SEC-FILE-01 |
| API Key 只进 Keychain | 保存 Key 已符合 | 中 | AI-SAFE |
| 日志脱敏 | 前端文案存在，后端写入层未统一保证 | 高 | AI-SAFE |

## 17. 建议批次拆分

| 批次 | 主责 | 范围 | 验收 |
|---|---|---|---|
| DATA-EDITOR-01 | Codex | Editor 保存、撤销、快照、恢复、AI diff 草稿写回 | 临时 HOME、测试 Skill，保存后重启可读，失败不破坏原文件 |
| SEC-FILE-01 | Codex | 文件路径校验、来源保护、打开目录、删除、恢复、依赖读路径 | 路径越界测试、插件缓存只读测试、删除根目录拒绝测试 |
| Codex-SETTINGS | Codex | Settings 真实读取和保存 | 重启后偏好保留，Key 状态从 Keychain 查 |
| Codex-LOGS | Codex | Logs 真实筛选、详情、成本和脱敏 | 空日志无样例，敏感信息脱敏 |
| Codex-DEPS | Codex | Dependencies 接真实分析 | 缺依赖、无依赖、解析失败都有状态 |
| Codex-REAL-DASH | Codex | Dashboard 指标接真实数据 | 无 fallback 数字，指标跳转带筛选 |
| WorkBuddy-UX | WorkBuddy | 视觉缺口和交互原型 | 截图、流程说明、已知限制 |
| AI-SAFE | Codex | Keychain、AI 外发提示、失败回退、日志脱敏 | Key 不落前端持久化，失败保留草稿 |

## 18. 审计证据索引

| 模块 | 关键文件 |
|---|---|
| 应用入口 | `/Users/shovy/Documents/skill-panel-codex-v3.8/src/main.tsx`、`src/AppShell.tsx`、`src/components/TopBar.tsx` |
| 状态 | `src/store/uiStore.ts`、`src/store/skillStore.ts`、`src/store/settingsStore.ts` |
| Library | `src/pages/Library/index.tsx`、`src/lib/invoke.ts` |
| Dashboard | `src/dashboard/DashboardView.tsx` |
| Detail | `src/detail/DetailView.tsx`、`src/detail/DetailPanel.tsx`、`src/components/DangerZone.tsx` |
| Editor | `src/editor/EditorView.tsx`、`src/editor/FrontmatterForm.tsx`、`src/editor/MarkdownEditor.tsx`、`src/editor/PreviewPane.tsx` |
| Create | `src/pages/Create/index.tsx`、`src/lib/skills.ts` |
| Settings | `src/pages/Settings/index.tsx`、`src/store/settingsStore.ts` |
| Logs | `src/pages/Logs/index.tsx`、`src/lib/logs.ts`、`src-tauri/src/call_logger.rs` |
| Dependencies | `src/pages/Dependencies/index.tsx`、`src-tauri/src/dep_analyzer.rs` |
| AI | `src/hooks/useAIRail.ts`、`src/lib/ai.ts`、`src/components/ai/AIAssistantView.tsx`、`src-tauri/src/ai_proxy.rs` |
| Tauri 命令 | `src-tauri/src/commands.rs`、`src-tauri/src/lib.rs` |
| Skill 数据 | `src-tauri/src/skill_store.rs`、`src-tauri/src/skill_scanner.rs`、`src-tauri/src/version_store.rs` |
| 设置 | `src-tauri/src/settings_store.rs`、`src-tauri/src/models.rs` |

## 19. 审计停止点

本批次完成只读盘点后停止。未修复发现的问题，未改业务代码，未创建 commit。文档由本次用户确认后写入 Obsidian SOP 目录，用于后续 WorkBuddy 和 Codex 批次排期。
