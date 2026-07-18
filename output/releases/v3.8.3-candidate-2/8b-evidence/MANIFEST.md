# Skill Panel Governance Backup Manifest

- Created: 2026-07-18 12:39:46 Asia/Shanghai
- Candidate branch: `codex/agent-codex-v3.8`
- Candidate HEAD: `57b29aeef5149e109ac016375968416c65e880cb`
- Installed application version before 8B: `3.8.3`
- Installed application path: `/Applications/Skill Panel.app`
- Candidate DMG SHA256: `a51cfae2aaec4a7325954d7af28815a513febea1346a5d21ce9034c378cd8688`
- Baseline DMG SHA256: `10a4596485037ae6e54f866000b35386e7dc61ab4cdba0cf9c3a1a2723401e1d`

## Application Data

- `settings.json` SHA256: `c7b887458ed8fd4f31342f90facf6c2c8b237646b188ae70e1131d67b238fdb6`
- `audit.log` SHA256: `2e82b3329d8ab4f6302cf51a8da8252304b972fcba79fa3870476d6bec9e0547`
- preferences plist SHA256: `0282e0f3323ca19bb6c5c6f459569213b3c6af94d0a4ab935d5a1594ec35f60b`
- Versions directory: absent
- Call log file: absent

## Skill Fingerprints

- `~/.codex/skills`: 12 `SKILL.md` files; combined SHA256 `366c74b9b1b35941e71ad088dcbf65cb9c7d46ec4b6caeb01755e1fbacc95eb5`
- `~/.agents/skills`: 216 `SKILL.md` files; combined SHA256 `f6a008b568cfd8ce44a189339f0dc38f4a06e92d683251c7a2c6bf9c7009479d`

## Repository Protection

- Dirty document patch SHA256: `d6f7dff756d4c0585c5590930d21add1a6e4d2ffd639c769ad5ba63c1f50e8a2`
- Protected v3.8 UI branch: `archive/pre-governance-v38-ui-parity-20260718`
- Protected candidate branch: `archive/pre-governance-v383-candidate2-20260718`
- Protected v3.9 mixed branch: `archive/pre-governance-v39-mixed-20260718`

This backup is read-only evidence for the v3.8.3 8B and repository-governance work. Original application data and Skill files remain in place.

## 8B Automated Sequence

- Fresh candidate source verification: 80 frontend tests, 6 packaging checks, 56 Rust library tests, and 4 Rust contract tests passed; typecheck and production build exited with code 0.
- Baseline install: v3.8.2 DMG mounted read-only and installed successfully.
- Candidate upgrade: candidate-2 DMG mounted read-only and installed as v3.8.3.
- Candidate Library evidence: 120 scanned Skills, 20 pages, and last-page range `115-120 / 120`.
- Rollback: v3.8.2 DMG installed successfully after candidate verification.
- Post-rollback installed version: `3.8.2`.
- `settings.json` SHA256 stayed `c7b887458ed8fd4f31342f90facf6c2c8b237646b188ae70e1131d67b238fdb6` throughout the sequence.
- Both Skill root counts and combined hashes stayed equal to the pre-8B fingerprints.

## Screenshots

- `v3.8.2-baseline-window.png`
- `v3.8.3-candidate2-upgrade-window.png`
- `v3.8.3-candidate2-upgrade-pagination.png`
- `v3.8.3-candidate2-upgrade-last-page.png`
- `v3.8.3-candidate2-upgrade-settings.png`
- `v3.8.3-candidate2-upgrade-settings-top.png`
- `v3.8.2-rollback-window.png`
- `v3.8.2-rollback-pagination.png`

## Final State

The user confirmed candidate-2 reinstallation. The final installed application is v3.8.3, the Library shows 120 real Skills across 20 pages, and the source Skill and settings fingerprints remain unchanged.
