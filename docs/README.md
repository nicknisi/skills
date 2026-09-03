# Skills

A collection of [pi](https://pi.dev) and Claude Code skills — drop-in expertise modules that shape how an agent handles specific kinds of requests. Each skill is a self-contained directory with a `SKILL.md` file that defines its trigger conditions, workflow, and constraints.

## What is a skill?

A skill is a markdown file that tells the agent:

- **When to activate** — trigger phrases, user intent patterns, or request types
- **What to do** — the workflow, steps, or process to follow
- **What not to do** — boundaries, anti-patterns, or things to refuse
- **How to output** — format, style, or quality standards

Skills live in the agent's context and are selected automatically based on the user's request. They are not plugins or code — they are structured prompts that govern behavior.

## Skill catalog

| Skill | Description |
|-------|-------------|
| **brainrot** | Turn any topic, doc, or wall of text into "sludge content": a phone-shaped (9:16) page with a narrated ELI5 lesson (natural male TTS voice, word-by-word captions) on top and Minecraft-style 3D parkour underneath, synced to the lesson (new biome per beat, a stunt on each beat's key phrase). Triggered by "brainrot," "sludge," "subway surfers," "I can't focus on this," "read this to me." |
| **content-machine** | Turn Nick Nisi's raw material into a blog post draft in his voice. Use when the user says "write a blog post," "draft a post," "write about [topic]," "turn my notes into a blog post," or provides scattered ideas that need shaping. Produces a deliberately flat draft with sourced facts and tagged gaps — never a finished post. |
| **diagnosing-bugs** | Diagnosis loop for hard bugs and performance regressions. Systematic root-cause analysis when something is broken, throwing, failing, or slow. |
| **domain-modeling** | Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a `CONTEXT.md`, or recording an ADR. |
| **eli5** | Explain a topic to a complete novice using an HTML artifact with big pictures and few words. Triggered by "eli5" or "explain like I'm 5." |
| **explain-this** | Explain any digital artifact — paper, PDF, article, or codebase — so the person actually understands it, not just skims. Uses comprehension quizzes and spaced repetition. |
| **grill** | Grill the user relentlessly about a plan, decision, or idea. Stress-test thinking by surfacing hidden assumptions and arguing for the simplest version. |
| **llms-visibility** | Make websites, docs, blogs, or landing pages visible and readable to LLMs and AI agents. Covers `llms.txt`, Markdown content negotiation, `Link` headers, and `Content-Signal` in `robots.txt`. |
| **research** | Investigate a question against high-trust primary sources and capture findings as a Markdown file in the repo. Delegated to background agents when legwork is needed. |
| **scandinavian-design** | Apply a refined Scandinavian visual system with a neutral black-and-white foundation, restrained sans-serif typography, purposeful product imagery, generous spacing, and clear page choreography. |
| **show-me** | Help the user understand the current topic visually with concise diagrams, code-shape sketches, and focused HTML artifacts. |
| **triage** | Move issues and external PRs through a state machine of triage roles, categorise, verify, grill if needed, and write agent-ready briefs. |
| **unslop** | Cut AI tells from any writing. Scans prose for statistically overrepresented AI writing patterns and rewrites flagged sections. |
| **wayfinder** | Plan a huge chunk of work (more than one agent session can hold) as a shared map of decision tickets on the issue tracker, and resolve them one at a time until the way to the destination is clear. |
| **wizard** | Generate an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting up credentials or CI secrets, or walking an unfamiliar third-party dashboard. |

## Structure

```
skills/
├── <skill-name>/
│   └── SKILL.md          # Required. The skill definition.
│   └── (other files)     # Optional. Scripts, references, templates.
```

Each `SKILL.md` follows this convention:

```markdown
---
name: <short-name>
description: '<one-line description including trigger conditions>'
---

# <Title>

## Workflow

### 1. <Step name>

<Instructions>

## Anti-patterns: do NOT implement

- **<Pattern>** — <Why to refuse it>

## Tradeoffs to confirm before shipping

- **<Decision>** — <What to ask the user>
```

## Usage

These skills are designed for [pi](https://pi.dev), a coding agent harness that supports skill-based context injection. To use them:

1. Clone or symlink this repo into your pi skills directory
2. Reference skills by name in your pi configuration
3. The agent will automatically select the appropriate skill based on your request

Some skills are also compatible with Claude Code's skill system.

## Adding a skill

1. Create a directory with a descriptive name
2. Write a `SKILL.md` with clear frontmatter and structured instructions
3. Test it with real requests before committing
4. Keep it focused — one skill, one responsibility

## Attribution

Some skills are original; others are adapted from public skill repositories:

- **llms-visibility** — adapted from [evilmartians/agent-skills](https://github.com/evilmartians/agent-skills)

When adapting a skill, attribution is preserved in the skill file itself.
