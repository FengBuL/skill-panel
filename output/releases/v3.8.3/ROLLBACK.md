# Skill Panel v3.8.3 回退说明

## 完整 Git bundle

- GitHub Release 附件：`skill-panel-v3.8.3-rollback.bundle`。
- 本机冷归档：`/Users/shovy/Documents/Skill-Panel-Archive/releases/v3.8.3/skill-panel-v3.8.3-rollback.bundle`。
- SHA256：`a80d24a2debc1f49a96b0ae6a62726eef4397ab9b35036c766071064ba34a6d6`。
- 文件大小超过 GitHub 仓库单文件限制，因此只作为 Release 附件和冷归档保存。

## 回退材料

- 完整 Git bundle：`skill-panel-v3.8.3-rollback.bundle`
- 固定源码归档：`skill-panel-v3.8.3-source.zip`
- 上一正式版本：tag `v3.8.2`
- 上一版本安装包：`output/releases/v3.8.2/`

## 从 bundle 恢复

```bash
git clone skill-panel-v3.8.3-rollback.bundle skill-panel-v3.8.3-restored
cd skill-panel-v3.8.3-restored
git checkout codex/rel-3.8.3-source-release
```

`codex/rel-3.8.3-source-release` 是 bundle 内部保留的归档分支，线上仓库已经完成分支清理。

bundle 中的发布源码提交为：

```text
8da6036ef2d0698de29ca06b3810718cb95f339a
```

## 回退到 v3.8.2

```bash
git checkout v3.8.2
npm install
npm run repo:doctor
npm test
npm run typecheck
npm run build
```

安装包回退使用 `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`。candidate-2 8B 已完成 v3.8.3 到 v3.8.2 的安装包回退和数据保留验证。

## 用户数据

- 回退前保留设置目录和 Skill 根目录备份。
- 禁止直接删除用户 Skill 文件。
- Skill 内容恢复优先使用应用版本快照或用户备份。
- API Key 继续由系统 Keychain 管理，文档和日志禁止记录原始值。
