# 类型契约与命令边界 v3.8.1

## 模块简介

负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。

## 检索关键词

`types`、`commands`、`contract`、`SkillCommandMap`、`AppSettings`

## 代码规模

- 源码文件数：5
- 代码总行数：659

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/types/skill.ts` | 198 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src/types/skill.test.ts` | 148 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src/types/commands.ts` | 182 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src/node-fs.d.ts` | 4 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |
| `src-tauri/tests/skill_contract.rs` | 127 | 负责前后端共享数据形状、命令名称列表、契约测试和 TypeScript 类型守卫。 |

## 对外契约

- skillCommandNames 覆盖 Tauri 命令边界
- AppSettings 使用 camelCase 序列化
- Rust 契约测试验证 JSON 形状
- DeleteSkillResult 使用 camelCase，包含 `skillName`、`originalPath`、`backupPath`、`trashResult` 和 `restoreInstructions`

## 修改规则

- 新增命令先更新类型契约
- Rust 模型变更同步前端类型
- 契约测试随字段变化更新

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
