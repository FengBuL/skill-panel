# 测试与视觉 QA v3.8.1

## 模块简介

负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。

## 检索关键词

`Vitest`、`Playwright`、`QA`、`packaging`、`visual`

## 代码规模

- 源码文件数：4
- 代码总行数：1120

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src/AppShell.test.tsx` | 435 | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 |
| `src/packaging.config.test.ts` | 71 | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 |
| `src/test/setup.ts` | 2 | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 |
| `scripts/visual-qa.mjs` | 612 | 负责 Vitest、契约测试、打包配置测试、Playwright 视觉检查和测试初始化。 |

## 对外契约

- npm test 覆盖前端行为
- visual:qa 输出截图和报告
- packaging.config.test 校验版本一致
- Detail 受保护来源复制到可编辑目录有前端行为测试
- Detail 归档持久化、复制确认、删除确认和受保护来源删除禁用有前端行为测试

## 修改规则

- 新增用户流程补测试
- 视觉变化更新截图证据
- 测试 mock 需要覆盖浏览器预览降级

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
