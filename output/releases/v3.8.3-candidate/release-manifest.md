# Skill Panel v3.8.3 macOS Candidate Manifest

## Basic Info

- Task: `REL-3.8.3-CANDIDATE-MACOS`
- Candidate code commit: `17bde2b4130a564faf81b23cd2c7c4bcb433db8d`
- Branch: `codex/agent-codex-v3.8`
- Version: `3.8.3`
- Platform scope: macOS only.
- Candidate status: macOS internal acceptance candidate.
- Formal public release: blocked by missing signing or notarization conditions.
- Build machine architecture: `arm64`
- Bundle id: `com.fengbul.skillpanel`

## Build

- First attempted command: `npm run tauri:build:macos`
- First attempt result: failed because `cargo metadata` was unavailable from the current shell `PATH`.
- Successful command: `PATH="$HOME/.cargo/bin:$PATH" npm run tauri:build:macos`
- Tauri output:
  - `src-tauri/target/release/bundle/macos/Skill Panel.app`
  - `src-tauri/target/release/bundle/dmg/Skill Panel_3.8.3_aarch64.dmg`
- Candidate output directory: `output/releases/v3.8.3-candidate/`

## Files

| File | Size bytes | SHA256 | Notes |
|---|---:|---|---|
| `Skill Panel.app` | `13803520` | directory bundle | Copied from Tauri bundle output; `du -sk` reported `13480`. |
| `Skill Panel_3.8.3_aarch64.app.zip` | `4952711` | `023eefb46efb83baf94f8471538389602ff529fbb2b6fba936ca02aea713fe1e` | App bundle zip for file-level checksum. |
| `Skill Panel_3.8.3_aarch64.dmg` | `4964044` | `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584` | Candidate installer DMG. |

## Package Metadata

| Check | Result |
|---|---|
| App `CFBundleIdentifier` | `com.fengbul.skillpanel` |
| App `CFBundleShortVersionString` | `3.8.3` |
| App `CFBundleVersion` | `3.8.3` |
| Binary architecture | `arm64` |
| DMG mount check | read-only attach succeeded |
| DMG App version check | `3.8.3` |
| DMG App bundle id check | `com.fengbul.skillpanel` |
| DMG executable check | executable bit present |

## Verification

| Command | Result |
|---|---|
| `npm test` | passed; 10 files, 67 tests |
| `npm run typecheck` | passed |
| `npm run build` | passed |
| `npm run packaging:check` | passed; 1 file, 6 tests |
| `npm run cargo:test` | passed; 54 lib tests, 0 bin tests, 4 integration tests |
| `npm run visual:qa` | passed |
| `npm run git:diff:check` | passed before candidate commit |

## Signing And Notarization

| Check | Result |
|---|---|
| Developer ID Application certificate | unavailable on current machine |
| codesign identity | unavailable; `0 valid identities found` |
| notarization profile | unavailable; notarytool required credentials |
| `codesign --verify --deep --strict --verbose=4` | failed: `code has no resources but signature indicates they must be present` |
| `codesign -dv --verbose=4` | `Signature=adhoc`; `TeamIdentifier=not set` |
| `spctl -a -vv -t install` | `accepted`, with `source=no usable signature` and `override=security disabled`; this is not Gatekeeper release evidence |
| `xcrun stapler validate` | failed; DMG has no stapled ticket |

## Rollback Point

- Git rollback point: `53e7ed3136e89cae52638dfdd9372983a918a0c5`
- Step 8 baseline DMG: `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg`
- Step 8 baseline SHA256: `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`

## Step 8 Status

- Step 8 manual upgrade, data retention, and installer rollback validation has not been executed in this task.
- Candidate can enter Step 8 on the local macOS machine as an internal acceptance candidate.
- Any unsigned-app warning dialogs must be captured in Step 8 screenshots.
