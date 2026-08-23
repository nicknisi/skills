# PRD: Content Machine Upgrades for the Blog Post Writer Skill

**Status:** Approved for implementation
**Source:** [David Ondrej podcast with Alex Lieberman + Dan (10X)](https://www.youtube.com/watch?v=QBfXiWvM0qc), content machine segment ~16:00–32:00. Timestamped citations below. Captions were auto-generated; quotes are approximate.
**Owner:** Nick Nisi
**Target:** `skills/content-writer/` (this directory)

---

## 1. Background

The content-writer skill was rewritten after a post shipped that readers called AI slop. The post-incident architecture is sound: facts from logs, feelings only from Nick, a flat draft Nick finishes, and a corpus-calibrated structural gate (`scripts/slopcheck.ts`, Node 24+, zero deps) that produces a rewrite list rather than certifying drafts. The gate also enforces provenance: high-risk sentences (numbers with units, versions, quotes, attributions) need a `[source: ...]` marker or a link, with distinct exit codes for structural (1) vs provenance (2) failures.

Alex Lieberman's "content machine" (built at 10X to turn non-creators into consistent publishers) independently arrives at the same core insight and then goes further in four places the skill currently doesn't. His anti-slop guarantee is not a detector, it's process design:

> AI helps with everything other than what the human is needed for: the first mile and the final mile. — [20:30](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1230)

> Take the words that you've given and not change your words, but just make sure your words flow. — [23:32](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1412)

This PRD adopts four of his mechanisms (A1–A4), tightens one existing behavior (R2), and explicitly rejects one (R1). It does not change the skill's identity: the output remains a deliberately flat draft with sourced facts and tagged gaps, never a finished post.

## 2. Goals

- G1: Make the interview (already the skill's highest-value step) extract more specific, less hedged material.
- G2: Give the interview better ammunition via a structured pre-interview research step.
- G3: Make Nick's per-draft feedback compound across sessions instead of evaporating.
- G4: Extend the skill upstream so it can propose post ideas from Nick's recent activity, and keep unused ideas.
- G5: Shift the draft further toward arranging Nick's verbatim words and away from generated connective prose.

## 3. Non-goals

- NG1: **No editor council or revision-to-score loop.** Alex's machine revises drafts until a persona council scores them ≥9/10 ([27:08](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1628)). That produces a draft that sounds finished, which is the exact artifact this skill was rewritten to never produce. Alex himself concedes tell-chasing is "a constant game of cat and mouse" ([20:15](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1215)); his real defense is first-mile/final-mile process design, which this skill already has. Mechanical confirmation (Pangram technical report): humanizer/restyle attacks are detected ~98% of the time and classified as a distinct humanized-AI class, so a revision loop is both philosophically wrong and detectable as its own signature. slopcheck stays a rewrite-list generator, not a certifier.
- NG2: No repurposing engine, distribution, UTM tagging, or performance monitoring. Out of scope for a blog-draft skill.
- NG3: No autopublishing. The hand-off rule ("Do not publish a post whose first-person sentences Nick has not read and approved") is untouched.
- NG4: No Notion dependency. Alex's "vault" is a Notion database; ours is a markdown file (see F4).
- NG5: No new voice-training flows. Nick has a corpus (`src/content/posts/`); the cold-start problem Alex solves at [29:02](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1742) doesn't apply.

## 4. Features

### F1: Interview upgrade — pushback protocol (A1, G1)

Source: interview panel, [25:43](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1543). Alex calls this "the most important step in the whole content machine." Six interviewer personas, one question at a time, forced specificity, ~20 minutes.

**Current behavior:** Step 2 asks 8–15 targeted questions, captures answers verbatim. Nothing governs question sequencing or what happens when an answer is vague.

**New behavior:**

1. **One question at a time.** Never batch questions into a single `ask_user_question` call or prose block. Each answer shapes the next question. Rationale: batched questions get batched, shallow answers.
2. **Pushback on vague answers.** After each answer, classify it before moving on:
   - *Specific* (names a moment, a number, a decision, a mistake): accept, move on.
   - *Vague* (generalization, hedge, "it was interesting", "I just felt like"): ask exactly one follow-up that demands the concrete instance. "When specifically?" / "What did that look like on the screen?" / "What was the actual command?"
   - One follow-up maximum per answer. If the second answer is still vague, record it verbatim anyway and move on. The skill pressure-tests; it does not interrogate.
3. **Interviewer stances, not celebrity personas.** Alex codifies Ferriss/Rogan/Stern/etc. as separate skills. We take the mechanic without the cosplay. Define 3 stances inline in the interview reference (not as separate skills):
   - *The mechanic:* how did it actually work, what broke, what was the exact error.
   - *The skeptic:* why should anyone believe this, what's the counterargument, who would disagree.
   - *The historian:* what did you try before this, what changed your mind, what would past-you say.
   Rotate stances across the interview so questions don't all probe the same axis. Do not announce the stance to Nick.
4. **Session length guidance.** Target the natural end of material, not a question count. Stop when two consecutive answers add no new facts or stories. The 8–15 question range becomes a floor-and-ceiling hint, not a script.
5. **Capture rules unchanged:** verbatim answers, no smoothing, flatness is the voice.

**Deliverable:** new file `references/interview.md` containing the protocol above; SKILL.md step 2 shrinks to a pointer plus the existing non-negotiables (verbatim capture, `[NICK: ...]` markers on decline). **Migration note:** step 2 now also contains four opinion-piece questions (thesis as a disagreeable sentence, strongest opposing view, stakes, admitted limitation). Carry these into `references/interview.md` — they fold naturally into the *skeptic* stance. Do not drop them.

### F2: Pre-interview research brief (A2, G2)

Source: intermediate research step, [25:29](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1529). Before Alex is interviewed, the machine researches: current developments, what's already being said in market, contrarian angles, and "open questions only I as Alex Lieberman can answer."

**Current behavior:** Step 1 mines logs/Slack/git for facts. There is no step that surveys the external conversation or identifies what only Nick can add.

**New behavior:** Insert a research step between gathering (step 1) and the interview (step 2). Produce a short brief (~1 page max) with four sections:

1. **State of the conversation.** What's already been written on this topic (web search, 3–5 sources). Two sentences per source, links kept.
2. **The consensus take.** The post everyone else has already written, in one paragraph. This is the post to NOT write.
3. **Contrarian angles.** 2–4 positions that cut against the consensus and are supportable from Nick's actual material (from step 1 mining). Each must cite which fact/log/commit supports it. No angle without a source — an unsupported contrarian angle is bait for invented conviction, which is the failure mode this skill exists to prevent.
4. **Questions only Nick can answer.** 3–6 questions that no amount of research can resolve: what he decided, what he abandoned, what surprised him. These seed the interview and get asked first.

The brief is working material, not draft content. Nothing from sections 1–3 enters the draft unless it survives the interview (Nick reacts to it in his own words) or is a sourced fact per the existing claim → source rule.

**Deliverable:** research step documented in SKILL.md as new step (renumber existing steps); brief format specified in `references/interview.md` since its consumer is the interview.

### F3: Content lessons file (A3, G3)

Source: [28:06](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1686) — end-of-session feedback becomes a lessons file checked on every future write, "to make sure it's not making the same mistake again."

**Current behavior:** The skill's one expensive lesson (the interiority incident) lives as prose in SKILL.md. Per-draft feedback from Nick has nowhere to go and does not compound.

**New behavior:**

1. New file `references/content-lessons.md`. Append-only log, newest first. Entry format:

   ```markdown
   ## YYYY-MM-DD — <post slug or working title>
   - **Lesson:** <one sentence, imperative, checkable against a future draft>
   - **Evidence:** <what Nick said or changed, quoted or paraphrased>
   ```

2. **Read at draft time.** The drafting step reads this file before writing, alongside `voice-tone.md`. Lessons are constraints, same category as the voice ceilings.
3. **Write at hand-off time.** After delivering the draft (step 7), ask Nick one question: "Anything the draft got wrong that I should never do again?" If he answers, append an entry. If he declines, append nothing. Never auto-derive lessons from slopcheck output — the gate already feeds back through its own channel, and machine-derived lessons would silt the file with noise.
4. **Dedup rule:** before appending, check whether the lesson restates an existing entry or an existing voice-tone prohibition. If so, don't append; if it sharpens one, note the sharpening on the existing entry's line.
5. **Seed the file** with the interiority incident (5.84 vs 0.97 per 1,000 words) so the file demonstrates its own format and the founding lesson is machine-checkable context, not just SKILL.md prose.

**Deliverable:** `references/content-lessons.md` seeded with one entry; read hook in the drafting step; write hook in the hand-off step.

### F4: Idea sourcing + idea vault (A4, G4) — optional entry point

Source: the Oracle, [24:15](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1455) — scans the last 7 days of Slack/Notion/Gmail/Linear/git for "spikes"; the Vault, [25:01](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1501) — unpicked ideas are stored, not discarded.

**Current behavior:** The skill activates only when Nick already has a topic.

**New behavior:** A second entry point, triggered by "what should I write about?" or "any post ideas in my recent work?" — never run implicitly.

1. **Scan** recent activity, most valuable sources first: git history across active repos (7–14 days), session logs, Slack if available. Skip unavailable sources silently.
2. **Score for spikes.** Alex's five spike criteria, adopted as-is because they're a good rubric: point of view, story potential, emotional intensity, lesson/framework, depth. A candidate needs at least two to make the list.
3. **Present 5–10 ideas**, each as: one-line pitch, the spike criteria it hits, and the evidence (commits, log excerpts) that suggested it. Fewer, better-evidenced ideas beat fifteen thin ones.
4. **Vault:** `references/idea-vault.md`, a flat markdown list. Entry: date, one-line pitch, evidence pointers, status (`open` / `drafted` / `dead`). Ideas Nick doesn't pick get appended as `open`. When the sourcing step runs, read the vault first and re-surface still-relevant `open` entries before scanning for new ones. Nick can mark entries `dead`; dead ideas are never re-surfaced.
5. **No external social sweep** (Alex's Reddit/X/YouTube scan) in v1. The research brief (F2) already covers the external conversation once a topic is chosen. Add later if idea supply, not idea quality, turns out to be the constraint.

**Deliverable:** new SKILL.md section "Entry point 2: idea sourcing" describing the scan/score/present flow; `references/idea-vault.md` created empty with a format header.

### F5: Arrangement-first drafting (R2, G5)

Source: [23:32](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1412) — the machine does "not change your words but just make sure your words flow, that they transition well."

**Current behavior:** Step 5 writes an "ugly draft" where mental-state sentences must be verbatim quotes, but connective and expository prose is generated freely in corpus-consistent style.

**New behavior:** A drafting priority order, applied sentence by sentence:

1. **Nick's verbatim words** (interview answers, notes, Slack messages he wrote) — first choice wherever they cover the ground. Light mechanical repair allowed (verb agreement, dropped words from voice-to-text) and marked with `[sic: cleaned]` only when the repair changes more than punctuation.
2. **Sourced facts in plain declarative sentences** — for ground Nick's words don't cover: what happened, numbers, commands, errors.
3. **Generated connective tissue** — last resort, transitions and scaffolding only, one to two sentences at a time, carrying zero claims. If a generated sentence asserts anything a source or quote doesn't already assert, it is either a fact needing a source or interiority needing a `[NICK: ...]` marker.

Practical effect: the interview transcript stops being a quote quarry and becomes the draft's skeleton. Expected outcome is a higher fraction of verbatim-Nick sentences per draft, which also mechanically lowers the invented-interiority risk that slopcheck polices.

**Why this is the load-bearing feature (Pangram finding):** lexical-provenance classifiers mark a clause human only on near-exact lexical match to human source material. Reworded-same-idea scores as AI-assisted; novel wording scores as AI; reordering is explicitly a non-edit. Tier 1 (verbatim words, rearranged) is therefore the one drafting operation detectors are invariant to — Alex's "not change your words, just make sure your words flow" is precisely that operation. This also raises the stakes on tier 1's repair rule: a reworded sentence silently drops from verbatim to adapted, so mechanical repair must stay mechanical.

**Measurement:** `scripts/slopcheck.ts --source <file>` computes the verbatim/adapted/generated split (5-gram lexical containment, character-weighted) against the raw material, plus the longest generated runs as retype targets. Empirical calibration: an inside-the-harness draft scored 97% generated against Nick's verified raw material (matching an external 91%-AI verdict), while verbatim Slack-quote segments scored human in the wild.

Existing hard rules (section endings on information, one metaphor max, no stage directions, every number sourced) unchanged.

**Deliverable:** rewrite of SKILL.md step 5 embedding the priority order; drafting table updated with one new row: "Prefer Nick's verbatim words over generated prose wherever they cover the ground | The draft is an arrangement, not a composition."

## 5. What we're explicitly not taking from the video

| Video mechanism | Timestamp | Why not |
| --- | --- | --- |
| Editor council + 9/10 revision loop | [27:08](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1628) | Produces finished-sounding drafts; inverts this skill's hand-off philosophy (NG1) |
| Repurposing engine, UTM, performance loop | [27:23](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1643) | Different product; out of scope (NG2) |
| Celebrity interviewer personas as separate skills | [25:43](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1543) | Mechanic adopted (F1), cosplay dropped; six skills for one interview is machinery without payoff |
| Voice training flows (interview / message corpus / borrowed voice) | [29:02](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1742) | Nick has 100+ posts; cold start doesn't apply (NG5) |
| Notion vault, meeting-recording hooks, auto-content on transcript | [31:10](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1870) | Infra Nick doesn't run; markdown vault covers the need (NG4) |

## 6. Implementation order

Ordered by value-to-cost. Each phase is independently shippable.

1. **Phase 1 — F3 (lessons file).** Smallest diff, immediate compounding. Two hooks + one seeded file.
2. **Phase 2 — F5 (arrangement-first drafting).** SKILL.md step 5 rewrite. Promoted from Phase 3: the Pangram finding makes tier-1 arrangement the entire anti-detection strategy, not a style preference, and `slopcheck.ts --source` already exists to measure it. F5 improves drafts from whatever raw material exists today; it does not need F1/F2 to land first. Fold in, don't rewrite, the existing provenance gate and the "What detectors actually measure" section of SKILL.md step 6.
3. **Phase 3 — F1 + F2 (interview upgrade + research brief).** One new reference file, SKILL.md step edits. These ship together because F2's output ("questions only Nick can answer") is F1's opening input. After F5 because F5 defines the demand for verbatim material and F1/F2 increase its supply.
4. **Phase 4 — F4 (idea sourcing + vault).** Largest new surface, only phase adding an entry point. Last because it extends scope rather than deepening the existing pipeline.

## 7. Acceptance criteria

- AC1 (F1): Interview reference exists; a test interview shows one-question-at-a-time flow and at least one vague-answer pushback; answers land verbatim in the working file.
- AC2 (F2): For a chosen topic, the brief contains all four sections; every contrarian angle cites a step-1 source; interview opens with a "questions only Nick can answer" item.
- AC3 (F3): Lessons file exists, seeded; a draft session demonstrably reads it (lesson from the file is reflected as a constraint); hand-off asks the feedback question exactly once.
- AC4 (F4): Idea sourcing runs only on explicit request; each presented idea names ≥2 spike criteria and evidence; unpicked ideas appear in the vault as `open`; a later run re-surfaces them.
- AC5 (F5): In a completed draft, every sentence is traceable to one of the three priority tiers; generated connective sentences carry no unsourced claims; slopcheck passes structurally with the interiority list going to Nick as today. Measured: `slopcheck.ts --source <raw material>` on an F5-produced draft shows a verbatim+adapted fraction materially above the pre-F5 baseline (97% generated), with the remaining generated runs identifiable as claim-free connective tissue.
- AC6 (NG1): No revision loop exists anywhere; slopcheck output remains a rewrite list; the skill still never delivers a "finished" post.

## 8. Risks

- R1: **Pushback fatigue.** One follow-up per vague answer can still feel like an interrogation over 15 questions. Mitigation: the stop rule (two consecutive no-new-material answers) and the one-follow-up cap. Watch for it in the first real session.
- R2: **Research brief leaking into the draft.** Sections 1–3 of the brief are third-party takes; if they seep into drafting, the post gets a borrowed point of view. Mitigation: the brief is consumed by the interview, not the drafter; F5's priority order gives generated prose no claim-carrying role.
- R3: **Lessons file rot.** Contradictory or stale lessons accumulate. Mitigation: dedup rule; Nick can prune, it's his file. Revisit if it exceeds ~30 entries.
- R4: **Vault becomes a graveyard.** Mitigation: re-surfacing on each sourcing run and the `dead` status. If everything goes dead, that's signal about idea quality, not a bug.

## 9. Open questions

- Q1: Should the F4 scan include Granola meeting transcripts as a source? Nick has the integration; meetings are Alex's highest-signal source ([32:07](https://www.youtube.com/watch?v=QBfXiWvM0qc&t=1927)). Deferred to Phase 4.
- Q2: **Answered.** `scripts/slopcheck.ts --source` computes the verbatim/adapted/generated split with retype targets for the longest generated runs. AC5 uses it.
- Q3: F1's stances live in `references/interview.md`. If Nick later wants persona flavor (a "Stern mode" for spicier takes), that's a new stance entry, not a new skill. Confirm with Nick before adding any.
