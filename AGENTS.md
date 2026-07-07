# Skill Panel Agent 规则

本文件是 Skill Panel 仓库的 agent 执行规则。所有 agent 进入本仓库前都要先读取并遵守。

## 语言规则

所有项目说明、交付说明、规范文件、交互文案默认使用中文。

中文表达要直接、清晰、可执行。避免使用二元否定转折句式，优先写成正向规则和明确动作。

## 工作目录隔离

不同 agent 使用不同文件夹。

- Codex 工作目录：`/Users/shovy/Documents/skill-panel-codex-v3.8`
- WorkBuddy 工作目录：`/Users/shovy/Documents/skill-panel-workbuddy-v3.9`
- 管理目录：`/Users/shovy/Documents/skill-panel`

禁止两个 agent 同时编辑同一个文件夹。

## 当前稳定线

- 稳定产品线：v3.8.x
- 当前稳定版本：v3.8.1
- 稳定分支目录：`/Users/shovy/Documents/skill-panel-codex-v3.8`

Codex 负责稳定集成和发布质量。

## 模块情况

模块文档库位于 `docs/modules/`。

核心索引：

- `docs/modules/README.md`：模块文档库入口。
- `docs/modules/module-index-v3.8.1.md`：按模块检索代码文档。
- `docs/modules/source-file-index-v3.8.1.md`：按源码文件检索模块归属、模块文档和行数。

当前稳定线模块：

- 应用壳与导航：入口、顶栏、视图切换、全局监听。
- 共享 UI 与通用组件：按钮、Toggle、Toast、错误边界、空状态。
- Skill Library：列表、筛选、分页、批量、详情抽屉。
- Dashboard 仪表盘：扫描概览和指标。
- 编辑器工作区：Frontmatter、Markdown、预览、校验。
- AI 助手与 Diff 写回：AI Rail、Key 检查、流式生成、diff 采纳。
- 设置与偏好：主题、扫描、AI 厂商、预算、脱敏。
- 新建与预览流程：创建 Skill 和只读预览。
- 日志与依赖分析：调用日志、token、依赖关系。
- 前端状态与 Hooks：zustand 状态、键盘、拖拽、查询。
- 类型契约与命令边界：前后端数据形状、命令清单、契约测试。
- 国际化与旧版工作区兼容：i18n、旧版工作区、兼容测试。
- Tauri 命令层：命令注册、模型、应用版本。
- Skill 数据、扫描和版本历史：扫描、读写、备份、快照。
- 后端设置与文件监听：设置文件、默认目录、文件监听。
- 测试与视觉 QA：Vitest、Playwright、打包配置测试。
- 打包、迁移和本地更新：npm、Tauri、迁移包、本地更新脚本。
- 样式系统与视觉规范：token、全局样式、UI 规范。

## 代码文档情况

每个模块都有独立代码文档，命名格式为：

```text
<模块英文 id>-v3.8.1.md
```

示例：

- `app-shell-v3.8.1.md`
- `ai-assistant-v3.8.1.md`
- `tauri-skill-data-v3.8.1.md`

每个模块文档包含：

- 模块简介
- 检索关键词
- 源码文件数
- 代码总行数
- 源码文件清单
- 对外契约
- 修改规则
- 解耦要求
- 修改入口

改代码前必须先执行：

1. 在 `docs/modules/source-file-index-v3.8.1.md` 搜索源码文件或关键词。
2. 打开对应模块文档。
3. 确认模块边界、源码路径、对外契约和修改规则。
4. 修改源码。
5. 同步更新模块文档和索引中的行数、简介或归属。

新增源码文件时必须分配模块归属。移动源码文件时必须同步更新源码文件索引。删除源码文件时必须同步清理模块文档。

## Agent 分工

Codex 负责：

- 稳定代码集成
- 版本号升级和发布提交
- Tauri 后端命令
- 文件系统、Keychain、设置、扫描器、日志、版本历史
- `src/types/**` 类型契约
- 测试、构建、回归修复
- 将成熟的 WorkBuddy 功能迁移进 v3.8.x

WorkBuddy 负责：

- UI 探索
- 交互流程
- 动效方案
- 功能原型
- 视觉 QA 截图
- 用户可见文案
- 体验评审记录

以下共享区域需要 Codex 评审后进入稳定线：

- `src/components/**`
- `src/hooks/**`
- `src/pages/**`
- `src/styles/**`

## 开发流程

1. 每个任务只处理一个功能或一个修复。
2. WorkBuddy 在 v3.9 文件夹制作原型。
3. Codex 将成熟部分迁移进 v3.8 文件夹。
4. Codex 保持 v3.8 架构稳定，架构迁移需要先批准。
5. 每次稳定交付使用补丁版本号，例如 v3.8.2。
6. 每次稳定交付需要测试和提交。

## UI 标准

所有 UI 和交互工作遵守 `ui-style-guide.md`。

默认原则：

- 桌面生产力工具质感
- 控件紧凑
- 颜色使用 token
- 图标使用 Material Symbols
- 尺寸稳定
- 避免装饰性背景
- AI 写回前需要 diff 确认
- 图标控件需要可访问标签

## 代码规则

- 优先沿用项目已有模式。
- 修改范围贴合当前任务。
- TypeScript 类型使用 `src/types/**`。
- Tauri 命令名需要记录在 `src/types/skill.ts`。
- API Key 通过后端 Keychain 命令存储。
- 前端状态库不得保存原始 API Key。
- 保留 Tauri API 的浏览器预览降级路径。
- 功能迁移期间避免大范围重构。

## 测试要求

声明完成前运行相关检查。

仅前端改动：

```bash
npm run typecheck
npm test
npm run build
```

涉及 Tauri、设置、文件系统、Keychain、扫描器、日志或版本：

```bash
npm run cargo:test
```

涉及可见 UI：

- 运行前端检查。
- 为受影响路由或工作流截取 Playwright 截图。
- 布局变化较大时检查 1024x768、1280x800、1440x960。

## Git 规则

- 编辑前确认当前文件夹正确。
- 修改前运行 `git status --short --branch`。
- 未经明确批准，不得丢弃用户或其他 agent 的工作。
- Codex 稳定交付需要在验证后提交。
- 提交信息要具体，例如 `feat: release v3.8.2 ai settings`。

## 发布规则

v3.8.x 发布需要更新：

- `package.json`
- `package-lock.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/tauri.conf.json`
- `src/packaging.config.test.ts`

随后运行：

```bash
npm test
npm run typecheck
npm run build
npm run cargo:test
```

## 交接格式

WorkBuddy 交给 Codex 时，需要包含：

- 功能名称
- 用户流程
- 修改文件
- 截图
- 已知缺口
- 建议进入的稳定版本

Codex 完成稳定集成时，需要包含：

- 版本号
- 提交哈希
- 已迁移功能概要
- 验证命令和结果
- 可见 UI 变更的截图路径
