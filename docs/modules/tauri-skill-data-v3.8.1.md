# Skill 数据、扫描和版本历史 v3.8.1

## 模块简介

负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、统一路径安全边界、备份、版本快照和恢复。

## 检索关键词

`skill_scanner`、`skill_store`、`skill_path_guard`、`version_store`、`frontmatter`、`snapshot`

## 代码规模

- 源码文件数：4
- 代码总行数：2371

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src-tauri/src/skill_scanner.rs` | 686 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 |
| `src-tauri/src/skill_store.rs` | 1295 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照、恢复和废纸篓删除事务。 |
| `src-tauri/src/skill_path_guard.rs` | 303 | 负责 Skill 文件命令的 canonicalization、允许根校验、符号链接逃逸拦截和来源权限矩阵。 |
| `src-tauri/src/version_store.rs` | 87 | 负责扫描 Skill 根目录、解析 frontmatter、读写 Skill、备份、版本快照和恢复。 |

## 对外契约

- scan_skills 返回 SkillSummary
- read_skill 和 update_skill 限制在允许根目录内
- 保存前创建备份和版本快照
- 版本历史按规范化完整路径 SHA256 隔离，单个 Skill 最多保留 20 份快照，最长保留 30 天
- restore_version 恢复前先创建当前版本快照，恢复失败时保持原文件
- CodexUser、AgentsUser、Custom 来源允许本地写入；PluginCache、System、Unknown 来源本地文件默认只读
- 受保护来源允许读取、应用内归档和复制到默认 Codex 用户 Skill 根目录
- delete_skill 只允许可写来源，删除前创建完整目录备份，备份位于被删目录之外，随后将 Skill 目录移入系统废纸篓
- delete_skill 成功返回 Skill 名称、原路径、备份路径、废纸篓结果和恢复说明；废纸篓失败时保留原目录和已创建备份

## 修改规则

- 文件写入必须保留路径安全校验
- 新增文件命令必须复用 `skill_path_guard`
- 破坏性删除禁止使用 `remove_dir_all` 永久删除目标 Skill
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
