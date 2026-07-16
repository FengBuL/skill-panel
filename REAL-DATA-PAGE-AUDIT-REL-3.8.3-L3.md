---
task: REL-3.8.3-L3-REAL-DATA-PAGE-01
version: 3.8.3
updated_at: 2026-07-16
status: candidate-1 failed, candidate-2 fix batch
---

# Real Data Page Audit

## Scope

Audit target: user-visible pages in the v3.8.3 macOS candidate after the Step 8 install failure.

Rules applied:
- Production install must not replace failed real scans with demo Skill data.
- Missing backend data is shown as `暂无数据` or `尚未接入`.
- Demo data is allowed only in explicit demo mode, tests, or development prototypes.

## Page Conclusions

| Page | Data source | Previous issue | Current handling |
|---|---|---|---|
| Dashboard | `useSkillStore.skills` real scan result | Empty store showed fallback counts, recent rows, call totals, dependency hints | Real Skill totals only; call metrics show `暂无数据`; dependency hints show `尚未接入`; empty rows show empty states |
| Library | `scan_skills` via Tauri invoke | Any scan error returned `MOCK_SKILLS`; first six cards only | Scan success, empty, error, and explicit demo states are separate; no mock on error; real pagination added |
| DetailPanel | selected Skill from store | Null selection rendered `aihot-query` fallback, fake version, fake usage, fake file counts | Null selection renders `暂无数据`; missing version, usage, first seen, references show `暂无数据` or `尚未接入` |
| DetailView | selected Skill from store and `load_app_settings` | Fallback Skill, fake version, author, file structure, usage time | Fallback is no-data placeholder; fake version, author, file structure, and usage removed |
| Editor | `read_skill`, `update_skill`, `validate_skill`, version commands | No-skill editor used built-in Browser Control and aihot markdown | Unloaded editor starts with empty draft; selected Skill content comes from `read_skill`; validate failure shows explicit fail |
| Logs | `get_call_logs` | Detail panel used a fixed call id | Log rows are real backend results or empty; fixed detail id remains `尚未接入` follow-up if log ids are added |
| Dependencies | none yet | Hardcoded dependency graph, risk counts, and table rows | Page now reports `尚未接入`; dependency table is empty until real backend analysis exists |
| ValidationResult | `validate_skill` result | Default checks showed passing items | No checks renders `暂无校验结果`; validate failure renders failure |
| AI Assistant | `hasApiKey`; Editor AI flow for actual calls | Displayed sample diff without real AI result | Sample diff removed; no result renders `暂无 Diff 数据` |

## Mock And Demo Policy

- `MOCK_SKILLS` remains only for explicit demo mode controlled by `skill-panel-demo-mode=true` or `VITE_SKILL_PANEL_DEMO=true`.
- Normal browser preview without explicit demo now shows scan failure or empty state.
- Tauri install scan failure now returns an error state with sanitized error text and no demo data.

## Remaining Low Priority Follow-Ups

- Logs detail can show a real call id when `get_call_logs` returns one.
- Dependencies can be connected to `analyze_deps` output once a page-level aggregation command exists.
- Editor can add an explicit new-Skill template flow separate from loaded Skill editing.
