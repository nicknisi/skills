---
name: research
description: Explicitly requested research workflow that delegates primary-source investigation to a background agent and saves a Markdown report. Use only when the user explicitly invokes this skill or requests this delegated research workflow.
disable-model-invocation: true
---

Run this workflow only when the user explicitly invokes this skill or requests delegated research with a saved report. Reading or automatically selecting this skill is not permission to delegate or create files. For ordinary questions and documentation lookups, investigate directly and answer without starting this workflow.

When explicitly requested, dispatch one **background agent** to do the research, so you keep working while it reads.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source.
3. Save it where the repo already keeps such notes; match the existing convention, and if there is none, put it somewhere sensible and say where.
