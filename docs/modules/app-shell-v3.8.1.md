# 应用壳与导航 v3.8.1

## 模块简介

负责应用启动入口、Notion 风格应用壳、顶栏、主视图切换、次级视图进入和全局监听。

## 检索关键词

`入口`、`AppShell`、`导航`、`TopBar`、`路由`、`Toast`、`safeListen`

## 代码规模

- 源码文件数：11
- 代码总行数：400

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/main.tsx` | 13 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/AppShell.tsx` | 109 | 负责应用启动入口、顶栏、主视图切换、Detail/AI/Dependencies/EmptyStates 次级视图进入和全局监听。 |
| `src/layout/AppShell.tsx` | 1 | 提供 AppShell 的稳定布局目录导出入口。 |
| `src/layout/TopBar.tsx` | 1 | 提供 TopBar 的稳定布局目录导出入口。 |
| `src/router.tsx` | 42 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/App.tsx` | 11 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/components/TopBar.tsx` | 68 | 负责原型单层顶部导航、主入口切换、Library 子视图高亮、Logs/Dependencies 入口和 New Skill 次级入口。 |
| `src/components/TopBar.css` | 100 | 负责顶部导航的白底、细边框、品牌、导航链接和 New Skill 按钮布局。 |
| `src/components/Toast.tsx` | 32 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |
| `src/components/Toast.css` | 8 | 负责应用 Toast 容器的无阴影样式。 |
| `src/lib/tauriEvents.ts` | 15 | 负责应用启动入口、顶栏、主视图切换、次级视图进入和全局监听。 |

## 对外契约

- 主入口通过 `src/layout/AppShell.tsx` 渲染 AppShell
- useUIStore 管理 mainView 和 subView
- safeListen 保护 Tauri 事件监听

## 导航层级

- 顶部主导航固定展示 Dashboard、Library、Logs、Dependencies、Settings。
- Detail、Editor、Create、AI Assistant、Preview 属于 Library 任务链路，不增加顶部入口。
- 打开上述任务页面时，TopBar 继续高亮 Library。
- Editor 需要已选中的 Skill 参数，标准路径为 `Library → Detail → Editor` 或 `Create → Editor`。
- `useUIStore` 的 mainView/subView 是内部渲染状态；产品导航层级以上述主导航与任务页面划分为准。

## 修改规则

- 新增页面入口先扩展 useUIStore 视图状态
- 顶栏使用 64px 单层导航，符合 Library 1:1 原型结构
- 新增任务页面先确定导航归属；Editor、Detail、Create、AI Assistant、Preview 保持 Library 归属
- 全局监听需要在卸载时释放

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
