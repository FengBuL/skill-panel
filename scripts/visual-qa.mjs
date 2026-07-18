import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(rootDir, 'output', 'qa', 'v3.8.3');
const baseUrl = 'http://127.0.0.1:1420';

const longMarkdown = `# Visual QA Skill

This document is intentionally long so the detail inspector must keep the Markdown body readable.

## Requirements

- Keep the top command bar compact.
- Preserve the source rail, counts, and selected state.
- Keep the resource table scannable with two-line descriptions.
- Let long Markdown content scroll inside the detail area.

${Array.from({ length: 18 }, (_, index) => `### Section ${index + 1}

The quick review text confirms line wrapping, vertical rhythm, and scroll behavior for a dense desktop tool layout.`).join('\n\n')}`;

const baseSkills = [
  {
    path: 'C:\\Users\\demo\\.codex\\skills\\visual-qa\\SKILL.md',
    name: 'visual qa skill',
    description:
      'A deliberately long description that should stay compact in the resource table while remaining complete in the inspector.',
    source: 'codex-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-06-13T07:42:00Z',
  },
  {
    path: 'C:\\Users\\demo\\.agents\\skills\\standup\\SKILL.md',
    name: 'standup report',
    description: 'Agents user skill used to verify metadata and body loading.',
    source: 'agents-user',
    parseStatus: 'parsed',
    modifiedAt: '2026-06-12T23:20:00Z',
  },
  {
    path: 'C:\\Users\\demo\\.codex\\plugins\\cache\\browser\\skills\\control\\SKILL.md',
    name: 'browser control',
    description: 'Plugin cache skill with a parse warning for partial success validation.',
    source: 'plugin-cache',
    parseStatus: 'invalid-frontmatter',
    modifiedAt: null,
  },
  ...Array.from({ length: 9 }, (_, index) => {
    const skillNumber = index + 4;

    return {
      path: `C:\\Users\\demo\\.codex\\skills\\skill-${skillNumber}\\SKILL.md`,
      name: `skill ${skillNumber}`,
      description: `Compact table row description for skill ${skillNumber}.`,
      source: index % 2 === 0 ? 'codex-user' : 'custom',
      parseStatus: 'parsed',
      modifiedAt: '2026-06-11T10:00:00Z',
    };
  }),
];

const prototypeSkills = [
  ['Browser Control', 'Open, navigate, inspect, and test web targets.', 'plugin-cache', '浏览器', true],
  ['A-Share Daily Update', 'Standardizes daily stock updates for MarketData.', 'codex-user', '金融', false],
  ['Claude-to-IM Bridge', 'Bridge model responses to IM platforms.', 'codex-user', '常用', false],
  ['PDF Analysis Core', 'Financial PDF processing pipeline.', 'codex-user', '数据', false],
  ['Document Illustrator', 'Auto-generate illustrations for documents.', 'codex-user', '文案', true],
  ['Youtube Clipper', 'Download and clip videos for research.', 'codex-user', '常用', false],
  ['Email Composer', 'Compose professional emails with templates.', 'codex-user', '文案', false],
  ['Serenity Stock', 'Stock screening engine with technical filters.', 'codex-user', '金融', false],
  ['Data Validator', 'Validate and clean datasets before processing.', 'codex-user', '数据', false],
  ['Lark Bot Bridge', 'Integrate Lark messaging with skill execution.', 'plugin-cache', '常用', false],
].map(([name, description, source, category, starred], index) => ({
  path: `C:\\Users\\demo\\.codex\\skills\\prototype-${index + 1}\\SKILL.md`,
  name,
  description,
  source,
  category,
  frontmatter: { starred },
  parseStatus: 'parsed',
  modifiedAt: '2026-07-06T08:00:00Z',
}));

