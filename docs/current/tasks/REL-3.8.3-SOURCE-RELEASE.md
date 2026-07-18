# REL-3.8.3-SOURCE-RELEASE 任务卡

## 基本信息

- 任务编号：`REL-3.8.3-SOURCE-RELEASE`
- 任务类型：发布验收 / 仓库维护
- 负责人：Codex
- 基线分支：`main`
- 基线提交：`f23ef8dcc4eb63c80e4508c9afb3e348a7d707b3`
- 目标版本：`3.8.3`

## 目标与范围

- 用户问题：candidate-2、正式版本、分支和文档并存，重大原型变更缺少唯一冻结基线。
- 本批次结果：完成开源源码正式发布、Preview 构建、分支清理、tag、GitHub Release 和 Obsidian 收口。
- 涉及模块：版本与打包、发布证据、仓库治理、文档索引。
- 计划修改文件：状态、计划、发布就绪、版本地图、发布目录、Obsidian 摘要。
- 排除范围：业务功能、用户 Skill、证书、公证凭据、secrets、Windows 人工验收。

## 决策

- 已确认需求：源码、tag 和 GitHub Release 作为 v3.8.3 正式开源发布；macOS ARM 和 Windows 安装包按 Preview 边界处理。
- 待验证假设：最终源码提交可以通过完整验证；macOS ARM 与 Windows NSIS CI 可以完成构建；源码归档排除 `output/` 生成物。
- 需要原型：否。
- 原型触发原因：无。

## 风险

- 数据读写：构建不读取真实 Skill；启动烟测使用临时 `HOME`。
- 文件删除：只清理经归档保护的 Git 分支，不删除用户文件。
- 批量操作：历史分支清理前生成完整 Git bundle。
- AI 写回：无。
- 回退点：发布前 `main` 提交 `f23ef8d`、tag `v3.8.2`、candidate-2 证据提交 `2046733`。

## 验收

- 自动验证：repo doctor、前端测试、类型、构建、打包、Rust、视觉 QA、diff check、GitHub Actions。
- 人工流程：复用 candidate-2 已通过的 macOS 8A/8B；不追加 Windows 人工验收声明。
- 截图：`output/qa/v3.8.3/` 与 candidate-2 8B 证据。
- 主要人工等待点：发布口径已确认；GitHub Release 创建后核对公开附件。
- 完成条件：正式 tag、GitHub Release、发布归档、分支和 Obsidian 全部一致。
