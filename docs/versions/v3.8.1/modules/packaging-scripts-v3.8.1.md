# 打包、迁移和本地更新 v3.8.1

## 模块简介

负责 npm/Tauri 配置、跨平台 Rust 测试启动、本地 macOS 更新、Windows 迁移包和发布配置。

## 检索关键词

`package`、`Cargo`、`tauri.conf`、`cross-platform`、`migration`、`release`

## 代码规模

- 源码文件数：8
- 代码总行数：334

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `package.json` | 52 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `vite.config.ts` | 20 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `src-tauri/Cargo.toml` | 33 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包、发布配置和后端依赖声明。 |
| `src-tauri/tauri.conf.json` | 67 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `src-tauri/build.rs` | 4 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `scripts/update-local-macos-app.sh` | 36 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `scripts/create-migration-package.ps1` | 71 | 负责 npm/Tauri 配置、本地 macOS 更新、Windows 迁移包和发布配置。 |
| `scripts/run-cargo-tests.mjs` | 51 | 跨平台选择 Cargo 并运行统一 Rust 测试集合。 |

## 对外契约

- 版本号在 package、Cargo、tauri.conf 保持一致
- 迁移包读取 package.json 版本
- 本地更新脚本复制构建产物
- Rust 使用 `trash` 依赖承接系统废纸篓行为
- `npm run cargo:test` 通过 Node 启动器兼容 Windows、macOS 和 Linux

## 修改规则

- 发布版本必须同步所有版本文件
- 脚本路径使用仓库相对结构
- 打包变更需要跑 build 和 packaging 测试

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
