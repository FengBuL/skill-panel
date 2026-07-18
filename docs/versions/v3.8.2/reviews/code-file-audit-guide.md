---
title: Skill Panel 逐文件代码整理与审核手册
aliases:
  - Skill Panel 代码文件说明书
  - Skill Panel 逐文件审核手册
date: 2026-07-16
updated: 2026-07-16
project: Skill Panel
codebase: /Users/shovy/Documents/skill-panel-codex-v3.8
branch: codex/agent-codex-v3.8
version: 3.8.2
head: 4910ff3dbec09ad912fdda3543cae2aaf4dedc0e
status: current
tags:
  - skill-panel
  - 代码说明
  - 文件审核
  - 程序员小白
---

# Skill Panel 逐文件代码整理与审核手册

> [!summary] 这份手册怎么用
> 这份文档逐个说明 Skill Panel 当前稳定开发仓中的代码文件。你无需先学会编程。Codex 每次完成改动后，你可以搜索文件名，查看这个文件负责什么、会连接到哪里、你需要亲自检查什么。

关联文档：

- 🟨 [[02-Skill-Panel项目说明与研发复盘]]
- 🟥 **[[../../skill panel/PROJECT_STATE|PROJECT_STATE]]**
- 🟥 **[[../../skill panel/CURRENT-PLAN|CURRENT-PLAN]]**
- 🟧 [[../../skill panel/Skill Panel详细用户流程图|Skill Panel 详细用户流程图]]

## 1. 本文使用的代码基线

| 项目 | 当前值 |
|---|---|
| 稳定开发仓 | /Users/shovy/Documents/skill-panel-codex-v3.8 |
| 分支 | codex/agent-codex-v3.8 |
| 应用版本 | 3.8.2 |
| 最新提交 | 4910ff3dbec09ad912fdda3543cae2aaf4dedc0e |
| 当前任务 | SEC-FILE-01D 综合验证与人工验收 |
| 工作区 | 干净 |

本文逐项覆盖：

1. 应用运行、测试和打包直接涉及的 150 份文件。
2. 设计迁移原型中的 12 份 HTML/CSS 文件。
3. 依赖锁文件与 Tauri 自动生成结构文件。

本文不逐项展开：

- node_modules：第三方依赖，npm 自动安装。
- dist：前端构建结果。
- src-tauri/target：Rust 编译和安装包生成结果。
- output：测试截图、报告和发布归档。
- .omm：架构工具使用的 YAML 与 Markdown 元数据。

> [!important] 最关键的审核原则
> 文件行数只代表大小。你更需要关注“职责有没有变化”“危险操作有没有确认”“数据有没有恢复办法”“页面和后端有没有同时更新”“测试有没有覆盖本次改动”。

### 数据列说明

| 列名 | 计算方法 |
|---|---|
| 行数 | 文件从第一行到最后一行的实际行数 |
| 字符数 | 文件全部字符数量，包含文字、代码、空格和换行 |
| 文件大小 | 文件在磁盘中的实际字节数，自动换算为 B、KB 或 MB |

### 颜色与格式说明

| 标记 | 含义 | 审核要求 |
|---|---|---|
| 🟥 一级重点 | 会接触用户文件、路径、版本、API Key、日志、AI 发送或全局流程 | 文件名同时加粗；每次修改都要做自动测试和人工流程 |
| 🟧 二级重点 | 负责页面入口、状态联动、测试、构建或重要交互 | 检查关联文件与回归测试 |
| 🟨 功能关联 | 负责普通页面、组件和工具 | 检查对应页面与上下游连接 |
| 🟦 视觉资料 | CSS 或视觉原型 | 检查多种窗口尺寸和截图 |
| 🟦 机器维护 | 依赖锁文件或自动生成文件 | 核对生成来源，避免手工编辑 |
| ⚪ 低风险入口 | 很短的导出、启动或测试初始化文件 | 确认路径和导出仍然有效 |

> [!danger] 红色一级重点
> 看到加粗文件出现在改动清单中时，应要求 Codex 同时说明：修改原因、影响流程、恢复办法、自动测试、人工验收和提交号。

## 2. 先理解代码怎么连起来

~~~mermaid
flowchart LR
    A["main.tsx 启动"] --> B["App.tsx"]
    B --> C["AppShell.tsx"]
    C --> D["Dashboard / Library / Editor / Settings 等页面"]
    D --> E["store、hooks 和 lib"]
    E --> F["invoke.ts 调用 Tauri"]
    F --> G["commands.rs"]
    G --> H["路径守卫、Skill 数据、设置、日志、AI"]
    H --> I["本地文件、版本快照、Keychain"]
~~~

你看到某个文件被修改时，可以按下面顺序判断：

1. 它属于页面、状态、数据、后端、测试还是样式。
2. 它连接了哪些文件。
3. 它有没有触碰删除、覆盖、路径、API Key、日志或 AI 发送。
4. 对应测试文件有没有更新。
5. 你能否通过真实操作验证结果。

## 3. 项目入口、构建和自动化文件

### 3.1 根目录与持续构建

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| index.html | 🟨 功能关联 | 18 | 665 | 665 B | 浏览器和 Tauri 窗口加载前端的 HTML 外壳 | src/main.tsx | 根节点是否存在；标题和基础资源是否正确 |
| **package.json** | 🟥 一级重点 | 51 | 1,672 | 1.6 KB | 记录版本、依赖和 npm 命令 | Vite、Vitest、Tauri、scripts | version 是否正确；新增依赖是否合理；命令有没有被改坏 |
| package-lock.json | 🟦 机器维护 | 4,086 | 145,920 | 142.5 KB | 锁定每个 npm 依赖的精确版本 | package.json、npm install | 只在依赖变化时审核；是否出现大量意外变化；不要手工编辑 |
| tsconfig.json | 🟨 功能关联 | 22 | 578 | 578 B | 规定前端 TypeScript 检查方式 | src 下全部 TS/TSX | 严格检查是否被关闭；路径和包含范围是否正确 |
| tsconfig.node.json | 🟨 功能关联 | 10 | 210 | 210 B | 规定 Vite 配置文件的 TypeScript 检查方式 | vite.config.ts | 配置文件是否还能通过类型检查 |
| vite.config.ts | 🟨 功能关联 | 19 | 379 | 379 B | 控制前端开发服务器、构建和测试环境 | index.html、src、Vitest | 端口、测试环境、插件和构建路径 |
| .github/workflows/desktop-build.yml | 🟧 二级重点 | 85 | 2,196 | 2.1 KB | 在 GitHub 环境构建桌面应用 | npm、Rust、Tauri、不同系统 | macOS/Windows 是否都执行；失败是否会阻止发布；产物是否上传 |

