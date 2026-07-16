---
project: Skill Panel
version: 3.8.3
release_task: REL-3.8.3-CANDIDATE-MACOS
platform_scope: macOS
status: macOS internal acceptance candidate ready for Step 8
updated_at: 2026-07-16
---

# Project State

## Current Release Task

- Task: `REL-3.8.3-CANDIDATE-MACOS`
- Scope: macOS single-platform candidate.
- Branch: `codex/agent-codex-v3.8`
- Start HEAD: `53e7ed3136e89cae52638dfdd9372983a918a0c5`
- Candidate code commit: `17bde2b4130a564faf81b23cd2c7c4bcb433db8d`
- Version: `3.8.3`
- Bundle id: `com.fengbul.skillpanel`
- macOS architecture: `arm64`
- Candidate status: macOS internal acceptance candidate, blocked for formal public release until signing and notarization are available.

## Step 7 Gate

- Step 6 is closed with the conclusion: historical evidence is bounded and missing evidence is explicit.
- Windows baseline gaps only block the Windows candidate.
- macOS can generate an independent candidate.
- `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg` is the Step 8 macOS upgrade and rollback baseline.
- Real upgrade and installer rollback will be verified in Step 8 using the v3.8.3 candidate package.
- macOS signing and notarization are gates for formal public release.
- When signing prerequisites are absent, the candidate state is macOS internal acceptance candidate with formal release blocked.

## Signing And Notarization

- Developer ID Application certificate: unavailable on this machine during read-only check.
- codesign identity: `security find-identity -v -p codesigning` reported `0 valid identities found`.
- notarization profile: `xcrun notarytool history` reported credentials are required.
- Formal release status: blocked by missing signing or notarization conditions.

## Release Artifacts

| Item | Path | SHA256 | Size | Status |
|---|---|---|---:|---|
| v3.8.2 baseline DMG | `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg` | `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d` | `4320791` | Step 8 baseline |
| v3.8.3 candidate App Zip | `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.app.zip` | `023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e` | `4952711` | internal acceptance candidate |
| v3.8.3 candidate App bundle | `output/releases/v3.8.3-candidate/Skill Panel.app` | directory bundle | `13480 KiB` | internal acceptance candidate |
| v3.8.3 candidate DMG | `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg` | `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584` | `4964044` | internal acceptance candidate |

## Known Risks

- Windows candidate and Windows verification are deferred.
- Formal public macOS release is blocked until Developer ID signing and notarization can be completed and verified.
- Step 8 manual upgrade, data retention, and rollback validation has not started in this task.
