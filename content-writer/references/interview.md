# Interview Protocol

Consumed by SKILL.md steps 2–3. The interview is the skill's highest-value
step; this file governs how it runs. The capture rules are non-negotiable and
live in SKILL.md: answers verbatim, no smoothing, `[NICK: ...]` markers on
decline.

## The research brief (SKILL.md step 2)

Written before the interview, consumed by it. One page maximum, four sections:

1. **State of the conversation.** What's already been written on this topic —
   web search, 3–5 sources, two sentences each, links kept.
2. **The consensus take.** The post everyone else has already written, in one
   paragraph. This is the post to NOT write.
3. **Contrarian angles.** 2–4 positions that cut against the consensus and are
   supportable from step-1 material. Each cites the fact, log, or commit that
   supports it. No angle without a source — an unsupported contrarian angle is
   bait for invented conviction, the failure mode this skill exists to prevent.
4. **Questions only Nick can answer.** 3–6 questions no amount of research can
   resolve: what he decided, what he abandoned, what surprised him. These open
   the interview.

The brief is working material. Sections 1–3 never enter the draft directly —
only Nick's reaction to them (his words) or sourced facts per the claim → source
rule do.

## The protocol

1. **One question at a time.** Never batch questions into a single
   `ask_user_question` call or prose block. Each answer shapes the next
   question. Batched questions get batched, shallow answers.

2. **Classify each answer before moving on.**
   - *Specific* — names a moment, a number, a decision, a mistake: accept,
     move on.
   - *Vague* — generalization, hedge, "it was interesting," "I just felt
     like": ask exactly one follow-up that demands the concrete instance.
     "When specifically?" / "What did that look like on the screen?" / "What
     was the actual command?"
   - One follow-up maximum per answer. If the second answer is still vague,
     record it verbatim anyway and move on. The interview pressure-tests; it
     does not interrogate.

3. **Rotate stances.** Three, defined here, never announced to Nick, rotated
   so questions don't all probe the same axis:
   - *The mechanic* — how did it actually work, what broke, what was the
     exact error, what was the actual command.
   - *The skeptic* — why should anyone believe this, who would disagree, what's
     the counterargument. For an opinion piece the skeptic always asks these
     four; the answers become the thesis, the counterargument, and the stakes
     in his words:
     - "State the thesis as one sentence a reasonable person could disagree
       with."
     - "What's the strongest version of the opposing view — and why is it
       wrong?"
     - "What does getting this wrong cost — time, money, an outage, a lost
       argument?"
     - "What's the one limitation you'd admit to? A post with no stated
       limitation reads as marketing."
   - *The historian* — what did you try before this, what changed your mind,
     what would past-you say.

4. **Open with the brief's "questions only Nick can answer."** Then rotate
   stances through the rest.

5. **Stop at the end of material, not a question count.** Stop when two
   consecutive answers add no new facts or stories. 8–15 questions is a
   floor-and-ceiling hint, not a script.

6. **Prefer dictated answers.** Voice-to-text (superwhisper or similar) beats
   typing: spoken answers run longer, carry cadence, and yield more verbatim
   tier-1 material for the draft. Capture the transcription as-is, false
   starts included.

## Standing questions

Reliable openers and probes, any stance:

- "What did you actually think when X happened?"
- "Why did you really stop doing Y? Not the tidy reason — the real one."
- "What's the part of this you'd argue with someone about?"
- "What did you get wrong that you'd rather not include?"
