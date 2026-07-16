---
项目: Skill Panel
任务: REL-3.8.3-CANDIDATE-MACOS
版本: 3.8.3
更新时间: 2026-07-16
---

# 开发日志

## 2026-07-16 REL-3.8.3-CANDIDATE-MACOS

### 范围

- 生成 v3.8.3 macOS 单平台候选。
- Windows 候选和 Windows 验证延期。
- 保留 v3.8.2 历史归档、tag 和安装包，不重建、不替换。

### 开工检查

- 分支：`codex/agent-codex-v3.8`
- 开始 HEAD：`53e7ed3136e89cae52638dfdd9372983a918a0c5`
- 工作区起始状态：干净。
- 最近历史 HEAD：`53e7ed3 docs: close v3.8.2 release evidence`
- 起始包版本：npm `3.8.2`，Tauri `3.8.2`，Cargo `3.8.2`。

### 修改内容

- npm、Tauri、Cargo、Cargo.lock 包版本更新为 `3.8.3`。
- 打包配置测试新增 Cargo manifest 版本一致性断言，并改为 v3.8.3 macOS 候选口径。
- 新增发布任务状态、发布就绪、SOP、SOP mindmap、第 8 步准备材料和候选 manifest。

### 验证

| 命令 | 结果 |
|---|---|
| `npm test` | 通过；10 个测试文件，67 个测试用例 |
| `npm run typecheck` | 通过 |
| `npm run build` | 通过 |
| `npm run packaging:check` | 通过；1 个测试文件，6 个测试用例 |
| `npm run cargo:test` | 通过；lib 54 项，bin 0 项，integration 4 项 |
| `npm run visual:qa` | 通过 |
| `npm run git:diff:check` | 候选提交前通过；文档收口后再次通过 |

### 候选证据

- 候选代码提交：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`
- 候选记录提交：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`
- 候选 App bundle：`output/releases/v3.8.3-candidate/Skill Panel.app`
- 候选 App Zip：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.app.zip`
- 候选 App Zip SHA256：`023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e`
- 候选 DMG：`output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg`
- 候选 DMG SHA256：`7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584`
- 构建命令：`PATH="$HOME/.cargo/bin:$PATH" npm run tauri:build:macos`
- macOS 架构：`arm64`
- bundle id：`com.fengbul.skillpanel`
- 应用版本：`3.8.3`

### 构建备注

- 首次运行 `npm run tauri:build:macos` 因当前 shell `PATH` 找不到 `cargo metadata` 失败。
- 加入 `PATH="$HOME/.cargo/bin:$PATH"` 后构建成功。
- 候选包只有 ad-hoc/linker-signed 签名，DMG 没有公证票据。

### 回退点

- Git 回退点：`53e7ed3136e89cae52638dfdd9372983a918a0c5`
- 第 8 步安装基线：`output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`
- 基线 SHA256：`10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`
