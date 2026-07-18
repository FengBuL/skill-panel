# 当前架构

更新时间：2026-07-18

## 基线

- 默认分支：`main`
- 当前开发版本：`3.8.3`
- 最新正式版本：`3.8.2`
- 前端入口：`src/main.tsx`
- 应用壳入口：`src/layout/AppShell.tsx`
- Tauri 入口：`src-tauri/src/main.rs` 和 `src-tauri/src/lib.rs`

## 前端调用链

```text
index.html
  -> src/main.tsx
  -> src/layout/AppShell.tsx
  -> src/pages/*
  -> src/components/*, src/hooks/*, src/stores/*
```

`src/App.tsx` 为测试和嵌入场景提供同一应用壳。生产入口和测试入口都要引用 `src/layout/AppShell.tsx`。

## 责任边界

- `src/pages/`：页面组合、路由上下文和页面级交互。
- `src/components/`：可复用界面组件。
- `src/hooks/`：前端行为和生命周期复用。
- `src/stores/`：跨页面前端状态。
- `src/types/`：前后端数据契约。
- `src-tauri/src/`：文件系统、设置、Keychain、扫描、日志和版本历史。
- `docs/modules/`：模块索引、边界和修改规则。

## 原型边界

WorkBuddy 原型用于验证高不确定性的 UI 和交互。每个原型固定一个 `main` 提交，并通过交接模板记录用户流程、状态、截图和验收结论。

Codex 在稳定分支中实现已验收契约。视觉、行为和状态需要与验收结果一致；源码组织遵守本页架构与模块边界。

## 文档边界

- Git 仓库：可执行事实、任务计划、架构、测试、发布证据。
- Obsidian：阅读入口、复盘和决策摘要。
- 同步方向：Git → Obsidian。

## 自动检查

`npm run repo:doctor` 检查版本一致性、应用入口、活动文档中的历史基线和当前分支祖先关系。CI 在测试与打包前运行该命令。
