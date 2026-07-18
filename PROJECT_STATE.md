---
项目: Skill Panel
当前开发版本: 3.8.3
最新正式版本: 3.8.2
当前任务: DOC-STRUCTURE-01
状态: 项目目录与接手文档整理完成，PR #4 已合并
更新时间: 2026-07-18
---

# 项目状态

## 版本状态

| 项目 | 状态 | 证据 |
|---|---|---|
| 最新正式版本 | `3.8.2` | tag `v3.8.2`，发布文件位于 `output/releases/v3.8.2/` |
| 当前开发版本 | `3.8.3` candidate-2 | macOS 8A 与 8B 已通过，产物位于 `output/releases/v3.8.3-candidate-2/` |
| candidate-1 | 历史失败候选 | 固定演示数据和分页缺失，保留于 `output/releases/v3.8.3-candidate/` |
| macOS 正式发布 | 阻塞 | 缺少 Developer ID 签名、公证和 Gatekeeper 完整验证 |
| Windows 当前候选 | 延期 | 历史正式包和治理 CI 记录保留，当前版本未完成人工候选验收 |

## 仓库状态

- 规范仓库：`/Users/shovy/Documents/skill-panel`
- 默认分支：`main`
- 本轮整理基线：`7ce545d`
- 整理提交：`d69f710`
- main 合并提交：`2529c67`
- 合并记录：PR #4 `docs: 按版本整理项目接手结构`
- 应用版本：npm、Tauri、Cargo 均为 `3.8.3`
- 应用入口：`src/main.tsx` -> `src/layout/AppShell.tsx`
- CI 门槛：Windows NSIS、macOS App/DMG、PR 审核和对话解决。
- 文档同步：Git -> Obsidian 单向同步。

## 当前任务

- 任务编号：`DOC-STRUCTURE-01`
- 目标：按现行资料和版本阶段整理 Git 与 Obsidian，为直接接手提供单一入口。
- 范围：文档目录、QA 证据目录、路径引用、治理检查和 Obsidian 镜像。
- 应用代码：业务逻辑不变。
- 完成状态：目录清晰、版本归属明确、现行链接有效、自动检查与测试全部通过。

## 关键证据

- candidate-2 代码与记录：`03865b3`、`57b29ae`、`2046733`。
- candidate-2 DMG SHA256：`a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688`。
- v3.8.2 基线 DMG SHA256：`10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`。
- 8B 证据：`output/releases/v3.8.3-candidate-2/8b-evidence/`。
- 版本文档地图：`docs/versions/README.md`。
- 项目接手结构：PR #4，merge commit `2529c67`。

## 已知风险

- macOS 正式发布条件尚未满足。
- Windows 当前版本候选验收尚未执行。
- `3.8.3` 尚无正式 tag。
- 历史文档中的路径和分支名称反映当时环境，使用前先查看对应版本目录的 `README.md`。
