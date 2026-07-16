---
project: Skill Panel
task: REL-3.8.3-CANDIDATE-MACOS
version: 3.8.3
platform_scope: macOS
updated_at: 2026-07-16
---

# Current Plan

## Batch Status

| Step | Status | Notes |
|---|---|---|
| Read-only start checks | done | Branch and HEAD matched the task input; worktree started clean. |
| Version alignment | done | npm, Tauri, Cargo, and Cargo lock package metadata are `3.8.3`. |
| Version consistency test | done | Packaging config test checks npm, Tauri, and Cargo manifest versions. |
| Step 7 documentation | done | macOS single-platform gate and Windows deferral are documented. |
| Full verification | done | `npm test`, typecheck, build, packaging check, Cargo tests, visual QA, diff check passed. |
| Candidate commit | done | `17bde2b4130a564faf81b23cd2c7c4bcb433db8d`. |
| macOS App and DMG build | done | Stored in `output/releases/v3.8.3-candidate/`. |
| Step 8 preparation | done | Baseline, candidate package, checklists, rollback steps, and screenshot list are recorded. |

## Gate Rules

- Target platform for Step 7 is macOS.
- Windows is deferred and must not be reported as verified.
- Missing Windows baseline blocks only the Windows candidate.
- macOS candidate generation can proceed using the v3.8.2 macOS DMG as Step 8 baseline.
- Formal macOS public release remains blocked without Developer ID signing and notarization.

## Validation Commands

```bash
npm test
npm run typecheck
npm run build
npm run packaging:check
npm run cargo:test
npm run visual:qa
npm run git:diff:check
```

## Candidate Records

- Candidate code commit: `17bde2b4130a564faf81b23cd2c7c4bcb433db8d`
- Build command: `PATH="$HOME/.cargo/bin:$PATH" npm run tauri:build:macos`
- Output directory: `output/releases/v3.8.3-candidate/`
- Rollback point: `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg` and Git HEAD before this task `53e7ed3136e89cae52638dfdd9372983a918a0c5`.

## Candidate Artifacts

| File | Size bytes | SHA256 |
|---|---:|---|
| `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.app.zip` | `4952711` | `023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e` |
| `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg` | `4964044` | `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584` |
