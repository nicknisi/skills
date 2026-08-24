# The Sparkline

Nancy Duarte's framework, identified by analyzing great speeches (Steve Jobs, MLK). The core mechanic: alternate between "what is" (current reality) and "what could be" (ideal future) to create emotional momentum through contrast. Each oscillation widens the gap, making the status quo increasingly intolerable and the vision increasingly compelling. Adapted here from presentations to persuasive blog writing.

## Best For

- Advocacy posts ("We should adopt X")
- Contrarian takes ("Y is broken, here's how to fix it")
- DX improvement pitches
- "Why I switched to X" posts with an evangelism angle
- Posts arguing for cultural or process change in dev teams

## The Steps

### 1. What Is (Opening Reality)

Open with the current state of things — honestly, specifically, without editorial. Let the reality speak for itself. The reader should recognize their own situation.

Don't attack the status quo yet. Just describe it. The contrast with "what could be" will do the rhetorical work.

**Example:** "Here's how most developers set up a new project in 2026: clone a template, install 200 dependencies, configure twelve tools, write a hundred lines of config before a single line of business logic. It takes an afternoon. We've accepted this as normal."

### 2. What Could Be (First Contrast)

Introduce the alternative vision. The first glimpse of a better world. Keep it grounded — not utopian, just noticeably better.

The contrast should feel like opening a window. The air is different on this side.

**Example:** "But what if project setup was fifteen minutes? What if your toolchain was three dependencies, not two hundred? What if the config was twelve lines in one file instead of twelve files with twelve different syntaxes? This isn't hypothetical. Some teams already live here."

### 3. What Is (Deeper Problem)

Return to reality, but go deeper. Now that the reader has seen the alternative, the current state should feel heavier. Dig into the second-order effects — the hidden costs, the normalized dysfunction.

This oscillation is the engine. Each return to reality feels worse after glimpsing what's possible.

**Example:** "But we don't talk about the real cost. It's not the setup time — it's the cognitive tax. Every new developer spends their first week learning the build system, not the product. Your Webpack config has its own PR history. Your ESLint rules have exceptions that have exceptions. And when something breaks in the toolchain, everyone looks at the one person who understands it. That person is tired."

### 4. What Could Be (Expanded Vision)

Widen the vision. Show what the alternative looks like in practice — not just the setup, but the daily experience, the team dynamics, the developer happiness. Make it concrete with real tools, real workflows.

**Example:** "I've been running a project on Bun for six months. `bun init`, one `bunfig.toml`, built-in test runner, built-in bundler. When a new developer joins, they clone the repo and run `bun dev`. That's it. No 'check the wiki for setup instructions.' No 'oh, you also need to install X globally.' The toolchain is invisible, which is what toolchains should be."

### 5. What Is (The Obstacle)

Return to reality one final time. Acknowledge why the change hasn't happened. Name the real obstacles: inertia, risk aversion, sunk cost, the "we've always done it this way" gravity. Be honest here — dismissing the obstacles makes the argument weaker, not stronger.

**Example:** "So why hasn't everyone switched? Because migration is real work with real risk. Because your Webpack config, ugly as it is, ships product. Because 'it works' is a powerful argument against 'it could be better.' And because the JavaScript ecosystem has burned us before — nobody wants to be the person who bet the codebase on the wrong horse. Again."

### 6. The New Bliss (Collapse the Gap)

Close the gap between what is and what could be. This isn't a sales pitch — it's a pragmatic bridge. Show how to get from here to there. Acknowledge the transition cost, but make the case that the destination is worth it.

End with a vision of the new normal that feels achievable, not idealistic.

**Example:** "You don't have to migrate everything. Start with a side project. A new microservice. An internal tool nobody will notice if it breaks. Run it for a month on the simpler stack. Measure setup time, build time, time-to-first-contribution for new team members. Let the numbers make the argument. The goal isn't to chase the new hotness — it's to stop accepting unnecessary complexity as the price of doing business. Your tools should be boring. Your product should be interesting."

## Structure Notes

The sparkline's power is in the oscillation. Each "what is" / "what could be" pair widens the emotional gap. Typically 3-4 oscillations work for a blog post — fewer feels flat, more feels repetitive.

**Pacing:** The first oscillation should be ~30% of the post (establishing both sides). Middle oscillations ~40% (deepening both). The New Bliss is ~30% (bridging and resolving).

The "what is" sections should get progressively more specific and damning. The "what could be" sections should get progressively more concrete and achievable. By the final oscillation, the reader should feel the gap is both real and closeable.

Don't straw-man the "what is." If your description of the current reality isn't fair, readers who live in that reality will disengage. The sparkline only works if both sides are honest.

## Combination Notes

- **Problem-Agitation-Solution:** PAS is a sparkline with one oscillation. If your sparkline feels like it only needs one contrast, compress it to PAS.
- **Compare-Contrast:** Natural pairing — the sparkline provides emotional momentum while compare-contrast provides analytical structure. Use sparkline for the narrative wrapper, compare-contrast for the evidence.
- **SCQA:** Layer the sparkline as an emotional rhythm over SCQA's logical structure. SCQA provides the argument; sparkline provides the feeling.
- **Kishotenketsu:** The twist (ten) can be a sparkline turn — the moment "what could be" collides with an unexpected obstacle or insight.

## When NOT to Use This

If you're not advocating for change, the sparkline has no engine. It's a persuasion framework — without a thesis, the oscillation feels aimless.

Poor fit for: incident reports (no advocacy needed), tutorials (no argument to make), personal transformation stories (use Story Circle — sparkline is about the world, not the self). Also dangerous for posts where the "what could be" is speculative — if you can't show concrete evidence that the alternative works, the sparkline becomes wishful thinking. Back your vision with receipts.
