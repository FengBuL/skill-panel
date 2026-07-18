import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const ACTIVE_DOCS = [
  'AGENTS.md',
  'README.md',
  'PROJECT_STATE.md',
  'CURRENT-PLAN.md',
];

export function checkVersionAlignment({
  packageVersion,
  tauriVersion,
  cargoVersion,
}) {
  const failures = [];

  if (tauriVersion !== packageVersion) {
    failures.push(
      `src-tauri/tauri.conf.json version ${tauriVersion} does not match package.json ${packageVersion}`,
    );
  }

  if (cargoVersion !== packageVersion) {
    failures.push(
      `src-tauri/Cargo.toml version ${cargoVersion} does not match package.json ${packageVersion}`,
    );
  }

  return failures;
}

export function checkEntrypoints({ mainSource, appSource }) {
  const failures = [];
  const currentShellImport = /from\s+['"]\.\/layout\/AppShell['"]/;

  if (!currentShellImport.test(mainSource)) {
    failures.push('src/main.tsx must import ./layout/AppShell');
  }

  if (!currentShellImport.test(appSource)) {
    failures.push('src/App.tsx must import ./layout/AppShell');
  }

  return failures;
}

export function checkActiveDocs(documents) {
  const failures = [];
  const retiredObsidianPath =
    /\/notes\/skill panel\/(?:PROJECT_STATE|CURRENT-PLAN|DEVELOPMENT-LOG)\.md/;

  for (const document of documents) {
    if (document.content.includes('codex/skill-panel-app')) {
      failures.push(
        `${document.path} contains retired branch codex/skill-panel-app`,
      );
    }

    if (retiredObsidianPath.test(document.content)) {
      failures.push(`${document.path} contains the retired Obsidian project path`);
    }
  }

  return failures;
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(REPO_ROOT, path), 'utf8'));
}

function readText(path) {
  return readFileSync(resolve(REPO_ROOT, path), 'utf8');
}

function cargoPackageVersion(source) {
  const packageSection = source.match(/^\[package\]\s*([\s\S]*?)(?=^\[|\Z)/m);
  const version = packageSection?.[1].match(/^version\s*=\s*"([^"]+)"/m)?.[1];

  if (!version) {
    throw new Error('Unable to read package version from src-tauri/Cargo.toml');
  }

  return version;
}

function checkMainAncestry() {
  try {
    execFileSync(
      'git',
      ['merge-base', '--is-ancestor', 'origin/main', 'HEAD'],
      { cwd: REPO_ROOT, stdio: 'ignore' },
    );
    return [];
  } catch {
    return ['HEAD must descend from origin/main'];
  }
}

export function runRepoDoctor() {
  const packageJson = readJson('package.json');
  const tauriConfig = readJson('src-tauri/tauri.conf.json');
  const cargoSource = readText('src-tauri/Cargo.toml');
  const documents = ACTIVE_DOCS.map((path) => ({
    path,
    content: readText(path),
  }));

  return [
    ...checkVersionAlignment({
      packageVersion: packageJson.version,
      tauriVersion: tauriConfig.version,
      cargoVersion: cargoPackageVersion(cargoSource),
    }),
    ...checkEntrypoints({
      mainSource: readText('src/main.tsx'),
      appSource: readText('src/App.tsx'),
    }),
    ...checkActiveDocs(documents),
    ...checkMainAncestry(),
  ];
}

function main() {
  const failures = runRepoDoctor();

  if (failures.length > 0) {
    console.error('Repository doctor found governance failures:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Repository doctor passed.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
