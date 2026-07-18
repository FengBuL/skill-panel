# Skill Panel

Skill Panel 是一款管理本机 AI Skill 的跨平台桌面应用，技术栈为 Tauri 2、React 19、TypeScript 和 Rust。

## 接手入口

| 项目 | 当前值 |
|---|---|
| 规范仓库 | `/Users/shovy/Documents/skill-panel` |
| 默认分支 | `main` |
| 当前开发版本 | `3.8.3` candidate-2，内部验收通过 |
| 最新正式版本 | `3.8.2`，tag `v3.8.2` |
| 当前应用入口 | `src/main.tsx` -> `src/layout/AppShell.tsx` |
| 当前项目状态 | [PROJECT_STATE.md](./PROJECT_STATE.md) |
| 当前开发计划 | [CURRENT-PLAN.md](./CURRENT-PLAN.md) |
| 文档与版本地图 | [docs/README.md](./docs/README.md) |
| 产物与证据地图 | [output/README.md](./output/README.md) |

新同事按以下顺序接手：

1. 阅读本文件、`PROJECT_STATE.md`、`CURRENT-PLAN.md` 和 `AGENTS.md`。
2. 阅读 [现行文档入口](./docs/current/README.md)，确认产品、架构、UI 和发布边界。
3. 执行 `npm install`，随后执行 `npm run repo:doctor`。
4. 开发前从最新 `main` 创建任务分支，并填写 [任务卡](./docs/current/templates/task-card.md)。
5. 提交前运行与修改范围匹配的测试，涉及共享行为时运行完整验证集。

## 当前状态

- `3.8.3` candidate-2 已通过 macOS 真实 Skill、分页、安装、升级、回退和数据保留验收。
- `3.8.2` 是最新正式版本，发布归档位于 `output/releases/v3.8.2/`。
- macOS 正式发布仍需 Developer ID 签名、公证和 Gatekeeper 完整验证。
- Windows NSIS 和 macOS App/DMG 的治理 CI 已通过；Windows 当前候选验收仍延期。
- Git 保存产品规格、架构、规则、状态、计划和验证证据；Obsidian保存现行镜像、阅读入口与个人复盘。

## 目录结构

```text
skill-panel/
├── AGENTS.md                 # Agent 执行规则
├── README.md                 # 项目接手总入口
├── PROJECT_STATE.md          # 当前事实状态
├── CURRENT-PLAN.md           # 当前唯一执行计划
├── src/                      # React 前端
├── src-tauri/                # Rust 后端与 Tauri 配置
├── scripts/                  # 治理、测试、构建辅助脚本
├── docs/
│   ├── current/              # 后续开发使用的现行文档
│   └── versions/             # 按版本阶段保存的历史文档
└── output/
    ├── qa/v3.8.3/            # 当前版本视觉 QA 证据
    └── releases/             # 按版本和候选批次保存的发布产物
```

`dist/`、`node_modules/` 和 `src-tauri/target/` 是可重新生成的本地产物，不承担版本说明职责。

## 常用命令

```bash
npm install
npm run repo:doctor
npm run dev
npm run tauri:dev
npm test
npm run typecheck
npm run build
npm run packaging:check
npm run cargo:test
npm run visual:qa
npm run git:diff:check
```

打包命令：

```bash
npm run tauri:build:windows
npm run tauri:build:windows:msi
npm run tauri:build:macos
```

## 开发规则

- 产品范围以 [PRD](./docs/current/product/PRD.md) 为准。
- 页面与交互以 [UI 规范](./docs/current/product/UI-SPECIFICATION.md) 和 [UI 样式指南](./docs/current/product/ui-style-guide.md) 为准。
- 模块边界以 [当前架构](./docs/current/architecture.md) 为准。
- 发布判断以 [发布就绪状态](./docs/current/operations/RELEASE-READINESS.md) 为准。
- 历史文档只用于追溯，不直接作为新任务实现基线。

## 历史迁移工具

v3.0.0 Windows 迁移脚本保留在 `scripts/create-migration-package.ps1`。使用背景和历史步骤见 [v3.0 迁移指南](./docs/versions/v3.0/migration-guide.md)。
