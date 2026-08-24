# Freytag's Pyramid

Gustav Freytag's five-phase dramatic arc, published in 1863. More granular than three-act structure — it maps the specific shape of tension through a narrative: build, peak, release. The pyramid gives you a precise tension curve to follow, which is especially useful when your post has a clear dramatic peak.

## Best For

- Posts with a clear breakthrough or "eureka" moment
- Production incident narratives with a climactic fix
- Critical decision posts (the moment you chose X over Y)
- Debugging stories where the root cause reveal is dramatic
- Migration stories with a point-of-no-return moment

## The Steps

### 1. Exposition (The Baseline)

Establish the world, the characters (you, your team, the codebase), and the initial situation. Tension is low. The reader is orienting.

Keep exposition lean. Readers don't need your full tech stack — they need enough context to understand why the rising action matters.

**Example:** "Our deploy pipeline was simple. Push to main, GitHub Actions runs tests, deploys to Vercel. Twelve seconds from merge to production. We bragged about it in standups. We had monitoring, but honestly, nobody checked it much. Things just... worked."

### 2. Rising Action (Tension Builds)

Complications accumulate. Each one raises the stakes. The rising action is a series of escalating problems — not one big jump, but a staircase of increasing tension.

This phase should feel like tightening a spring. Each paragraph adds pressure. Failed solutions make it worse.

**Example:** "First, deploys started taking 45 seconds. Then two minutes. We blamed Vercel. Then our Lighthouse scores dropped — not dramatically, just enough to notice. Bundle size crept up. Then a customer reported the app was unusable on mobile. Then another. I ran `npx @next/bundle-analyzer` and stared at the treemap. Our 'simple' app was shipping 2.4MB of JavaScript. The vendor chunk alone was bigger than most websites."

### 3. Climax (The Peak)

The moment of highest tension. The critical decision, the breakthrough discovery, the thing that changes everything. This is the apex of your pyramid — every sentence before it builds here, every sentence after flows from it.

The climax should be a single, specific moment. Not a gradual realization — a beat.

**Example:** "I found it at 11pm on a Tuesday. Deep in our barrel file — `utils/index.ts` — a single `export * from './legacy'` was pulling in an entire charting library we'd stopped using six months ago. Every page, every route, every user was downloading 800KB of dead code. One line. The kind of line nobody writes on purpose and everybody's afraid to delete."

### 4. Falling Action (The Aftermath)

The immediate consequences of the climax. The fix is in, but now you're dealing with the fallout. This is where you show the implementation — the actual work that followed the breakthrough.

Falling action has its own tension: will the fix work? Are there side effects? Don't skip this — it's where credibility lives.

**Example:** "I deleted the line. Ran the tests. Four failures — components that were silently importing from that barrel file. I fixed three of them in twenty minutes. The fourth was a dashboard chart that nobody could remember building. Slack messages at midnight: 'Does anyone use the analytics dashboard?' Three thumbs-up on the message. Zero replies. I deleted the whole component. Pushed to staging."

### 5. Denouement (The New Normal)

Resolution and reflection. The tension is released. Show the outcome — metrics, changed processes, lessons learned. The reader should feel the distance between the exposition and now.

End with what's genuinely different. If nothing changed except the bundle size number, the story is thin.

**Example:** "Bundle size dropped to 380KB. Time-to-interactive went from 4.2 seconds to 1.1. Mobile complaints stopped. But the real change was process. We added a bundle budget to CI — any PR that increases the bundle by more than 5KB gets flagged. We audit barrel files quarterly now. And I learned something I keep relearning: the scariest bugs aren't the ones that break things. They're the ones that quietly make things worse, so slowly that nobody notices until a customer tells you."

## Structure Notes

The pyramid is asymmetric in practice. Rising action should be the longest phase (~40% of the post). Exposition and denouement are bookends (~15% each). The climax is a moment, not a section (~5-10%). Falling action fills the rest (~20%).

The key insight of Freytag's model is that **falling action exists**. Most developer blog posts go climax → conclusion, skipping the aftermath entirely. The falling action is where you show the work — the implementation, the edge cases, the "yes, but" that makes the fix real.

Tension should rise continuously through the rising action. If tension plateaus, add a complication. If it drops, you've peaked too early — restructure so the biggest revelation comes later.

## Combination Notes

- **Nested Loops:** Multiple overlapping pyramids. The outer story has its own arc, and inner stories (anecdotes, flashbacks) each have mini-pyramids. Useful for longer posts with multiple narrative threads.
- **The Spiral:** Recursive rising action — each pass through a problem goes deeper. The pyramid repeats at increasing depth, like debugging that keeps revealing deeper root causes.
- **Story Circle:** Similar arc, different granularity. The Story Circle's eight steps map roughly to Freytag's five phases, but with more emphasis on the personal transformation.
- **Post-Mortem:** Natural fit for incident timelines. The post-mortem's timeline structure provides the content; Freytag's pyramid provides the tension shape.

## When NOT to Use This

If your post doesn't have a clear dramatic peak, Freytag's pyramid will feel forced. Posts about gradual realization, ongoing processes, or comparison/evaluation don't have a climax — they have a thesis. Use SCQA, Progressive Disclosure, or Compare-Contrast instead.

Also a poor fit for advocacy posts (use Sparkline) or "I was wrong" posts where the revelation is the starting point (use The False Start or In Medias Res). If you can't point to a single sentence and say "that's the climax," this isn't your framework.
