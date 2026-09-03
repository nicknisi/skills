#!/usr/bin/env node
// build.mjs — assemble a brainrot lesson page from a beats JSON file.
//
// Zero dependencies. Works under `node build.mjs` (18+) and `bun build.mjs`.
//
//   node scripts/build.mjs <beats.json> [--out <file.html>] [--video <youtube id|url>] [--no-open]
//
// Reads assets/template.html, injects the JSON into the data island, writes the
// page (default: ~/.cache/brainrot/<slug>-<stamp>.html), opens it in the
// default browser, and prints the path. The page loads three.js from cdnjs for
// the 3D runner and falls back to a built-in 2D renderer when offline; YouTube
// mode needs the network too. Everything else is inline.

import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = path.join(here, "..", "assets", "template.html");
const MARKER = "<!--BRAINROT_DATA-->";
const MAX_WORDS = 60; // warn above this; browsers' TTS gets flaky on long utterances

function usage(code) {
  console.error(
    "usage: node build.mjs <beats.json> [--out <file.html>] [--video <youtube id|url>] [--no-open]",
  );
  process.exit(code);
}

function parseArgs(argv) {
  const args = { input: null, out: null, video: null, open: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") args.out = argv[++i];
    else if (a === "--video") args.video = argv[++i];
    else if (a === "--no-open") args.open = false;
    else if (a === "-h" || a === "--help") usage(0);
    else if (a.startsWith("--")) {
      console.error(`unknown flag: ${a}`);
      usage(1);
    } else if (!args.input) args.input = a;
    else usage(1);
  }
  if (!args.input) usage(1);
  return args;
}

// Accept a bare 11-char id, watch?v=, youtu.be/, /shorts/, /embed/, /live/.
export function youtubeId(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m =
    s.match(/[?&]v=([\w-]{11})/) ||
    s.match(/youtu\.be\/([\w-]{11})/) ||
    s.match(/\/(?:shorts|embed|live)\/([\w-]{11})/);
  return m ? m[1] : null;
}

function slugify(s) {
  return (
    String(s || "lesson")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "lesson"
  );
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

function wordCount(s) {
  return String(s || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function validate(data) {
  const problems = [];
  const warnings = [];
  if (!data || typeof data !== "object") problems.push("top level must be an object");
  if (!data.title || typeof data.title !== "string") problems.push("`title` (string) is required");
  if (!Array.isArray(data.beats) || data.beats.length === 0)
    problems.push("`beats` must be a non-empty array");
  else {
    data.beats.forEach((b, i) => {
      if (!b || typeof b.text !== "string" || !b.text.trim())
        problems.push(`beats[${i}].text must be a non-empty string`);
      else {
        const n = wordCount(b.text);
        if (n > MAX_WORDS)
          warnings.push(`beats[${i}] is ${n} words; keep beats under ~40 so TTS stays snappy`);
      }
      if (b.key != null) {
        if (typeof b.key !== "string") problems.push(`beats[${i}].key must be a string`);
        else if (typeof b.text === "string" && !b.text.toLowerCase().includes(b.key.trim().toLowerCase()))
          warnings.push(`beats[${i}].key "${b.key}" is not in its text; the stunt will fire at ~70% instead`);
        else if (wordCount(b.key) > 6) warnings.push(`beats[${i}].key is ${wordCount(b.key)} words; keep it to 1–5`);
      } else warnings.push(`beats[${i}] has no key phrase; the stunt will fire at ~70% of the beat`);
      if (b.code != null && typeof b.code !== "string") problems.push(`beats[${i}].code must be a string`);
      if (b.eli5 != null && typeof b.eli5 !== "string") problems.push(`beats[${i}].eli5 must be a string`);
    });
    if (data.beats.length < 4) warnings.push("fewer than 4 beats — this will be over before the little guy jumps twice");
    if (data.beats.length > 30) warnings.push("more than 30 beats — consider splitting into two lessons");
  }
  if (data.mode && !["teach", "focus"].includes(data.mode))
    problems.push("`mode` must be 'teach' or 'focus'");
  return { problems, warnings };
}

function openInBrowser(file) {
  const plat = process.platform;
  const cmd = plat === "darwin" ? "open" : plat === "win32" ? "cmd" : "xdg-open";
  const argv = plat === "win32" ? ["/c", "start", "", file] : [file];
  const child = spawn(cmd, argv, { stdio: "ignore", detached: true });
  child.on("error", () => console.error(`(could not auto-open; open ${file} yourself)`));
  child.unref();
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  let raw;
  try {
    raw = fs.readFileSync(args.input, "utf8");
  } catch (e) {
    console.error(`cannot read ${args.input}: ${e.message}`);
    process.exit(1);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`invalid JSON in ${args.input}: ${e.message}`);
    process.exit(1);
  }

  if (args.video) {
    const id = youtubeId(args.video);
    if (!id) {
      console.error(`--video: could not find a YouTube id in "${args.video}"`);
      process.exit(1);
    }
    data.video = { ...(data.video || {}), youtube: id };
  } else if (data.video && data.video.youtube) {
    const id = youtubeId(data.video.youtube);
    if (!id) console.error(`warning: video.youtube "${data.video.youtube}" does not look like a YouTube id; ignoring`);
    data.video.youtube = id;
  }

  const { problems, warnings } = validate(data);
  for (const w of warnings) console.error(`warning: ${w}`);
  if (problems.length) {
    for (const p of problems) console.error(`error: ${p}`);
    process.exit(1);
  }

  let template;
  try {
    template = fs.readFileSync(TEMPLATE, "utf8");
  } catch (e) {
    console.error(`template missing at ${TEMPLATE}: ${e.message}`);
    process.exit(1);
  }
  if (!template.includes(MARKER)) {
    console.error(`template has no ${MARKER} marker`);
    process.exit(1);
  }

  // Inside a <script type="application/json"> the only thing that can break
  // out is a literal "</script". Escaping the slash keeps the JSON valid.
  const json = JSON.stringify(data).replace(/<\//g, "<\\/");
  const html = template.replace(MARKER, json);

  const out =
    args.out ||
    path.join(os.homedir(), ".cache", "brainrot", `${slugify(data.title)}-${stamp()}.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);

  console.log(out);
  console.error(
    `${data.beats.length} beats · ${data.beats.reduce((n, b) => n + wordCount(b.text), 0)} words · ${
      data.video && data.video.youtube ? "youtube " + data.video.youtube : "built-in runner"
    }`,
  );
  if (args.open) openInBrowser(out);
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