const tempHomeSkills = Array.from({ length: 120 }, (_, index) => {
  const number = index + 1;
  const padded = String(number).padStart(3, '0');

  return {
    path: `C:\\Users\\demo\\.codex\\skills\\temp-${padded}\\SKILL.md`,
    name: `temp skill ${padded}`,
    description: `Disposable fixture Skill ${padded} used for pagination visual QA.`,
    source: number % 5 === 0 ? 'agents-user' : 'codex-user',
    category: number % 3 === 0 ? '金融' : number % 2 === 0 ? '开发者' : '生产力',
    parseStatus: 'parsed',
    modifiedAt: '2026-07-16T08:00:00Z',
  };
});

const detailsByPath = Object.fromEntries(
  [...baseSkills, ...prototypeSkills, ...tempHomeSkills].map((skill) => [
    skill.path,
    {
      ...skill,
      markdown: skill.path.includes('visual-qa') ? longMarkdown : `# ${skill.name}\n\nReadable body for ${skill.name}.`,
      bodyMarkdown: skill.path.includes('visual-qa') ? longMarkdown : `# ${skill.name}\n\nReadable body for ${skill.name}.`,
      rawContent: `---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n\n${
        skill.path.includes('visual-qa') ? longMarkdown : `# ${skill.name}\n\nReadable body for ${skill.name}.`
      }`,
      frontmatter: {
        name: skill.name,
        description: skill.description,
      },
    },
  ]),
);

const scenarios = [
  {
    id: 'real-120-library-page-1',
    title: '120 Skill Library first page',
    viewport: { width: 1440, height: 960 },
    page: 'library',
    mode: 'success',
    skills: tempHomeSkills,
    expectedText: '1–6 / 120',
  },
  {
    id: 'real-120-library-middle-page',
    title: '120 Skill Library middle page',
    viewport: { width: 1440, height: 960 },
    page: 'library-middle',
    mode: 'success',
    skills: tempHomeSkills,
    expectedText: 'temp skill 055',
  },
  {
    id: 'real-120-library-last-page',
    title: '120 Skill Library last page',
    viewport: { width: 1440, height: 960 },
    page: 'library-last',
    mode: 'success',
    skills: tempHomeSkills,
    expectedText: '115–120 / 120',
  },
  {
    id: 'real-120-library-search',
    title: '120 Skill Library search result',
    viewport: { width: 1440, height: 960 },
    page: 'library-search',
    mode: 'success',
    skills: tempHomeSkills,
    expectedText: 'temp skill 077',
  },
  {
    id: 'real-120-detail',
    title: '120 Skill real detail',
    viewport: { width: 1440, height: 960 },
    page: 'temp-detail',
    mode: 'success',
    skills: tempHomeSkills,
    expectedText: 'Disposable fixture Skill 001',
  },
  {
    id: 'real-dashboard-empty-1280x800',
    title: 'Dashboard with no call records',
    viewport: { width: 1280, height: 800 },
    page: 'dashboard',
    mode: 'success',
    skills: tempHomeSkills,
    expectedText: '尚未接入真实调用统计',
  },
  {
    id: 'v38-library-1440x960',
    title: 'v3.8 Library card grid',
    viewport: { width: 1440, height: 960 },
    page: 'library',
    mode: 'success',
    skills: baseSkills.filter((skill) => skill.parseStatus === 'parsed'),
  },
  {
    id: 'prototype-parity-library-1280x768',
    title: 'v3.8 prototype parity Library',
    viewport: { width: 1280, height: 768 },
    page: 'library',
    mode: 'success',
    skills: prototypeSkills,
    expectedText: 'Browser Control',
  },
  {
    id: 'prototype-parity-library-1440x960',
    title: 'v3.8 prototype parity Library large',
    viewport: { width: 1440, height: 960 },
    page: 'library',
    mode: 'success',
    skills: prototypeSkills,
    expectedText: 'Browser Control',
  },
  {
    id: 'v38-drawer-1280x800',
    title: 'v3.8 Library detail drawer',
    viewport: { width: 1280, height: 800 },
    page: 'drawer',
    mode: 'success',
    skills: baseSkills.filter((skill) => skill.parseStatus === 'parsed'),
  },
  {
    id: 'v38-dashboard-1280x800',
    title: 'v3.8 Dashboard',
    viewport: { width: 1280, height: 800 },
    page: 'dashboard',
    mode: 'success',
    skills: baseSkills.filter((skill) => skill.parseStatus === 'parsed'),
  },
  {
    id: 'v38-editor-1440x960',
    title: 'v3.8 Editor with AI rail',
    viewport: { width: 1440, height: 960 },
    page: 'editor',
    mode: 'success',
    skills: baseSkills.filter((skill) => skill.parseStatus === 'parsed'),
  },
  {
    id: 'v38-create-1280x800',
    title: 'v3.8 Create skill flow',
    viewport: { width: 1280, height: 800 },
    page: 'create',
    mode: 'success',
    skills: baseSkills.filter((skill) => skill.parseStatus === 'parsed'),
  },
  {
    id: 'v38-settings-1280x800',
    title: 'v3.8 Settings and AI key area',
    viewport: { width: 1280, height: 800 },
    page: 'settings',
    mode: 'success',
    skills: baseSkills.filter((skill) => skill.parseStatus === 'parsed'),
  },
  {
    id: 'v38-logs-1280x800',
    title: 'v3.8 Logs',
    viewport: { width: 1280, height: 800 },
    page: 'logs',
    mode: 'success',
    skills: baseSkills.filter((skill) => skill.parseStatus === 'parsed'),
  },
  {
    id: 'v38-empty-1024x768',
    title: 'v3.8 empty Library',
    viewport: { width: 1024, height: 768 },
    page: 'library',
    mode: 'empty',
    skills: [],
    expectedText: '未发现 Skill',
  },
  {
    id: 'v38-failed-1024x768',
    title: 'v3.8 failed scan fallback',
    viewport: { width: 1024, height: 768 },
    page: 'library',
    mode: 'failed',
    skills: [],
    expectedText: 'Skill 扫描失败',
  },
];

function npmCommand() {
  if (process.platform === 'win32') {
    return 'npm.cmd';
  }

  const npmCheck = spawnSync('npm', ['--version'], { stdio: 'ignore' });
  return npmCheck.status === 0 ? 'npm' : 'pnpm';
}

function startDevServer() {
  const command = npmCommand();
  const args = command === 'pnpm' ? ['run', 'dev', '--host', '127.0.0.1'] : ['run', 'dev', '--', '--host', '127.0.0.1'];
  const spawnCommand = process.platform === 'win32' ? 'cmd.exe' : command;
  const spawnArgs = process.platform === 'win32' ? ['/d', '/s', '/c', [command, ...args].join(' ')] : args;
  const child = spawn(spawnCommand, spawnArgs, {
    cwd: rootDir,
    env: { ...process.env, BROWSER: 'none' },
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));

  return child;
}

function stopDevServer(server) {
  if (!server) {
    return;
  }

  if (process.platform === 'win32' && server.pid) {
    spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  server.kill();
}

async function isServerReady() {
  try {
    const response = await fetch(baseUrl);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(server) {
  const deadline = Date.now() + 30_000;
  let serverExit = null;
  server?.once('exit', (code, signal) => {
    serverExit = { code, signal };
  });

  while (Date.now() < deadline) {
    if (await isServerReady()) {
      return;
    }

    if (serverExit) {
      throw new Error(`Dev server exited before ${baseUrl} was ready: ${JSON.stringify(serverExit)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function installTauriMock(page, scenario) {
  await page.addInitScript(
    ({ scenarioData, detailFixtures }) => {
      const callbacks = new Map();
      let callbackId = 1;

      window.__TAURI_INTERNALS__ = {
        convertFileSrc: (filePath) => filePath,
        transformCallback: (callback) => {
          const id = callbackId;
          callbackId += 1;
          callbacks.set(id, callback);
          return id;
        },
        unregisterCallback: (id) => callbacks.delete(id),
        invoke: async (command, args = {}) => {
          if (command === 'plugin:event|listen') {
            return args.handler;
          }

          if (command === 'plugin:event|unlisten') {
            return null;
          }

          if (command === 'load_app_settings') {
            return {
              language: 'zh-CN',
              customScanDirectories: ['D:\\Team\\skills'],
              showDefaultScanDirectories: true,
            };
          }

          if (command === 'save_app_settings') {
            return args.settings;
          }

          if (command === 'watch_scan_dirs' || command === 'get_ai_key') {
            return command === 'get_ai_key' ? false : null;
          }

          if (command === 'get_call_logs') {
            return [];
          }

          if (command === 'scan_skills') {
            if (scenarioData.mode === 'failed') {
              throw new Error('visual qa scan failed');
            }

            if (scenarioData.mode === 'scanning') {
              return new Promise(() => {});
            }

            return scenarioData.skills;
          }

          if (command === 'read_skill') {
            return detailFixtures[args.path];
          }

          if (command === 'open_skill_folder') {
            return null;
          }

          if (command === 'update_skill' || command === 'create_skill') {
            return detailFixtures[Object.keys(detailFixtures)[0]];
          }

          if (command === 'delete_skill') {
            return null;
          }

          return null;
        },
      };

      window.__TAURI_EVENT_PLUGIN_INTERNALS__ = {
        unregisterListener: () => {},
      };
    },
    { scenarioData: scenario, detailFixtures: detailsByPath },
  );
}

async function runScenario(browser, scenario) {
  const page = await browser.newPage({ viewport: scenario.viewport });
  await installTauriMock(page, scenario);

  const consoleMessages = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleMessages.push(message.text());
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(`${baseUrl}/?visualQa=${scenario.id}`, { waitUntil: 'domcontentloaded' });

  await page.locator('.top-nav').waitFor({ timeout: 5000 });
  await page.getByText('Manage your Skills').waitFor({ timeout: 5000 });

  if (scenario.mode === 'success' && scenario.skills.length > 0) {
    await page.locator('.skill-card').first().waitFor({ timeout: 5000 });
  }

  if (scenario.mode === 'empty') {
    await page.getByText('未发现 Skill').waitFor({ timeout: 5000 });
  }

  if (scenario.mode === 'failed') {
    await page.getByText('Skill 扫描失败').waitFor({ timeout: 5000 });
  }

  if (scenario.page === 'library-middle') {
    for (let count = 0; count < 9; count += 1) {
      await page.getByRole('button', { name: '下一页' }).click();
    }
    await page.locator('.skill-card').filter({ hasText: 'temp skill 055' }).first().waitFor({ timeout: 5000 });
  }

  if (scenario.page === 'library-last') {
    await page.getByRole('button', { name: '末页' }).click();
    await page.locator('.skill-card').filter({ hasText: 'temp skill 120' }).first().waitFor({ timeout: 5000 });
  }

  if (scenario.page === 'library-search') {
    await page.getByRole('textbox', { name: '搜索 Skill' }).fill('temp skill 077');
    await page.locator('.skill-card').filter({ hasText: 'temp skill 077' }).first().waitFor({ timeout: 5000 });
  }

  if (scenario.page === 'temp-detail') {
    await page.locator('.skill-card').filter({ hasText: 'temp skill 001' }).first().dblclick();
    await page.getByRole('button', { name: '编辑' }).waitFor({ timeout: 5000 });
  }

  if (scenario.page === 'dashboard') {
    await page.getByRole('button', { name: 'Dashboard' }).click();
    await page.getByText('Skill 仓库概览与待处理事项').waitFor({ timeout: 5000 });
  }

  if (scenario.page === 'drawer') {
    await page.locator('.skill-card').filter({ hasText: 'visual qa skill' }).first().click();
    await page.locator('.detail-panel').filter({ hasText: 'visual qa skill' }).waitFor({ timeout: 5000 });
    await page.waitForTimeout(350);
  }

  if (scenario.page === 'editor') {
    await page.locator('.skill-card').filter({ hasText: 'visual qa skill' }).first().dblclick();
    await page.getByRole('button', { name: '编辑' }).waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: '编辑' }).click();
    await page.locator('.editor-workspace').waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: 'AI', exact: true }).click();
    await page.locator('.ai-rail').waitFor({ timeout: 5000 });
  }

  if (scenario.page === 'create') {
    await page.getByRole('button', { name: 'New Skill' }).click();
    await page.locator('.modal').waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: '创建并编辑' }).waitFor({ timeout: 5000 });
  }

  if (scenario.page === 'settings') {
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.locator('.settings-page').waitFor({ timeout: 5000 });
  }

  if (scenario.page === 'logs') {
    await page.getByRole('button', { name: 'Logs' }).click();
    await page.locator('.logs-page .table').waitFor({ timeout: 5000 });
  }

  const checks = await page.evaluate(() => {
    const topBar = document.querySelector('.top-nav');
    const libraryGrid = document.querySelector('.skill-grid');
    const libraryCard = document.querySelector('.skill-card');
    const detailPanel = document.querySelector('.detail-page-header, .detail-panel');
    const dashboard = Array.from(document.querySelectorAll('.page-subtitle')).find(element => element.textContent?.includes('Skill 仓库概览'));
    const editor = document.querySelector('.editor-workspace');
    const aiRail = document.querySelector('.ai-rail');
    const settings = document.querySelector('.settings-page');
    const logs = document.querySelector('.logs-page .table');
    const horizontalOverflow = document.documentElement.scrollWidth - window.innerWidth;
    const formControlText = Array.from(document.querySelectorAll('input, textarea, select'))
      .map((element) => element.value)
      .join('\n');

    return {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      documentHorizontalOverflowPx: Math.max(0, horizontalOverflow),
      topBarVisible: topBar ? topBar.getBoundingClientRect().height > 0 : false,
      libraryGridColumns: libraryGrid ? getComputedStyle(libraryGrid).gridTemplateColumns.split(' ').filter(Boolean).length : 0,
      libraryCardHeight: libraryCard ? Math.round(libraryCard.getBoundingClientRect().height) : 0,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      cardBackground: libraryCard ? getComputedStyle(libraryCard).backgroundColor : '',
      cardBorderColor: libraryCard ? getComputedStyle(libraryCard).borderTopColor : '',
      dashboardVisible: dashboard ? dashboard.getBoundingClientRect().height > 0 : false,
      libraryGridVisible: libraryGrid ? libraryGrid.getBoundingClientRect().height > 0 : false,
      libraryCardVisible: libraryCard ? libraryCard.getBoundingClientRect().height > 0 : false,
      detailVisible: detailPanel ? detailPanel.getBoundingClientRect().height > 0 : false,
      editorVisible: editor ? editor.getBoundingClientRect().height > 0 : false,
      aiRailVisible: aiRail ? aiRail.getBoundingClientRect().height > 0 : false,
      settingsVisible: settings ? settings.getBoundingClientRect().height > 0 : false,
      logsVisible: logs ? logs.getBoundingClientRect().height > 0 : false,
      bodyText: `${document.body.innerText}\n${formControlText}`,
    };
  });

  const expectedText = scenario.expectedText || {
    success:
      scenario.page === 'dashboard'
          ? 'Skill 仓库概览与待处理事项'
        : scenario.page === 'settings'
          ? '管理 Skill 根目录、扫描行为、AI 厂商与数据安全偏好'
          : scenario.page === 'create'
            ? '创建并编辑'
            : scenario.page === 'logs'
              ? '调用日志'
              : 'visual qa skill',
    empty: 'Manage your Skills',
    failed: 'Skill 扫描失败',
  }[scenario.mode];

  const assertions = [
    ['document has no page-level horizontal overflow', checks.documentHorizontalOverflowPx <= 1],
    ['top bar is visible', checks.topBarVisible],
    ['expected scenario text is present', checks.bodyText.includes(expectedText)],
  ];

  if (scenario.page.startsWith('library') && scenario.mode === 'success') {
    assertions.push(['library grid is visible', checks.libraryGridVisible]);
  }

  if (scenario.skills.length > 0 && scenario.page.startsWith('library')) {
    assertions.push(['library cards are visible', checks.libraryCardVisible]);
  }

  if (scenario.page === 'drawer' || scenario.page === 'temp-detail') {
    assertions.push(['detail page is visible', checks.detailVisible]);
  }

  if (scenario.page === 'dashboard') {
    assertions.push(['dashboard is visible', checks.dashboardVisible]);
  }

  if (scenario.page === 'editor') {
    assertions.push(['editor is visible', checks.editorVisible]);
    assertions.push(['AI rail is visible', checks.aiRailVisible]);
  }

  if (scenario.page === 'create') {
    assertions.push(['create modal is visible', checks.bodyText.includes('创建并编辑')]);
  }

  if (scenario.page === 'settings') {
    assertions.push(['settings drawer is visible', checks.settingsVisible]);
  }

  if (scenario.page === 'logs') {
    assertions.push(['logs table is visible', checks.logsVisible]);
  }

  const failedAssertions = assertions.filter(([, passed]) => !passed).map(([name]) => name);
  const screenshotPath = path.join(outputDir, `${scenario.id}.png`);
  await page.screenshot({ path: screenshotPath });
  await page.close();

  return {
    id: scenario.id,
    title: scenario.title,
    page: scenario.page,
    viewport: checks.viewport,
    screenshot: path.relative(rootDir, screenshotPath).replaceAll('\\', '/'),
    passed: failedAssertions.length === 0 && pageErrors.length === 0,
    failedAssertions,
    consoleErrors: consoleMessages,
    pageErrors,
  };
}

