# Tauri 命令层 v3.8.1

## 模块简介

负责 Tauri 应用入口、命令注册、命令适配、应用版本、统一脱敏和前端可调用边界。

## 检索关键词

`Tauri`、`commands`、`invoke_handler`、`app_version`、`backend`、`redaction`

## 代码规模

- 源码文件数：5
- 代码总行数：1282

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src-tauri/src/main.rs` | 6 | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 |
| `src-tauri/src/lib.rs` | 55 | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 |
| `src-tauri/src/commands.rs` | 793 | 负责 Tauri 应用入口、命令注册、命令适配、audit 日志脱敏、应用版本和前端可调用边界。 |
| `src-tauri/src/models.rs` | 252 | 负责 Tauri 应用入口、命令注册、命令适配、应用版本和前端可调用边界。 |
| `src-tauri/src/redaction.rs` | 176 | 提供后端 API Key、token、JWT、路径、邮箱、URL 查询参数和 JSON 嵌套字符串脱敏工具。 |

## 对外契约

- generate_handler 注册所有前端命令
- app_version 与 Cargo 版本一致
- 模型使用 serde camelCase
- 文件命令统一通过后端路径守卫校验允许根、符号链接和来源权限
- delete_skill 返回 Skill 名称、原路径、备份路径、废纸篓结果和恢复说明
- append_audit_log 写入前递归脱敏 detail
- ai_optimize 在取 Key 与网络请求前校验发送确认字段

## 修改规则

- 新增命令同步 commands.rs、lib.rs、src/types/skill.ts
- 命令参数保持前端友好命名
- 错误返回 Result<T, String>
- 命令错误涉及用户内容、路径、token 或 Keychain 时先脱敏

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
