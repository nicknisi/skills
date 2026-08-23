---
name: blog-post-writer
description: Turn Nick Nisi's raw material into a blog post draft in his voice. Use when the user says "write a blog post," "draft a post," "write about [topic]," "turn my notes into a blog post," or provides scattered ideas that need shaping — or when he asks "what should I write about?" / "any post ideas in my recent work?" (idea sourcing). Produces a deliberately flat draft with sourced facts and tagged gaps — never a finished post.
---

# Nick Nisi Blog Writer

Turn raw material into a draft Nick finishes. This skill does research, structure,
and connective prose. It does **not** produce publishable first-person writing.

## The rule this skill exists to enforce

> **Facts may come from logs. Feelings may not.**

An earlier version of this skill shipped a post that readers called AI slop. The
facts were impeccable — real timestamps, real commit stats, real Slack quotes. The
failure was that it also generated Nick's inner life: what he thought, what he'd
assumed, what moved him. Nine such claims; one had a source. Readers can't always
name that, but they feel it, and they stop trusting the piece.

The measured version: that post claimed inner states at **5.84 per 1,000 words**
against Nick's corpus mean of **0.97**. Six times his rate. He mostly writes about
what he built. The draft wrote about how he felt about what he built.

Everything below follows from that.

## Process

### 1. Gather the raw material

Accept the mess: scattered thoughts, code, commands, conclusions, links. Don't
require organization.

If the material is thin, mine it — session logs, Slack, git history, the repos
themselves. This is the pipeline's genuine strength and there's no reason to hold
back. **Record a source for every fact.** A working file of claim → source keeps
the draft honest and makes drafting mechanical. In the draft, every high-risk claim
— a number with units, a version, a quote, an attribution — carries a
`[source: ...]` marker or a link in the same sentence. slopcheck flags the ones
that don't. Nick strips the markers when he finishes the post.

Three more ledger rules:

- **Pin verbatim at research time.** When a quote, command, or code block will
  appear in the draft, copy it into the working file exactly, while the source
  is still open — and paste from the file when drafting, never retype from
  memory. Retyping from memory is how misquotes happen.
- **Length is source-proportional.** Thin grounding means a shorter post, never
  padding. Thin sources plus a long draft is the fabrication signature.