### 3.2 Tauri 工程配置

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| **src-tauri/Cargo.toml** | 🟥 一级重点 | 34 | 805 | 805 B | 记录 Rust 版本、依赖和应用版本 | src-tauri/src 全部 Rust 文件 | version 是否与 package.json 一致；安全依赖是否变化 |
| src-tauri/build.rs | ⚪ 低风险入口 | 3 | 39 | 39 B | 启动 Tauri 的 Rust 构建步骤 | Cargo、Tauri | 通常无需改动；改动后必须重新打包 |
| **src-tauri/tauri.conf.json** | 🟥 一级重点 | 66 | 1,384 | 1.4 KB | 设置应用名称、版本、窗口、图标和安装包 | package.json、Cargo.toml、构建脚本 | version 三处一致；窗口尺寸；安装包类型；安全配置 |
| src-tauri/gen/schemas/acl-manifests.json | 🟦 机器维护 | 1 | 68,210 | 66.6 KB | Tauri 自动生成的权限清单结构 | Tauri CLI | 不要手工编辑；升级 Tauri 后核对变化 |
| src-tauri/gen/schemas/capabilities.json | 🟦 机器维护 | 1 | 2 | 2 B | Tauri 自动生成的能力结构 | Tauri CLI | 不要手工编辑；权限异常时重新生成 |
| src-tauri/gen/schemas/desktop-schema.json | 🟦 机器维护 | 2,358 | 120,083 | 117.3 KB | Tauri 自动生成的桌面配置规则 | tauri.conf.json | 不逐行审核；确认来源是 Tauri 生成流程 |
| src-tauri/gen/schemas/macOS-schema.json | 🟦 机器维护 | 2,358 | 120,083 | 117.3 KB | Tauri 自动生成的 macOS 配置规则 | tauri.conf.json | 不逐行审核；macOS 配置升级时核对生成时间 |

### 3.3 工程脚本

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| scripts/create-migration-package.ps1 | 🟧 二级重点 | 70 | 2,834 | 2.8 KB | 在 Windows 制作迁移或发布资料 | PowerShell、构建产物 | 路径、版本、复制清单、覆盖行为 |
| **scripts/update-local-macos-app.sh** | 🟥 一级重点 | 35 | 934 | 934 B | 在本机更新 macOS App | Tauri 构建产物、Applications | 是否先退出旧应用；目标路径；是否可能覆盖错误应用 |
| scripts/visual-qa.mjs | 🟧 二级重点 | 593 | 20,945 | 20.6 KB | 启动应用、切换场景、截图并生成视觉报告 | Playwright、页面、output/playwright | 场景是否覆盖最新页面；失败断言；截图尺寸；报告是否真实通过 |

## 4. 前端启动与应用外壳

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/main.tsx | 🟧 二级重点 | 13 | 371 | 371 B | 创建 React 应用并挂载到页面 | index.html、App.tsx、styles.css | App 是否正常挂载；全局样式是否加载 |
| src/App.tsx | 🟧 二级重点 | 10 | 257 | 291 B | 提供最外层应用组件 | AppShell.tsx | 是否仍只承担入口职责 |
| **src/AppShell.tsx** | 🟥 一级重点 | 98 | 3,360 | 3.5 KB | 组织顶部导航、主页面、详情、AI 和全局监听 | TopBar、uiStore、各页面、tauriEvents | 页面切换；次级页面返回；监听是否重复；错误是否可见 |
| src/router.tsx | 🟧 二级重点 | 42 | 1,538 | 1.7 KB | 保存页面路由和视图映射 | AppShell、页面入口 | 路由名称与导航是否一致；旧链接是否还能进入 |
| src/layout/AppShell.tsx | ⚪ 低风险入口 | 1 | 40 | 40 B | 从稳定目录重新导出 AppShell | src/AppShell.tsx | 导出路径是否有效；不要放业务逻辑 |
| src/layout/TopBar.tsx | ⚪ 低风险入口 | 1 | 47 | 47 B | 从稳定目录重新导出 TopBar | components/TopBar.tsx | 导出路径是否有效；不要放业务逻辑 |
| src/components/TopBar.tsx | 🟧 二级重点 | 62 | 2,158 | 2.1 KB | 显示品牌、五个导航入口和 New Skill 按钮 | uiStore、AppShell、TopBar.css | 当前页高亮；Library 子页面；新建入口；键盘和按钮可用性 |
| src/components/TopBar.css | 🟦 视觉资料 | 94 | 1,524 | 1.5 KB | 控制顶部导航的尺寸、间距和状态 | TopBar.tsx、tokens.css | 导航有没有挤压；小窗口是否溢出；选中状态是否清楚 |
| src/components/Toast.tsx | 🟨 功能关联 | 32 | 1,106 | 1.1 KB | 显示应用级成功、失败和提示消息 | AppShell、Toast.css | 消息是否会自动消失；失败内容是否可读；敏感信息是否隐藏 |
| src/components/Toast.css | 🟦 视觉资料 | 8 | 520 | 520 B | 控制 Toast 容器位置 | Toast.tsx | 是否遮挡按钮和弹窗 |
| src/lib/tauriEvents.ts | 🟨 功能关联 | 14 | 333 | 333 B | 监听 Tauri 后端发送的全局事件 | AppShell、watcher.rs | 监听是否释放；事件名称是否和后端一致 |

## 5. 旧版兼容工作区

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| **src/SkillPanelWorkspace.tsx** | 🟥 一级重点 | 5,933 | 245,541 | 239.8 KB | 保存旧版完整工作区、旧交互和兼容逻辑 | i18n、stores、hooks、Tauri 命令 | 修改范围是否过大；新旧页面是否重复；旧功能回归；建议逐步拆分 |

