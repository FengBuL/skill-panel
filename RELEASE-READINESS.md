---
project: Skill Panel
task: REL-3.8.3-CANDIDATE-MACOS
version: 3.8.3
platform_scope: macOS
readiness: internal_acceptance_candidate_ready_for_step_8
updated_at: 2026-07-16
---

# Release Readiness

## Status

- Step 7 target platform: macOS.
- Candidate type: macOS internal acceptance candidate.
- Windows status: deferred.
- Formal public release: blocked until signing and notarization conditions are available and verified.
- Candidate code commit: `17bde2b4130a564faf81b23cd2c7c4bcb433db8d`

## Step 7 Threshold

- Step 6 conclusion is accepted: historical evidence is bounded and missing evidence is explicit.
- Missing Windows baseline blocks Windows candidate generation.
- Missing Windows baseline does not block macOS candidate generation.
- v3.8.2 macOS DMG is the Step 8 upgrade and rollback baseline.
- Real upgrade and installer rollback are Step 8 activities and must use the v3.8.3 candidate package.
- macOS signing and notarization are formal public release gates.
- If signing conditions remain absent, the candidate is recorded as macOS internal acceptance candidate and formal release stays blocked.

## Signing And Notarization Readiness

| Check | Result |
|---|---|
| Developer ID Application certificate | unavailable |
| codesign identity | unavailable; `0 valid identities found` |
| notarization profile | unavailable; notarytool requires credentials |
| codesign verification | failed on candidate App: `code has no resources but signature indicates they must be present` |
| spctl verification | `accepted` with `source=no usable signature` and `override=security disabled`; not release evidence |
| stapler verification | failed; no stapled ticket |

## Step 8 Inputs

| Input | Value |
|---|---|
| Baseline DMG | `output/releases/v3.8.2/Skill Panel_3.8.2_aarch64.dmg` |
| Baseline SHA256 | `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d` |
| Candidate DMG | `output/releases/v3.8.3-candidate/Skill Panel_3.8.3_aarch64.dmg` |
| Candidate SHA256 | `7a89a7335f8a8b0cc250cb8f28a544e0a1f27a396932dc95d170ffca2202b584` |
| Test Skill | `REL-3.8.3 disposable upgrade skill` |
| Upgrade status | waiting for Step 8 manual validation |
| Rollback status | waiting for Step 8 manual validation |

## Formal Release Blockers

- Developer ID Application signing identity is unavailable on the current machine.
- Notarization credentials or profile are unavailable on the current machine.
- Gatekeeper, stapler, and full signed package checks cannot be completed until signing and notarization conditions are restored.
- Windows candidate, Windows install, Windows upgrade, Windows rollback, Credential Store, and system trash checks are deferred.
