---
项目: Skill Panel
任务: REL-3.8.3-CANDIDATE-MACOS
版本: 3.8.3
目标平台: macOS
更新时间: 2026-07-18
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
| 第 8 步 candidate-1 安装验收 | 验证失败 | 用户在 2026-07-16 发现安装版显示虚拟 Skill 数据，Library 无分页，超过 100 个 Skill 无法访问剩余内容。历史失败候选保留。 |
| L3 修复批次 | 已完成 | 任务 `REL-3.8.3-L3-REAL-DATA-PAGE-01`；继续使用版本 `3.8.3`；candidate-2 产物位于 `output/releases/v3.8.3-candidate-2/`。 |
| candidate-2 8A 人工验收 | 已通过 | 用户确认真实 Skill、分页、搜索筛选、页码重置和 Library → Detail → Editor → Detail → Library 流程正常；暂未发现新的 8A 问题。 |
| candidate-2 8B 安装升级与回退验收 | 已通过 | 已完成安全备份、v3.8.2 基线安装、candidate-2 升级、v3.8.2 回退和用户确认后的 candidate-2 最终安装；设置与源 Skill 指纹保持一致。 |

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

## 2026-07-16 第 8 步失败更正

- 失败候选代码 commit：`17bde2b4130a564faf81b23cd2c7c4bcb433db8d`。
- 失败候选记录 commit：`cc2a155b69f92bb8e35d15e919f29166f5ac9c16`。
- 失败现象：安装版没有加载本机真实 Skill，Library 只显示少量 Skill 且缺少分页。
- 原候选目录和 SHA256 必须保留：`output/releases/v3.8.3-candidate/`。
- 修复通过后仅生成 candidate-2，禁止创建正式 tag，禁止正式发布。

## 2026-07-17 至 2026-07-18 candidate-2 8A 和 8B

- 8A 结论：人工验收通过。
- 8B 任务编号：`REL-3.8.3-L3-CANDIDATE-2-8B`。
- 当前 HEAD：`57b29aeef5149e109ac016375968416c65e880cb`。
- v3.8.2 基线 DMG：`output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`。
- v3.8.2 SHA256：`10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`。
- candidate-2 DMG：`output/releases/v3.8.3-candidate-2/Skill Panel_3.8.3_aarch64.dmg`。
- candidate-2 SHA256：`a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688`。
- 8B 备份：`~/.codex/skill-panel-acceptance-backups/REL-3.8.3-GOVERNANCE-20260718-123946/`。
- 8B 证据：`output/releases/v3.8.3-candidate-2/8b-evidence/`。
- v3.8.2 基线、candidate-2 升级和 v3.8.2 回退均完成启动与版本验证。
- candidate-2 升级与最终安装均显示 120 个真实 Skill、20 页分页，末页范围为 `115–120 / 120`。
- `settings.json` SHA256 全程保持 `c7b887458ed8fd4f31342f90facf6c2c8b237646b188ae70e1131d67b238fdb6`。
- `~/.codex/skills` 的 12 个 `SKILL.md` 与 `~/.agents/skills` 的 216 个 `SKILL.md` 数量和组合 SHA256 全程一致。
- 用户已确认重新安装 candidate-2；本机最终安装版本为 `3.8.3`。
- 8B 结论：安装、升级、回退和数据保留验证通过。
- 发布限制：即使 8B 通过，macOS 正式对外发布仍需签名和公证条件；未解决前禁止正式 tag 和发布。
