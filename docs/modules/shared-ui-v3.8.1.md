# 共享 UI 与通用组件 v3.8.1

## 模块简介

提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。

## 检索关键词

`Button`、`Toggle`、`Segment`、`EmptyState`、`ErrorBoundary`、`共享组件`

## 代码规模

- 源码文件数：7
- 代码总行数：424

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/components/ui.tsx` | 79 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/components/ui.css` | 69 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/Ui.tsx` | 95 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/Toast.tsx` | 54 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/EmptyState.tsx` | 31 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/ErrorBoundary.tsx` | 59 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |
| `src/common/SkillExport.tsx` | 37 | 提供 Button、Toggle、Segment、搜索框、空状态、错误边界、导出控件等可复用组件。 |

## 对外契约

- 共享控件保持稳定 props
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
