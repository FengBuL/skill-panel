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

## Test Commands

Use these commands from the repository root when validating a development slice:

```bash
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

Run Rust tests from `src-tauri`:

```bash
C:\Users\12925\.cargo\bin\cargo.exe test
```

The Rust command depends on the local Rust toolchain metadata. If `cargo.exe test` fails before compiling because the stable toolchain manifest cannot be read or synced, treat that as an environment risk and rerun after the local toolchain is repaired.

## Project Layout

- `src/` contains the React frontend and i18n resources.
- `src-tauri/` contains the Rust backend and Tauri configuration.
- `docs/project-plan.md` contains the project plan for the split development work.

## Internationalization

All visible UI text in the shell is read from `src/i18n/resources.ts`. The first shell supports `zh-CN` and `en-US`, with a language selector in the app header.
