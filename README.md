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
npm test
```

Run Rust tests:

```bash
npm run cargo:test
```

## Project Layout

- `src/` contains the React frontend and i18n resources.
- `src-tauri/` contains the Rust backend and Tauri configuration.
- `docs/project-plan.md` contains the project plan for the split development work.

## Internationalization

All visible UI text in the shell is read from `src/i18n/resources.ts`. The first shell supports `zh-CN` and `en-US`, with a language selector in the app header.
