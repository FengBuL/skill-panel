# AI 助手与 Diff 写回 v3.8.1

## 模块简介

负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。

## 检索关键词

`AI Rail`、`ai_optimize`、`get_ai_key`、`ai_cancel`、`diff`、`Keychain`

## 代码规模

- 源码文件数：9
- 代码总行数：1426

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/components/ai/AIRail.tsx` | 102 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/CostBadge.tsx` | 44 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/DiffHunk.tsx` | 59 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/DiffModal.tsx` | 102 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/ai.css` | 461 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/hooks/useAIRail.ts` | 171 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/lib/ai.ts` | 171 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/lib/ai.test.ts` | 40 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src-tauri/src/ai_proxy.rs` | 276 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |

## 对外契约

- 生成前调用 get_ai_key
- ai_optimize 通过 ai-chunk、ai-done、ai-error 推送事件
- 写回动作进入 DiffModal
- API Key 存在系统 Keychain

## 修改规则

- 写回动作保持 diff 确认
- 安全审查保持只读
- 新增厂商需要同步前端价格表和 Rust 代理

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
