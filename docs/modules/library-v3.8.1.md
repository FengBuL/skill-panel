# Skill Library v3.8.1

## 模块简介

负责 Skill Library 主页面、顶部搜索筛选、Notion 风格卡片网格、右侧详情面板、卡片选中和进入编辑器。

## 检索关键词

`Library`、`SkillCard`、`DetailPanel`、`筛选`、`Notion`、`卡片网格`

## 代码规模

- 源码文件数：9
- 代码总行数：1010

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/pages/Library/index.tsx` | 100 | 负责 Library 1:1 原型 DOM 编排、搜索、分类 pill、卡片网格、右侧详情面板、单击选中和双击打开 Editor。 |
| `src/pages/Library/Library.css` | 335 | 负责 Library 1:1 原型布局、搜索、分类 pill、卡片网格、详情面板和响应式样式。 |
| `src/components/SkillCard.tsx` | 85 | 提供 Library Notion 风格 Skill 卡片，支持单击选中、双击打开和 Enter 键打开。 |
| `src/detail/DetailPanel.tsx` | 80 | 提供 Library 右侧 340px 详情面板。 |
| `src/library/SkillCard.tsx` | 89 | 旧版卡片组件，保留给兼容代码，Library 新页面不再复用。 |
| `src/store/skillStore.ts` | 143 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/lib/invoke.ts` | 141 | 负责 Skill 扫描调用、前端数据映射、clone_skill 封装和浏览器预览 fallback 数据。 |
| `src/lib/invoke.test.ts` | 31 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |
| `src/lib/skills.ts` | 7 | 负责 Skill 列表、筛选、分页、批量选择、详情抽屉和进入编辑器。 |

## 对外契约

- scanSkills 返回前端 Skill 列表
- useSkillStore 保存搜索、筛选、分页和选中详情状态
- Library 右侧 DetailPanel 只展示概览，卡片单击只更新选中项和右侧详情
- 卡片双击进入 Editor；可编辑来源进入正常 Editor，受保护来源进入只读 Editor
- 卡片获得键盘焦点后按 Enter 执行与双击相同的打开行为
- 返回 Library 后保留搜索、分类筛选和当前选中项

## 修改规则

- 第 1 批顶部分类 pill 使用页面局部状态，避免污染持久筛选状态
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
