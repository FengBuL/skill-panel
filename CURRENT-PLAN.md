---
项目: Skill Panel
任务: REL-3.8.3-CANDIDATE-MACOS
版本: 3.8.3
目标平台: macOS
更新时间: 2026-07-16
---

# 当前计划

## 批次状态

| 步骤 | 状态 | 说明 |
|---|---|---|
| 只读开工检查 | 已完成 | 分支和 HEAD 与任务输入一致；工作区起始状态干净。 |
| 版本统一 | 已完成 | npm、Tauri、Cargo、Cargo.lock 包版本均为 `3.8.3`。 |
| 版本一致性测试 | 已完成 | 打包配置测试已覆盖 npm、Tauri、Cargo manifest 版本一致性。 |
| 第 7 步文档 | 已完成 | 已记录 macOS 单平台门槛和 Windows 延期。 |
| 完整验证 | 已完成 | `npm test`、typecheck、build、packaging check、Cargo tests、visual QA、diff check 全部通过。 |
| 候选代码提交 | 已完成 | `17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。 |
| macOS App 和 DMG 构建 | 已完成 | 已存放于 `output/releases/v3.8.3-candidate/`。 |
| 第 8 步准备 | 已完成 | 已记录基线、候选包、检查清单、回退步骤和截图要求。 |

## 门槛规则

- 第 7 步目标平台为 macOS。
- Windows 延期，不能写成 Windows 已验证。
- Windows 基线缺失只阻塞 Windows 候选。
- macOS 候选生成使用 v3.8.2 macOS DMG 作为第 8 步基线。
- 没有 Developer ID 签名和公证时，macOS 正式发布保持阻塞。

## 验证命令

```bash
npm test
npm run typecheck
npm run build
npm run packaging:check
npm run cargo:test
npm run visual:qa
npm run git:diff:check
```

## 候选记录

- 候选代码提交：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`
- 构建命令：`PATH="$HOME/.cargo/bin:$PATH" npm run tauri:build:macos`
- 输出目录：`output/releases/v3.8.3-candidate/`
- 回退点：`output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg` 和本任务开始前 Git HEAD `53e7ed3136e89cae52638dfdd9372983a918a0c5`。

## 候选产物

| 文件 | 大小 bytes | SHA256 |
|---|---:|---|
| `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.app.zip` | `4952711` | `023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e` |
| `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg` | `4964044` | `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584` |
