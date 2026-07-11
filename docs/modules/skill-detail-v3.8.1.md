# Skill Detail v3.8.1

## 模块简介

负责 Skill 独立详情页、基础信息、文件结构、质量检查、依赖关系和危险操作确认提示。

## 检索关键词

`Detail`、`Skill Detail`、`DetailView`、`FileTree`、`QualityCheck`、`DependencyList`、`DangerZone`、`详情`

## 代码规模

- 源码文件数：7
- 代码总行数：520

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/detail/DetailView.tsx` | 141 | 负责 Skill Detail 原型 DOM 编排、数据选择、操作区和只读确认提示。 |
| `src/detail/detail.css` | 224 | 负责 Skill Detail 原型网格、基础信息、质量检查、依赖表格和危险区样式。 |
| `src/detail/DetailDrawer.tsx` | 29 | 提供详情抽屉外壳，保留给兼容代码和后续扩展。 |
| `src/components/FileTree.tsx` | 31 | 提供文件结构展示组件。 |
| `src/components/QualityCheck.tsx` | 28 | 提供质量检查结果组件。 |
| `src/components/DependencyList.tsx` | 43 | 提供依赖关系列表组件。 |
| `src/components/DangerZone.tsx` | 24 | 提供危险操作区和二次确认提示。 |

## 对外契约

- 详情数据来自 useSkillStore 当前扫描结果和 useUIStore.subParam
- Library 卡片点击进入 `subView: detail`
- 危险操作区只展示确认提示，本批次不调用写入命令

## 修改规则

- 详情页视觉对齐 `detail.html` 原型
- 文件、质量、依赖、危险区保持只读展示
- 删除、归档等危险操作必须保留确认提示

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
