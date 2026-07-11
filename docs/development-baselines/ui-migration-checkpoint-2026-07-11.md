# v3.8.1 UI 迁移收口基线

## 基线目的

本记录把 `1bd6f31908f05bbd14c057a2048730be6e0db6e7` 之后工作区内累计的 Notion 风格 UI 迁移结果收口为可测试、可回退的集成基线。该基线用于启动 WorkBuddy UI 代码开发线，不代表 v3.8.2 已发布。

## 改动来源

- Git 起点：`1bd6f31908f05bbd14c057a2048730be6e0db6e7`。
- 设计来源：`/Users/shovy/Documents/skill-panel-workbuddy-v3.8.1-prototype/docs/design-prototypes/skill-panel-redesign-notion/`。
- 迁移批次：Library、Dashboard、Detail、Editor、AI Assistant / Diff、Logs、Dependencies、Settings、New Skill、Empty / Error。
- 迁移证据：`docs/design-migration-results/skill-panel-redesign-notion/`。
- 模块说明：`docs/modules/`。
- `.omm/` 属于本地生成的架构分析缓存，已加入 `.gitignore`，不进入产品基线。

## 已确认有效的 UI

- 顶部主导航固定为 Dashboard、Library、Logs、Dependencies、Settings。
- Library 保持主入口，New Skill 保持右侧次级入口。
- AI Assistant 顶栏只显示一个右侧入口：返回编辑器。
- 十个页面均有 1440×960 的原型图、Codex 实现截图和并排对照图。
- 应用壳、页面路由、Library 扫描、Dashboard 指标、Logs 加载、New Skill 创建、API Key Keychain 保存、Editor 读取与校验、AI Key 阻断和 Diff 采纳具有前端回归测试。

## 本次验证中修正的问题

- New Skill 测试仍断言旧按钮文案，现已对齐当前页面。
- Settings 的 API Key 区域只有视觉占位，现已恢复输入和 `set_ai_key` 保存链路；原始 Key 只保存在组件临时状态，保存后立即清空。
- AI Assistant 的 Key 状态曾被固定为已配置，现改为读取真实 store 状态。
- Editor 接收文件路径参数时曾把路径显示为 Skill 名称，现优先解析 store 中的 Skill 名称。
- 两套共 3,125 行的旧版界面测试依赖已经移除的 DOM 结构，现已改为覆盖当前导航、页面壳和编辑器关键流程的测试。旧断言可从 Git 历史读取。

## 已知边界

- 迁移对照归档覆盖 1440×960；自动视觉 QA 另覆盖 1024×768、1280×768、1280×800 和 1440×960。发布前仍需对本次实际改动页面复跑对应视口。
- 部分页面仍含展示型数据和暂未连接的按钮，后续批次需要逐项连接真实命令并增加测试。
- Editor 当前“保存”按钮只更新页面状态，完整 `save_skill` 写回与版本快照连接需单独集成。
- Detail 的归档、打开目录和备份仍处于展示或确认提示阶段。
- AI Assistant 页面级“生成优化建议”仍是视觉流程；Editor 内 AI Rail 已覆盖真实命令与 Diff 测试。

## 回退和后续开发规则

- 本次收口提交是 WorkBuddy UI 分支的唯一创建基准。
- WorkBuddy 在独立 worktree 完成 UI 代码和页面测试，交付可追溯提交。
- Codex 通过 cherry-pick 或明确 merge 集成，不进行页面手工复刻。
- 每批交付必须附主导航、激活项、右侧唯一入口对照表。
- 发布前执行 `npm test`、`npm run typecheck`、`npm run build`、`npm run packaging:check`、`npm run cargo:test` 和三档视口视觉回归。
