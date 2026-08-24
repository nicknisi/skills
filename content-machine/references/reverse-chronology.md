# Reverse Chronology

Tell the story backwards, from outcome to origin. Each section answers "but how did we get here?" Peeling back layers of decisions, migrations, and accumulated context until you reach the root. Christopher Nolan uses it. Seinfeld used it. It works for developer blogs because codebases are archaeological sites — every weird pattern has a history, and understanding the present requires excavating the past.

## Best For

- "Why is our codebase like this" posts
- Architectural archaeology (explaining legacy decisions)
- Posts where the end result is compelling and the origin story explains it
- Dependency deep-dives ("why do we depend on X")
- Configuration genealogy posts
- "How did we end up with 47 microservices" stories

## The Steps

### 1. The End State (Show the Current Situation)

Open with the present. Show the reader what exists now — the weird architecture, the surprising dependency, the config file that scares new hires. Don't explain it yet. Let the reader feel the same confusion a new team member would.

The end state should provoke the question: "How did this happen?"

**Example:** "Our tsconfig.json is 847 lines long. It has 23 path aliases, 6 composite project references, and a comment block that just says 'DO NOT TOUCH - ask Sarah.' Sarah left the company two years ago. Every new developer opens this file, stares at it, and quietly closes it. I decided to figure out how it got this way."

### 2. The Previous Layer (What Led Here)

Step back one layer. What was the most recent change or decision that created the current state? Show the proximate cause — the thing that, on its own, seemed reasonable.

Each layer should feel like a reasonable decision that only looks strange in the context of everything that came after.

**Example:** "The composite project references came from last year's monorepo migration. We had three separate repos — frontend, shared types, and a CLI tool — and the team decided to consolidate. Reasonable. But each repo had its own tsconfig with different compiler options. Rather than reconcile them, someone (git blame says it was me) created a base config and three project-specific overrides that inherit from it. The comment block? That was Sarah's way of saying 'the inheritance chain is fragile and I'm the only one who understands it.'"

### 3. Deeper Still (Earlier Decisions)

Go back another layer. And maybe another. Each layer reveals an earlier decision that constrained the later ones. The reader starts to see the chain of causation — each link made sense at the time, but the chain itself is the problem.

This is the investigative core of the post. Three to four layers usually tells the full story without losing the reader.

**Example:** "But why three repos in the first place? Because in 2022, the shared types package was an npm module published to a private registry. It had its own release cycle, its own semver, its own CI pipeline. The frontend pinned to `^2.0.0` and the CLI pinned to `^1.8.0`. Two major versions of the same types, in the same product. The private registry? That was because in 2021, we tried a monorepo, and our CI at the time couldn't handle it. The build took 45 minutes. So we split into separate repos 'temporarily.'"

### 4. The Origin (The Root Decision)

Reach the beginning. The original decision, context, or constraint that started the entire chain. Often, this is surprisingly mundane — a two-person team making a quick call that calcified into architecture.

The origin should feel like finding the first domino. The reader should think "oh, so that's why."

**Example:** "And here's where it started: in 2020, with two developers and a weekend project. TypeScript was new to both of them. The tsconfig was copied from a Create React App eject. The path aliases came from a blog post one of them read about 'clean imports.' There was no monorepo because there was no mono — just one repo, one app, one config file. Every layer of complexity was a reasonable response to a real problem. And every layer made the next problem harder to solve with the tools that already existed."

### 5. The Thread (Connect It Forward Again)

Now that the reader has the full history, connect it forward. Trace the thread from origin to present in a few sentences. Show the pattern. Then — and this is the payoff — say what should happen next.

The thread is where the post becomes useful, not just interesting. What do you do with this knowledge?

**Example:** "So our 847-line tsconfig is actually a geological record: a weekend project (2020), clean import aspirations (2020), a CI bottleneck (2021), a premature repo split (2021), a private registry nobody asked for (2022), a monorepo re-merge (2024), and a comment from someone who understood the sediment layers but didn't have time to flatten them. The fix isn't rewriting the tsconfig. It's admitting that the project references are solving a problem we created by splitting repos we never should have split. We're slowly collapsing the layers — removing path aliases one at a time, merging the project references back into a single config. Not a rewrite. An archaeological restoration. Sarah would approve."

## Structure Notes

Reverse chronology posts typically have 4-5 layers. Fewer feels shallow; more loses the reader in nested context. Each layer should be roughly the same length to maintain rhythm.

**The End State** is ~15% of the post. Quick, vivid, question-provoking.

**The layers (steps 2-4)** are ~55% total. Each layer should answer the question raised by the previous one and raise a new question of its own. The momentum comes from "but why?" at every transition.

**The Thread** is ~30%. This is where you earn the reader's time. The archaeology is interesting, but the synthesis is valuable. Show the pattern, name the anti-pattern, suggest the path forward.

Transition phrases matter in reverse chronology. "But why?" "That came from..." "Which happened because..." "Rewind further..." These signposts keep the reader oriented in the non-linear timeline.

## Combination Notes

- **In Medias Res:** Both are non-linear, but different directions. In medias res starts in the middle and expands outward; reverse chronology starts at the end and peels backward. They pair well: open with a dramatic moment from the middle of the excavation, then continue peeling back.
- **Post-Mortem:** Reveal the root cause last for dramatic effect. Traditional post-mortems go chronologically; reverse chronology starts with the outage and works back to the architectural decision that made it inevitable.
- **Socratic Path:** Each layer asks "why?" — the Socratic method applied to architecture. The reader discovers the answers alongside the author.
- **Kafkaesque Labyrinth:** For codebases where each layer reveals more absurdity. The reverse chronology amplifies the growing sense of "how did we collectively agree to this?"

## When NOT to Use This

If the present state isn't interesting or surprising, there's nothing to excavate. Reverse chronology needs a compelling "how did we get here?" — if the answer is "we made straightforward decisions and arrived at a reasonable place," the framework adds complexity without value.

Poor fit for: tutorials, personal transformation stories (use Story Circle — it's about the future, not the past), advocacy posts (use Sparkline — reverse chronology describes, it doesn't argue), and any post where the chronological version is already clear and compelling. If the story makes sense told forward, tell it forward.

Also risky for posts where you don't have access to the full history. If you're guessing at the origin layers, the post will feel speculative rather than investigative. Do the `git log` work first.
