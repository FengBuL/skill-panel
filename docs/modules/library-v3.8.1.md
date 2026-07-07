# Skill Library v3.8.1

## 模块简介

负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。

## 检索关键词

`Library`、`SkillCard`、`筛选`、`分页`、`抽屉`、`批量`

## 代码规模

- 源码文件数：7
- 代码总行数：1094

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/pages/Library/index.tsx` | 173 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/pages/Library/Library.css` | 523 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/library/SkillCard.tsx` | 89 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/store/skillStore.ts` | 143 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/lib/invoke.ts` | 128 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/lib/invoke.test.ts` | 31 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/lib/skills.ts` | 7 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |

## 对外契约

- scanSkills 返回前端 Skill 列表
- useSkillStore 保存筛选、分页、抽屉状态
- Drawer 只读预览并进入 Editor

## 修改规则

- 筛选规则集中放在 skillStore
- 扫描数据映射集中放在 lib/invoke.ts
- 卡片布局需要通过视觉 QA 检查

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
