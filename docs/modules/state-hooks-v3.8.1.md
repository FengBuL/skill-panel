# 前端状态与 Hooks v3.8.1

## 模块简介

负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。

## 检索关键词

`zustand`、`hooks`、`偏好`、`拖拽`、`键盘`、`查询`

## 代码规模

- 源码文件数：7
- 代码总行数：689

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/store/uiStore.ts` | 78 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/stores/SkillPanelProvider.tsx` | 130 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/hooks/useDebouncedValue.ts` | 16 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/hooks/usePreferencePersistence.ts` | 48 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/hooks/useDragDrop.ts` | 171 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/hooks/useKeyboardNav.ts` | 97 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |
| `src/hooks/useSkillQuery.ts` | 149 | 负责 UI 状态、偏好持久化、搜索防抖、拖拽、键盘导航和 Skill 查询。 |

## 对外契约

- useUIStore 控制主视图和次级视图
- Hook 只处理单一交互职责
- 偏好持久化保持浏览器兼容

## 修改规则

- 跨页面状态集中到 store
- 局部交互优先留在页面组件
- Hook 输入输出保持清晰

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
