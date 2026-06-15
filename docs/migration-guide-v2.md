# Skill Panel v2.0.0 迁移指南

本指南用于把 Skill Panel v2.0.0 迁移到另一台 Windows 电脑，并尽量恢复同样的 skill、扫描目录、语言、类目颜色和自定义标签。

## 迁移包内容

运行 `scripts/create-migration-package.ps1` 后，会在 `output/migration` 下生成：

- `Skill-Panel-v2.0.0-migration.zip`：完整迁移包。
- `Skill-Panel-v2.0.0/app/Skill Panel_2.0.0_x64-setup.exe`：Windows 安装器。
- `Skill-Panel-v2.0.0/portable/skill-panel.exe`：便携启动文件。
- `Skill-Panel-v2.0.0/config/settings.json`：应用设置，包括语言、扫描目录、类目颜色和 skill 自定义标签。
- `Skill-Panel-v2.0.0/skills/.codex/skills`：Codex 用户 skill。
- `Skill-Panel-v2.0.0/skills/.agents/skills`：Agents 用户 skill。

## 新电脑安装步骤

1. 解压 `Skill-Panel-v2.0.0-migration.zip`。
2. 运行 `app/Skill Panel_2.0.0_x64-setup.exe` 安装应用。
3. 复制 `config/settings.json` 到新电脑的：

   ```text
   %USERPROFILE%\.codex\skill-panel\settings.json
   ```

4. 复制 `skills/.codex/skills` 到新电脑的：

   ```text
   %USERPROFILE%\.codex\skills
   ```

5. 复制 `skills/.agents/skills` 到新电脑的：

   ```text
   %USERPROFILE%\.agents\skills
   ```

6. 启动 Skill Panel，点击重新扫描。

## 自定义扫描目录

如果 `settings.json` 里包含旧电脑的绝对路径，例如 `D:\Team\skills`，新电脑需要满足其中一种条件：

- 创建同样路径并复制对应 skill。
- 打开 Skill Panel 设置，删除旧路径并添加新电脑上的目录。

## 便携启动

`portable/skill-panel.exe` 可直接运行，用于快速验证界面和版本。正式使用建议运行安装器，方便开始菜单和桌面快捷方式管理。

## 可迁移的 UI 数据

v2.0.0 的设置文件会保存：

- 顶部语言选择。
- 自定义扫描目录。
- 是否显示默认扫描目录。
- 左侧类目颜色。
- skill 卡片上的自定义标签和标签颜色。

这些数据都在 `%USERPROFILE%\.codex\skill-panel\settings.json` 中。

## v2.0.0 最新补充

2026-06-16 的最新构建还会迁移 `categoryLabels`，用于保存左侧类目自定义名称。迁移到新电脑后，类目颜色、类目名称、Skill 自定义标签和标签颜色会一起从 `settings.json` 恢复。
