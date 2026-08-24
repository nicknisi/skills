# In Medias Res

Start in the middle of the action, then backfill context. From Latin: "in the midst of things." Homer opened the Iliad this way. Every cold open on a TV drama does it. The technique works because it hooks with urgency first and earns context second — the reader is already invested before they understand why.

## Best For

- Incident stories and outage narratives
- Debugging posts ("how I fixed X") where the crisis hooks immediately
- "That time everything broke" stories
- Deploy-gone-wrong narratives
- Any post where the most dramatic moment isn't the ending

## The Steps

### 1. The Hook (Drop Into Action)

Open with the most vivid, urgent, or dramatic moment. No preamble. No "let me set the scene." Drop the reader into the middle of the crisis, the breakthrough, or the confusion. They should feel disoriented in an exciting way.

The hook should raise an immediate question: "Wait, what's happening? How did they get here?"

**Example:** "The Slack message came at 2:47 AM: 'Production is down. All of it.' I opened my laptop to a dashboard of red. Every healthcheck failing. CPU at 100% across all pods. And the last deploy was mine — merged six hours ago, right before I went to bed."

### 2. The Rewind (Fill In Context)

Now that the reader is hooked, rewind. Establish the context they need to understand the crisis. This is your exposition — but the reader is willing to sit through it now because they need to understand the situation you opened with.

The rewind should feel like answering the reader's questions. They're thinking "how did this happen?" — show them.

**Example:** "Let me back up. We'd been running our API on a single Node.js process for two years. It handled our traffic fine — maybe 200 requests per minute on a good day. The deploy I'd pushed was innocent: a new endpoint for our mobile app, maybe 40 lines of TypeScript. Standard stuff. Reviewed, tested, green CI. What I didn't know was that the mobile team had soft-launched to 50,000 beta users that same afternoon."

### 3. The Build (Return to Chronological)

Resume the timeline from the rewind point, building toward and through the crisis moment you opened with. Now the reader has context, so the events carry weight. Add detail you couldn't include in the hook — the investigation, the false leads, the escalation.

This section should move with momentum. The reader already knows the crisis exists — now they're watching you navigate it.

**Example:** "I checked the deploy diff first. Nothing suspicious. Then I pulled up the request logs and saw numbers I'd never seen before — 12,000 requests per minute. Our new endpoint was being called on every app open, and 50,000 users were opening the app simultaneously for a push notification the marketing team had sent. The endpoint itself was fine. But it joined three tables without an index on the foreign key, and at 12K RPM, Postgres was spending all its time on sequential scans."

### 4. The Resolution (Complete the Story)

Deliver the fix, the outcome, the ending. This is the climax and denouement compressed. The reader has been waiting for this since the hook — make the payoff specific and satisfying.

Show what you actually did, not just what worked. The resolution should feel earned.

**Example:** "I added the index in a migration, ran it against production — 3 seconds to create on a table with 2 million rows — and watched CPU drop from 100% to 8% in real time. The dashboard went green. Total downtime: 47 minutes. I pushed a follow-up PR adding a composite index and connection pooling with PgBouncer, because I was too wired to sleep anyway. Then I set up the bundle of alerts I should've had from the start."

### 5. The Reflection (What It Means)

Step back and extract the lesson. What changed in your process, your thinking, your team's practices? The reflection connects the incident to something bigger — it's what separates a war story from a blog post.

Don't moralize. Share what you actually learned, including the uncomfortable parts.

**Example:** "The missing index was my fault. The missing load test was everyone's fault. The missing communication between the mobile team and the backend team was a systems problem. We now have a deploy checklist that includes 'check with dependent teams for upcoming launches.' It's a Google Doc. It's not elegant. But nobody's gotten a 2:47 AM Slack message since. The real lesson wasn't technical — it was that 'standard stuff' is only standard until the context changes under your feet."

## Structure Notes

The hook should be ~10% of the post. Just enough to create urgency. Resist the temptation to tell the whole story in the opening — you want the question, not the answer.

The rewind is ~20%. Efficient context-setting. The reader is patient here because they're invested, but don't abuse that patience.

The build is ~35%. This is the narrative engine. Chronological, detailed, escalating. The reader re-experiences the events with full context.

The resolution is ~20%. Specific, concrete, satisfying. Show the fix working.

The reflection is ~15%. Concise. One or two key insights. Resist the urge to list every lesson — pick the ones that matter.

The power of in medias res is that it front-loads the emotional hook. The risk is that the rewind feels like a speed bump. Keep the rewind focused — only provide context the reader actually needs to understand the story.

## Combination Notes

- **Story Circle:** Flash back through the journey. Open at step 5 (Find), rewind to step 1 (You), then play forward through the full circle.
- **Three-Act:** Reorder the acts. Open with Act 2's inciting incident, rewind through Act 1, then play through Act 2 and Act 3 chronologically.
- **Reverse Chronology:** Both are non-linear, but different directions. In medias res starts in the middle and expands outward; reverse chronology starts at the end and peels backward. They can combine: open mid-crisis, then peel back in reverse.
- **Post-Mortem:** Open with the incident alert (the hook), then follow the post-mortem structure for investigation and resolution. Natural pairing for outage stories.

## When NOT to Use This

If your post doesn't have a dramatic moment worth opening with, in medias res will feel gimmicky. Tutorial posts, comparison posts, and gradual-realization stories don't have a "drop into the action" moment — they have a thesis.

Also risky for posts where the context is complex. If the reader needs significant background to understand the hook, the opening will confuse rather than hook. Test it: can you write a 2-3 sentence opening that creates urgency without any prior context? If not, start chronologically and use SCQA or Three-Act instead.

Avoid for posts where the journey is more interesting than the crisis. Story Circle or Three-Act will serve transformation narratives better.
