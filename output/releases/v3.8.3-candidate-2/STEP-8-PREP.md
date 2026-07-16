# v3.8.3 candidate-2 第 8 步安装验收准备

## 安装包

- App Zip：`output/releases/v3.8.3-candidate-2/Skill Panel_3.8.3_aarch64.app.zip`
- DMG：`output/releases/v3.8.3-candidate-2/Skill Panel_3.8.3_aarch64.dmg`
- SHA256：
  - App Zip：`c2ad0df7cb7b165d533c3d2ebf85a316cfe9375774e44a4afa87c6cab360f426`
  - DMG：`a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688`

## 本轮重点验收

- Library 加载本机真实 Skill。
- 扫描失败时显示失败状态，不能显示演示 Skill。
- 空扫描结果显示“未发现 Skill”。
- Library 支持分页、搜索后回到第 1 页、筛选后回到第 1 页。
- 100 个以上 Skill 时能进入最后一页。
- Detail 返回 Library 后保留分页、搜索、分类和选中项。
- AppShell 文件监听重新扫描失败时保留当前真实列表。

## 发布边界

- 禁止创建正式 tag。
- 禁止发布。
- 保留失败候选目录 `output/releases/v3.8.3-candidate/`。
