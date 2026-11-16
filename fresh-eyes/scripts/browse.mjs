#!/usr/bin/env node
// One persona's Chrome. Chrome runs detached and each call reattaches over CDP,
// so page state survives between separate bash calls.
// Usage: node browse.mjs <sessionDir> <command> [args]
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const USAGE = `usage: node browse.mjs <sessionDir> <command>
  start <desktop|mobile>      launch this session's Chrome (mobile = 375px, touch, slow 3G)
  goto <url>                  open a URL
  look                        URL, title, and the page as an accessibility tree
  click <selector> [--double] click (or double-click) the first match
  fill <selector> <text>      replace a field's value
  press <key>                 e.g. Enter, Tab, Escape
  back                        browser back button
  scroll <down|up>            scroll one screen
  shot <name>                 screenshot what is on screen now, prints the file path
  stop                        close Chrome (screenshots stay)
selectors: Playwright syntax. Prefer role=button[name="Sign up"] using names from look, or text=Sign up.`;

const PROFILES = {
  desktop: { width: 1280, height: 800, timeout: 20_000 },
  mobile: { width: 375, height: 812, timeout: 60_000, mobile: true },
};
const WATCHDOG_S = 150;
// Chrome DevTools "Slow 3G" preset.
const SLOW_3G = { offline: false, latency: 2000, downloadThroughput: 50_000, uploadThroughput: 50_000 };
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const CHROME =
  process.env.CHROME_PATH ||
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : 'google-chrome');

const [dir, cmd, ...rest] = process.argv.slice(2);
if (!dir || !cmd) fail(USAGE);
const statePath = path.join(dir, 'session.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

async function start(profileName) {
  const profile = PROFILES[profileName];
  if (!profile) fail('start needs desktop or mobile');
  if (fs.existsSync(statePath)) fail(`session already started in ${dir}; run stop first`);
  const userDataDir = path.join(dir, 'chrome-profile');
  fs.mkdirSync(userDataDir, { recursive: true });
  const child = spawn(
    CHROME,
    [
      '--headless=new',
      '--remote-debugging-port=0', // Chrome picks a free port and writes it to DevToolsActivePort
      `--user-data-dir=${userDataDir}`,
      `--window-size=${profile.width},${profile.height}`,
      '--no-first-run',
      '--no-default-browser-check',
      // shortcut: a back/forward-cache restore swaps the page target and strands our reattached page,
      // so back always reloads here. Revisit if bfcache-specific bugs matter.
      '--disable-features=BackForwardCache',
      'about:blank',
    ],
    { detached: true, stdio: 'ignore' },
  );
  child.unref();
  const portFile = path.join(userDataDir, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await sleep(100);
  if (!fs.existsSync(portFile)) fail(`Chrome did not start (${CHROME}). Set CHROME_PATH.`);
  const port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0]);
  fs.writeFileSync(statePath, JSON.stringify({ pid: child.pid, port, profile: profileName }));
  console.log(`started ${profileName} Chrome on port ${port}`);
}

