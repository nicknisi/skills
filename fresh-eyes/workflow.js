// fresh-eyes: five first-time-user personas walk the app from landing page to
// first success in their own real Chrome, screenshot every friction moment, and
// report. Issues are merged and ranked by impact, the human picks what to fix,
// one agent fixes, then the same personas replay their paths to prove it.
//
// args: {
//   url:      landing page URL (app must already be running)
//   success:  what "first success" means, e.g. "created and saw their first project"
//   browse:   absolute path to fresh-eyes/scripts/browse.mjs
//   outDir:   absolute path for screenshots and report.md
//   notes?:   test accounts, email-verification workaround, anything a persona can't discover
//   personas?: subset of persona ids to run (default all)
//   repo?:    app source repo for the fixer (default: the session cwd)
// }

export const meta = {
  name: 'fresh-eyes',
  description: 'First-time-user personas walk the app in real Chrome, rank friction by impact, gated fix, replay to prove it',
};

// The workflow sandbox has process but not require.
const { execFileSync } = process.getBuiltinModule('node:child_process');
const fs = process.getBuiltinModule('node:fs');
const path = process.getBuiltinModule('node:path');

const ARGS = typeof args === 'string' ? JSON.parse(args) : args || {}; // the workflow tool can pass args as a JSON string
for (const k of ['url', 'success', 'browse', 'outDir']) {
  if (!ARGS[k]) throw new Error(`fresh-eyes needs args.${k}`);
}
const { url: URL, success: SUCCESS, browse: BROWSE, outDir: OUT } = ARGS;
const NOTES = ARGS.notes || 'none';
const REPO = ARGS.repo || cwd;

const ALL_PERSONAS = [
  {
    id: 'impatient',
    profile: 'desktop',
    brief:
      'You are impatient. You skim instead of reading, click the most prominent button first, and never read help text. ' +
      'The first time something errors, stalls for more than a few seconds, or makes you think, you quit. Report exactly where and why you quit.',
  },
  {
    id: 'skeptic',
    profile: 'desktop',
    brief:
      'You are a skeptic. Before giving the app any personal data you look for and read pricing, terms of service, and the privacy policy. ' +
      'Missing, vague, contradictory, or hard-to-find answers about cost, data use, or cancellation are issues. Only then do you sign up and continue.',
  },
  {
    id: 'mobile',
    profile: 'mobile',
    brief:
      'You are on a phone: a 375px-wide screen on a slow 3G connection (already emulated in your browser). ' +
      'Check screenshots often. Tiny tap targets, horizontal scrolling, content cut off, layouts that break, ' +
      'and waits with no loading feedback are all issues. Note how long slow actions take.',
  },
  {
    id: 'literal',
    profile: 'desktop',
    brief:
      'English is your second language. You follow only what the UI literally says. You do not guess what icons without labels mean, ' +
      'you do not understand idioms, jargon, or clever marketing copy, and you do not infer steps the page does not state. ' +
      'Every time the words are unclear or you have to guess what to do next, that is an issue: quote the exact text.',
  },
  {
    id: 'breaker',
    profile: 'desktop',
    brief:
      'You are a breaker. In every form, first try junk: empty submits, very long strings, emoji, <script>alert(1)</script>, ' +
      "' OR 1=1 --, wrong formats, leading/trailing spaces. Double-click every submit button (click --double). " +
      'Hit back in the middle of multi-step flows and resubmit. Unhelpful errors, lost input, duplicate submissions, ' +
      'crashes, and console/HTTP errors are all issues. After probing each step, enter valid data and keep going.',
  },
];
const PERSONAS = ARGS.personas ? ALL_PERSONAS.filter((p) => ARGS.personas.includes(p.id)) : ALL_PERSONAS;
if (PERSONAS.length === 0) throw new Error(`no personas matched ${JSON.stringify(ARGS.personas)}`);

const SEVERITY_WEIGHT = { blocker: 3, major: 2, minor: 1 };

