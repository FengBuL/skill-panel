# 共享 UI 与通用组件 v3.8.1

## 模块简介

提供 Button、ActionButton、PageHeader、StatusPill、SearchBar、FilterBar、CategoryPill、MetricCard、RiskSummary、SkillRowMini、Toggle、Segment、空状态、错误边界、导出控件等可复用组件。

## 检索关键词

`Button`、`ActionButton`、`PageHeader`、`StatusPill`、`SearchBar`、`FilterBar`、`CategoryPill`、`MetricCard`、`RiskSummary`、`SkillRowMini`、`Toggle`、`Segment`、`EmptyState`、`ErrorBoundary`、`共享组件`

## 代码规模

- 源码文件数：19
- 代码总行数：1197

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/components/ui.tsx` | 79 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/components/ui.css` | 539 | 提供 Button、ActionButton、PageHeader、StatusPill、Modal、Drawer、Template、EmptyState 等无阴影组件样式。 |
| `src/components/ActionButton.tsx` | 34 | 提供 Notion 风格通用操作按钮，支持 primary、ghost、secondary、danger、text。 |
| `src/components/Modal.tsx` | 28 | 提供 Notion 风格弹窗结构。 |
| `src/components/Drawer.tsx` | 14 | 提供 Notion 风格抽屉结构。 |
| `src/components/ErrorState.tsx` | 33 | 提供统一错误状态展示。 |
| `src/components/PageHeader.tsx` | 22 | 提供页面标题、副标题、eyebrow 和右侧操作区布局。 |
| `src/components/StatusPill.tsx` | 25 | 提供健康、异常、警告、信息、归档、只读、收藏等状态徽标。 |
| `src/components/SearchBar.tsx` | 17 | 提供 Library 原型搜索框结构。 |
| `src/components/FilterBar.tsx` | 26 | 提供 Library 原型筛选和排序按钮组。 |
| `src/components/CategoryPill.tsx` | 13 | 提供 Library 原型分类 pill。 |
| `src/components/MetricCard.tsx` | 19 | 提供 Dashboard 指标卡片结构。 |
| `src/components/RiskSummary.tsx` | 16 | 提供 Dashboard 依赖提醒行结构。 |
| `src/components/SkillRowMini.tsx` | 22 | 提供 Dashboard 表格行结构。 |
| `src/common/Ui.tsx` | 95 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/Toast.tsx` | 54 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/EmptyState.tsx` | 65 | 提供统一空状态、扫描中和无搜索结果展示。 |
| `src/common/ErrorBoundary.tsx` | 59 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/SkillExport.tsx` | 37 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |

## 对外契约

- 共享控件保持稳定 props
- 新增 Notion 风格组件保持纯展示属性，页面业务通过调用方传入
- 纯图标按钮提供可访问标签
- 错误边界包裹可恢复 UI 区域

## 修改规则

- 两处以上复用再抽共享组件
- 按钮尺寸和圆角遵守 ui-style-guide.md
- 避免共享组件绑定具体页面业务

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