> [!warning]
> SkillPanelWorkspace.tsx 是当前最大的文件。任何改动都可能影响多个旧功能。看到它出现在改动清单中时，应要求 Codex说明修改区域、关联流程和回归测试。

## 6. common 通用基础组件

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/common/EmptyState.tsx | 🟨 功能关联 | 65 | 2,536 | 2.6 KB | 显示无数据、扫描中和搜索无结果 | Library、页面空状态 | 文案是否对应真实原因；按钮是否能继续操作 |
| src/common/ErrorBoundary.tsx | 🟨 功能关联 | 59 | 1,582 | 1.6 KB | 捕获 React 页面崩溃并显示替代界面 | 应用外壳、子页面 | 是否能看到错误；能否恢复或刷新；错误内容是否泄露敏感信息 |
| src/common/SkillExport.tsx | 🟨 功能关联 | 36 | 1,227 | 1.2 KB | 提供 Skill 导出入口 | Skill 数据、浏览器下载 | 导出内容、文件名、失败反馈 |
| src/common/Toast.tsx | 🟨 功能关联 | 57 | 1,642 | 1.6 KB | 旧工作区使用的通知组件，并进行前端脱敏 | SkillPanelWorkspace、redaction.ts | API Key、路径、邮箱等是否隐藏 |
| src/common/Ui.tsx | 🟨 功能关联 | 94 | 2,713 | 2.6 KB | 提供旧工作区的按钮、开关、分段控件和搜索框 | 旧页面和 SkillPanelWorkspace | 通用组件改动是否影响多个旧页面 |

## 7. 新版共享 UI 组件

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 常见使用位置 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/components/ActionButton.tsx | 🟨 功能关联 | 34 | 1,026 | 1.0 KB | 通用操作按钮，支持主要、次要、危险等样式 | 全部新版页面 | 禁用状态；危险按钮颜色；点击是否重复触发 |
| src/components/CategoryPill.tsx | 🟨 功能关联 | 31 | 692 | 722 B | 显示 Skill 分类标签 | Library | 选中状态；长文字；点击区域 |
| src/components/DangerZone.tsx | 🟧 二级重点 | 32 | 1,015 | 1.1 KB | 显示归档和删除等危险操作 | Detail | 确认弹窗；来源权限；删除后的恢复说明 |
| src/components/DependencyGraph.tsx | 🟨 功能关联 | 17 | 544 | 554 B | 显示依赖关系图 | Dependencies | 数据为空时显示；关系方向是否清楚 |
| src/components/DependencyList.tsx | 🟨 功能关联 | 43 | 1,264 | 1.3 KB | 显示 Skill 依赖列表 | Detail | 缺失依赖和循环依赖提示 |
| src/components/DependencyTable.tsx | 🟨 功能关联 | 45 | 1,203 | 1.2 KB | 显示依赖详情表格 | Dependencies | 表头、排序、长路径、空数据 |
| src/components/Drawer.tsx | 🟨 功能关联 | 14 | 478 | 478 B | 提供右侧抽屉外壳 | DetailDrawer、其他侧栏 | 关闭方式；焦点；背景滚动 |
| src/components/ErrorState.tsx | 🟨 功能关联 | 33 | 975 | 979 B | 显示统一错误页面或错误区域 | 多个页面 | 错误原因、重试按钮、下一步说明 |
| src/components/FileTree.tsx | 🟨 功能关联 | 31 | 939 | 955 B | 显示 Skill 文件结构 | Detail | 深层目录、长文件名、空目录 |
| src/components/FilterBar.tsx | 🟨 功能关联 | 26 | 936 | 944 B | 显示筛选与排序按钮 | Library | 当前筛选是否可见；清除筛选是否有效 |
| src/components/KeyStatusBadge.tsx | 🟧 二级重点 | 16 | 536 | 612 B | 显示 API Key 是否已配置 | Settings、AI Assistant | 只显示状态和掩码；不可显示完整 Key |
| src/components/LogTable.tsx | 🟨 功能关联 | 49 | 1,367 | 1.4 KB | 显示调用日志表格 | Logs | 时间、状态、耗时；敏感内容脱敏；空状态 |
| src/components/MetricCard.tsx | 🟨 功能关联 | 19 | 627 | 627 B | 显示 Dashboard 数字指标 | Dashboard | 数字来源；无数据时是否显示 0 |
| src/components/Modal.tsx | 🟧 二级重点 | 28 | 862 | 867 B | 提供通用弹窗外壳 | 删除确认、AI Diff、创建流程 | 取消、确认、Esc、焦点和背景滚动 |
| src/components/PageHeader.tsx | 🟨 功能关联 | 22 | 689 | 689 B | 显示页面标题、副标题和右侧操作 | 各主页面 | 标题层级；长文案；按钮位置 |
| src/components/QualityCheck.tsx | 🟨 功能关联 | 28 | 798 | 852 B | 显示 Skill 质量检查项目 | Detail | 通过和失败状态；原因是否可读 |
| src/components/RiskSummary.tsx | 🟨 功能关联 | 16 | 419 | 419 B | 显示依赖风险摘要 | Dashboard、Dependencies | 风险数量与列表是否一致 |
| src/components/SearchBar.tsx | 🟨 功能关联 | 17 | 648 | 672 B | 提供搜索输入框 | Library | 输入防抖；清空；无结果提示 |
| src/components/SettingCard.tsx | 🟨 功能关联 | 14 | 447 | 447 B | 提供设置项分组卡片 | Settings | 标题与控件对应；长说明是否挤压 |
| src/components/SettingsNav.tsx | 🟨 功能关联 | 13 | 377 | 413 B | 显示设置页面左侧导航 | Settings | 选中状态；小窗口显示 |
| src/components/SkillCard.tsx | 🟨 功能关联 | 86 | 3,107 | 3.1 KB | 显示新版 Library Skill 卡片 | Library | 标题、描述、状态、分类、选中和点击行为 |
| src/components/SkillForm.tsx | 🟨 功能关联 | 41 | 1,501 | 1.5 KB | 显示新建 Skill 表单 | Create | 必填项、错误提示、提交防重复 |
| src/components/SkillRowMini.tsx | 🟨 功能关联 | 22 | 528 | 528 B | 显示 Dashboard 最近 Skill 行 | Dashboard | 点击是否进入正确 Skill；时间是否正确 |
| src/components/StatusPill.tsx | 🟨 功能关联 | 25 | 738 | 738 B | 显示健康、警告、归档、只读等状态 | 多个页面 | 状态颜色和文字是否一致 |
| src/components/TemplateSelector.tsx | 🟨 功能关联 | 52 | 2,057 | 2.1 KB | 显示新建 Skill 模板 | Create | 模板描述；选中状态；空模板 |
| src/components/ValidationResult.tsx | 🟨 功能关联 | 41 | 1,219 | 1.2 KB | 显示编辑器校验结果 | Editor | 错误位置、严重程度、修复提示 |
| src/components/ui.tsx | 🟨 功能关联 | 78 | 2,810 | 2.8 KB | 提供新版按钮、开关、分段选择等小组件 | 多个新版页面 | 通用改动对所有页面的影响 |
| src/components/ui.css | 🟦 视觉资料 | 560 | 9,765 | 9.5 KB | 控制新版通用组件样式 | components 下多数文件 | 按钮、弹窗、抽屉、空状态是否同时受影响；响应式 |

