# Step 8 Preparation

## Baseline And Candidate

| Item | Path | SHA256 |
|---|---|---|
| v3.8.2 baseline DMG | `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg` | `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d` |
| v3.8.3 candidate DMG | `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg` | `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584` |

## Disposable Test Skill

- Name: `REL-3.8.3 disposable upgrade skill`
- Suggested fields:
  - tag: `release-candidate`
  - category: `Release QA`
  - body: `Temporary Skill for v3.8.3 upgrade and rollback validation.`
- Remove it after Step 8 evidence is collected.

## Before Upgrade Checklist

- Screenshot v3.8.2 app version.
- Screenshot Skill list with the disposable Skill visible.
- Screenshot disposable Skill detail, including title, tag, category, color, and body.
- Record Skill count.
- Record settings language.
- Record configured scan paths.
- Record the app data backup location if one is created.

## After Upgrade Checklist

- Install v3.8.3 candidate DMG.
- Screenshot v3.8.3 app version.
- Confirm disposable Skill remains visible.
- Confirm disposable Skill detail remains intact.
- Confirm settings language remains intact.
- Confirm configured scan paths remain intact.
- Confirm no startup migration error is visible in logs.
- Capture any unsigned app warning dialog.

## Rollback Steps

1. Quit Skill Panel.
2. Install `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`.
3. Launch Skill Panel.
4. Screenshot app version after rollback.
5. Confirm disposable Skill remains visible or record the exact data compatibility issue.
6. Confirm settings language and scan paths remain intact.
7. Capture logs if startup or data loading differs after rollback.

## Required Screenshots

- v3.8.2 app version before upgrade.
- Disposable Skill detail before upgrade.
- v3.8.3 app version after upgrade.
- Disposable Skill detail after upgrade.
- Settings paths after upgrade.
- v3.8.2 app version after rollback.
- Disposable Skill detail after rollback.
- macOS warning dialog for the unsigned internal candidate, if shown.
