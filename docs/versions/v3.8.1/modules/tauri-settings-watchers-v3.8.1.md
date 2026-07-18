# 后端设置与文件监听 v3.8.1

## 模块简介

负责设置文件读写、默认扫描目录、文件变化监听和 scan-changed 事件。

## 检索关键词

`settings_store`、`watcher`、`scan-changed`、`settings.json`

## 代码规模

- 源码文件数：2
- 代码总行数：325

## 代码文件清单

| 源码路径 | 行数 | 责任 |
| --- | ---: | --- |
| `src-tauri/src/settings_store.rs` | 279 | 负责设置文件读写、默认扫描目录、文件变化监听和 scan-changed 事件。 |
| `src-tauri/src/watcher.rs` | 46 | 负责设置文件读写、默认扫描目录、文件变化监听和 scan-changed 事件。 |

## 对外契约

- load_app_settings 读取默认设置
- save_app_settings 原子写入设置文件
- watch_scan_dirs 触发 scan-changed 事件

## 修改规则

- 设置迁移兼容缺失字段
- 监听路径需要去重
- 浏览器模式前端要能降级

## 解耦要求

- 模块内部优先完成自身逻辑聚合。
- 跨模块调用优先通过类型契约、store、hook 或 Tauri 命令。
- 页面层只编排交互，通用逻辑沉淀到对应模块。
- 后端能力通过命令层暴露，前端避免直接假设后端文件结构。

## 修改入口

1. 先在 `docs/modules/module-index-v3.8.1.md` 找到模块。
2. 再打开本文件确认源码路径和边界。
3. 修改源码后更新相关测试和本文档行数。
