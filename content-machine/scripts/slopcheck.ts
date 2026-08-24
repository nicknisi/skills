#!/usr/bin/env node
/**
 * Corpus-calibrated structural slop detector.
 *
 * Vocabulary scanners miss modern AI prose. The tells are structural and, critically,
 * they are *rates* — a real writer uses every one of these devices occasionally. Slop
 * is what happens when a device fires on every section instead of once a post.
 *
 * So this measures a draft against the author's own published corpus and flags
 * outliers in BOTH directions (over-suppression is as suspicious as excess).
 * On top of that sit absolute gates no corpus can average away: unsourced
 * high-risk claims, invented interiority, and broken links.
 *
 * Usage (Node 24+ runs .ts directly):
 *     node slopcheck.ts --corpus 'posts/*.md*' --draft draft.mdx
 *     node slopcheck.ts --corpus 'posts/*.md*'              # just print baselines
 *     node slopcheck.ts --corpus 'posts/*.md*' --draft d.mdx --check-links
 *
 * Exit codes: 0 clean; 1 structural flags or broken links; 2 structurally clean
 * but provenance work remains (unsourced claims / interiority for the author).
 */

import { globSync, readFileSync } from "node:fs";

// ---------------------------------------------------------------- text cleanup

/** Reduce a .md/.mdx post to prose. Everything stripped here would skew the stats. */
function stripMarkdown(text: string): string {
  return text
    .replace(/^---\n[\s\S]*?\n---\n/, "") // frontmatter
    .replace(/^import .*$/gm, "") // mdx imports
    .replace(/```[\s\S]*?```/g, "") // fenced code
    .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, "") // jsx blocks
    .replace(/<[^>]+>/g, "") // stray tags
    .replace(/^\s*\|.*$/gm, "") // tables
    .replace(/^\s*>.*$/gm, "") // blockquotes (quoted sources)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"); // links -> label
}

type Section = [header: string, body: string];