const ISSUE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    url: { type: 'string' },
    whatHappened: { type: 'string' },
    expected: { type: 'string' },
    severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
    screenshot: { type: 'string' },
    evidence: { type: 'string', description: 'console errors, HTTP failures, exact UI text, timings' },
  },
  required: ['title', 'url', 'whatHappened', 'expected', 'severity', 'screenshot'],
};
const PERSONA_SCHEMA = {
  type: 'object',
  properties: {
    persona: { type: 'string' },
    reachedSuccess: { type: 'boolean' },
    gaveUpBecause: { type: 'string', description: 'empty when you reached success' },
    actions: { type: 'number' },
    path: { type: 'array', items: { type: 'string' }, description: 'each step you took, replayable by someone else' },
    issues: { type: 'array', items: ISSUE_SCHEMA },
  },
  required: ['persona', 'reachedSuccess', 'actions', 'path', 'issues'],
};

const RERUN_SCHEMA = {
  ...PERSONA_SCHEMA,
  properties: {
    ...PERSONA_SCHEMA.properties,
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ['fixed', 'still broken', 'could not reach'] },
          screenshots: { type: 'array', items: { type: 'string' } },
          note: { type: 'string' },
        },
        required: ['id', 'status', 'screenshots'],
      },
    },
  },
  required: [...PERSONA_SCHEMA.required, 'verdicts'],
};

const browser = (dir, ...cmd) => execFileSync('node', [BROWSE, dir, ...cmd], { encoding: 'utf8' });

function personaPrompt(p, dir, extra = '') {
  const b = `node ${BROWSE} ${dir}`;
  return `You are a first-time user of a web app. You have never seen it. You know only what the browser shows you: do not read source code, docs, or files.

GOAL: starting at ${URL}, reach first success: ${SUCCESS}
NOTES FROM THE TEAM: ${NOTES}

WHO YOU ARE: ${p.brief}

YOUR BROWSER is your own Chrome, already running and already ${p.profile === 'mobile' ? 'emulating a 375px phone on slow 3G' : 'at desktop size'}. Drive it only through bash:
  ${b} goto <url> | look | click <selector> [--double] | fill <selector> <text> | press <key> | back | scroll <down|up> | shot <name>
look prints the page as an accessibility tree. Selectors are Playwright syntax: prefer role=button[name="Sign up"] using names from look, or text=Sign up.
Every action prints the URL, how long it took, and any console errors or failed requests (lines starting with !).
To see the page the way a person does, take a shot and read the PNG path it prints.

Stay in character the whole time. Whenever you get confused, stuck, or annoyed, or something looks broken: take a shot first, then record an issue that points at that shot.
Friction counts even when nothing technically failed (unclear wording, slow with no feedback, a surprise). Severity: blocker = you could not continue; major = you continued only with effort or luck; minor = annoying.
Stop when you reach first success, when this persona would give up, or after about 40 actions.
Write path as concrete replayable steps, e.g. 'click role=button[name="Get started"]'.${extra}`;
}

async function walk(round, extraFor) {
  return parallel(
    PERSONAS.map((p) => async () => {
      const dir = path.join(OUT, round, p.id);
      fs.mkdirSync(dir, { recursive: true });
      browser(dir, 'start', p.profile);
      try {
        const report = await agent(personaPrompt(p, dir, extraFor ? extraFor(p) : ''), {
          label: `${round}-${p.id}`,
          tools: ['bash', 'read'],
          schema: extraFor ? RERUN_SCHEMA : PERSONA_SCHEMA,
          timeoutMs: 30 * 60_000,
          maxTurns: 120,
        });
        return { ...report, persona: p.id }; // the model sometimes writes a description here; ids drive the replay
      } finally {
        browser(dir, 'stop');
      }
    }),
  );
}

// ── 1. First walk ──────────────────────────────────────────────────────────
phase('first walk');
const reports = (await walk('walk')).filter(Boolean);
if (reports.length === 0) throw new Error('every persona failed; check the url and that Chrome starts');

