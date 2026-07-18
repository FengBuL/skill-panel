---
项目: Skill Panel
任务: DOC-STRUCTURE-01
版本: 3.8.3
更新时间: 2026-07-18
---

# 当前计划

## 目标

整理 Git 与 Obsidian 项目资料，使新同事可以从单一入口确认当前版本、正式版本、历史阶段、涉及文件、验证证据和后续开发规则。

## 执行状态

| 步骤 | 状态 | 输出 |
|---|---|---|
| 文件与版本盘点 | 已完成 | Git 标签、提交历史、文档时间和发布目录已核对 |
| Git 目录设计 | 已完成 | `docs/current`、`docs/versions`、`output/qa` 分层已确定 |
| Git 文件迁移 | 已完成 | 现行文档、版本资料和 v3.8.3 QA 证据已归入新目录 |
| Obsidian 整理 | 已完成 | 保留项目总览、现行镜像、个人复盘和开发方法 |
| 自动化映射更新 | 已完成 | 新源路径与 `01-现行开发` 映射已生效，自动化保持暂停 |
| 完整验证 | 已完成 | repo doctor、链接、镜像、前端、构建、打包、Rust 和视觉 QA 全部通过 |

## 目录规则

- 根目录只保留项目入口、当前状态、当前计划、Agent 规则、源码和工程配置。
- `docs/current/` 只保存后续开发会直接读取和维护的文档。
- `docs/versions/<版本>/` 保存该阶段的设计、计划、模块说明、审计和迁移资料。
- `output/releases/` 保存发布包和候选包，目录名必须包含版本或候选编号。
- `output/qa/<版本>/` 保存视觉报告和截图。
- Obsidian 活动区只保留项目总览、当前状态及主要规则镜像。

## 验证命令

```bash
npm run repo:doctor
npm test
npm run typecheck
npm run build
npm run packaging:check
npm run cargo:test
npm run visual:qa
npm run git:diff:check
```

## 验证结果

- Obsidian 七份规则镜像与 Git 源逐字一致。
- 18 份现行 Markdown 的本地链接全部有效。
- `npm run repo:doctor`：通过。
- `npm test`：12 个测试文件、89 项测试通过。
- `npm run typecheck`：通过。
- `npm run build`：通过。
- `npm run packaging:check`：6 项测试通过。
- `npm run cargo:test`：Rust lib 56 项、integration 4 项通过。
- `npm run visual:qa`：17 个场景通过，报告位于 `output/qa/v3.8.3/visual-qa-report.json`。
- `git diff --check`：通过。
