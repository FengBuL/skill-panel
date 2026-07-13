# Skill Panel v3.8.2 回退说明

## 回退材料

- Git 回退包：`skill-panel-v3.8.2-rollback.bundle`
- 源码归档：`skill-panel-v3.8.2-source.zip`
- 当前安装包：`Skill Panel_3.8.2_aarch64.dmg`
- 当前 App Zip：`Skill Panel_3.8.2_aarch64.app.zip`

## 可用代码点

- v3.8.2 tag 目标：`2b53d5487bf5c54acf4cfb13ad7fd517bfc60ac4`
- v3.8.2 发布代码点：`65140b081962a0177b56c1cf14c572515f320e4e`
- Dashboard 视觉 QA 修复点：`421cafc9b51cb1245beb06a4a59d736b9b432d50`
- 文档同步点：`43996ef40aabb1491ea068991d7e3751bb074851`
- v3.8.1 UI 迁移基线：`80816e52cb1e58f7f7d2ede5543fb983788fbfce`
- 历史 tag：`v3.0.0`、`v2.0.0`

## 从 Git 回退包恢复仓库

```bash
mkdir -p /tmp/skill-panel-restore
cd /tmp/skill-panel-restore
git clone /path/to/skill-panel-v3.8.2-rollback.bundle skill-panel
cd skill-panel
git checkout v3.8.2
```

## 回退到发布代码点

```bash
git checkout 65140b081962a0177b56c1cf14c572515f320e4e
npm install
npm test
npm run typecheck
npm run build
```

## 回退到 v3.8.1 UI 基线

```bash
git checkout 80816e52cb1e58f7f7d2ede5543fb983788fbfce
npm install
npm test
npm run typecheck
npm run build
```

## 安装包回退边界

本目录已归档 v3.8.2 macOS 安装包。当前本机未找到 v3.8.1、v3.0.0 或 v2.0.0 的对应 macOS/Windows 安装包副本，安装层面的上一版回退包仍需从历史 Release 或 CI artifact 补齐。

## 用户数据注意事项

- 回退前保留用户设置目录和 Skill 根目录备份。
- 避免直接删除用户 Skill 文件。
- 如果需要恢复 `SKILL.md` 内容，优先使用应用版本快照或用户备份。