## 8. AI 助手前端文件

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/components/ai/AIAssistantView.tsx | 🟧 二级重点 | 128 | 3,828 | 4.2 KB | 显示完整 AI Assistant 页面 | useAIRail、DiffPreview、KeyStatusBadge | Key 状态；优化模式；发送前确认；错误和取消 |
| src/components/ai/AIModeSelector.tsx | 🟨 功能关联 | 36 | 953 | 1.0 KB | 选择 AI 优化方向 | AIAssistantView | 每个模式含义；默认选择；不可用状态 |
| src/components/ai/AIRail.tsx | 🟧 二级重点 | 145 | 4,525 | 4.6 KB | 显示侧边 AI 工具和发送流程 | useAIRail、CostBadge、DiffModal | 发送内容预览；确认；取消；费用；结果应用 |
| src/components/ai/CostBadge.tsx | 🟨 功能关联 | 43 | 1,250 | 1.3 KB | 显示预计或实际调用费用 | AIRail、AI 返回数据 | 金额单位；无数据；超预算提示 |
| src/components/ai/DiffHunk.tsx | 🟨 功能关联 | 56 | 1,690 | 1.7 KB | 显示一段文本修改前后差异 | DiffPreview、DiffModal | 删除和新增是否清楚；单段采纳和拒绝 |
| src/components/ai/DiffModal.tsx | 🟧 二级重点 | 142 | 4,804 | 4.8 KB | 在弹窗中审阅 AI 修改 | AIRail、Modal、DiffHunk | 全部采纳、部分采纳、取消；关闭后草稿状态 |
| src/components/ai/DiffPreview.tsx | 🟨 功能关联 | 32 | 1,099 | 1.1 KB | 显示 AI 修改摘要 | AIAssistantView、DiffHunk | 修改数量；长文本；空结果 |
| src/components/ai/ai.css | 🟦 视觉资料 | 717 | 12,690 | 12.4 KB | 控制 AI Rail、Assistant、Diff 和确认界面样式 | AI 组件全部 | 遮挡、滚动、小窗口、危险确认是否清楚 |

## 9. Dashboard 文件

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/dashboard/DashboardView.tsx | 🟧 二级重点 | 167 | 5,913 | 6.2 KB | 计算并展示指标、最近修改、关注项和风险 | skillStore、MetricCard、SkillRowMini、RiskSummary | 数字是否来自真实数据；点击是否进入正确页面；空数据 |
| src/pages/Dashboard/index.tsx | 🟨 功能关联 | 5 | 136 | 136 B | Dashboard 页面入口 | DashboardView | 入口导出是否正确 |
| src/pages/Dashboard/Dashboard.css | 🟦 视觉资料 | 203 | 3,133 | 3.1 KB | 控制 Dashboard 网格、卡片和表格 | DashboardView | 1024、1280、1440 宽度；卡片对齐；表格溢出 |

## 10. Library 文件

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/pages/Library/index.tsx | 🟧 二级重点 | 102 | 3,670 | 3.8 KB | 组织搜索、分类、卡片网格和右侧详情面板 | skillStore、SkillCard、DetailPanel | 筛选结果；选中状态；详情和编辑入口 |
| src/pages/Library/Library.css | 🟦 视觉资料 | 423 | 7,124 | 7.0 KB | 控制 Library 网格、搜索、分类和详情面板 | Library 页面 | 卡片宽度；右栏；窄屏；长文字 |
| src/library/SkillCard.tsx | 🟨 功能关联 | 88 | 2,642 | 2.6 KB | 旧数据结构使用的 Skill 卡片 | skillStore、旧兼容流程 | 点击、选中、批量状态、只读状态 |
| src/detail/DetailPanel.tsx | 🟨 功能关联 | 86 | 3,796 | 3.8 KB | 显示 Library 右侧简要详情 | Library、DetailView | 当前 Skill 是否同步；编辑和详情按钮 |
| **src/lib/invoke.ts** | 🟥 一级重点 | 141 | 6,124 | 6.5 KB | 调用后端扫描并把数据转换成前端格式 | commands.rs、skillStore | 命令名；数据字段；失败和浏览器演示数据 |
| src/lib/skills.ts | ⚪ 低风险入口 | 6 | 259 | 259 B | 集中导出 Skill 相关工具 | Library、其他模块 | 导出路径是否仍有效 |
| **src/store/skillStore.ts** | 🟥 一级重点 | 142 | 4,080 | 4.1 KB | 保存 Skill 列表、选中项、筛选和分页状态 | Library、Dashboard、Detail、invoke | 刷新后数据；选中项清理；分页；批量操作 |

## 11. Skill 详情文件

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| **src/detail/DetailView.tsx** | 🟥 一级重点 | 464 | 18,849 | 19.5 KB | 完成详情、归档、打开目录、复制、删除和反馈 | skillPermissions、commands.rs、DangerZone、Modal | 删除确认；归档持久化；复制后的路径；受保护来源限制；错误反馈 |
| src/detail/DetailDrawer.tsx | 🟨 功能关联 | 29 | 891 | 891 B | 提供详情抽屉外壳 | Drawer、DetailPanel | 关闭、返回和选中 Skill 是否同步 |
| src/detail/detail.css | 🟦 视觉资料 | 399 | 6,882 | 6.7 KB | 控制详情页、质量检查、依赖和危险区样式 | DetailView | 危险区是否醒目；弹窗；表格；小窗口 |

