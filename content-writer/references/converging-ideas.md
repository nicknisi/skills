# Converging Ideas Framework

Start with two or three seemingly unrelated threads, then reveal how they connect to a single insight. The "what does X have to do with Y?" structure. The reader's curiosity about the connection is what keeps them reading. The payoff is the moment the threads snap together.

## Best For

- Cross-domain insight posts ("What cooking taught me about TypeScript")
- "Unexpected lesson from X" posts
- Connecting disparate experiences into a unified worldview
- Posts where the thesis would sound obvious if stated upfront but feels earned when arrived at through convergence

## The Steps

### 1. Thread A (Establish the First Idea)

Introduce the first concept, story, or observation. Make it interesting on its own merits — it needs to stand alone before it connects.

- Give it enough depth that the reader is engaged with this thread specifically
- Don't hint at the connection yet
- End the section at a natural pause, not a cliffhanger

**Example:** "I spent last weekend reorganizing my Neovim config. Not because it was broken — it worked fine. But I'd accumulated three years of plugins I'd added for specific problems that no longer existed. A Copilot integration I replaced with Claude Code. A fuzzy finder config that duplicated what Telescope already did. A custom statusline I wrote before lualine existed. The config worked, but I couldn't explain half of it anymore."

### 2. Thread B (Establish the Second, Seemingly Unrelated Idea)

Shift to something that feels completely different. The contrast is the point — the reader should be thinking "where is this going?"

- Signal the shift: a section break, a new header, a clear transition
- Make this thread equally engaging on its own
- The further apart the threads seem, the more satisfying the convergence

**Example:** "Completely unrelated: I've been reading about how cities evolve. There's this concept called 'desire paths' — the unofficial trails people wear into grass because the paved sidewalk doesn't go where they actually walk. Urban planners used to fight them. Now the smart ones pave the desire paths instead."

### 3. Optional Thread C (A Third Angle)

A third thread can make the convergence feel more like a revelation than a coincidence. But only add it if it genuinely enriches the connection.

- Keep it shorter than A and B — the reader's patience for unconnected threads has limits
- It should add a dimension the first two threads don't cover
- Two threads is often enough; don't force a third

**Example:** "One more thing. At work last week, we had a retro about our CI pipeline. It's 47 minutes. Nobody likes it. But when we traced the history, every step was added for a good reason — a flaky test, a security scan after an incident, a lint rule after a bad deploy. Each addition made sense. The aggregate didn't."

### 4. The Convergence (Reveal the Connection)

This is the moment the threads snap together. The reader should feel the connection click, not have it explained to them.

- State the connection clearly but let the threads do the heavy lifting
- The best convergences feel inevitable in retrospect
- One or two sentences can be enough if the setup was strong

**Example:** "My Neovim config, desire paths, and our CI pipeline are all the same problem: systems that grow by accretion rather than intention. Each addition solves a local problem. Nobody steps back to ask whether the whole still makes sense."

### 5. The Synthesis (Unified Insight)

Now that the connection is established, explore what it means. This is where you go deeper than any individual thread could.

- Apply the unified insight to new territory
- Make it actionable — what does this mean for the reader's work?
- This section can be the longest; the convergence earned you space to go deep

**Example:** "I've started scheduling what I'm calling 'accretion audits.' Once a quarter, I pick a system — my dotfiles, a CI config, a codebase's dependency list — and ask one question: if I were building this today, would I make the same choices? Not 'does it work?' Working is a low bar. The question is whether it still reflects intent."

## Structure Notes

The convergence point is the hinge of the entire post. Everything before it is setup; everything after is payoff. If the convergence doesn't land, the post feels like three disconnected anecdotes with a forced moral.

Weight distribution: Threads A and B should be roughly equal length. Thread C (if present) should be noticeably shorter. The Convergence itself can be brief — even a single paragraph. The Synthesis should be substantial, about a third of the total post.

The opening of Thread B is a trust exercise. The reader trusted you through Thread A, and now you're asking them to trust you with something that seems unrelated. Earn that trust by making each thread genuinely interesting, not just setup for the punchline.

## Combination Notes

- **The Petal:** Similar multi-thread structure, but petals radiate from a known center. Converging Ideas hides the center until the convergence. You can start with convergence and shift to petals for the synthesis section.
- **Compare & Contrast:** If threads A and B are two perspectives on the same domain, you're doing Compare & Contrast. Converging Ideas works better when threads are from _different_ domains.
- **The Rashomon:** Same event from different angles that converge. Rashomon is inward-facing (multiple views of one thing); Converging Ideas is outward-facing (multiple things revealing one pattern).
- **Kishotenketsu:** The convergence moment IS the twist (Ten). The threads are Ki and Sho, the convergence is Ten, the synthesis is Ketsu.

## When NOT to Use This

If the connection between your threads is obvious from the start, there's no convergence moment — you just have a list of examples. Use The Petal instead. Also avoid this if you're stretching to connect things that don't naturally relate. The reader can tell when a convergence is forced. If you have to write three paragraphs explaining why the threads connect, they probably don't.

Single-concept deep dives don't need multiple threads. Use Progressive Disclosure or The Spiral for those.