/** Split on ## headers. Returns [(header, body)]; body may be ''. */
function splitSections(text: string): Section[] {
  const parts = text.split(/^##+ +(.*)$/m);
  if (parts.length === 1) return [["", text]];
  const out: Section[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    out.push([parts[i].trim(), parts[i + 1] ?? ""]);
  }
  return out;
}

function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function sentences(p: string): string[] {
  return p
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

function words(t: string): string[] {
  return t.match(/[\w'’-]+/g) ?? [];
}

function count(text: string, rx: RegExp): number {
  const flags = rx.flags.includes("g") ? rx.flags : rx.flags + "g";
  return [...text.matchAll(new RegExp(rx.source, flags))].length;
}

function mean(v: number[]): number {
  return v.reduce((a, b) => a + b, 0) / v.length;
}

function pstdev(v: number[]): number {
  const m = mean(v);
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length);
}

function round(n: number, places = 2): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

// ------------------------------------------------------------------- detectors

// "Not X. It's Y." / "wasn't X. That was Y." / "isn't X, it is Y"
const ANTITHESIS =
  /\b(?:not|n't|isn't|wasn't|aren't|weren't)\b[^.!?\n]{0,120}[.,;—-]\s*(?:it's|that's|it is|that is|it was|that was|they're|you're)\b/i;

// narrator emceeing his own post
const STAGE_DIRECTIONS =
  /\b(?:now watch what|here's the (?:part|thing) (?:that|where)|watch what happens|let me be clear|make no mistake|i want that on the record|that's the part i'd put on|and here's the (?:kicker|rub|twist)|but here's the thing)\b/i;

// staged revelation
const EPIPHANY =
  /\b(?:reframed everything|changed everything|something clicked|the most \w+ (?:sentence|thing|question) i(?:'ve)? \w+|that was the moment|it (?:finally )?clicked|then it hit me|i'll never forget the moment)\b/i;

// first-person mental-state predicates: the interiority surface
const INTERIORITY = new RegExp(
  "\\bI\\s+(?:felt|feel|realized|realised|knew|thought|believed|wanted|feared|" +
    "assumed|decided|noticed|understood|suspected|hoped|worried|loved|hated|" +
    "didn't (?:think|realize|realise|know|care|notice)|" +
    "never (?:thought|realized|realised|noticed|considered))\\b" +
    "|it (?:had )?never occurred to me" +
    "|\\bI'd (?:been|spent|assumed|thought|told myself)\\b" +
    "|\\bI (?:did not|didn't) (?:want|mean|intend|expect)\\b" +
    "|\\bI went a little \\w+" +
    "|^\\s*mostly i was\\b" +
    "|\\bI was (?:bored|tired|annoyed|frustrated|curious|nervous|embarrassed|hooked)\\b" +
    "|\\bmy (?:exit strategy|whole personality|instinct|first instinct)\\b",
  "i",
);

const CLOSURE_DEVICES: Record<string, RegExp> = {
  // A vocative, not just any sentence opening with "Word,". Requires second
  // person immediately after the name: "And Zack — you were right...".
  "direct address": /^(?:and |but |so )?[A-Z][a-z]+\s*[—,]\s+(?:you|your|if you)\b/im,
  "past-self frame": /what i'd tell|if you'd asked me|July me|past me/i,
  "bolded lesson": /\*\*[^*]{40,}\*\*/,
  "apology/absolution": /\bsorry about\b|\byou were right\b/i,
};

// "not just X, but Y" and cousins — the contrastive reframe
const NEG_PARALLEL =
  /\b(?:not just|isn't just|not only|isn't merely|not merely|more than just|it's not about|isn't about|isn't simply)\b/i;

// trailing "-ing" analysis clause bolted on for unearned depth
const ING_TAIL =
  /,\s(?:highlighting|underscoring|emphasizing|showcasing|reflecting|demonstrating|signaling|illustrating|ensuring|enabling|allowing)\b[^.\n]*\./i;

// bold-label-colon items: "**Performance:** Performance improved…" — the inline-header tell
const INLINE_HEADER_ITEM = /^\s*(?:[-*+]|\d+[.)])?\s*\*\*[^*\n]+?:\*\*/m;

// Allusive narrative-beat H2s — chapter titles, not topics. Curated list so
// descriptive headers never match; safe as a hard flag.
const NARRATIVE_BEAT_H2 =
  /^(?:the )?(?:drift|turn|fall|climb|descent|return|reckoning|unravel(?:ing)?|awakening|homecoming|coming home|breaking point|aftermath|beginning|end)$/i;

// A bold span ≥40 chars anywhere in prose reads as a highlighted lesson —
// the closure detector only checks the tail; this checks the whole body.
const BOLD_APHORISM = /\*\*[^*\n]{40,}\*\*/;

// ---------------------------------------------------- provenance (draft-only)

// High-risk claims: sentences stating a checkable specific. Each needs a
// [source: ...] marker or a link in the same sentence, else it's flagged.
const SOURCE_MARK = /\[source:[^\]]*\]/i;
// ponytail: digit-based only — spelled-out numbers ("twelve minutes") pass; add if they bite.
const NUMERIC_UNIT =
  /\b\d[\d,.]*\s?(?:ms|s|seconds?|minutes?|hours?|days?|weeks?|months?|years?|kb|mb|gb|%|percent|x|users?|requests?|posts?|commits?|lines?|files?|words?|dollars?)\b/i;
const VERSION_NUM = /\bv?\d+\.\d+(?:\.\d+)?\b/;
const STATUS_VERB =
  /\b(?:shipped|launched|released|deployed|went live|is live|rolled out|merged|published)\b/i;
const ATTRIBUTION =
  /\b(?:[Aa]ccording to|[Ss]aid|[Ss]ays|[Ww]rote|[Nn]oted|[Rr]eported|[Tt]old)\s+[A-Z][a-z]/;
const QUOTED_TEXT = /["\u201c][^"\u201d]{15,}["\u201d]/;
const VAGUE_AUTHORITY =
  /\b(?:experts? (?:believe|agree|say)|studies (?:show|suggest)|research (?:shows|suggests)|it'?s widely (?:known|accepted)|industry reports?|some (?:critics|people) (?:argue|say))\b/i;

// metric -> regex used to quote the offending lines when the metric flags
const EXAMPLE_PATTERNS: Record<string, RegExp> = {
  antithesis_per_1k: ANTITHESIS,
  stage_directions: STAGE_DIRECTIONS,
  epiphany_markers: EPIPHANY,
  em_dash_per_1k: /—/,
  neg_parallelism_per_1k: NEG_PARALLEL,
  ing_tail_per_1k: ING_TAIL,
  inline_header_per_1k: INLINE_HEADER_ITEM,
};

/**
 * Original lines with non-prose blanked, so line numbers stay true.
 * Links are kept intact — a link in a sentence counts as a citation.
 */
function cleanLines(text: string): string[] {
  const out: string[] = [];
  let inFence = false;
  let inFront = false;
  text.split("\n").forEach((line, i) => {
    const s = line.trim();
    if (i === 0 && s === "---") {
      inFront = true;
      out.push("");
      return;
    }
    if (inFront) {
      if (s === "---") inFront = false;
      out.push("");
      return;
    }
    if (s.startsWith("```")) {
      inFence = !inFence;
      out.push("");
      return;
    }
    if (inFence || s.startsWith("|") || s.startsWith(">") || s.startsWith("import ")) {
      out.push("");
      return;
    }
    out.push(line.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/<[^>]+>/g, ""));
  });
  return out;
}

function highRiskReason(sentence: string): string {
  if (VAGUE_AUTHORITY.test(sentence)) return "vague authority";
  if (QUOTED_TEXT.test(sentence)) return "quote";
  if (ATTRIBUTION.test(sentence)) return "attribution";
  if (NUMERIC_UNIT.test(sentence)) return "number+unit";
  if (VERSION_NUM.test(sentence)) return "version";
  if (STATUS_VERB.test(sentence)) return "status verb";
  return "";
}

type Uncited = [line: number, reason: string, sentence: string];

/**
 * High-risk sentences with neither a [source: ...] marker nor a link.
 * ponytail: a sentence is judged within one line — a citation on a
 * hard-wrapped continuation line won't be seen. One paragraph per line
 * (Nick's format) makes this exact.
 */
function findUncited(lines: string[]): Uncited[] {
  const out: Uncited[] = [];
  lines.forEach((line, i) => {
    const s0 = line.trim();
    if (!s0 || s0.startsWith("#")) return;
    for (const s of sentences(s0)) {
      if (SOURCE_MARK.test(s) || s.includes("](") || s.includes("http")) continue;
      const reason = highRiskReason(s);
      if (reason) out.push([i + 1, reason, s]);
    }
  });
  return out;
}

/** 3+ H2s all opening on a gerund, or all on the same word — template silhouette. */
function h2Symmetry(text: string): [h2s: string[], reason: string] {
  const h2s = [...text.matchAll(/^## +(.+)$/gm)].map((m) => m[1].trim());
  const first = h2s.map((h) => h.match(/[\w'-]+/)?.[0]).filter((w): w is string => Boolean(w));
  if (first.length >= 3) {
    if (first.every((w) => w.toLowerCase().endsWith("ing") && w.length > 4)) {
      return [h2s, "every H2 opens on a gerund"];
    }
    if (new Set(first.map((w) => w.toLowerCase())).size === 1) {
      return [h2s, `every H2 opens with "${first[0]}"`];
    }
  }
  return [h2s, ""];
}

function quoteMatches(lines: string[], rx: RegExp, limit = 3): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length && out.length < limit; i++) {
    if (rx.test(lines[i])) {
      const t = lines[i].trim();
      out.push(t.length > 110 ? `L${i + 1}: ${t.slice(0, 110)}…` : `L${i + 1}: ${t}`);
    }
  }
  return out;
}

// ------------------------------------------- provenance vs source (draft-only)
//
// Mirrors Pangram 4's soft n-grams labeler (§3.5 of their technical report):
// a clause is Human on near-exact LEXICAL match to human source; reworded is
// AI-Assisted; novel is AI-Generated. Reordering is a non-edit. So the only
// durable way to score human is a high verbatim fraction — measured here.

function wordTokens(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

function ngramSet(tokens: string[], n: number): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i + n <= tokens.length; i++) out.add(tokens.slice(i, i + n).join(" "));
  return out;
}

type ProvenanceClass = "verbatim" | "adapted" | "generated";

interface ProvenanceReport {
  fractions: Record<ProvenanceClass, number>; // character-weighted
  runs: { start: number; end: number; words: number; preview: string }[]; // longest generated runs
}

/**
 * Classify each prose sentence against the author's raw material (working
 * file, interview transcript, Slack quotes). 5-gram containment ≥0.5 ≈
 * near-exact lexical match (verbatim); ≥0.15 ≈ substantial rewrite (adapted);
 * below ≈ open generation (generated).
 * ponytail: sentence = within one line, same limit as findUncited.
 */
function provenanceVsSource(lines: string[], sourceText: string): ProvenanceReport {
  const N = 5;
  const srcTokens = wordTokens(sourceText);
  const srcGrams = ngramSet(srcTokens, N);
  const srcJoined = srcTokens.join(" ");

  const chars: Record<ProvenanceClass, number> = { verbatim: 0, adapted: 0, generated: 0 };
  const genRuns: ProvenanceReport["runs"] = [];
  let run: { start: number; end: number; words: number; preview: string } | null = null;

  lines.forEach((line, i) => {
    const s0 = line.trim();
    if (!s0 || s0.startsWith("#")) return;
    for (const s of sentences(s0)) {
      const toks = wordTokens(s);
      if (toks.length === 0) continue;
      let cls: ProvenanceClass;
      if (toks.length < N + 1) {
        cls = srcJoined.includes(toks.join(" ")) ? "verbatim" : "generated";
      } else {
        const grams = ngramSet(toks, N);
        let hit = 0;
        for (const g of grams) if (srcGrams.has(g)) hit++;
        const ratio = hit / grams.size;
        cls = ratio >= 0.5 ? "verbatim" : ratio >= 0.15 ? "adapted" : "generated";
      }
      chars[cls] += s.length;
      if (cls === "generated") {
        if (run && i - run.end <= 1) {
          run.end = i;
          run.words += toks.length;
        } else {
          if (run) genRuns.push(run);
          run = { start: i + 1, end: i, words: toks.length, preview: s.slice(0, 70) };
        }
      } else if (run) {
        genRuns.push(run);
        run = null;
      }
    }
  });
  if (run) genRuns.push(run);

  const total = Math.max(chars.verbatim + chars.adapted + chars.generated, 1);
  genRuns.sort((a, b) => b.words - a.words);
  return {
    fractions: {
      verbatim: chars.verbatim / total,
      adapted: chars.adapted / total,
      generated: chars.generated / total,
    },
    runs: genRuns.slice(0, 3),
  };
}

type LinkResult = [url: string, status: number | null];

/**
 * HEAD each URL, GET fallback. Only 404/410 count as broken — a gate that
 * cries wolf on bot-blocking 403s gets bypassed, not obeyed.
 */
async function checkLinks(urls: string[], timeoutMs = 10_000): Promise<[LinkResult[], LinkResult[]]> {
  const broken: LinkResult[] = [];
  const unverified: LinkResult[] = [];
  for (const url of urls) {
    let status: number | null = null;
    for (const method of ["HEAD", "GET"]) {
      try {
        const resp = await fetch(url, {
          method,
          headers: { "User-Agent": "Mozilla/5.0 slopcheck-linkcheck" },
          signal: AbortSignal.timeout(timeoutMs),
        });
        status = resp.status;
        if (method === "HEAD" && [403, 405, 501].includes(resp.status)) continue; // server dislikes HEAD; retry as GET
        break;
      } catch {
        status = null;
        if (method === "GET") break;
      }
    }
    if (status === 404 || status === 410) broken.push([url, status]);
    else if (status === null || status >= 400) unverified.push([url, status]);
  }
  return [broken, unverified];
}

function isPunchline(par: string): boolean {
  const w = words(par);
  if (!(w.length > 0 && w.length <= 20)) return false;
  if (sentences(par).length > 2) return false;
  if (/\d|`|http|\]\(/.test(par)) return false; // numbers, code, links = informational
  if (par.trimEnd().endsWith(":")) return false;
  return true;
}

// -------------------------------------------------------------------- analysis

type SectionStat = [header: string, wordCount: number, punchline: boolean, tail: string];

interface Analysis {
  words: number;
  sections: number;
  punchline_ending_rate: number;
  antithesis_per_1k: number;
  stage_directions: number;
  epiphany_markers: number;
  interiority_per_1k: number;
  em_dash_per_1k: number;
  neg_parallelism_per_1k: number;
  ing_tail_per_1k: number;
  inline_header_per_1k: number;
  section_length_cv: number;
  paragraph_length_cv: number;
  long_long_punch_per_1k: number;
  closure_devices_stacked: number;
  _closure: string[];
  _sections: SectionStat[];
  _prose: string;
}

function analyze(text: string): Analysis {
  const prose = stripMarkdown(text);
  const secs = splitSections(prose);
  const n = Math.max(words(prose).length, 1);
  const perK = (c: number) => round((c * 1000) / n);

  const secStats: SectionStat[] = [];
  let punchEndings = 0;
  for (const [header, body] of secs) {
    const pars = paragraphs(body);
    if (pars.length === 0) continue;
    const ends = isPunchline(pars[pars.length - 1]);
    if (ends) punchEndings++;
    secStats.push([header, words(body).length, ends, pars[pars.length - 1].slice(0, 70)]);
  }

  const nSecs = Math.max(secStats.length, 1);
  const secLengths = secStats.length > 0 ? secStats.map((s) => s[1]) : [0];
  const cv =
    secLengths.length > 1 && mean(secLengths) ? pstdev(secLengths) / mean(secLengths) : 0;

  const parLengths = secs.flatMap(([, body]) => paragraphs(body).map((p) => words(p).length));
  const parCv =
    parLengths.length > 1 && mean(parLengths) ? pstdev(parLengths) / mean(parLengths) : 0;

  // long-long-punch rhythm
  let triplets = 0;
  for (const [, body] of secs) {
    for (const p of paragraphs(body)) {
      const ss = sentences(p).map((s) => words(s).length);
      for (let i = 0; i < ss.length - 2; i++) {
        if (ss[i] > 15 && ss[i + 1] > 15 && ss[i + 2] < 7) triplets++;
      }
    }
  }

  const lastBody = secs.length > 0 ? secs[secs.length - 1][1] : "";
  const tail = paragraphs(lastBody).slice(-3).join(" ");
  const closure = Object.entries(CLOSURE_DEVICES)
    .filter(([, rx]) => rx.test(tail))
    .map(([k]) => k);

  return {
    words: n,
    sections: nSecs,
    punchline_ending_rate: round(punchEndings / nSecs),
    antithesis_per_1k: perK(count(prose, ANTITHESIS)),
    stage_directions: count(prose, STAGE_DIRECTIONS),
    epiphany_markers: count(prose, EPIPHANY),
    interiority_per_1k: perK(count(prose, INTERIORITY)),
    em_dash_per_1k: perK(prose.split("—").length - 1),
    neg_parallelism_per_1k: perK(count(prose, NEG_PARALLEL)),
    ing_tail_per_1k: perK(count(prose, ING_TAIL)),
    inline_header_per_1k: perK(count(prose, INLINE_HEADER_ITEM)),
    section_length_cv: round(cv),
    paragraph_length_cv: round(parCv),
    long_long_punch_per_1k: perK(triplets),
    closure_devices_stacked: closure.length,
    _closure: closure,
    _sections: secStats,
    _prose: prose,
  };
}

// Direction of suspicion: "high" = only excess is bad, "both" = suppression too.
//
// interiority_per_1k is deliberately NOT here. It used to be a z-score check and
// that was a design error: it turned a truth problem into a rate problem. A draft
// can score "in range" against the corpus mean while still containing fabricated
// claims about the author's mind, because the metric cannot distinguish invented
// interiority from remembered interiority. Unsourced mental-state claims have a
// target of ZERO, not a corpus average. Reported separately, always.
const METRICS: Record<string, "high" | "low" | "both"> = {
  punchline_ending_rate: "high",
  antithesis_per_1k: "high",
  stage_directions: "high",
  epiphany_markers: "high",
  em_dash_per_1k: "both",
  long_long_punch_per_1k: "high",
  closure_devices_stacked: "high",
  neg_parallelism_per_1k: "high",
  ing_tail_per_1k: "high",
  inline_header_per_1k: "high",
  section_length_cv: "low", // too UNIFORM is the tell
  paragraph_length_cv: "low", // metronomic paragraphs are the tell
};

// ------------------------------------------------------------------------ main

interface Args {
  corpus: string;
  draft?: string;
  exclude: string;
  checkLinks: boolean;
  sources: string[];
}

function parseArgs(argv: string[]): Args {
  const args: Args = { corpus: "", exclude: "", checkLinks: false, sources: [] };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case "--corpus":
        args.corpus = argv[++i] ?? "";
        break;
      case "--draft":
        args.draft = argv[++i];
        break;
      case "--exclude":
        args.exclude = argv[++i] ?? "";
        break;
      case "--check-links":
        args.checkLinks = true;
        break;
      case "--source":
        args.sources.push(argv[++i] ?? "");
        break;
    }
  }
  if (!args.corpus) {
    console.error("usage: slopcheck.ts --corpus 'posts/*.md*' [--draft d.mdx] [--check-links]");
    process.exit(64);
  }
  return args;
}

const fmt = (n: number, width: number, places = 2) => n.toFixed(places).padStart(width);

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const files = globSync(args.corpus)
    .sort()
    .filter((f) => !(args.exclude && f.includes(args.exclude)));
  if (files.length === 0) {
    console.error(`no corpus files matched '${args.corpus}'`);
    process.exit(1);
  }

  const base: Record<string, number[]> = {};
  for (const f of files) {
    const a = analyze(readFileSync(f, "utf-8"));
    if (a.words < 300) continue;
    for (const m of Object.keys(METRICS)) {
      (base[m] ??= []).push(a[m as keyof Analysis] as number);
    }
  }

  console.log(`CORPUS BASELINE  (${base.em_dash_per_1k.length} posts)\n` + "=".repeat(62));
  const stats: Record<string, [mean: number, sd: number]> = {};
  for (const m of Object.keys(METRICS)) {
    const v = base[m];
    const mu = mean(v);
    const sd = pstdev(v) || 0.01;
    stats[m] = [mu, sd];
    console.log(
      `  ${m.padEnd(26)} mean ${fmt(mu, 7)}   sd ${fmt(sd, 6)}   max ${fmt(Math.max(...v), 7)}`,
    );
  }

  if (!args.draft) return;

  const draftText = readFileSync(args.draft, "utf-8");
  const d = analyze(draftText);
  const dlines = cleanLines(draftText);
  console.log(`\nDRAFT: ${args.draft}  (${d.words} words, ${d.sections} sections)\n` + "=".repeat(62));

  const fails: string[] = [];
  for (const [m, direction] of Object.entries(METRICS)) {
    const [mu, sd] = stats[m];
    const val = d[m as keyof Analysis] as number;
    const z = (val - mu) / sd;
    const bad =
      (direction === "high" && z > 2) ||
      (direction === "low" && z < -2) ||
      (direction === "both" && Math.abs(z) > 2);
    const mark = bad ? "  FLAG" : "      ";
    const zs = `${z >= 0 ? "+" : ""}${z.toFixed(1)}`;
    console.log(`${mark}  ${m.padEnd(26)} ${fmt(val, 7)}   (corpus ${mu.toFixed(2)}, z=${zs})`);
    if (bad) fails.push(m);
  }

  const shown = fails.filter((m) => m in EXAMPLE_PATTERNS);
  if (shown.length > 0) {
    console.log("\n  offending lines (fix these exact spots, not the whole draft):");
    for (const m of shown) {
      for (const q of quoteMatches(dlines, EXAMPLE_PATTERNS[m])) {
        console.log(`    ${m.padEnd(26)} ${q}`);
      }
    }
  }

  const [h2s, sym] = h2Symmetry(draftText);
  if (sym) {
    fails.push("h2_symmetry");
    console.log(`\n  FLAG  h2_symmetry: ${sym} — ${h2s.join("; ")}`);
  }

  const beatH2s = h2s.filter((h) => NARRATIVE_BEAT_H2.test(h));
  if (beatH2s.length > 0) {
    fails.push("narrative_beat_h2");
    console.log(`\n  FLAG  narrative_beat_h2: chapter-title headers — name the topic instead: ${beatH2s.join("; ")}`);
  }

  const boldAphorisms = quoteMatches(dlines, BOLD_APHORISM);
  if (boldAphorisms.length > 0) {
    fails.push("bolded_aphorism");
    console.log("\n  FLAG  bolded_aphorism: bold span ≥40 chars reads as a highlighted lesson — unbold or cut:");
    for (const q of boldAphorisms) console.log(`    ${q}`);
  }

  console.log("\n  section endings:");
  for (const [header, wc, punch, tail] of d._sections) {
    const label = punch ? "PUNCHLINE" : "   flat  ";
    console.log(`    ${label}  ${header.slice(0, 34).padEnd(34)} ${String(wc).padStart(5)}w  → ${tail}`);
  }
  if (d._closure.length > 0) {
    console.log(`\n  closure devices stacked in final section: ${d._closure.join(", ")}`);
  }

  if (args.checkLinks) {
    const urls = [...new Set([...draftText.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]))].sort();
    console.log("\n" + "=".repeat(62));
    console.log(`LINKS — checking ${urls.length} unique URL(s)…`);
    const [broken, unverified] = await checkLinks(urls);
    for (const [url, st] of broken) console.log(`  BROKEN ${st}: ${url}`);
    for (const [url, st] of unverified) console.log(`  unverified (${st ?? "no response"}): ${url} — check by hand`);
    if (broken.length === 0 && unverified.length === 0) console.log("  all resolve.");
    if (broken.length > 0) fails.push("broken_links");
  }

  if (args.sources.length > 0) {
    const sourceText = args.sources.map((p) => readFileSync(p, "utf-8")).join("\n");
    const prov = provenanceVsSource(dlines, sourceText);
    const pct = (x: number) => (x * 100).toFixed(0) + "%";
    console.log("\n" + "=".repeat(62));
    console.log("PROVENANCE vs SOURCE — what a lexical-provenance detector sees.");
    console.log("Verbatim reads human; adapted reads AI-assisted; generated reads AI.");
    console.log("Raise the verbatim fraction by arranging the author's words,");
    console.log("never by restyling generated prose (humanizing is itself detected).\n");
    console.log(
      `  verbatim ${pct(prov.fractions.verbatim)}   adapted ${pct(prov.fractions.adapted)}   generated ${pct(prov.fractions.generated)}   (character-weighted)`,
    );
    if (prov.runs.length > 0) {
      console.log("  longest generated runs (the author retypes these, in his words):");
      for (const r of prov.runs) {
        console.log(`    L${r.start}–L${r.end < r.start ? r.start : r.end}  ~${r.words} words  → ${r.preview}…`);
      }
    }
  }

  const uncited = findUncited(dlines);
  console.log("\n" + "=".repeat(62));
  console.log(`UNSOURCED CLAIMS — ${uncited.length} high-risk sentence(s) without a source.`);
  if (uncited.length > 0) {
    console.log("Each needs a [source: ...] marker or a link in the same sentence —");
    console.log("cite it from the working file or cut it. Vague authority is cut-only.\n");
    for (const [n, reason, s] of uncited.slice(0, 40)) {
      console.log(`  L${String(n).padEnd(4)} [${reason}]  ${s.slice(0, 130)}`);
    }
  }

  // Always runs. This is a provenance gate, not a style metric: it is not
  // optional and it is not scored against the corpus.
  const claims = paragraphs(d._prose)
    .flatMap((par) => sentences(par))
    .filter((s) => INTERIORITY.test(s))
    .map((s) => s.trim());
  console.log("\n" + "=".repeat(62));
  console.log(`INTERIORITY — ${claims.length} claim(s) about the author's inner life.`);
  console.log("Target for UNSOURCED claims is zero, not a corpus average. Each line");
  console.log("below is either the author's own words or an invention. Only the");
  console.log("author knows which. No score in this report overrules that.\n");
  claims.forEach((s, i) => console.log(`  ${String(i + 1).padStart(2)}. ${s.slice(0, 150)}`));

  console.log();
  if (fails.length > 0) {
    console.log(
      `RESULT: ${fails.length} structural flag(s); ${uncited.length} unsourced claim(s); ` +
        `${claims.length} interiority claim(s) unconfirmed.`,
    );
    process.exit(1);
  }
  if (claims.length > 0 || uncited.length > 0) {
    console.log(
      `RESULT: no structural outliers, but ${uncited.length} unsourced claim(s) and ` +
        `${claims.length} interiority claim(s) need sources or the author.`,
    );
    process.exit(2);
  }
  console.log("RESULT: no structural outliers; no unsourced claims; no unconfirmed interiority.");
}

await main();
