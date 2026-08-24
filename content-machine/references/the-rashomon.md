# The Rashomon Framework

Present the same event or decision from multiple contradictory perspectives. Named after Akira Kurosawa's 1950 film where four witnesses give incompatible accounts of the same crime. The truth lives in the tension between viewpoints, not in any single one. This framework is honest about the fact that most technical decisions don't have objectively right answers — just trade-offs viewed from different positions.

## Best For

- Architecture decisions with competing stakeholder views
- "There is no right answer" posts
- Team dynamics posts about disagreements that were both right
- Posts exploring trade-offs without declaring a winner
- Retrospectives where the same outcome looks different depending on who you ask

## The Steps

### 1. The Event (Neutral Facts)

State what happened as plainly as possible. Just the observable facts — no interpretation, no framing, no judgment.

- Keep it short and declarative
- The neutrality is important — it's the baseline the perspectives will diverge from
- Include enough detail that each perspective's interpretation will feel grounded

**Example:** "Last quarter, our team migrated from REST to GraphQL for our internal dashboard API. The migration took eight weeks. The old REST endpoints were deprecated and removed. The dashboard's Lighthouse performance score dropped from 94 to 87. Developer satisfaction scores on the quarterly survey went from 3.2 to 4.1 out of 5."

### 2. Perspective A (First Viewpoint, Sympathetically Presented)

Tell the story from the first perspective. The key: present it sympathetically. The reader should nod along and think "that makes sense."

- Use the language and values this perspective would use
- Show the reasoning, not just the conclusion
- Make this perspective feel reasonable and considered

**Example:** "From the frontend team's perspective, the migration was an unqualified win. The old REST API required them to make six requests to load the main dashboard view. Six. With GraphQL, it was one query that returned exactly the shape they needed. They stopped writing data transformation layers. They stopped maintaining a client-side cache to avoid redundant fetches. The code got simpler, the developer experience got better, and the survey scores reflected it."

### 3. Perspective B (Contradicting Viewpoint, Equally Sympathetic)

Now tell the same story from a perspective that contradicts A. This is the hard part — you must make this perspective equally sympathetic.

- Don't strawman this view even subtly
- Show how the same facts lead to different conclusions
- The reader should think "wait, that also makes sense"

**Example:** "From the backend team's perspective, the migration was a slow-motion disaster. The REST endpoints were cacheable, predictable, and observable. They could tell exactly which data was being requested and how often. GraphQL queries were opaque blobs. Cache invalidation went from 'set a TTL' to 'parse the query AST and figure out which fields might have changed.' The performance score dropped because the server was now doing work that used to be split across cacheable endpoints. And the backend survey scores? Nobody asked them."

### 4. Optional Perspective C (A Third Angle)

A third perspective adds depth when it reveals something neither A nor B can see. Don't add it just for symmetry.

- This often works well as the user's perspective, the manager's perspective, or the "future maintainer" perspective
- It should add a dimension, not just split the difference
- Keep it shorter than A and B

**Example:** "The platform team had a different take entirely. They didn't care about REST vs GraphQL — they cared about the migration process. Eight weeks of parallel systems. Eight weeks of 'which API do I call?' questions in Slack. Eight weeks of bugs from mismatched data shapes between old and new. Their argument: the choice mattered less than the transition cost, and nobody had budgeted for that cost because both teams were too busy arguing about the destination to think about the journey."

### 5. Reconciliation (Synthesize, Privilege, or Leave Unresolved)

This is where you decide what kind of post you're writing. You have three honest options:

**Option A — Synthesize:** Show how all perspectives contain truth and build a more complete picture from the combination.

**Option B — Privilege:** Take a position, but acknowledge it's a position, not a fact. Explain what values or context lead you there.

**Option C — Leave unresolved:** Sometimes the tension IS the point. Name it and let the reader sit with it.

**Example (Synthesis):** "Here's what I think is actually true: the GraphQL migration was the right call for the product and a failure of process. The frontend team was right that the developer experience improved. The backend team was right that observability regressed. The platform team was right that the transition cost was underestimated. None of these perspectives are wrong. They're just measuring different things. And the mistake wasn't choosing GraphQL — it was assuming that a migration only has one scoreboard."

**Example (Unresolved):** "I don't have a clean takeaway here. If you asked me whether we should have done the migration, my answer changes depending on which hat I'm wearing. That discomfort is the point. When your team is debating a technical decision and everyone seems to have a reasonable position, they probably do. The question isn't who's right. It's which trade-offs your team is most equipped to handle."

## Structure Notes

Symmetry between perspectives is critical. If Perspective A gets 500 words of empathetic detail and Perspective B gets 200 words of "but on the other hand," the post is a take dressed up as balance. Give each perspective enough space to be genuinely persuasive.

The neutral event statement does real work. Without it, each perspective drifts into telling its own version of events, and the reader can't tell where the facts end and interpretation begins.

Pacing: The event statement should be the shortest section (one paragraph). Each perspective should be roughly equal length. The reconciliation can be as long as a perspective or as short as a paragraph, depending on whether you're synthesizing or leaving tension.

## Combination Notes

- **Compare & Contrast:** If the perspectives aren't contradictory, just different, you're doing Compare & Contrast. Rashomon specifically needs tension between viewpoints.
- **Converging Ideas:** Perspectives that converge rather than conflict. You can start Rashomon (perspectives diverge) and end with convergence (they reconnect at a synthesis).
- **SCQA:** Each perspective can be framed as its own SCQA where the same Situation has different Complications depending on the viewer.
- **The Sparkline:** Alternate between perspectives as a source of tension, using the back-and-forth to create the emotional rhythm.

## When NOT to Use This

If one perspective is clearly right and another is clearly wrong, Rashomon creates false balance. Just write the post from the correct perspective and address counterarguments directly. Also avoid this when the "event" is actually a series of events — Rashomon works best with a single, well-defined decision or incident.

If the perspectives are different but not contradictory (one team thinks it was good, another thinks it was fine), there's no productive tension. You need genuine disagreement between reasonable people for this framework to earn its complexity.

Be cautious with identifiable real people. If Perspective B is clearly your coworker and you're putting words in their mouth, this gets uncomfortable fast. Composite characters or anonymized perspectives work better.
