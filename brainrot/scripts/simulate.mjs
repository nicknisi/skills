#!/usr/bin/env node
// simulate.mjs — dev-only check for the runner's autopilot. Not used by the skill itself.
//
//   node scripts/build.mjs beats.json --out /tmp/x.html --no-open
//   node scripts/simulate.mjs /tmp/x.html [seconds=90] [chaos]
//
// Runs the built page's script under a stub DOM and a proxy THREE with a virtual clock
// (setTimeout/setInterval/requestAnimationFrame), ticks 60 fps for N simulated seconds,
// and prints deaths, coins, landings, lanes used, beat/key/stunt cue counts, and whether
// the lesson reached GG. Headless Chrome can't be trusted for rAF-driven pages; this can.
import fs from 'node:fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const seconds = +(process.argv[3] || 90), chaos = process.argv[4] === 'chaos';
const code = html.match(/<script>\n([\s\S]*?)\n<\/script>/)[1];
const dataJson = html.match(/<script id="brainrot-data"[^>]*>([\s\S]*?)<\/script>/)[1];

// ---- virtual clock + timers
let now = 0, timers = [], tid = 1, rafs = [];
globalThis.performance = { now: () => now };
globalThis.setTimeout = (fn, ms = 0) => { timers.push({ id: tid, at: now + ms, fn }); return tid++; };
globalThis.setInterval = (fn, ms = 0) => { timers.push({ id: tid, at: now + ms, fn, every: ms }); return tid++; };
globalThis.clearTimeout = globalThis.clearInterval = (id) => { timers = timers.filter((t) => t.id !== id); };
globalThis.requestAnimationFrame = (cb) => { rafs.push(cb); return rafs.length; };
function tick(ms) {
  now += ms;
  for (;;) { const due = timers.filter((t) => t.at <= now).sort((a, b) => a.at - b.at)[0]; if (!due) break; if (due.every) due.at += due.every; else timers = timers.filter((t) => t !== due); due.fn(); }
  const cbs = rafs; rafs = []; for (const cb of cbs) cb(now);
}

// ---- stub DOM
const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
class ClassList { constructor() { this.s = new Set(); } add(...c) { c.forEach((x) => this.s.add(x)); } remove(...c) { c.forEach((x) => this.s.delete(x)); } toggle(c, f) { const on = f === undefined ? !this.s.has(c) : !!f; on ? this.s.add(c) : this.s.delete(c); return on; } contains(c) { return this.s.has(c); } }
class El {
  constructor(tag) { this.tag = tag; this.classList = new ClassList(); this.style = { setProperty() {} }; this.dataset = {}; this.hidden = false; this.textContent = ''; this.children = []; this.words = []; this.width = 0; this.height = 0; this.value = ''; this.checked = false; }
  set innerHTML(h) { this._h = h; this.words = [...h.matchAll(/<span class="w" data-start="(\d+)">([\s\S]*?)<\/span>/g)].map((m) => { const e = new El('span'); e.dataset.start = m[1]; e.textContent = unesc(m[2]); return e; }); }
  get innerHTML() { return this._h || ''; }
  querySelectorAll(sel) { if (sel === '.w') return this.words; if (sel.includes('.w.')) return this.words.filter((w) => sel.split(',').some((s) => s.trim().split('.').slice(2).every((c) => w.classList.contains(c)))); return this.children.filter((c) => c.classList.contains(sel.replace('.', ''))); }
  querySelector(sel) { if (sel === 'input') return (this.input ||= new El('input')); return null; }
  appendChild(c) { this.children.push(c); c.parentNode = this; return c; } remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((c) => c !== this); }
  scrollIntoView() {} getBoundingClientRect() { return { width: 520, height: 420 }; } getContext() { return anyProxy(); } removeAttribute() {} addEventListener() {} blur() {} setAttribute() {} matches() { return false; }
  get scrollHeight() { return 0; } get clientHeight() { return 1; } get offsetWidth() { return 1; }
}
const byId = new Map(); const el = (id) => { if (!byId.has(id)) byId.set(id, new El('div')); return byId.get(id); };
globalThis.document = { getElementById: el, querySelector: (s) => { const m = s.match(/^#([\w-]+)( input)?$/); if (!m) return new El('x'); return m[2] ? el(m[1]).querySelector('input') : el(m[1]); }, createElement: (t) => new El(t), addEventListener() {}, hidden: false, title: '' };
globalThis.window = globalThis; globalThis.matchMedia = () => ({ matches: false }); globalThis.addEventListener = () => {}; globalThis.dispatchEvent = () => {};
const ls = new Map(); globalThis.localStorage = { getItem: (k) => (ls.has(k) ? ls.get(k) : null), setItem: (k, v) => ls.set(k, v) };
globalThis.ResizeObserver = class { observe() {} }; globalThis.HTMLButtonElement = class {}; globalThis.Event = class { constructor(t) { this.type = t; } }; globalThis.KeyboardEvent = globalThis.Event;
globalThis.devicePixelRatio = 1; globalThis.speechSynthesis = undefined; // → captions-only pacing drives the beats
const anyProxy = () => new Proxy(function () {}, { get(_, k) { if (k === Symbol.toPrimitive) return () => 0; if (k === 'then' || k === Symbol.iterator) return undefined; return anyProxy(); }, apply() { return anyProxy(); }, construct() { return anyProxy(); }, set() { return true; } });
globalThis.THREE = anyProxy();
el('brainrot-data').textContent = dataJson;

// ---- run
const logs = []; const origWarn = console.warn; console.warn = (...a) => logs.push(a.join(' ')); console.info = () => {};
new Function(code)();
const B = globalThis.__brainrot, sim = B.runner.sim;
let keyCues = 0, beatCues = 0, endCues = 0; const origCue = B.runner.cue; B.runner.cue = (k, a) => { if (k === 'key') keyCues++; if (k === 'beat') beatCues++; if (k === 'end') endCues++; return origCue(k, a); };
if (chaos) { B.state.chaos = true; B.runner.setChaos(true); }
el('gate').onclick();                                    // start
let maxY = 0, minY = 0, landings = 0, wasGrounded = true, lanesUsed = new Set(), stuntsSeen = 0, wasStunt = false, fellDeaths = 0;
const deathsBefore = () => sim.world.deaths;
for (let t = 0; t < seconds * 1000; t += 1000 / 60) {
  tick(1000 / 60);
  maxY = Math.max(maxY, sim.P.y); if (!sim.P.dead) minY = Math.min(minY, sim.P.y);
  if (!wasGrounded && sim.P.grounded) landings++; wasGrounded = sim.P.grounded;
  lanesUsed.add(sim.P.lane);
  if (sim.P.stuntT > 0 && !wasStunt) stuntsSeen++; wasStunt = sim.P.stuntT > 0;
}
const counter = el('counter').textContent, finished = B.state.finished;
const stats = B.runner.stats();
console.log(JSON.stringify({ mode: chaos ? 'chaos' : 'normal', seconds, ...stats, speed: +(stats.dist / seconds).toFixed(1), landings, maxY: +maxY.toFixed(2), lanesUsed: [...lanesUsed].sort(), beatCues, keyCues, endCues, stuntsSeen, counter, finished, streak: el('streak').textContent, errorsLogged: logs.filter((l) => /error|Error/.test(l)).slice(0, 3), voidFalls: logs.filter((l) => l.includes('VOID')).length }));
