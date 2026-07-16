---
project: Skill Panel
task: REL-3.8.3-CANDIDATE-MACOS
version: 3.8.3
platform_scope: macOS
updated_at: 2026-07-16
---

# SOP

## Step 7 macOS Candidate Procedure

1. Confirm branch, HEAD, recent commits, worktree status, diff stat, and version metadata.
2. Confirm signing and notarization prerequisites with read-only checks.
3. Align npm, Tauri, Cargo, and Cargo lock package versions to `3.8.3`.
4. Keep business functionality unchanged.
5. Update version consistency tests.
6. Run full verification:

```bash
npm test
npm run typecheck
npm run build
npm run packaging:check
npm run cargo:test
npm run visual:qa
npm run git:diff:check
```

7. Create the v3.8.3 candidate code commit after verification.
8. Build macOS App and DMG on the current macOS machine. If Cargo is absent from the shell path, run `PATH="$HOME/.cargo/bin:$PATH" npm run tauri:build:macos`.
9. Store candidate artifacts under `output/releases/v3.8.3-candidate/`.
10. Record commit, filenames, sizes, SHA256, architecture, bundle id, app version, build command, tests, signing status, notarization status, and rollback point.

## Gate Interpretation

- Step 7 platform target is macOS.
- Windows baseline gaps block only Windows candidate generation.
- macOS can independently generate a candidate.
- v3.8.2 macOS DMG is the Step 8 baseline.
- Step 8 performs true upgrade, data retention, and installer rollback validation with the v3.8.3 candidate DMG.
- macOS signing and notarization are formal public release gates.
- Without signing and notarization prerequisites, candidate status is macOS internal acceptance candidate and formal release is blocked.

## Step 8 Preparation

### Baseline

- DMG path: `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`
- SHA256: `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`

### Candidate

- DMG path: `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg`
- SHA256: `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584`

### Disposable Test Skill

- Name: `REL-3.8.3 disposable upgrade skill`
- Content: create one simple markdown Skill with a unique title, one tag, and one short body.
- Purpose: verify Skill list persistence, detail view persistence, local file presence, and rollback behavior.

### Upgrade Before Checklist

- Capture installed app version.
- Capture existing Skill count.
- Capture disposable Skill title, tag, color, category, and file path.
- Capture settings language and scan paths.
- Capture app data directory timestamp or backup path.

### Upgrade After Checklist

- Confirm app version is `3.8.3`.
- Confirm disposable Skill remains visible and editable.
- Confirm category, tag, color, and content remain intact.
- Confirm settings language and scan paths remain intact.
- Confirm logs show no startup migration error.

### Rollback Steps

1. Quit Skill Panel.
2. Install the v3.8.2 baseline DMG over the v3.8.3 candidate installation.
3. Launch Skill Panel.
4. Confirm app version returns to `3.8.2`.
5. Confirm disposable Skill and settings remain available or record any migration compatibility issue.
6. Quit Skill Panel and preserve screenshots and logs.

### Required Screenshots

- v3.8.2 app version before upgrade.
- Disposable Skill detail before upgrade.
- v3.8.3 app version after upgrade.
- Disposable Skill detail after upgrade.
- Settings paths after upgrade.
- v3.8.2 app version after rollback.
- Disposable Skill detail after rollback.
- Any macOS warning dialog caused by unsigned internal candidate.
