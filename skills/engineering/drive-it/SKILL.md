---
name: drive-it
description: Run the complete engineering workflow from an idea to a merged
  pull request — understand, plan, build, ship, and handle review until a
  human merges.
disable-model-invocation: true
---

# Drive It

Take one idea to a merged pull request by routing to the focused skills. Each
skill owns its rules; call it instead of redoing its work here. Call the Skill
tool with `aurelius` first and keep that mindset throughout. Resume at the
earliest phase whose output is missing:

- Understand: a shared understanding the user confirmed
- Plan: a plan
- Scaffold: the approved scaffold, when step 3 applies
- Build: a branch with the milestone's commits
- Ship: a pull request
- Deliver: a merged pull request

1. **Understand** — call the Skill tool with `challenge-me`. Skip it only when
   no consequential decision about the idea is open.
2. **Plan** — call the Skill tool with `plan-it`, present the plan by calling
   the Skill tool with `brief-me`, and ask once, with a recommended answer,
   for approval to execute the whole plan autonomously. Default to one pull
   request per milestone and settle every deviation in that same question;
   apart from the structure checkpoint in step 3, no further input is needed
   before delivery.
3. **Scaffold** — when the milestone adds or moves modules, public functions,
   or dependencies, branch from the remote default branch, call the Skill tool
   with `scaffold-it`, post its report, and ask once whether the structure
   holds before building on it. Otherwise skip this step.
4. **Build** — call the Skill tool with `define-goal` for the milestone, set
   that goal as the active objective when the harness supports one, and branch
   from the remote default branch if step 3 did not. Then call the Skill tool
   with `craft-it` for each plan step until its `Done when:` check passes.
5. **Ship** — before each commit call the Skill tool with `review-it`, fix
   every Blocking and Important finding, call the Skill tool with `to-issues`
   for its Follow-ups, and call the Skill tool with `conventional-commit`.
   Then call the Skill tool with `create-pull-request`, and the Skill tool
   with `review-it` once over the complete diff before the pull request leaves
   draft. Repeat Scaffold, Build, and Ship for each approved milestone.
6. **Deliver** — call the Skill tool with `brief-me`, ask one bundled question
   with recommended answers, covering tracker synchronization and reviewer
   requests, then call the Skill tool with `pr-review-loop` until every pull
   request is merged by a human or blocked.

To invoke an expert perspective, call the Skill tool with the matching `ask-*`
skill; its description decides when it applies.

Research, decide, and resolve what you can yourself; a step you have decided
on is something to run, not to announce. Interrupt the user only when a
required check, decision, or authorization cannot be obtained by the agent,
when new evidence invalidates the agreed outcome, or before an action you
cannot undo. When you interrupt for a check, decision, or authorization, post
or report the request with the options you know. You are blocked when a
required check, decision, or authorization cannot be obtained by the agent and
the request has been posted or reported. Never merge yourself, and never
publish external issues, deploy, or release without the matching explicit
authorization.
