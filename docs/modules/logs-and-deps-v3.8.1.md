# 日志与依赖分析 v3.8.1

## 模块简介

负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。

## 检索关键词

`Logs`、`call logs`、`依赖`、`analyze_deps`、`tokens`

## 代码规模

- 源码文件数：5
- 代码总行数：322

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/pages/Logs/index.tsx` | 60 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src/pages/Logs/Logs.css` | 112 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src/lib/logs.ts` | 26 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src-tauri/src/call_logger.rs` | 58 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |
| `src-tauri/src/dep_analyzer.rs` | 66 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |

## 对外契约

- get_call_logs 返回时间、skillName、prompt、status、durationMs、tokens
- analyze_deps 返回 dependsOn 和 dependedBy

## 修改规则

- 日志结构变更需要兼容旧 JSONL
- 依赖分析保持只读
- 费用字段内部记录时提供默认值

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
