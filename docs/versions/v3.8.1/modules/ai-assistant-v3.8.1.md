# AI 助手与 Diff 写回 v3.8.1

## 模块简介

负责 AI Rail、API Key 检查、发送前确认、脱敏预览、流式生成、取消、费用显示、diff 选择采纳和后端代理。

## 检索关键词

`AI Rail`、`ai_optimize`、`get_ai_key`、`ai_cancel`、`diff`、`Keychain`、`脱敏`、`发送确认`

## 代码规模

- 源码文件数：14
- 代码总行数：2407

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/components/ai/AIRail.tsx` | 145 | 负责 AI Rail、API Key 检查、发送前确认、脱敏预览、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/AIAssistantView.tsx` | 128 | 负责 AI Assistant 页面、优化方向选择、Diff 对比和 Keychain 状态展示。 |
| `src/components/ai/AIModeSelector.tsx` | 36 | 提供 AI Assistant 优化模式选择结构。 |
| `src/components/ai/CostBadge.tsx` | 44 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/DiffHunk.tsx` | 66 | 负责 AI Rail、页面级 Diff hunk 展示、选择采纳和拒绝操作。 |
| `src/components/ai/DiffModal.tsx` | 102 | 负责 AI Rail、API Key 检查、流式生成、取消、费用显示、diff 选择采纳和后端代理。 |
| `src/components/ai/DiffPreview.tsx` | 39 | 提供 AI Assistant 页面级 Diff 摘要与 hunk 列表。 |
| `src/components/ai/ai.css` | 717 | 负责 AI Rail、AI Assistant 页面、Diff 对比、发送确认和 Key 状态的无阴影样式。 |
| `src/components/KeyStatusBadge.tsx` | 16 | 提供 API Key 配置状态和脱敏 Key 展示。 |
| `src/hooks/useAIRail.ts` | 207 | 负责 AI Rail、API Key 检查、发送确认状态机、流式生成、取消、diff 选择采纳和后端代理。 |
| `src/lib/ai.ts` | 182 | 负责 AI Rail、API Key 检查、脱敏预览、确认参数、事件监听和 diff 工具。 |
| `src/lib/ai.test.ts` | 89 | 覆盖 diff 工具、前端脱敏语义和 AI 发送确认参数。 |
| `src/lib/redaction.ts` | 33 | 提供前端 API Key、token、路径、邮箱和 URL 敏感参数脱敏工具。 |
| `src-tauri/src/ai_proxy.rs` | 476 | 负责 Keychain/Credential Store 访问、厂商允许列表、发送确认校验、后端脱敏和 AI 代理。 |

## 对外契约

- 生成前调用 get_ai_key，只返回是否配置
- ai_optimize 通过 ai-chunk、ai-done、ai-error 推送事件
- ai_optimize 参数包含 sendConfirmed、rawContentConfirmed 和 preview；后端在取 Key 与发起网络前校验确认状态
- 写回动作进入 DiffModal
- API Key 存在系统 Keychain
- 关闭脱敏时需要本次 rawContentConfirmed 风险确认

## 修改规则

- 写回动作保持 diff 确认
- 安全审查保持只读
- 新增厂商需要同步前端价格表和 Rust 代理
- 服务商和 endpoint 只能来自允许列表
- 自动化测试使用 mock Keychain 和 mock 事件，不调用真实 AI

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