## 12. Editor 文件

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| **src/editor/EditorView.tsx** | 🟥 一级重点 | 696 | 26,552 | 27.2 KB | 读取 Skill、维护草稿、保存、处理外部冲突、版本恢复和 AI Diff | commands.rs、version_store、FrontmatterForm、MarkdownEditor、PreviewPane | 未保存提示；外部修改；保存前快照；恢复；只读来源；错误反馈 |
| src/editor/EditorWorkspace.tsx | 🟨 功能关联 | 14 | 316 | 316 B | 提供编辑器三栏外壳 | EditorView | 页面高度、滚动和区域布局 |
| src/editor/FrontmatterForm.tsx | 🟨 功能关联 | 42 | 1,206 | 1.2 KB | 编辑名称、描述、分类等头部数据 | EditorView、skill.ts | 必填项；格式；修改后预览是否同步 |
| src/editor/MarkdownEditor.tsx | 🟨 功能关联 | 20 | 533 | 533 B | 提供 Markdown 文本编辑框 | EditorView | 输入、光标、禁用和大文本性能 |
| src/editor/PreviewPane.tsx | 🟨 功能关联 | 47 | 1,724 | 1.7 KB | 显示 Markdown 预览 | EditorView | 转义安全；空内容；长内容滚动 |
| src/pages/Editor/index.tsx | 🟨 功能关联 | 5 | 121 | 121 B | Editor 页面入口 | EditorView | 当前 Skill 参数是否传入 |
| src/pages/Editor/Editor.css | 🟦 视觉资料 | 399 | 6,826 | 6.7 KB | 控制编辑器三栏、表单、预览和 AI 入口 | Editor 页面 | 三栏宽度；小窗口；滚动；保存状态 |

## 13. 新建、预览和验收状态页面

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/pages/Create/index.tsx | 🟧 二级重点 | 96 | 3,409 | 3.5 KB | 完成模板选择、表单、AI 入口和新建提交 | SkillForm、TemplateSelector、commands.rs | 名称重复；目标目录；创建失败；提交防重复 |
| src/pages/Create/Create.css | 🟦 视觉资料 | 28 | 490 | 490 B | 控制新建弹窗辅助样式 | Create 页面 | 表单和模板是否挤压 |
| src/pages/Preview/index.tsx | 🟨 功能关联 | 54 | 3,985 | 4.0 KB | 预览准备创建的 Skill | Create、Skill 数据 | 预览内容是否和最终写入一致；返回修改 |
| src/pages/EmptyStates/index.tsx | 🟨 功能关联 | 64 | 2,180 | 2.4 KB | 集中展示空状态和错误状态，供验收使用 | EmptyState、ErrorState | 文案、按钮、不同状态是否都能查看 |
| src/pages/EmptyStates/EmptyStates.css | 🟦 视觉资料 | 29 | 458 | 458 B | 控制验收状态页布局 | EmptyStates 页面 | 多状态卡片在小窗口的布局 |

## 14. Settings 文件

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| **src/pages/Settings/index.tsx** | 🟥 一级重点 | 208 | 8,346 | 8.7 KB | 设置主题、扫描目录、AI 厂商、Key、确认选项和预算 | settingsStore、commands.rs、KeyStatusBadge | Key 不回显；保存结果；厂商允许列表；路径选择；错误提示 |
| src/pages/Settings/Settings.css | 🟦 视觉资料 | 199 | 3,192 | 3.1 KB | 控制设置导航、卡片、表单和安全说明 | Settings 页面 | 表单对齐；长说明；窄屏；危险设置提示 |
| src/settings/Settings.tsx | ⚪ 低风险入口 | 14 | 293 | 293 B | 提供设置页面稳定导出入口 | pages/Settings | 导出路径是否有效 |
| **src/store/settingsStore.ts** | 🟥 一级重点 | 79 | 2,715 | 2.7 KB | 保存前端设置状态 | Settings、后端设置命令 | 默认值；读取和保存；失败后状态是否回滚 |
| src/components/SettingCard.tsx | 🟨 功能关联 | 14 | 447 | 447 B | 包装设置分组 | Settings | 分组标题和控件关系 |
| src/components/SettingsNav.tsx | 🟨 功能关联 | 13 | 377 | 413 B | 设置页分组导航 | Settings | 当前分组高亮；滚动定位 |

## 15. Logs 与 Dependencies 文件

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/pages/Logs/index.tsx | 🟧 二级重点 | 135 | 5,427 | 5.5 KB | 读取、筛选并展示调用日志 | lib/logs、LogTable、后端日志命令 | 日志脱敏；空状态；详情；错误状态 |
| src/pages/Logs/Logs.css | 🟦 视觉资料 | 154 | 2,773 | 2.7 KB | 控制日志表格、筛选和详情样式 | Logs 页面 | 长文本、横向滚动、错误颜色 |
| src/lib/logs.ts | 🟧 二级重点 | 29 | 747 | 747 B | 调用后端读取日志并再次脱敏 | call_logger.rs、redaction.ts | 后端失败；旧日志；敏感字段 |
| src/pages/Dependencies/index.tsx | 🟧 二级重点 | 72 | 2,852 | 3.0 KB | 显示依赖拓扑、风险摘要和详情 | DependencyGraph、DependencyTable、dep_analyzer.rs | 数据来源；风险数量；无依赖状态 |
| src/pages/Dependencies/Dependencies.css | 🟦 视觉资料 | 123 | 2,074 | 2.0 KB | 控制依赖页面图表和表格样式 | Dependencies 页面 | 图表可读性；表格溢出；风险提示 |