- **Disclose what you couldn't read.** A named source you couldn't access (a
  private thread, a dead link, a repo that isn't cloned) goes in the handoff
  list, never silently dropped. Nick decides whether the evidence is enough,
  and he can only do that if he knows what you didn't read.

The working file doubles as the `--source` input to the provenance gate in
step 7 — everything Nick wrote (Slack messages, notes, prompts) and every
pinned quote belongs in it.

### 2. Research the conversation before interviewing

Produce a brief, one page maximum, four sections (format details in
`references/interview.md`):

1. **State of the conversation** — what's already been written on this topic
   (web search, 3–5 sources, two sentences each, links kept).
2. **The consensus take** — the post everyone else has already written, in one
   paragraph. This is the post to NOT write.
3. **Contrarian angles** — 2–4 positions that cut against the consensus and are
   supportable from step-1 material, each citing the fact, log, or commit that
   supports it. No angle without a source.
4. **Questions only Nick can answer** — 3–6 questions no research can resolve:
   what he decided, what he abandoned, what surprised him. These open the
   interview.

The brief is working material, not draft content. Nothing from sections 1–3
enters the draft unless it survives the interview — Nick reacts to it in his
own words — or is a sourced fact per step 1.

### 3. Interview for the parts you cannot mine

**This is the highest-value step in the skill. Do not skip it.**

Logs record what Nick did. They never record what he thought. Run the interview
per `references/interview.md`: one question at a time, opening with the brief's
"questions only Nick can answer," at most one pushback per vague answer, three
stances (mechanic, skeptic, historian) rotating unannounced, stopping when two
consecutive answers add no new facts or stories — 8–15 questions is a hint, not
a script.

Non-negotiables, whatever the protocol says:

- Capture answers **verbatim**. Tell him to type fast and not polish. His
  unpolished answers are the raw material for every voice-load-bearing sentence
  in the post. They will be flat, hedged, and specific — **that flatness is the
  voice.** Do not smooth it.
- Interview answers go into the working file — they are `--source` material.
- If he declines to be interviewed, the post ships with `[NICK: ...]` markers
  where his inner life would go. That is a correct outcome, not a failure.

### 4. Read the corpus, not a description of it

Read 2–3 recent posts from `src/content/posts/` in full — most recent first, plus
any on a similar topic. Write connective prose consistent with **those**, not with
a summary of them.

Then read `references/voice-tone.md`, which is now a list of **ceilings and
prohibitions**, not features to hit. Requesting a feature makes a model execute it
every time it applies; that's what produced eight aphorisms in an eight-section
post. Only constraints are safe to state.

Last, read `references/content-lessons.md`. Lessons are constraints in the same
category as the voice ceilings — a draft that repeats a logged lesson is a
failed draft even if every gate passes.

### 5. Structure from the material

Find the chronology or the argument already in the facts and follow it.

**Do not select a narrative framework.** `references/frameworks.md` exists as
diagnostic vocabulary for talking about a draft that already exists — never as a
template to fill. Choosing a framework means choosing what the events *meant*,
which is Nick's call, not the tool's. A flawlessly executed Story Circle is the
single most detectable artifact this skill can produce, because no human drafting
from memory has ever produced one.

The only structural instruction: **identify the one turn the post exists to make,
arrange the facts so it lands, and leave flat ground everywhere else.**

Section headers are descriptive — they name the topic ("What Fleet is", "Three
signals, none trustworthy alone"). Allusive narrative-beat headers ("The drift",
"Coming home") read as chapter titles and are a tell in bulk.

### 6. Write the ugly draft

Informationally complete, rhetorically inert. **Aim for flat.**

Nick is good at adding voice to plain prose and bad at excising pastiche from
clever prose. A draft that already *sounds* finished is the worst possible artifact
to hand him — he has to fight it. Give him something that obviously needs him.

Build the draft sentence by sentence in this priority order:

1. **Nick's verbatim words** — interview answers, notes, Slack messages he
   wrote — first choice wherever they cover the ground. Light mechanical repair
   (verb agreement, dropped words from voice-to-text) is allowed; mark it
   `[sic: cleaned]` when the repair changes more than punctuation. Rewording is
   not repair — a reworded sentence silently stops being his.
2. **Sourced facts in plain declarative sentences** — for ground his words
   don't cover: what happened, numbers, commands, errors.
3. **Generated connective tissue** — last resort. Transitions and scaffolding
   only, one to two sentences at a time, carrying zero claims. If a generated
   sentence asserts anything a source or quote doesn't already assert, it is
   either a fact needing a source or interiority needing a `[NICK: ...]`
   marker.

The interview transcript is the draft's skeleton, not a quote quarry. This is
also the entire anti-detection strategy: provenance classifiers are invariant to
rearranging Nick's words and reliably flag composed prose however it's styled
(see "What detectors actually measure" below).

Hard rules while drafting:

| Rule | Why |
| ---- | --- |
| Every mental-state sentence is a verbatim quote from step 3, or a `[NICK: what were you actually thinking here?]` marker | The core failure. Untagged invented interiority is an automatic fail. |
| Prefer Nick's verbatim words over generated prose wherever they cover the ground | The draft is an arrangement, not a composition |
| Sections end on information — a fact, a number, a command, or just stop | Eight aphoristic endings is the template's silhouette |
| Every number traces to a source | "Twelve minutes of curiosity" was invented precision that narrativizes a life |
| High-risk claims — numbers with units, versions, quotes, attributions — carry `[source: ...]` or a link in the sentence | slopcheck flags the gaps; cite from the working file or cut the sentence |
| One sustained metaphor per post, maximum | A metaphor recurring across 3+ sections is a framework fingerprint |
| No narrator stage directions | "Now watch what happened next" is Nick emceeing a post he'd never emcee |

Where you'd reach for a rhetorical flourish, write the plain sentence instead and
let Nick decide whether it deserves more.

### 7. Run the structural gate — before Nick reads it

```bash
node scripts/slopcheck.ts \
  --corpus '/Users/nicknisi/Developer/nicknisi.com/src/content/posts/*.md*' \
  --draft path/to/draft.mdx \
  --source path/to/working-file.md \
  --check-links
```

It calibrates against Nick's real posts and flags outliers in both directions —
**suppression is as suspicious as excess.** A draft engineered to dodge a metric
looks different from one that never considered it.

The gate's job is to produce Nick's rewrite list, not to certify the draft. It
quotes the offending lines with line numbers — fix those exact spots rather than
rewriting blind. Before running it, re-read the draft **from the file**, not from
your memory of writing it. Memory holds the version you intended; the file holds
the one you wrote.

Three sections are absolute gates, not corpus-scored metrics:

- **UNSOURCED CLAIMS** — numbers, versions, quotes, and attributions with no
  `[source:]` marker or link. Cite them from the working file or cut them.
- **INTERIORITY** — claims about Nick's inner life. Those lines go to Nick,
  not to you.
- **LINKS** — a 404 is a fix, not a note. Anything "unverified" gets checked by
  hand.

The script exits non-zero while any of these have entries. A structurally clean
draft with unconfirmed claims is not a passing draft.

Two drills after the gate is clean:

1. Delete the last paragraph and re-read. If the post got better, keep the
   deletion — summary endings usually add nothing.
2. Ask "what makes this obviously AI-generated?" and fix whatever answers. If
   the answer is "nothing," ask again — a first draft that survives untouched
   almost never happens.

### What detectors actually measure

Pangram-class detectors are provenance classifiers, not tell counters. Their
training labels a clause human only on a near-exact **lexical** match to
human-written source; same-idea-reworded is AI-assisted; novel wording is AI.
Three consequences, confirmed on a real post (Aug 2026):

- **De-telling cannot flip a verdict.** Restyling generated prose is
  "humanization," which Pangram detects ~98% of the time and labels as its own
  class — a worse look than AI. Never run a rewrite-until-the-detector-passes
  loop; it is detected, and it produces the finished-sounding draft this skill
  exists to never produce.
- **Reordering the author's sentences is a non-edit to their labeler.**
  Arranging Nick's words is provenance-preserving. Composing new ones is not.
- **The only lever is the verbatim fraction** — the share of draft characters
  that lexically match Nick's raw material. On the real post, his verbatim
  Slack quotes scored HUMAN in the wild and the generated connective prose
  around them scored AI, segment for segment.

The PROVENANCE section of the gate output (enabled by `--source`) classifies
every sentence verbatim/adapted/generated and lists the longest generated runs.
Those runs are the spans only Nick's own typing can fix — they go in the
handoff as retype targets, not as rewrite targets for you.

Vocabulary checks (the `tighten-prose` and `unslop` skills) run last and matter
least. They scan for 2024-era tells like "delve" and "leverage" and will pass a
maximally slop-shaped draft — they did exactly that on the post that caused this
rewrite. One exception to their rules: unslop's absolute punctuation bans ("no
em dashes, ever") don't apply here. The corpus is the authority — Nick uses em
dashes at a measured rate, and slopcheck flags suppression below that rate as
readily as excess. Match his rate; don't zero the character.

### 8. Hand off, don't ship

Deliver:

1. The flat draft
2. The interiority list — every sentence claiming his inner life, for him to rewrite or cut
3. The gate output, including the provenance split and the longest generated runs as retype targets
4. Open questions
5. Sources you couldn't read and links that didn't verify

Then ask Nick exactly one feedback question: **"Anything the draft got wrong
that I should never do again?"** If he answers, append the lesson to
`references/content-lessons.md` (entry format at the top of that file). If he
declines, append nothing. Never auto-derive lessons from slopcheck output — the
gate feeds back through its own channel. Before appending, check the file and
`voice-tone.md`: if the lesson restates an existing constraint, sharpen the
existing entry in place instead of duplicating it.

**Do not publish a post whose first-person sentences Nick has not read and
approved.** He isn't the editor of this artifact. He's the only source for half of
it.

## Entry point 2: idea sourcing

Runs only when Nick explicitly asks — "what should I write about?", "any post
ideas in my recent work?" Never implicitly.

1. Read `references/idea-vault.md` first. Re-surface still-relevant `open`
   entries before scanning for new ones; never re-surface `dead` ones.
2. Scan recent activity, most valuable sources first: git history across active
   repos (7–14 days), session logs, Slack if available. Skip unavailable
   sources silently.
3. Score candidates against the five spike criteria: point of view, story
   potential, emotional intensity, lesson/framework, depth. A candidate needs
   at least two to make the list.
4. Present 5–10 ideas, each as a one-line pitch, the criteria it hits, and the
   evidence (commits, log excerpts) that suggested it. Fewer, better-evidenced
   ideas beat fifteen thin ones.
5. Append unpicked ideas to the vault as `open`. Nick marks entries `dead`;
   mark an entry `drafted` when a draft exists.

## Output Format

See `references/post-template.md` for frontmatter schema and file conventions.

## Bundled Resources

- `references/interview.md` — research-brief format and interview protocol (stances, pushback, stop rule)
- `references/voice-tone.md` — ceilings and prohibitions, with measured rates from his corpus
- `references/content-lessons.md` — append-only lessons from Nick's hand-off feedback; read at draft time
- `references/idea-vault.md` — unpicked post ideas from idea-sourcing runs
- `references/post-template.md` — frontmatter schema and structural skeleton
- `references/frameworks.md` — diagnostic vocabulary for critiquing a finished draft
- `scripts/slopcheck.ts` — corpus-calibrated structural detector, provenance gates (unsourced claims + interiority + verbatim fraction via `--source`), and link checker (Node 24+, no dependencies)
