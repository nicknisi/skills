# Three-Act Structure

The foundational Western narrative arc — Setup, Confrontation, Resolution. Most stories map to it naturally because it mirrors how humans process change: things were fine, then they weren't, then they were again (but different). Aristotle described it first. Every screenwriting book rehashes it. It works because it's how brains expect stories to unfold.

## Best For

- General-purpose narrative posts
- Career reflections and job transitions
- Project retrospectives ("How we built X")
- Conference talk recaps rewritten as blog posts
- Any post where you need reliable structure and don't want to overthink it

## The Steps

### Act 1: Setup (Establish the World)

Introduce the world as it exists, then introduce the conflict that will disrupt it. Act 1 ends with a clear inciting incident — the moment things change.

The setup should be efficient. Readers are patient, but not infinitely. Establish what matters, skip what doesn't.

**Example:** "I'd been writing TypeScript for three years with a tsconfig I copy-pasted from a starter template. Strict mode off. `any` sprinkled like seasoning. It worked — in the same way that duct tape works. Then I joined a team that enforced `strict: true` on every repo, and my first PR got 47 type errors."

### Act 2: Confrontation (The Messy Middle)

Rising action, complications, setbacks, learning. This is the longest act — typically 50-60% of the post. The confrontation is where the actual story lives. Multiple obstacles, failed attempts, escalating stakes.

Don't resolve things too quickly. Let the reader sit in the discomfort. Show the wrong turns.

**Example:** "I spent the first week just fixing type errors. `as any` became my crutch — the compiler would shut up, and I could ship. But code review caught every one. 'If you're casting to any, you're just writing JavaScript with extra steps,' my tech lead said. She wasn't wrong. So I started actually reading the error messages. Discriminated unions. Type narrowing. Conditional types. Each concept was a small crisis of 'wait, TypeScript can do that?' followed by rewriting something I thought was fine."

### Act 3: Resolution (Climax and Denouement)

The climax — the decisive moment or breakthrough — followed by the denouement, where you show the new normal. Act 3 should feel earned. If Act 2 was hard, Act 3 is the payoff.

The resolution isn't always triumphant. Sometimes it's "here's what I learned from failing." That's fine. Honest endings stick harder than happy ones.

**Example:** "Three months in, I opened an old project — one of my `strict: false` repos — and I couldn't read my own code. Not because it was bad, exactly, but because I couldn't see the shapes anymore. TypeScript's type system had rewired how I think about data. The 47 errors weren't a hazing ritual. They were the curriculum. I still reach for `as const` more than I probably should, and generics still make me squint. But I write different code now. More intentional. More honest about what I don't know at compile time."

## Structure Notes

**Act 1** should be ~20% of the post. Get in, set the scene, trigger the conflict. If you're still in Act 1 at the 30% mark, you're over-establishing.

**Act 2** is ~55%. This is where most writers struggle — they want to rush to the resolution. Resist. The confrontation is the post. Let complications compound. Show three failed attempts, not one.

**Act 3** is ~25%. Climax is a moment, not a section. The denouement (aftermath, reflection, new normal) should be concise but resonant. Tie back to Act 1 — show what changed.

The three-act structure is the gravity well of narrative. Even when you're using another framework, you're probably using three acts underneath. That's its strength and its weakness — it's reliable but can feel generic without strong voice and specific detail.

## Combination Notes

- **The False Start:** Subvert Act 1 expectations. Set up one story, reveal it was wrong, restart. The false start lives entirely in Act 1 territory.
- **Problem-Agitation-Solution:** PAS is a compressed three-act. Problem = Act 1, Agitation = Act 2, Solution = Act 3. When your three-act post is under 1,000 words, PAS might be the honest frame for it.
- **Story Circle:** An expanded version with more granular steps. When three acts feels too coarse — especially for personal transformation posts — the Story Circle gives you eight beats instead of three.
- **Freytag's Pyramid:** Adds specific tension mapping within the three acts. If your Act 2 feels flat, Freytag's rising action / climax / falling action gives it a spine.

## When NOT to Use This

Three-act structure is so universal it can become invisible — "I used three-act structure" is like saying "I used paragraphs." If your post needs a more specific shape (non-linear timeline, tension oscillation, layer-peeling), reach for a more opinionated framework.

Poor fit for: incident timelines (use Post-Mortem or In Medias Res), comparison posts (use Compare-Contrast), advocacy/persuasion posts (use Sparkline or PAS). If the post doesn't have a clear conflict, three-act structure will feel forced — consider Progressive Disclosure or SCQA instead.
