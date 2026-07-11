# Dashboard 仪表盘 v3.8.1

## 模块简介

负责展示扫描结果概览、数量指标、状态汇总和快速入口。

## 检索关键词

`Dashboard`、`指标`、`概览`、`统计`

## 代码规模

- 源码文件数：3
- 代码总行数：369

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/dashboard/DashboardView.tsx` | 165 | 负责 Dashboard 原型 DOM 编排、指标计算、最近修改、关注项和依赖提醒。 |
| `src/pages/Dashboard/index.tsx` | 5 | 负责 Dashboard 页面入口并挂载 DashboardView。 |
| `src/pages/Dashboard/Dashboard.css` | 199 | 负责 Dashboard 原型网格、卡片、表格、状态 pill 和依赖提醒样式。 |

## 对外契约

- 数据来源为 useSkillStore 当前 skills
- 指标数值优先来自当前扫描结果，空数据时使用原型占位数据维持页面形态

## 修改规则

- 新增指标先确认数据来源
- 避免重复扫描
- 卡片、表格和状态 pill 遵守 Notion 风格原型视觉密度

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