// ── 2. Merge and rank ──────────────────────────────────────────────────────
phase('merge');
const merged = await agent(
  `${reports.length} first-time users each reported issues while trying to reach "${SUCCESS}" in a web app. ` +
    `Merge them into one deduplicated list: two reports are the same issue when they share a root cause, even if worded differently. ` +
    `Keep every distinct issue. For each, list every persona that hit it, the worst severity any of them gave, and every screenshot path. ` +
    `Set personaSpecific true when only that persona's situation could trigger it (e.g. only on a phone).\n\nREPORTS:\n${JSON.stringify(reports, null, 1)}`,
  {
    label: 'merge',
    schema: {
      type: 'object',
      properties: {
        issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string' },
              personas: { type: 'array', items: { type: 'string' } },
              severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
              personaSpecific: { type: 'boolean' },
              screenshots: { type: 'array', items: { type: 'string' } },
              evidence: { type: 'string' },
            },
            required: ['title', 'summary', 'personas', 'severity', 'personaSpecific', 'screenshots'],
          },
        },
      },
      required: ['issues'],
    },
  },
);

// Rank by impact (severity x people hit), then by people hit. Done here, not by the model, so it is stable.
const issues = merged.issues
  .map((i) => ({ ...i, count: i.personas.length, score: SEVERITY_WEIGHT[i.severity] * i.personas.length }))
  .sort((a, b) => b.score - a.score || b.count - a.count)
  .map((i, n) => ({ id: `I${n + 1}`, ...i }));

const reportPath = path.join(OUT, 'report.md');
function writeReport(verdicts = {}) {
  const line = (i) => {
    const v = verdicts[i.id];
    const status = v ? ` | **${v.status}**` : '';
    return `### ${i.id}. ${i.title}\n${i.severity}, hit by ${i.count}/${PERSONAS.length} (${i.personas.join(', ')})${i.personaSpecific ? ', persona-specific' : ''}${status}\n\n${i.summary}\n\n${i.screenshots.map((s) => `- ${s}`).join('\n')}${v ? `\n- after: ${v.screenshots.join(', ') || 'no screenshot'}${v.note ? `\n- ${v.note}` : ''}` : ''}\n`;
  };
  const outcomes = reports.map((r) => `- ${r.persona}: ${r.reachedSuccess ? 'reached success' : `gave up: ${r.gaveUpBecause}`} (${r.actions} actions)`);
  fs.writeFileSync(reportPath, `# fresh-eyes: ${URL}\n\nGoal: ${SUCCESS}\n\n${outcomes.join('\n')}\n\n${issues.map(line).join('\n')}`);
}
writeReport();
const summary = {
  report: reportPath,
  outcomes: reports.map((r) => ({ persona: r.persona, reachedSuccess: r.reachedSuccess, gaveUpBecause: r.gaveUpBecause || null })),
  issues: issues.map(({ id, title, severity, count, personas }) => ({ id, title, severity, count, personas })),
};
if (issues.length === 0) return { ...summary, fixed: [] };

// ── 3. Human picks what to fix ─────────────────────────────────────────────
phase('decide');
const serious = issues.filter((i) => i.severity !== 'minor');
const listing = issues.map((i) => `${i.id} [${i.severity}, ${i.count}/${PERSONAS.length}] ${i.title}`).join('\n');
const FIX_ALL = `Fix all ${issues.length}`;
const FIX_SERIOUS = `Fix blockers and majors (${serious.length})`;
let choice;
try {
  choice = await ask(`fresh-eyes found ${issues.length} issues (details and screenshots: ${reportPath}):\n${listing}`, [
    FIX_ALL,
    ...(serious.length && serious.length < issues.length ? [FIX_SERIOUS] : []),
    'Report only, fix nothing',
  ]);
} catch {
  choice = undefined; // no UI to ask: never fix without a human decision
}
const toFix = choice === FIX_ALL ? issues : choice === FIX_SERIOUS ? serious : [];
if (toFix.length === 0) return { ...summary, fixed: [], note: 'No fixes chosen; report only.' };