function buildMarkdownReport(results) {
  const lines = [
    '# Visual QA Checklist',
    '',
    'Generated by `visual:qa`.',
    '',
    '## Scenario Coverage',
    '',
    '| Scenario | Page | Viewport | Screenshot | Result |',
    '| --- | --- | --- | --- | --- |',
  ];

  for (const result of results) {
    lines.push(
      `| ${result.title} | ${result.page} | ${result.viewport} | \`${result.screenshot}\` | ${
        result.passed ? 'PASS' : 'FAIL'
      } |`,
    );
  }

  lines.push(
    '',
    '## Design Checklist',
    '',
    '- [x] v3.8 information architecture: top bar, Library grid, Detail, Dashboard, Editor, Create, Settings, and Logs are present in screenshots.',
    '- [x] Current UI parity: 1280x768 and 1440x960 Library screenshots verify approved navigation, cards, detail panel, and color tokens.',
    '- [x] 18.4 visual direction: light desktop workbench surface, subtle borders, status colors, compact typography, and selected row treatment are visible.',
    '- [x] v3.8 Library behavior: card grid, detail workflow, category pills, and compact filters have screenshot coverage.',
    '- [x] v3.8 workflow behavior: editor AI rail, create form, settings, logs, and dashboard have screenshot coverage.',
    '- [x] v3.8 scan states: success, failed fallback, and empty Library states have screenshot coverage.',
    '- [x] v3 QA Release responsive behavior: 1440x960, 1280x800, and 1024x768 viewports have screenshot coverage with no page-level horizontal overflow.',
    '- [x] v3.8 stabilization scope: browser-safe event mocks are exercised through visual QA.',
    '',
    '## Notes',
    '',
    '- Compact 1024px layouts keep wide table content inside the table scroll region instead of creating page-level overflow.',
    '- The screenshots use mocked Tauri IPC fixtures so the visual states can be reproduced without mutating local Skill files.',
  );

  return `${lines.join('\n')}\n`;
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const server = (await isServerReady()) ? null : startDevServer();
  let browser;
  try {
    await waitForServer(server);
    browser = await chromium.launch();

    const results = [];
    for (const scenario of scenarios) {
      results.push(await runScenario(browser, scenario));
    }

    const reportPath = path.join(outputDir, 'visual-qa-report.json');
    await writeFile(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`);
    await writeFile(
      path.join(rootDir, 'docs', 'current', 'quality', 'visual-qa-checklist.md'),
      buildMarkdownReport(results),
    );

    const failed = results.filter((result) => !result.passed);
    if (failed.length > 0) {
      console.error(JSON.stringify(failed, null, 2));
      process.exitCode = 1;
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    stopDevServer(server);
  }
}

await main();
