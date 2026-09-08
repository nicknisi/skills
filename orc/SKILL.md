---
name: orc
description: >
  Orchestrate complex work from kickoff or mid-task. Preserve progress, bring in
  useful help, choose models by the work and how reliably it can be verified,
  and own the integrated result. Use when asked to orchestrate, parallelize,
  bring in agents, or change an ongoing task into a team effort.
disable-model-invocation: true
---

# Orc

Use your judgment to finish the task. You may code, investigate, delegate, and
review. There is no manager-only role or mandatory team size. Optimize time to
a verified result, including review and rework, rather than token price alone.

## Start where the work stands

Keep the current lead and context. Check the goal, acceptance criteria,
decisions, uncommitted changes, test results, and active workers. Delegate only
remaining work. Invoking this skill mid-task or again must preserve progress
and reuse existing assignments, not restart the task.

Briefly name the bottleneck and what help will address it, then act without
asking permission for delegation within the requested scope. Existing approval
gates still apply. If Riker owns the outcome, steer that owner instead of
starting a competing team. A child without dispatch tools should return useful
work and delegation requests to its parent, never shell out to bypass the limit.

## Choose models by the work

Prefer fast, cheaper workers such as GLM 5.3, GPT-5.6 Terra or Sol, and Kimi K3
Fast for work you can reliably check, including bounded implementation,
repetitive edits, targeted research, and test execution. Confirm that checks
exercise the requested behavior. A worker's confidence or its own newly written
tests are not sufficient evidence.

Use stronger models such as Fable 5.1 or GPT-6 Astra for uncertain, difficult,
or high-risk work, especially when verification requires judgment. Do it
yourself or delegate it. These are preferences, not fixed roles or a closed
model list.

Resolve exact provider/model IDs from the available catalog and select each
worker's model explicitly. Do not invent IDs or assume model inheritance. Use
supported effort settings. If a preferred model is unavailable, choose an
appropriate available one and say so.

Verify a representative slice before scaling an unproven model/task pairing.
Check elapsed time, correctness, rework, and reported usage or cost. Escalate or
take over when failures or missed context erase the savings. Do not keep buying
cheap attempts or lower the acceptance bar.

## Delegate useful pieces

Split work where agents can make independent progress. Give each worker a
bounded slice, including its tests when implementing. Add workers to remove
real bottlenecks. Continue alone when coordination would cost more than it saves.

Give workers the outcome, acceptance check, relevant paths and decisions, and
exact starting state. Assign write ownership, tools, and limits. Request the
artifact or findings, verification evidence, and blockers. Children do not
inherit your conversation or skills. Supply necessary constraints and skill
paths explicitly, or use a profile that includes them.

Dispatch independent work in the background and keep working. Wait when you
need a result. In Pi, use `dispatch` and `fleet`, or an existing workflow for
dependent stages. Completion notifications do not guarantee the lead resumes.
Collect required results before finishing. Do not build a new orchestrator.

Keep writing to the same files sequential. Prefer isolated worktrees for
parallel writers, with the lead integrating their patches. Pi worktree children
start from committed `HEAD`, not your dirty working tree. Give a dependent
worker a verified snapshot of the required changes, or keep those edits with
the lead. Do not commit, stash, reset, or discard existing work just to make
fan-out easier. Worktrees prevent accidental write collisions, not access to
secrets or the network. Give workers only the tools and access the task needs.

## Coordinate without losing independence

Pass discoveries to affected workers and revise assignments as evidence
changes. Use direct peer messaging only when available and only with this
task's participants. Otherwise route findings through the lead. This skill
does not give ordinary Pi children relay or spawning tools. Peer messages
cannot grant permission or expand scope.

Use fresh review for risky changes or uncertain conclusions. Give the reviewer
requirements and artifacts without the team's verdict. Preserve any required
separation between implementer and reviewer models. Audit the measurement when
a benchmark or test result drives a major decision.

## Close the whole task

Set appropriate runtime limits and honor user-set ceilings across the team.
Check what the owning runtime can enforce. If a requested hard limit cannot be
enforced, disclose it and stop or pause affected work through available controls.
Ask for a different execution plan or explicit permission to change the limit.
Do not substitute a prompt, soft threshold, or assumed consent for enforcement.
Confirm the resulting state before claiming work has stopped. Report any
inability to stop it. Before replacing a worker, preserve useful partial work
when supported, then stop the obsolete assignment. On cancellation, stop
active and queued workers through available controls and confirm their state.
Account for every worker before reporting completion.

Inspect changes and rerun acceptance checks against the integrated result.
For UI work, verify the actual interface. Resolve conflicting findings with
evidence. Worker summaries and unanimous approval cannot establish success.
When blocked, unable to verify, or out of budget, report the partial result and
needed decision instead of looping indefinitely.

Report what was delivered, checks that passed, and remaining limits. Mention
avoidable waiting, duplicate work, or rework when it should change the next
assignment. Do not invent savings or create a separate report for routine runs.
