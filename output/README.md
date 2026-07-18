# 产物与证据地图

## 发布产物

| 目录 | 版本阶段 | 状态 |
|---|---|---|
| `releases/v3.8.2/` | v3.8.2 | 最新正式版本及回退基线 |
| `releases/v3.8.3-candidate/` | v3.8.3 candidate-1 | 历史失败候选，禁止覆盖 |
| `releases/v3.8.3-candidate-2/` | v3.8.3 candidate-2 | macOS 8A 与 8B 通过的内部候选 |

每个发布目录内的 manifest、`FILES.txt` 和 `SHA256SUMS.txt` 共同定义产物身份。

## QA 证据

| 目录 | 版本阶段 | 内容 |
|---|---|---|
| `qa/v3.8.3/` | v3.8.3 | Playwright 视觉截图和 `visual-qa-report.json` |

运行 `npm run visual:qa` 会刷新当前 `3.8.3` QA 目录。版本升级时需要同步调整脚本输出目录和本文件。

## 可重新生成目录

- 根目录 `dist/`：前端构建结果。
- `src-tauri/target/`：Rust 与 Tauri 构建缓存。
- `node_modules/`：npm 依赖。

这些目录不用于判断正式版本或候选身份。
