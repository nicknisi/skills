---
name: fresh-eyes
description: Launch QA with first-time-user personas. Use when the user says "fresh-eyes", or wants a web app's first-run experience tested by simulated new users (impatient, skeptic, mobile on slow 3G, non-native speaker, breaker) in real browsers, with the friction ranked, fixed, and re-verified.
---

# Fresh eyes

Five persona agents each get their own real Chrome, walk the app from the landing page to first success, and screenshot every moment they get confused, stuck, or annoyed. The saved `fresh-eyes` workflow merges and ranks the issues, asks the user which to fix, runs one fixer, then the same personas replay their paths and give a verdict on each fix. The personas and every step live in [`workflow.js`](workflow.js).

## Run it

1. **Pick the target.** The app must already be running at an http(s) URL. Start the dev server in the background if needed. Use a local or staging URL: the breaker persona submits junk and duplicate forms, so it creates real records. If the only URL is production, get explicit approval first.
2. **Define first success** as one observable end state ("signed up and saw the dashboard with their first project"). Derive it from the conversation or the product; ask only when it can't be inferred. Collect **notes** a stranger couldn't discover: test credentials, how to get past email verification, seeded data.
3. **Set up once:**
   - `npm --prefix <skill-dir>/scripts install` when `<skill-dir>/scripts/node_modules` is missing.
   - `mkdir -p ~/.pi/agent/workflows && ln -sf <skill-dir>/workflow.js ~/.pi/agent/workflows/fresh-eyes.js`
   - Google Chrome must be installed, or `CHROME_PATH` set.
4. **Run** the `workflow` tool: action `run`, name `fresh-eyes`, args:
   - `url`, `success`, `notes`
   - `browse`: absolute path to `<skill-dir>/scripts/browse.mjs`
   - `outDir`: `~/.cache/fresh-eyes/<repo-name>-<YYYYMMDD-HHMM>` (absolute)
   - `personas` (optional): subset of `impatient`, `skeptic`, `mobile`, `literal`, `breaker`, when the user asks for specific ones

   - `repo` (optional): the app's source repo when it is not the current directory; the fixer edits only there

   Mid-run, the workflow asks the user which issues to fix; nothing changes before that answer.

## After the run

Lead with what a stranger experiences: which personas reached first success and where the others gave up. Then show the ranked issues (id, severity, how many personas hit it, verdict) and the path to `report.md`, which lists every before and after screenshot. Call out any fix that is **still broken** or **not verified**, plus new issues found in the replay. The fixes are left uncommitted for review.