## 16. 前端状态与 Hooks

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 使用位置 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/store/uiStore.ts | 🟧 二级重点 | 102 | 3,108 | 3.1 KB | 保存主页面、次级页面、详情对象和 UI 状态 | AppShell、TopBar、各页面 | 返回路径；切换后旧状态；非法页面值 |
| src/stores/SkillPanelProvider.tsx | 🟧 二级重点 | 129 | 3,766 | 3.7 KB | 为旧工作区提供全局数据和操作 | SkillPanelWorkspace、旧组件 | 首次加载；刷新；错误；组件卸载 |
| **src/hooks/useAIRail.ts** | 🟥 一级重点 | 207 | 5,449 | 5.5 KB | 管理 AI 发送确认、流式结果、取消、费用和 Diff | AIRail、AIAssistantView、lib/ai | 未确认时不可发送；取消有效；失败后可重试 |
| src/hooks/useDebouncedValue.ts | 🟨 功能关联 | 15 | 391 | 391 B | 延迟处理快速输入 | SearchBar、筛选 | 延迟时间；清理定时器；输入是否丢失 |
| src/hooks/useDragDrop.ts | 🟨 功能关联 | 170 | 5,240 | 5.1 KB | 管理拖动排序和放置规则 | 旧 Library、工作区 | 锁定项；跨分类；失败回滚；触屏 |
| src/hooks/useKeyboardNav.ts | 🟨 功能关联 | 96 | 2,217 | 2.2 KB | 管理键盘移动和选择 | 列表、卡片 | 焦点；上下左右；Enter；Esc |
| src/hooks/usePreferencePersistence.ts | 🟨 功能关联 | 47 | 1,190 | 1.2 KB | 把前端偏好保存到本地 | 旧工作区、设置 | 读取失败；旧格式；隐私数据不可写入普通存储 |
| src/hooks/useSkillQuery.ts | 🟨 功能关联 | 148 | 4,986 | 4.9 KB | 组合搜索、分类、排序和分页 | Library、旧工作区 | 多条件结果；清空；分页边界；性能 |

## 17. 国际化文件

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/i18n/resources.ts | 🟧 二级重点 | 763 | 32,881 | 35.4 KB | 保存中文和英文文案 | 全部使用翻译的页面 | 两种语言键一致；按钮和错误信息完整 |
| src/i18n/core.ts | 🟨 功能关联 | 119 | 3,746 | 3.7 KB | 提供语言类型、查找和格式化规则 | runtime、resources | 缺少文案时的处理；变量替换 |
| src/i18n/runtime.tsx | 🟧 二级重点 | 320 | 12,477 | 12.2 KB | 提供 React 翻译上下文和语言切换 | App、页面、旧工作区 | 切换后立即更新；语言持久化 |
| src/i18n/index.ts | 🟨 功能关联 | 20 | 432 | 432 B | 集中导出国际化能力 | 其他前端文件 | 导出是否完整；循环引用 |

## 18. 前端数据工具与安全工具

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| **src/lib/ai.ts** | 🟥 一级重点 | 182 | 5,422 | 5.3 KB | 处理 AI 命令、事件、发送确认、脱敏预览和 Diff 工具 | useAIRail、ai_proxy.rs、commands.ts | 确认参数；取消事件；返回数据；敏感信息 |
| **src/lib/redaction.ts** | 🟥 一级重点 | 33 | 1,906 | 1.9 KB | 在前端隐藏 Key、Token、路径、邮箱和 URL 参数 | Toast、Logs、AI | 脱敏范围；正常文字不能被过度隐藏 |
| **src/lib/skillPermissions.ts** | 🟥 一级重点 | 38 | 959 | 959 B | 根据 Skill 来源判断能否编辑、归档、删除和复制 | Detail、Editor、Library | 用户来源和受保护来源规则是否正确 |
| **src/types/commands.ts** | 🟥 一级重点 | 190 | 5,221 | 5.4 KB | 定义前端调用后端时的数据形状 | invoke、AI、Settings、commands.rs | 字段名称、可选字段、命令返回值 |
| **src/types/skill.ts** | 🟥 一级重点 | 206 | 6,280 | 6.1 KB | 定义 Skill、版本、依赖、日志等前端数据形状 | store、页面、后端 models | 字段是否与后端一致；旧数据兼容 |
| src/node-fs.d.ts | 🟨 功能关联 | 3 | 101 | 101 B | 补充 Node 文件模块的类型声明 | 测试和构建脚本 | 只放必要声明；避免掩盖真实类型错误 |

## 19. 全局样式

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/styles.css | 🟦 视觉资料 | 216 | 4,554 | 4.4 KB | 设置全局重置、背景、字体、应用高度和基础控件 | main.tsx、全部页面 | 全局改动是否影响所有页面；滚动；窗口高度 |
| src/styles/tokens.css | 🟦 视觉资料 | 74 | 2,388 | 2.3 KB | 保存颜色、间距、圆角和通用尺寸变量 | 所有 CSS | 修改一个变量会影响哪些页面；颜色对比度 |

## 20. 前端测试文件

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 检查什么 | 对应代码 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src/App.test.tsx | 🟧 二级重点 | 116 | 4,718 | 4.7 KB | 基础启动、扫描和旧工作区核心行为 | App、SkillPanelWorkspace | 核心流程是否仍有覆盖 |
| src/App.editor.test.tsx | 🟧 二级重点 | 225 | 9,920 | 10.0 KB | 编辑器保存、草稿和相关交互 | Editor、旧编辑器流程 | 保存失败、冲突、恢复等边界 |
| src/AppShell.test.tsx | 🟧 二级重点 | 763 | 32,533 | 32.6 KB | 导航、Dashboard、Library、Detail、Editor、Settings、AI 和安全流程 | AppShell 与新版页面 | 新增页面和按钮是否有测试；危险操作是否验证 |
| src/i18n.test.ts | 🟧 二级重点 | 100 | 3,197 | 3.1 KB | 中英文资源完整性 | i18n/resources、core | 缺少键、错误语言和变量替换 |
| src/i18n/useI18n.test.tsx | 🟧 二级重点 | 211 | 6,246 | 6.1 KB | React 中语言切换和翻译 Hook | i18n/runtime | 切换、持久化、默认语言 |
| src/lib/ai.test.ts | 🟧 二级重点 | 89 | 2,985 | 2.9 KB | Diff、脱敏和 AI 确认参数 | lib/ai、redaction | 未确认发送、脱敏和 Diff 边界 |
| src/lib/invoke.test.ts | 🟧 二级重点 | 30 | 1,172 | 1.2 KB | Tauri 调用数据转换 | lib/invoke | 命令名、字段映射和失败 |
| src/lib/skillPermissions.test.ts | 🟧 二级重点 | 24 | 1,004 | 1004 B | Skill 来源权限规则 | skillPermissions | 受保护来源不能执行危险操作 |
| src/packaging.config.test.ts | 🟧 二级重点 | 70 | 2,278 | 2.2 KB | 三处版本号和打包配置 | package、Cargo、Tauri 配置 | 版本一致；安装包配置 |
| src/types/skill.test.ts | 🟧 二级重点 | 148 | 5,744 | 5.6 KB | 数据类型和前后端契约 | types/skill、commands | 字段变化是否被及时发现 |
| src/test/setup.ts | ⚪ 低风险入口 | 1 | 43 | 43 B | 初始化前端测试环境 | Vitest | 测试环境是否正确加载 |

