---
name: plan-it
description: Turn a confirmed understanding into a durable, execution-ready
  engineering plan. Use for substantial work that needs coordinated steps,
  recorded decisions, a clean handoff, or multiple milestones.
---

# Plan It

Transform the shared understanding into a plan that another capable agent can
execute without reconstructing the conversation. Design the work, not the
workflow around the work.

## Capture the understanding

1. Inspect the repository, applicable instructions, conversation, research,
   tickets, and existing plans. Establish discoverable facts yourself.
2. Preserve the intended outcome, relevant current state, scope boundaries,
   constraints, and assumptions.
3. Record material decisions with their decisive rationale and implementation
   consequences. Include alternatives actually evaluated, supporting evidence,
   and conditions for revisiting the decision when they matter. Summarize the
   result instead of replaying the discussion.
4. Keep unresolved risks, questions, and research needs visible. Ask for input
   only when a missing decision prevents a useful plan.

## Shape the work

- Organize the implementation into coherent steps ordered by real dependencies.
- Give each step a concrete outcome and evidence that can prove it complete.
- Keep the system usable at meaningful intermediate boundaries.
- Turn necessary research into a step that names the decision it must unlock.
- Cover final validation across behavior, regression protection,
  documentation, and operational concerns when relevant.
- If the work contains multiple independently deliverable outcomes, create a
  lightweight roadmap and linked milestone plans. Keep shared context in the
  roadmap and enough milestone-specific context in each plan to execute it
  independently. Link the roadmap to every milestone plan, each milestone back
  to the roadmap, and plans to one another when dependencies exist.

## Write the handoff

Follow an existing repository convention. Otherwise write the plan under
`docs/plans/` with a descriptive filename and use
[assets/plan-template.md](assets/plan-template.md) as a starting point. Adapt the
structure when the work needs it; omit sections that add no useful information.

Include relevant files, systems, research, documentation, reference
implementations, and related plans when they help a new agent find the right
starting point. Explain briefly what each important source establishes or why
it should be read. Keep only context that affects execution, decisions, or
validation.

The plan is ready when a capable agent can understand the direction, continue
the work, and judge completion from the repository and the plan alone. Preserve
decision-equivalent context: what is settled, why, what evidence supports it,
and what new evidence would justify reopening it.

Report the plan path, intended outcome, overall approach, and material risks or
open questions. Do not begin implementation unless the request also authorizes
it.