// ── 4. Fix ─────────────────────────────────────────────────────────────────
phase('fix');
const fix = await agent(
  `First-time users hit these issues in the web app served at ${URL}, whose source is the repository at ${REPO}. ` +
    `Work only inside ${REPO} (use absolute paths). ` +
    `Fix every one at its root cause, in one pass. Look at the screenshots (read the PNG paths) to see what users saw. ` +
    `Keep changes as small as the fix allows and do not commit. Run the project's existing checks (typecheck, lint, tests) if it has them. ` +
    `Check your fixes in a real browser with the same tool the users had (install nothing else): ` +
    `node ${BROWSE} ${path.join(OUT, 'fix-check')}-<desktop|mobile> start <desktop|mobile>, then goto/look/click/fill/shot as needed, then stop. ` +
    `Before you finish, make sure ${URL} serves your changes: if the dev server does not hot reload, restart it in the background with nohup so it keeps running.\n\n` +
    `ISSUES:\n${JSON.stringify(toFix, null, 1)}`,
  {
    label: 'fixer',
    tools: ['read', 'bash', 'edit', 'write', 'grep', 'find', 'ls'],
    timeoutMs: 60 * 60_000,
    schema: {
      type: 'object',
      properties: {
        fixed: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'string' }, change: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } },
            required: ['id', 'change', 'files'],
          },
        },
        notFixed: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'string' }, reason: { type: 'string' } }, required: ['id', 'reason'] },
        },
        checks: { type: 'string', description: 'which checks you ran and their result' },
      },
      required: ['fixed', 'notFixed', 'checks'],
    },
  },
);

// ── 5. Replay to prove it ──────────────────────────────────────────────────
phase('replay');
const fixedIds = new Set(fix.fixed.map((f) => f.id));
const byPersona = Object.fromEntries(reports.map((r) => [r.persona, r]));
const replays = (
  await walk('replay', (p) => {
    const mine = issues.filter((i) => fixedIds.has(i.id) && i.personas.includes(p.id));
    const before = byPersona[p.id];
    return (
      `\n\nTHIS IS YOUR SECOND VISIT. Last time you took this path:\n${(before?.path || []).join('\n')}\n\n` +
      (mine.length
        ? `The team says they fixed these issues you hit:\n${mine.map((i) => `${i.id}: ${i.title} (before: ${i.screenshots.join(', ')})`).join('\n')}\n` +
          `Replay your path. At each of those moments take a shot and give a verdict per id (fixed / still broken / could not reach), pointing at the new screenshot.\n`
        : 'None of your issues were in the fix list; verdicts can be empty.\n') +
      'Then keep going to first success as a first-time user would, and record any NEW issues (including ones the fixes caused) in issues.'
    );
  })
).filter(Boolean);

// Per issue, the strongest verdict across personas wins: one "still broken" beats any "fixed", and "fixed" beats "could not reach".
const RANK = { 'still broken': 3, fixed: 2, 'could not reach': 1 };
const verdicts = {};
for (const r of replays) for (const v of r.verdicts) if (!verdicts[v.id] || RANK[v.status] > RANK[verdicts[v.id].status]) verdicts[v.id] = v;
writeReport(verdicts);
fs.appendFileSync(
  reportPath,
  `\n## Replay\n\n${replays.map((r) => `- ${r.persona}: ${r.reachedSuccess ? 'reached success' : `gave up: ${r.gaveUpBecause}`}; new issues: ${r.issues.map((i) => `${i.title} (${i.screenshot})`).join('; ') || 'none'}`).join('\n')}\n\n## Fixer\n\n${fix.checks}\n${fix.notFixed.map((n) => `- not fixed ${n.id}: ${n.reason}`).join('\n')}\n`,
);

return {
  ...summary,
  fixed: fix.fixed.map((f) => ({ id: f.id, files: f.files, verdict: verdicts[f.id]?.status || 'not verified' })),
  notFixed: fix.notFixed,
  checks: fix.checks,
  replay: replays.map((r) => ({ persona: r.persona, reachedSuccess: r.reachedSuccess, newIssues: r.issues.map((i) => i.title) })),
};
