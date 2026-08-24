# Problem-Agitation-Solution (PAS) Framework

A punchy, three-act structure from copywriting that works well for technical posts. State the problem, make the reader feel the pain, then deliver the fix.

## Best For

- Bug fix stories ("I finally fixed that flaky test")
- Performance optimization posts
- Developer experience improvements
- "This one weird trick" posts (done with substance, not clickbait)
- Short-form posts where SCQA feels too heavy

## The Three Steps

### 1. Problem

State the problem clearly and specifically. The reader should immediately recognize it.

- Lead with the symptom the reader would experience
- Use specific error messages, behaviors, or metrics
- Be concrete — name the tool, the version, the context

**Example:** "Every third CI run, our test suite would fail on a different test. No code changes, no infra changes. Just... random failures."

### 2. Agitation

Make the reader feel the pain. This is what separates PAS from a dry bug report.

- Show the ripple effects — time wasted, trust lost, workarounds accumulated
- Share the failed attempts and dead ends
- Quantify the cost when possible
- Build frustration to the point where the reader needs the solution

**Example:** "We'd re-run the pipeline and move on. Then it became twice a day. Then someone added `retry: 3` to the CI config and we all pretended that was fine. We lost about 2 hours per developer per week just babysitting green builds."

### 3. Solution

Deliver the fix with clarity and detail. The payoff should feel earned.

- Show the actual solution — code, config, commands
- Explain why it works (not just what it is)
- Show before/after results
- Note any caveats or edge cases

**Example:** Walk through the `jest --detectOpenHandles` output, the leaked database connection, the one-line fix, and the CI dashboard going green.

## Structure Notes

PAS is compact by nature. It works best for posts under 1,500 words. If the solution requires extensive setup or context, SCQA or Progressive Disclosure may be better fits.

The Agitation step is the engine. Without it, the post is just "problem, here's the fix" — a Stack Overflow answer, not a blog post. The agitation creates empathy and makes the solution satisfying.

Don't fake the agitation. If the problem was easy to diagnose, don't pretend it was a nightmare. Readers can tell.

## Combination Notes

- **+ The Sparkline:** PAS is a single oscillation (problem→pain→fix); Sparkline adds multiple oscillations. Use when you want to show several rounds of "this hurts / imagine if it didn't" before delivering the solution.
- **+ Three-Act:** PAS is essentially a compressed three-act structure. Expand into full three-act when the agitation phase needs more room — multiple complications, failed attempts, deeper context.
- **+ Comedians Set:** The agitation phase is a natural fit for comedic build — stack the absurdity of the problem until the fix lands like a punchline.
- **+ Kafkaesque Labyrinth:** When the "problem" is systemic complexity, the agitation phase becomes a labyrinth walkthrough. PAS gives the structure; Kafkaesque gives the tone.

## When NOT to Use This

If the solution requires extensive context or setup, PAS will feel rushed — use SCQA instead. Also a poor fit for posts where the journey is the point, not the destination.
