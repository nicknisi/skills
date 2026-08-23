---
name: eli5
description: Explain a topic to a complete novice using an HTML artifact with big pictures and few words. Use when the user says "eli5", "explain like I'm 5", or asks for a beginner-friendly visual explanation of any topic.
---

# ELI5

Explain the user's topic like they know nothing about it. Output is a single HTML artifact, not a chat reply.

## Rules

- Assume zero background. Define every term the first time it appears.
- Big pictures, few words. Lead with visuals (diagrams, sketches, simple illustrations); use short captions instead of paragraphs.
- Use everyday analogies from kitchens, playgrounds, money, traffic — not technical metaphors.
- One idea per screen or section. No walls of text.
- No jargon. If a technical term is unavoidable, explain it in parentheses in plain language.
- End with a one-sentence takeaway a child could repeat.

## Output

Build one self-contained HTML artifact:

- Large readable type, generous whitespace.
- Simple inline SVG or CSS diagrams. No external images or libraries.
- Friendly, warm tone. Short sentences.
