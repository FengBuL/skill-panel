# Skill Panel

Skill Panel is a cross-platform desktop app shell for managing local AI skills. This repository starts with a Tauri + React + TypeScript + Rust foundation that supports Windows and macOS.

## Stack

- Tauri 2 desktop runtime
- React 19 and TypeScript frontend
- Rust backend commands under `src-tauri`
- Vite for local frontend development
- Vitest and Testing Library for frontend tests

## Scripts

Install dependencies:

```bash
npm install
```

Run the frontend shell:

```bash
npm run dev
```

Run the desktop app:

```bash
npm run tauri:dev
```

Build the frontend:

```bash
npm run build
```

Run frontend tests:

```bash
npm.cmd test
```

Run Rust tests:

```bash
npm.cmd run cargo:test
```

Run packaging configuration checks:

```bash
npm.cmd run packaging:check
```

Build the Windows NSIS installer:

```bash
npm.cmd run tauri:build:windows
```

Build the optional Windows MSI package:

```bash
npm.cmd run tauri:build:windows:msi
```

Build macOS bundles:

```bash
npm.cmd run tauri:build:macos
```

GitHub Actions can build both desktop targets:

```text
.github/workflows/desktop-build.yml
```

The workflow uploads a Windows NSIS installer and macOS app/dmg artifacts.

## Test Commands

Use these commands from the repository root when validating a development slice:

```bash
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run packaging:check
```

Run Rust tests from a Visual Studio Developer Command Prompt, or from a shell that has loaded the MSVC build environment:

```bash
npm.cmd run cargo:test
```

The Rust command depends on the local Rust toolchain metadata and the Windows MSVC linker. On Windows, install Rust stable for `x86_64-pc-windows-msvc` and Visual Studio Build Tools with the C++ workload before running Rust tests or Tauri builds.

## Packaging

Desktop packaging is configured in `src-tauri/tauri.conf.json` for Windows and macOS:

- Windows targets: NSIS by default; MSI is available through `npm.cmd run tauri:build:windows:msi` when WiX and its Windows feature dependencies are installed.
- macOS targets: `.app` and `.dmg`.
- Application name: `Skill Panel`.
- Bundle identifier: `com.fengbul.skillpanel`.

The repository includes a lightweight generated placeholder icon set under `src-tauri/icons` so Tauri builds can run on Windows and macOS. Replace it with final brand artwork later. To regenerate icons from a source image, place it at `src-tauri/icons/source.png`, then run:

```bash
npm.cmd run tauri:icons
```

The generated files should live under `src-tauri/icons`.

## Migration Package

To move Skill Panel v2.0.1 to another Windows computer, build the app and create a migration package:

```bash
npm.cmd run tauri:build:windows
powershell -ExecutionPolicy Bypass -File scripts/create-migration-package.ps1
```

The script writes `output/migration/Skill-Panel-v2.0.1-migration.zip`. The package includes the Windows installer, a portable executable, the current app settings file, and local `.codex/skills` plus `.agents/skills` folders when they exist.

The detailed migration guide is in `docs/migration-guide-v2.md`.

## Project Layout

- `src/` contains the React frontend and i18n resources.
- `src-tauri/` contains the Rust backend and Tauri configuration.
- `docs/project-plan.md` contains the project plan for the split development work.

## Internationalization

All visible UI text in the shell is read from `src/i18n/resources.ts`. The first shell supports `zh-CN` and `en-US`, with a language selector in the app header.
