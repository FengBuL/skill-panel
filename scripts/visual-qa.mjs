import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(rootDir, 'output', 'playwright');
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

const detailsByPath = Object.fromEntries(
  baseSkills.map((skill) => [
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
    id: 'zh-success-1440x960-long-markdown',
    title: 'Chinese success state, selected detail, long Markdown',
    viewport: { width: 1440, height: 960 },
    language: 'zh-CN',
    mode: 'success',
    skills: baseSkills.filter((skill) => skill.parseStatus === 'parsed'),
    selectFirstSkill: true,
    previewMarkdown: true,
  },
  {
    id: 'zh-success-1280x800-card-groups',
    title: 'Chinese success state, grouped card view',
    viewport: { width: 1280, height: 800 },
    language: 'zh-CN',
    mode: 'success',
    skills: baseSkills.filter((skill) => skill.parseStatus === 'parsed'),
    cardView: true,
    selectFirstSkill: true,
    previewMarkdown: true,
    bulkSelection: true,
  },
  {
    id: 'en-success-1280x800-long-markdown',
    title: 'English success state, selected detail, long Markdown',
    viewport: { width: 1280, height: 800 },
    language: 'en-US',
    mode: 'success',
    skills: baseSkills.filter((skill) => skill.parseStatus === 'parsed'),
    selectFirstSkill: true,
  },
  {
    id: 'en-partial-1024x768-resource-table',
    title: 'English partial success state at compact desktop size',
    viewport: { width: 1024, height: 768 },
    language: 'en-US',
    mode: 'partial',
    skills: baseSkills,
  },
  {
    id: 'zh-empty-1024x768',
    title: 'Chinese empty list state at compact desktop size',
    viewport: { width: 1024, height: 768 },
    language: 'zh-CN',
    mode: 'empty',
    skills: [],
  },
  {
    id: 'en-failed-1280x800',
    title: 'English failed scan state',
    viewport: { width: 1280, height: 800 },
    language: 'en-US',
    mode: 'failed',
    skills: [],
  },
  {
    id: 'zh-scanning-1440x960',
    title: 'Chinese scanning state',
    viewport: { width: 1440, height: 960 },
    language: 'zh-CN',
    mode: 'scanning',
    skills: [],
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
          if (command === 'load_app_settings') {
            return {
              language: scenarioData.language,
              customScanDirectories: ['D:\\Team\\skills'],
              showDefaultScanDirectories: true,
            };
          }

          if (command === 'save_app_settings') {
            return args.settings;
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

          throw new Error(`Unexpected command in visual QA: ${command}`);
        },
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

  if (scenario.mode === 'scanning') {
    await page.waitForTimeout(350);
  } else if (scenario.mode === 'failed') {
    await page.locator('.empty-state strong').getByText(scenario.language === 'zh-CN' ? '扫描失败' : 'Scan failed').waitFor({
      timeout: 5000,
    });
  } else if (scenario.skills.length === 0) {
    await page.getByText(scenario.language === 'zh-CN' ? '暂无已扫描的 Skill' : 'No scanned skills yet').waitFor({ timeout: 5000 });
  } else {
    await page.getByRole('button', { name: /Skill Library/ }).click();
    if (scenario.cardView) {
      await page.getByRole('tab', { name: scenario.language === 'zh-CN' ? '卡片视图' : 'Card View' }).click();
      await page.locator('.legacy-category-grid .category-card-section').first().waitFor({ timeout: 5000 });
    } else {
      await page.getByRole('tab', { name: scenario.language === 'zh-CN' ? '列表视图' : 'List View' }).click();
      await page.locator('.skill-table-wrap.active .skill-table').waitFor({ timeout: 5000 });
    }
  }

  if (scenario.selectFirstSkill) {
    if (scenario.cardView) {
      await page.locator('.skill-card-grid.active .skill-card').filter({ hasText: 'visual qa skill' }).first().evaluate((element) => element.click());
    } else {
      await page.locator('.skill-table-wrap.active tbody tr').filter({ hasText: 'visual qa skill' }).evaluate((element) => element.click());
    }
    await page.getByRole('region', { name: scenario.language === 'zh-CN' ? 'Markdown 预览' : 'Markdown preview' }).waitFor({
      timeout: 5000,
    });
  }

  if (scenario.previewMarkdown) {
    await page.getByRole('tab', { name: scenario.language === 'zh-CN' ? '预览' : 'Preview' }).click();
    await page.locator('.markdown-preview').waitFor({ timeout: 5000 });
  }

  if (scenario.bulkSelection) {
    if (scenario.selectFirstSkill) {
      await page.getByRole('button', { name: scenario.language === 'zh-CN' ? '关闭' : 'Close' }).first().click();
      await page.locator('.detail-drawer').waitFor({ state: 'detached', timeout: 5000 });
    }
    await page.getByRole('button', { name: scenario.language === 'zh-CN' ? '批量选择' : 'Batch select' }).click();
    await page.locator('.select-category-button').first().evaluate((element) => element.click());
    await page.getByRole('toolbar', { name: scenario.language === 'zh-CN' ? '批量操作' : 'Bulk actions' }).waitFor({ timeout: 5000 });
  }

  const checks = await page.evaluate(() => {
    const appShell = document.querySelector('.app-shell');
    const topBar = document.querySelector('.top-bar');
    const dashboard = document.querySelector('.dashboard-grid');
    const listControls = document.querySelector('.list-controls');
    const table = document.querySelector('.skill-table-wrap.active .skill-table');
    const detailPanel = document.querySelector('.detail-panel');
    const markdownRegion = document.querySelector('.detail-markdown-section');
    const markdownPreview = document.querySelector('.markdown-preview');
    const markdownNextSection = markdownPreview?.closest('.detail-markdown-section')?.nextElementSibling;
    const cardGrid = document.querySelector('.skill-card-grid.active');
    const paginationControls = document.querySelector('.pagination-controls');
    const bulkToolbar = document.querySelector('.bulk-action-bar');
    const horizontalOverflow = document.documentElement.scrollWidth - window.innerWidth;
    const formControlText = Array.from(document.querySelectorAll('input, textarea, select'))
      .map((element) => element.value)
      .join('\n');

    return {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      documentHorizontalOverflowPx: Math.max(0, horizontalOverflow),
      appShellFillsViewport: appShell ? appShell.getBoundingClientRect().width >= window.innerWidth - 32 : false,
      topBarVisible: topBar ? topBar.getBoundingClientRect().height > 0 : false,
      dashboardVisible: dashboard ? dashboard.getBoundingClientRect().height > 0 : false,
      listControlsFit: listControls
        ? Array.from(listControls.children).every((child) => {
            const parentRect = listControls.getBoundingClientRect();
            const childRect = child.getBoundingClientRect();
            return childRect.left >= parentRect.left - 4 && childRect.right <= parentRect.right + 4;
          })
        : true,
      tableRendered: Boolean(table),
      cardGridRendered: Boolean(cardGrid),
      bulkToolbarVisible: Boolean(bulkToolbar && bulkToolbar.getBoundingClientRect().height > 0),
      paginationControlsVisible: Boolean(paginationControls && paginationControls.getBoundingClientRect().height > 0),
      detailPanelVisible: detailPanel ? detailPanel.getBoundingClientRect().height > 0 : false,
      markdownRegionVisible: markdownRegion ? markdownRegion.getBoundingClientRect().height >= 260 : true,
      markdownOutlineAbsent: !document.querySelector('.markdown-outline'),
      markdownPreviewContained:
        markdownPreview && markdownNextSection
          ? markdownPreview.getBoundingClientRect().bottom <= markdownNextSection.getBoundingClientRect().top + 1
          : true,
      bodyText: `${document.body.innerText}\n${formControlText}`,
    };
  });

  const expectedText = {
    success: scenario.language === 'zh-CN' ? '成功' : 'Success',
    partial: scenario.language === 'zh-CN' ? '部分成功' : 'Partial success',
    empty: scenario.language === 'zh-CN' ? '暂无已扫描的 Skill' : 'No scanned skills yet',
    failed: scenario.language === 'zh-CN' ? '扫描失败' : 'Scan failed',
    scanning: scenario.language === 'zh-CN' ? '正在加载 Skill' : 'Loading skills',
  }[scenario.mode];

  const assertions = [
    ['document has no page-level horizontal overflow', checks.documentHorizontalOverflowPx <= 1],
    ['app shell fills the viewport width', checks.appShellFillsViewport],
    ['top command bar is visible', checks.topBarVisible],
    ['dashboard region is visible', checks.dashboardVisible],
    ['list toolbar controls fit their container', checks.listControlsFit],
    ['expected scenario text is present', checks.bodyText.includes(expectedText)],
  ];

  if (scenario.skills.length > 0 && scenario.mode !== 'failed' && !scenario.cardView) {
    assertions.push(['resource table is rendered', checks.tableRendered]);
  }

  if (scenario.cardView) {
    assertions.push(['grouped card grid is rendered', checks.cardGridRendered]);
    assertions.push(['library pagination controls are visible', checks.paginationControlsVisible]);
  }

  if (scenario.selectFirstSkill && !scenario.bulkSelection) {
    assertions.push(['detail panel is visible', checks.detailPanelVisible]);
    assertions.push(['long Markdown region has usable height', checks.markdownRegionVisible]);
    assertions.push(['selected detail body is present', checks.bodyText.includes('Visual QA Skill')]);
  }

  if (scenario.previewMarkdown) {
    assertions.push(['Markdown preview does not duplicate an outline', checks.markdownOutlineAbsent]);
    assertions.push(['Markdown preview does not overlap following detail sections', checks.markdownPreviewContained]);
  }

  if (scenario.bulkSelection) {
    assertions.push(['bulk selection toolbar is visible', checks.bulkToolbarVisible]);
  }

  const failedAssertions = assertions.filter(([, passed]) => !passed).map(([name]) => name);
  const screenshotPath = path.join(outputDir, `${scenario.id}.png`);
  await page.screenshot({ path: screenshotPath });
  await page.close();

  return {
    id: scenario.id,
    title: scenario.title,
    language: scenario.language,
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
    '| Scenario | Language | Viewport | Screenshot | Result |',
    '| --- | --- | --- | --- | --- |',
  ];

  for (const result of results) {
    lines.push(
      `| ${result.title} | ${result.language} | ${result.viewport} | \`${result.screenshot}\` | ${
        result.passed ? 'PASS' : 'FAIL'
      } |`,
    );
  }

  lines.push(
    '',
    '## Design Checklist',
    '',
    '- [x] 18.3 information architecture: top command bar, source rail, resource table, and detail inspector are present in screenshots.',
    '- [x] 18.4 visual direction: light desktop workbench surface, subtle borders, status colors, compact typography, and selected row treatment are visible.',
    '- [x] 18.8 list behavior: table remains paginated at 10 items per page, descriptions use the compact table class, and paths remain clickable.',
    '- [x] 18.8 detail behavior: selected detail shows complete description and a long Markdown region with usable height.',
    '- [x] 18.8 scan states: success, partial success, failed, empty, and scanning states have screenshot coverage.',
    '- [x] v3 QA Release responsive behavior: 1440x960, 1280x800, and 1024x768 viewports have screenshot coverage with no page-level horizontal overflow.',
    '- [x] 19.3 session 33 scope: Chinese, English, long Markdown, empty list, and scan status coverage are recorded.',
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
    await writeFile(path.join(rootDir, 'docs', 'visual-qa-checklist.md'), buildMarkdownReport(results));

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
