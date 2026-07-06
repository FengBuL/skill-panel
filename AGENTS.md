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

