# Post-mortem / Retrospective Framework

A structured breakdown of something that happened — what went wrong (or right), why, and what was learned. Borrows from incident response and agile retrospectives.

## Best For

- Incident reports and outage stories
- Migration retrospectives
- "Things that went wrong" posts
- Project launch post-mortems
- Refactoring or rewrite stories

## The Steps

### 1. The Event

What happened? Set the scene concisely.

- State what occurred and when
- Establish stakes — who was affected, what was the impact?
- Be direct. Don't bury the lede.

**Example:** "Last Tuesday at 2am, our deploy pipeline pushed a broken build to production. 12,000 users saw a blank page for 47 minutes."

### 2. The Timeline

Walk through events in order. This is the narrative backbone.

- Use timestamps or relative time markers
- Show key decisions and who made them
- Include what you saw vs what was actually happening
- Show the confusion and wrong turns — don't just present the clean path

**Example:**

- "2:03am — Alerts fire. Dashboard shows 500s spiking."
- "2:08am — We check the last deploy. Nothing looks wrong."
- "2:22am — Someone notices the CDN config changed."

### 3. Root Cause

Explain what actually went wrong at a technical level.

- Distinguish between the trigger and the underlying cause
- Show the specific code, config, or process that failed
- Be precise — include line numbers, error messages, config diffs
- Explain why existing safeguards didn't catch it

### 4. The Fix

How was it resolved? Both the immediate fix and any follow-up.

- The band-aid: what stopped the bleeding
- The real fix: what prevents recurrence
- Show code or config changes
- Note what was considered but rejected

### 5. Lessons Learned

What changed as a result? This is the payoff.

- Process changes, new tests, new monitoring
- What you'd do differently in hindsight
- Broader principles or patterns that emerged
- Be honest about what you still haven't fixed

**Example:** "We added a CDN config diff check to the deploy pipeline. We also realized nobody on-call actually knew how the CDN was configured — so we wrote the runbook we should have had."

## Structure Notes

Vulnerability is the currency of a good post-mortem. Readers relate to mistakes, not perfection. The more honest the account, the more useful the lessons.

The Timeline section is what makes post-mortems compelling. Don't skip straight to the root cause — the detective work IS the story.

## Combination Notes

- **+ Reverse Chronology:** Start with the resolution, then work backwards through the timeline to the root cause. Creates a detective-story feel where each section answers "but how did we get here?"
- **+ In Medias Res:** Open with the 2am alert firing, then rewind to establish context before continuing the timeline. Hooks the reader with the crisis immediately.
- **+ Freytag's Pyramid:** Map the incident timeline to the dramatic arc — the root cause discovery is the climax, the fix is falling action, lessons are denouement.
- **+ Sisyphean Arc:** When the post-mortem is about something that keeps happening — the incident that recurs despite fixes. The post-mortem structure provides the narrative; Sisyphean Arc provides the philosophical frame.

## When NOT to Use This

If nothing actually went wrong or failed, this framework will feel forced. Also a poor fit for posts where the interesting part is the solution, not the incident — use SCQA or PAS instead.
