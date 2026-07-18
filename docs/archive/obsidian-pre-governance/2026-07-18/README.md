---
title: Skill Panel 开发主文档
date: 2026-07-10
updated: 2026-07-13
tags: [SkillPanel, 开发文档]
status: active
---

# Skill Panel 开发主文档

这个目录只保存会在开发过程中持续更新的主文件。

| 文件 | 用途 | 何时更新 |
|---|---|---|
| [[PRD]] | 产品目标、范围、页面与验收标准 | 产品需求发生变化 |
| [[AGENTS]] | agent 协作、目录、安全、测试和发布规则 | 协作方式或工程规则变化 |
| [[PROJECT_STATE]] | 当前目录、分支、版本、HEAD、风险 | 每批交付、切分支、升版本 |
| [[CURRENT-PLAN]] | 当前开发批次台账 | 每次开工和收尾 |
| [[DEVELOPMENT-LOG]] | 已完成里程碑和重要变更 | 每个批次或版本完成 |
| [[BACKLOG]] | 后续需求与待验证问题 | 收到反馈或发现需求 |
| [[UI-SPECIFICATION]] | 当前视觉、组件和响应式基准 | UI 规范变化 |
| [[RELEASE-READINESS]] | 发布阻塞、验证和回退基线 | 集成验收与发布阶段 |

## 当前工作线

- Codex 稳定线：`/Users/shovy/Documents/skill-panel-codex-v3.8`
- WorkBuddy 原型线：`/Users/shovy/Documents/skill-panel-workbuddy-v3.8.1-prototype`
- Git 管理目录：`/Users/shovy/Documents/skill-panel`
- 废弃 v3.9 目录仅供历史查看。

开始开发前依次读取 [[PROJECT_STATE]]、[[CURRENT-PLAN]]、[[AGENTS]] 和 [[PRD]]。

## 当前产品导航

- 顶部主导航固定为 Dashboard、Library、Logs、Dependencies、Settings。
- Library 是默认入口，也是 Detail、Editor、Create、AI Assistant 和 Preview 的导航归属。
- Editor 需要已选中的 Skill，从 Detail 的编辑操作或 Create 完成流程进入。
- 进入上下文任务页面后 Library 保持高亮，完整职责和流程见 [[PRD]] 与 [[UI-SPECIFICATION]]。

## 当前发布

- 用户已确认 v3.8.2 发布。
- 发布提交：`65140b081962a0177b56c1cf14c572515f320e4e`。
- Dashboard 修复提交：`421cafc9b51cb1245beb06a4a59d736b9b432d50`。
- 发布 tag：`v3.8.2` -> `2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`。
- 发布归档提交：`2f71ba750b7da9ff9186b33dc94aa85e7d86db81`。
- 当前复验：前端、类型、构建、打包配置和 Rust 测试通过；视觉 QA 为 11/11，Dashboard 场景已通过。
- 发布证据、macOS 安装包归档、SHA256 和回退材料见 [[RELEASE-READINESS]]。Windows 安装包、macOS 签名/公证和上一版安装包回退材料仍需补齐。

## 项目侧运行参考

来源：`/Users/shovy/Documents/skill-panel-codex-v3.8/README.md`，已在 `2f71ba7…` 发布归档提交核验。

### 技术栈

- Tauri 2、React 19、TypeScript、Rust 与 Vite。
- 前端测试采用 Vitest 与 Testing Library；Rust 后端位于 `src-tauri/`。

### 常用命令

在项目根目录执行：

```bash
npm install
npm run dev
npm run tauri:dev
npm run build
npm.cmd test
npm.cmd run cargo:test
npm.cmd run packaging:check
```

Windows 打包命令为 `npm.cmd run tauri:build:windows`（NSIS）与 `npm.cmd run tauri:build:windows:msi`（MSI）；macOS 使用 `npm.cmd run tauri:build:macos`。发布前从 [[RELEASE-READINESS]] 确认真实环境验证结果。

### 目录与迁移

- `src/`：React 前端与 i18n 资源。
- `src-tauri/`：Rust 后端与 Tauri 配置。
- `docs/project-plan.md`：分工开发计划。
- Windows 迁移包由 `scripts/create-migration-package.ps1` 生成，详细说明见 `docs/migration-guide-v2.md`；项目 README 中的包名仍沿用 v3.0.0 示例，当前发布判断以 [[PROJECT_STATE]] 为准。