## 21. Rust 后端入口与共享数据

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src-tauri/src/main.rs | 🟨 功能关联 | 5 | 110 | 110 B | 启动桌面后端 | lib.rs | 保持简单；启动入口是否正确 |
| src-tauri/src/lib.rs | 🟧 二级重点 | 55 | 1,681 | 1.6 KB | 创建 Tauri 应用并注册命令 | commands.rs、watcher、插件 | 新命令是否注册；插件权限；启动错误 |
| **src-tauri/src/commands.rs** | 🟥 一级重点 | 793 | 26,054 | 25.5 KB | 提供前端可调用的后端命令 | 前端 invoke、所有后端模块 | 参数检查；路径守卫；错误返回；敏感日志；命令清单 |
| **src-tauri/src/models.rs** | 🟥 一级重点 | 252 | 7,810 | 7.6 KB | 定义 Rust 侧 Skill、设置、日志、AI 等数据结构 | commands、store、scanner、前端 types | 字段与前端一致；旧文件兼容；默认值 |

## 22. Rust Skill 文件与版本安全

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| **src-tauri/src/skill_path_guard.rs** | 🟥 一级重点 | 303 | 9,417 | 9.2 KB | 把路径变成真实路径并限制在允许目录，阻止符号链接逃逸 | commands、skill_store、scanner | 所有文件命令是否经过守卫；受保护来源；目录边界 |
| **src-tauri/src/skill_scanner.rs** | 🟥 一级重点 | 689 | 21,771 | 21.3 KB | 扫描目录、发现 Skill、解析文件和元数据 | settings_store、models、skill_store | 扫描范围；坏文件；重复；软链接；性能 |
| **src-tauri/src/skill_store.rs** | 🟥 一级重点 | 1,295 | 48,416 | 47.3 KB | 读取、保存、复制、归档、删除、备份和恢复 Skill | commands、path_guard、version_store | 覆盖前备份；删除进入废纸篓或备份；失败回滚；权限 |
| **src-tauri/src/version_store.rs** | 🟥 一级重点 | 380 | 13,448 | 13.2 KB | 创建、列出和恢复 Skill 版本快照 | Editor、skill_store | 快照时机；数量清理；恢复前再备份；版本隔离 |

## 23. Rust 设置、监听、日志和依赖

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| **src-tauri/src/settings_store.rs** | 🟥 一级重点 | 281 | 10,052 | 9.8 KB | 读取和保存设置，提供默认扫描目录 | Settings、commands、watcher | 配置文件位置；默认值；旧格式；普通设置中不可保存完整 Key |
| src-tauri/src/watcher.rs | 🟧 二级重点 | 47 | 1,347 | 1.4 KB | 监听 Skill 文件变化并通知前端 | settings_store、tauriEvents | 重复监听；停止监听；大量变化；事件风暴 |
| **src-tauri/src/call_logger.rs** | 🟥 一级重点 | 202 | 6,337 | 6.3 KB | 写入和读取调用日志，并执行脱敏 | commands、Logs、redaction | 写入前脱敏；旧日志再次脱敏；损坏日志行 |
| src-tauri/src/dep_analyzer.rs | 🟧 二级重点 | 76 | 2,806 | 2.9 KB | 分析 Skill 之间的依赖关系 | Dependencies、models | 缺失依赖；循环；重复；空数据 |

## 24. Rust AI 与敏感数据

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 负责什么 | 连接对象 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| **src-tauri/src/ai_proxy.rs** | 🟥 一级重点 | 476 | 13,863 | 14.2 KB | 从系统凭据存储读取 Key，检查厂商，确认发送并代理 AI 请求 | Settings、lib/ai、commands、Keychain | Key 不写日志；厂商允许列表；发送确认；超时；错误脱敏 |
| **src-tauri/src/redaction.rs** | 🟥 一级重点 | 176 | 5,562 | 5.4 KB | 隐藏 Key、Token、JWT、路径、邮箱和 URL 敏感参数 | call_logger、commands、ai_proxy | 嵌套 JSON；不同 Key 格式；正常内容保留 |

## 25. Rust 契约测试

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 检查什么 | 对应代码 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| src-tauri/tests/skill_contract.rs | 🟧 二级重点 | 127 | 4,106 | 4.1 KB | 检查 Rust 与 TypeScript 的命令、字段和返回结构 | commands.rs、models.rs、types | 新命令和新字段是否加入；前后端名称一致 |

## 26. 设计迁移原型代码

位置：docs/design-migration-results/skill-panel-redesign-notion/prototype

这些文件用于视觉对照和原型验收，不会直接进入正式应用运行流程。

