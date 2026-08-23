# SCQA Framework (Situation-Complication-Question-Answer)

From Barbara Minto's Pyramid Principle. A logical, structured framework that mirrors how developers think in RFCs, issue trackers, and design docs.

## Best For

- Debugging stories and root cause analyses
- Architectural decision records turned into posts
- "Why we chose X over Y" posts
- Technical problem-solving narratives

## The Four Steps

### 1. Situation

Establish the stable baseline. What was the world like before the problem?

- The existing stack, workflow, or assumption
- Set context the reader can relate to
- Keep it brief — just enough to ground the reader

**Example:** "Our API had been running fine for two years. 200ms p99, zero drama."

### 2. Complication

Introduce what disrupted the status quo. This creates tension.

- What broke, changed, or stopped working?
- What new requirement appeared?
- Why couldn't the old approach handle it?

**Example:** "Then we hit 10x traffic from a viral launch and our database connection pool started choking."

### 3. Question

Make the tension explicit. What needed to be answered?

- This can be stated directly or implied
- Frame it as the question the reader would ask
- Often a single sentence or paragraph

**Example:** "How do you scale a connection pool without rewriting the data layer?"

### 4. Answer

Deliver the solution, approach, or insight.

- This is the bulk of the post
- Can include multiple sub-sections
- Show the work — code, configs, benchmarks
- Be honest about trade-offs and what didn't work

**Example:** Walk through the PgBouncer setup, connection limits tuning, and before/after benchmarks.

## Structure Notes

SCQA is inherently top-down — it leads with context and builds to the answer. This makes it scannable: readers who already understand the problem can skip to the Answer section.

The Complication is where the energy lives. If the complication doesn't create genuine tension, the post will feel flat.

## Combination Notes

- **+ The Sparkline:** Use SCQA as the logical backbone, layer sparkline oscillations ("what is" vs "what could be") over the Complication and Answer sections for emotional momentum.
- **+ Socratic Path:** Replace the linear Complication→Question flow with a Socratic chain of progressively deeper questions. Works well for root cause analyses.
- **+ The Rashomon:** Present multiple perspectives within the Answer section — especially when the "right" answer depends on stakeholder viewpoint.
- **+ Story Circle:** When the SCQA problem-solving narrative also involves personal transformation, nest the SCQA within a Story Circle's chaos phase (steps 3-6).

## When NOT to Use This

If the post is more about a personal journey or transformation than the technical solution, SCQA will feel too clinical. If the post is very short and punchy, PAS is more compact.
