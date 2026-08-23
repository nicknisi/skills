# The Petal Framework

Multiple stories or examples radiate from a central theme, like petals around a flower's center. Each petal is self-contained but reinforces the core message from a different angle. The reader understands the center more deeply with each petal, and the order of petals can be rearranged without breaking the structure.

## Best For

- "N things I learned" posts done with narrative depth
- Thematic collections with a unifying insight
- Posts with multiple supporting anecdotes
- Conference recap posts organized by theme rather than timeline
- "Principles I follow" posts where each principle gets its own story

## The Steps

### 1. The Center (State the Core Theme)

Open with the central thesis, question, or theme that all petals will orbit. This is the flower's center — everything radiates from here.

- State it clearly but don't exhaust it — leave room for the petals to enrich it
- Frame it as something worth exploring from multiple angles
- This can be a question, a claim, or an observation

**Example:** "Every meaningful improvement to my development workflow in the last five years has come from the same place: removing a context switch. Not adding a feature. Not learning a new tool. Just... eliminating one moment where my brain had to change modes."

### 2. Petal 1 (First Story or Example)

The first petal should be your most accessible example. It establishes the pattern the reader will look for in subsequent petals.

- Tell a complete mini-story with its own setup and payoff
- Connect it back to the center explicitly
- Set the tone and depth for the petals that follow

**Example:** "The first context switch I killed was leaving the terminal to look things up. I'd be deep in a debugging session, hit a wall, and open a browser tab. Twenty minutes later I'd be reading about Rust's borrow checker despite working in TypeScript. When I set up `tldr` and `man` with good search in my terminal, the browser stopped being a reflex. The fix wasn't discipline — it was removing the exit ramp."

### 3. Petal 2 (Different Angle, Same Theme)

The second petal should approach the center from a noticeably different direction. If Petal 1 was about tooling, Petal 2 might be about process or communication.

- Show a different _kind_ of example, not just a different instance
- The reader should think "oh, this applies there too"
- Each petal should expand what the center means

**Example:** "The second context switch was subtler: git stash. I'd be mid-feature, get pulled into a code review, stash my work, review the PR, pop the stash, and spend ten minutes remembering where I was. When I started using `git worktree` to keep multiple branches checked out simultaneously, code reviews stopped interrupting my flow. I just switched tmux panes. Same repo, different directory, zero stashing."

### 4. Petal 3+ (Additional Angles)

Each additional petal should feel like a new facet of the same gem. Diminishing returns kick in around petal 4 or 5 — choose quality over quantity.

- Vary the scale: if early petals were about tooling, go bigger (team process) or smaller (a single keybinding)
- Later petals can be shorter — the pattern is established
- The best final petal often reframes the center in a way the reader didn't expect

**Example:** "The context switch I'm working on killing right now is the biggest one: the gap between thinking about code and writing code. I used to think that meant a faster editor. Turns out it means `claude-code` in my terminal, where I describe what I want and it writes the implementation while I think about the next problem. The context switch wasn't typing speed. It was the translation layer between intent and syntax."

### 5. Return to Center (Synthesize with Enriched Understanding)

Come back to the central theme, but now the reader has seen it from multiple angles. The center should feel richer, more dimensional than when you stated it in Step 1.

- Echo the language from your opening, but with the depth the petals added
- Don't just restate — synthesize
- The reader should feel like they understand the center differently now

**Example:** "Removing a context switch sounds like a productivity hack, but it's actually something deeper. Every context switch is a place where momentum goes to die. The tools don't matter — tmux, worktrees, AI assistants, whatever. What matters is asking, every time you feel friction: is this a context switch I can eliminate? Because the best workflow improvement is the one where you stop noticing the seams."

## Structure Notes

Petals are modular. You should be able to rearrange them without breaking the post. If removing a petal makes the post collapse, it's not a petal — it's a load-bearing wall, and you need a different framework.

The center should be stated simply enough that each petal can reference it without re-explaining. If your center takes three paragraphs to set up, it's too complex for this structure.

Pacing: the first petal is the longest (it establishes the pattern). Each subsequent petal can be progressively shorter as the reader fills in more context on their own. Three to five petals is the sweet spot. Two feels thin; six or more becomes a listicle.

Transitions between petals can be simple. "The second context switch I killed..." is perfectly fine. Don't over-engineer the connective tissue — the shared center provides the cohesion.

## Combination Notes

- **Nested Loops:** A single petal can contain a nested loop if one example needs more depth. The other petals stay flat while one goes deep.
- **Converging Ideas:** Converging Ideas hides the center; The Petal reveals it upfront. You can start with Converging Ideas to establish the center, then shift to petals for the exploration.
- **Progressive Disclosure:** If your petals increase in complexity (simple tool tip, intermediate workflow, advanced architecture), you're hybridizing with Progressive Disclosure. This works well.
- **The Sparkline:** Each petal can alternate between what-is and what-could-be, giving each mini-story its own emotional arc.

## When NOT to Use This

If the examples have a natural order — chronological, simple-to-complex, cause-and-effect — the petal structure hides that order. Use Progressive Disclosure or Story Circle instead. Also avoid this when the center is too thin to support multiple angles. If every petal is saying the same thing in a slightly different costume, you don't have petals — you have redundancy. One strong example with SCQA is better than five weak petals.

If your examples build on each other (petal 2 only makes sense after petal 1), use Nested Loops or The Spiral. Petals must be independently comprehensible.
