# 日志与依赖分析 v3.8.1

## 模块简介

负责调用日志展示、AI 调用记录、日志脱敏、依赖关系分析和日志读取。

## 检索关键词

`Logs`、`call logs`、`依赖`、`analyze_deps`、`tokens`、`脱敏`

## 代码规模

- 源码文件数：10
- 代码总行数：955

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/components/DependencyGraph.tsx` | 17 | 提供依赖拓扑展示组件。 |
| `src/components/DependencyTable.tsx` | 45 | 提供依赖详情表格组件。 |
| `src/components/LogTable.tsx` | 49 | 提供调用日志表格组件。 |
| `src/pages/Dependencies/index.tsx` | 65 | 负责依赖分析页面、拓扑图、风险摘要和依赖详情。 |
| `src/pages/Dependencies/Dependencies.css` | 123 | 负责依赖分析页面、拓扑图、风险摘要和表格样式。 |
| `src/pages/Logs/index.tsx` | 135 | 负责调用日志页面、筛选入口、空日志表格、详情展示和前端防御性脱敏。 |
| `src/pages/Logs/Logs.css` | 98 | 负责调用日志页面、表格、筛选和详情样式。 |
| `src/lib/logs.ts` | 29 | 负责调用日志读取、fallback 空态和前端防御性脱敏。 |
| `src/lib/redaction.ts` | 33 | 提供前端 API Key、token、路径、邮箱和 URL 敏感参数脱敏工具。 |
| `src-tauri/src/call_logger.rs` | 202 | 负责调用日志写入前脱敏、读取旧 JSONL 再脱敏、损坏行兼容和文件权限限制。 |
| `src-tauri/src/dep_analyzer.rs` | 66 | 负责调用日志展示、AI 调用记录、依赖关系分析和日志读取。 |

## 对外契约

- get_call_logs 返回时间、skillName、prompt、status、durationMs、tokens
- get_call_logs 读取旧日志时再次脱敏；损坏 JSONL 行静默跳过且不回显原文
- analyze_deps 返回 dependsOn 和 dependedBy

## 修改规则

- 日志结构变更需要兼容旧 JSONL
- 依赖分析保持只读
- 费用字段内部记录时提供默认值
- 写入日志前必须调用统一脱敏，prompt 只保留脱敏后的必要摘要

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