| 文件 | 重点等级 | 行数 | 字符数 | 文件大小 | 展示内容 | 你重点审核什么 |
| --- | --- | ---: | ---: | ---: | --- | --- |
| index.html | 🟦 视觉资料 | 123 | 4,484 | 4.9 KB | Library 主原型入口 | 卡片、导航、详情栏和整体比例 |
| library.html | 🟦 视觉资料 | 257 | 16,427 | 16.5 KB | 更完整的 Library 原型 | 搜索、分类、网格和右栏 |
| dashboard.html | 🟦 视觉资料 | 115 | 5,641 | 5.8 KB | Dashboard 原型 | 指标、最近修改和风险提醒 |
| detail.html | 🟦 视觉资料 | 126 | 6,323 | 6.5 KB | Skill 详情原型 | 基本信息、依赖、质量和危险区 |
| editor.html | 🟦 视觉资料 | 150 | 6,167 | 6.6 KB | Editor 原型 | 三栏、表单、预览和 AI 入口 |
| new-skill.html | 🟦 视觉资料 | 110 | 5,845 | 5.9 KB | 新建 Skill 原型 | 模板和表单流程 |
| settings.html | 🟦 视觉资料 | 111 | 5,924 | 6.3 KB | Settings 原型 | 左侧导航、设置分组和安全说明 |
| logs.html | 🟦 视觉资料 | 140 | 6,133 | 6.3 KB | Logs 原型 | 筛选、表格和详情 |
| dependencies.html | 🟦 视觉资料 | 122 | 5,345 | 5.5 KB | Dependencies 原型 | 图、风险和依赖表 |
| ai-assistant.html | 🟦 视觉资料 | 106 | 5,664 | 6.0 KB | AI Assistant 原型 | 模式、确认和 Diff |
| empty.html | 🟦 视觉资料 | 103 | 4,835 | 5.0 KB | 空状态和错误状态原型 | 文案、按钮和状态区别 |
| prototype-shell.css | 🟦 视觉资料 | 560 | 11,657 | 11.4 KB | 所有原型共享样式 | 与正式 CSS 的差异；原型验收基线 |

## 27. 文件改动时的配套检查关系

| 如果改了这些文件 | 同时检查这些文件或流程 |
|---|---|
| package.json | package-lock.json、Cargo.toml、tauri.conf.json、packaging.config.test.ts |
| AppShell.tsx 或 TopBar.tsx | router.tsx、uiStore.ts、AppShell.test.tsx、视觉截图 |
| Library 页面 | skillStore.ts、invoke.ts、DetailPanel、Library.css |
| DetailView.tsx | DangerZone、skillPermissions、commands.rs、skill_store.rs、删除和归档人工流程 |
| EditorView.tsx | commands.rs、skill_store.rs、version_store.rs、App.editor.test.tsx |
| Settings 页面 | settingsStore.ts、settings_store.rs、ai_proxy.rs、Keychain 人工验证 |
| AI 组件或 useAIRail | lib/ai.ts、ai_proxy.rs、redaction、ai.test.ts、发送确认截图 |
| Logs 页面 | lib/logs.ts、call_logger.rs、redaction 前后端文件 |
| commands.rs | types/commands.ts、skill_contract.rs、所有调用这个命令的页面 |
| models.rs 或 types/skill.ts | 另一端的数据类型、契约测试、旧数据读取 |
| skill_path_guard.rs | 所有文件写入、打开、复制、归档和删除命令 |
| skill_store.rs | Editor、Detail、Create、版本快照、备份和恢复 |
| 任意 CSS | 对应页面的 1024、1280、1440 截图 |

## 28. 你每次收到代码改动后怎么审核

### 第一步：确认改动文件

让 Codex 给你一张表：

| 文件 | 为什么改 | 影响的用户操作 | 对应测试 |
|---|---|---|---|
| 示例：src/detail/DetailView.tsx | 修复删除确认 | 详情页删除 Skill | AppShell.test.tsx、人工删除与恢复 |

### 第二步：在本文搜索文件名

查看该文件的职责、连接对象和审核点。若 Codex 的说明与本文职责差异较大，应要求解释职责变化。

### 第三步：检查配套文件

例如改了 DetailView.tsx，同时检查：

- skillPermissions.ts
- commands.rs
- skill_store.rs
- AppShell.test.tsx
- 删除、归档和恢复人工流程

### 第四步：亲自走用户流程

你只需要关心用户看到的结果：

- 按钮是否能点。
- 成功后数据是否真的变化。
- 失败时是否说明原因。
- 关闭再打开应用后结果是否保留。
- 删除或覆盖后是否可以恢复。
- Key、路径和日志是否隐藏敏感内容。

### 第五步：要求保存证据

- 自动测试结果。
- 类型检查和构建结果。
- 相关页面截图。
- 人工验收步骤和结果。
- Git 提交号。
- PROJECT_STATE、CURRENT-PLAN 或 delivery 的更新。

## 29. 当前风险最高的 10 个文件

| 顺序 | 文件 | 原因 |
|---:|---|---|
| 1 | src/SkillPanelWorkspace.tsx | 文件巨大，包含大量旧逻辑，修改影响面广 |
| 2 | src-tauri/src/skill_store.rs | 直接读写、复制、归档和删除用户文件 |
| 3 | src-tauri/src/commands.rs | 几乎所有前后端调用都经过这里 |
| 4 | src/editor/EditorView.tsx | 处理草稿、保存、冲突、版本和恢复 |
| 5 | src-tauri/src/skill_path_guard.rs | 决定文件命令能访问哪些路径 |
| 6 | src-tauri/src/ai_proxy.rs | 接触 API Key、外部网络和用户内容 |
| 7 | src/detail/DetailView.tsx | 包含删除、归档、复制和打开目录 |
| 8 | src-tauri/src/redaction.rs | 决定日志和错误中哪些敏感信息会被隐藏 |
| 9 | src/components/ai/ai.css | 样式量大，会影响 AI 页面多个状态 |
| 10 | src/i18n/resources.ts | 所有中英文文案集中在这里 |

## 30. 当前建议

1. 每次任务尽量控制在一个功能区域。
2. 修改高风险文件时要求列出配套测试和人工流程。
3. 新增后端命令时同步更新前端类型与契约测试。
4. 新增文件时同步更新 docs/modules/source-file-index-v3.8.1.md。
5. 当前源码索引的部分行数已经落后，应在 SEC-FILE-01D 或文档整理任务中刷新。
6. 发布前优先完成 Keychain、Credential Store、危险文件操作和安装回退的人工验证。

---

文档基线：

- 统计日期：2026-07-16
- 稳定仓版本：3.8.2
- 稳定仓 HEAD：4910ff3dbec09ad912fdda3543cae2aaf4dedc0e
- 直接运行、测试和打包文件：150 份
- 设计原型代码：12 份
- 下一开发任务：SEC-FILE-01D
