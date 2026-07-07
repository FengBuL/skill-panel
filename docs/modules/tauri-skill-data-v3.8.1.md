# Skill 数据、扫描和版本历史 v3.8.1

## 模块简介

负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。

## 检索关键词

`skill_scanner`、`skill_store`、`version_store`、`frontmatter`、`snapshot`

## 代码规模

- 源码文件数：3
- 代码总行数：2200

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src-tauri/src/skill_scanner.rs` | 686 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 |
| `src-tauri/src/skill_store.rs` | 1427 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 |
| `src-tauri/src/version_store.rs` | 87 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 |

## 对外契约

- scan_skills 返回 SkillSummary
- read_skill 和 update_skill 限制在允许根目录内
- 保存前创建备份和版本快照

## 修改规则

- 文件写入必须保留路径安全校验
- frontmatter 格式化保持常见字段顺序
- 版本恢复只写回目标 SKILL.md

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