async function stop() {
  if (!fs.existsSync(statePath)) return console.log('not running');
  const { pid } = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const alive = () => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  };
  if (alive()) process.kill(pid);
  for (let i = 0; i < 50 && alive(); i++) await sleep(100); // Chrome writes its profile while exiting
  fs.rmSync(statePath);
  fs.rmSync(path.join(dir, 'chrome-profile'), { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  console.log('stopped');
}

async function attach() {
  if (!fs.existsSync(statePath)) fail(`no session in ${dir}; run start first`);
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const profile = PROFILES[state.profile];
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${state.port}`);
  const context = browser.contexts()[0];
  const page = context.pages().at(-1) ?? (await context.newPage()); // newest tab, so target=_blank links are followed
  page.setDefaultTimeout(profile.timeout);
  page.setDefaultNavigationTimeout(profile.timeout * 2);
  const cdp = await context.newCDPSession(page);
  if (profile.mobile) {
    // shortcut: CDP overrides end when this process detaches, so throttling only covers our own commands
    // (background loading between commands runs at full speed). Good enough for first-run friction.
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await cdp.send('Emulation.setUserAgentOverride', { userAgent: IPHONE_UA });
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', SLOW_3G);
  }
  const problems = [];
  const inflight = new Set();
  page.on('request', (r) => inflight.add(r));
  page.on('requestfinished', (r) => inflight.delete(r));
  page.on('requestfailed', (r) => inflight.delete(r));
  page.on('console', (m) => m.type() === 'error' && problems.push(`console error: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  page.on('response', (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()} ${r.request().method()} ${r.url()}`));
  page.on('requestfailed', (r) => problems.push(`request failed: ${r.url()} (${r.failure()?.errorText})`));
  return { browser, page, cdp, problems, inflight };
}

// Wait until the action's requests finish, so slow failures (e.g. a 404 on slow 3G) get reported.
// shortcut: apps with long-polling or SSE never go quiet, so each action waits the full 15s; add a URL ignore list if that bites.
async function settle(page, inflight) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  const deadline = Date.now() + 15_000;
  let quietSince = Date.now();
  while (Date.now() < deadline) {
    await sleep(100);
    if (inflight.size > 0) quietSince = Date.now();
    else if (Date.now() - quietSince >= 700) return;
  }
}

async function run() {
  if (cmd === 'start') return start(rest[0]);
  if (cmd === 'stop') return stop();
  // Some CDP calls never settle and ignore Playwright timeouts; never leave the caller hanging.
  setTimeout(() => {
    console.log(`FAILED: ${cmd} got no response from the browser in ${WATCHDOG_S}s`);
    process.exit(1);
  }, WATCHDOG_S * 1000).unref();
  const { browser, page, cdp, problems, inflight } = await attach();
  const started = Date.now();
  let out = '';
  try {
    switch (cmd) {
      case 'goto':
        if (!rest[0]) fail('goto needs a url');
        await page.goto(rest[0], { waitUntil: 'domcontentloaded' });
        break;
      case 'look': {
        const tree = await page.locator('body').ariaSnapshot();
        out = tree.length > 15_000 ? `${tree.slice(0, 15_000)}\n... (truncated, scroll or click to see more)` : tree;
        break;
      }
      case 'click': {
        const target = page.locator(rest[0]).first();
        await (rest.includes('--double') ? target.dblclick() : target.click());
        break;
      }
      case 'fill':
        await page.locator(rest[0]).first().fill(rest.slice(1).join(' '));
        break;
      case 'press':
        await page.keyboard.press(rest[0]);
        break;
      case 'back':
        await page.goBack({ waitUntil: 'domcontentloaded' });
        break;
      case 'scroll':
        await page.mouse.wheel(0, rest[0] === 'up' ? -700 : 700);
        break;
      case 'shot': {
        const shots = path.join(dir, 'shots');
        fs.mkdirSync(shots, { recursive: true });
        const n = String(fs.readdirSync(shots).length + 1).padStart(2, '0');
        const name = (rest.join('-') || 'shot').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 60);
        const file = path.join(shots, `${n}-${name}.png`);
        // Via CDP, not page.screenshot(): Playwright doesn't know an attached page's emulated viewport and
        // would capture the whole layout instead of what the phone actually shows.
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(file, Buffer.from(data, 'base64'));
        out = file;
        break;
      }
      default:
        fail(`unknown command: ${cmd}\n${USAGE}`);
    }
    if (!['look', 'shot'].includes(cmd)) await settle(page, inflight);
  } catch (err) {
    // Report the failure as the user would experience it, then let the caller decide.
    console.log(`FAILED: ${String(err.message).split('\n')[0]}`);
    process.exitCode = 1;
  }
  const title = await page.title().catch(() => '?');
  console.log(`url: ${page.url()}\ntitle: ${title}\ntook: ${Date.now() - started}ms`);
  if (problems.length) console.log(problems.map((p) => `! ${p}`).join('\n'));
  if (out) console.log(out);
  await browser.close(); // for a CDP attach this only disconnects; Chrome keeps running
}

await run();
