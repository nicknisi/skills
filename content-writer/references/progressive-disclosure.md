# Progressive Disclosure Framework

Start simple, layer complexity. Teach a concept by building up from the most minimal version to the full picture. The reader learns at each step and can stop when they have enough.

## Best For

- Teaching a new concept, API, or tool
- "Getting started with X" posts
- Deep dives that need to be accessible to different skill levels
- Library or feature introductions

## The Steps

### 1. The Hook (Why Care?)

Start with what this enables. Show the end result or the problem it solves before explaining how.

- A compelling use case or before/after
- Keep it concrete — show output, a screenshot, or a result
- One paragraph max

**Example:** "With three lines of config, you can get type-safe environment variables that error at build time instead of runtime."

### 2. The Simplest Version

Show the absolute minimum viable example. Strip away every optional thing.

- The fewest lines of code that demonstrate the concept
- No error handling, no edge cases, no abstractions
- Annotate what each line does

**Example:** A 3-line `.env` schema with `z.string()` and the one-liner to parse it.

### 3. Layer 1: Real-World Usage

Add the first layer of practical complexity.

- Error handling or validation
- Common options or configuration
- A more realistic use case

**Example:** Add `.url()`, `.default()`, and a custom error message.

### 4. Layer 2: Advanced Patterns

Add sophistication for readers who want to go deeper.

- Composition, abstraction, or integration patterns
- Performance considerations
- Edge cases and gotchas

**Example:** Runtime vs build-time validation, environment-specific schemas, CI integration.

### 5. The Full Picture

Tie it together with a complete, production-ready example.

- Reference the simple version to show how far the reader has come
- Link to docs or further reading
- Optional: show the real config from your actual project

## Structure Notes

Each layer should be a natural stopping point. A reader who leaves after Layer 1 should still have something useful.

Use code blocks heavily — this framework lives and dies on concrete examples. Every layer should have a runnable snippet.

Headers should signal complexity level so readers can jump to their depth: "The Basics," "Going Further," "Advanced Patterns."

## Combination Notes

- **+ The Spiral:** Progressive Disclosure moves forward (simple→complex); The Spiral revisits the same concept with deepening understanding. Combine by returning to your "simplest version" at each layer to show how understanding has evolved.
- **+ Nested Loops:** Wrap each disclosure layer in a mini-narrative. The technical content still builds simple-to-complex, but each layer is told as a story rather than a tutorial step.
- **+ Kishotenketsu:** Use Progressive Disclosure for layers 1-2 (Ki, Shō), then introduce the twist (Ten) as a recontextualization that makes earlier layers look different.
- **+ The Petal:** Each "petal" can be a progressive disclosure sequence — multiple parallel paths from simple to complex, all supporting one central theme.

## When NOT to Use This

If the post is telling a story rather than teaching a concept, Progressive Disclosure will feel like a tutorial when it should feel like a narrative. Also a poor fit for opinion pieces or comparisons where there's no clear simple-to-complex gradient.
