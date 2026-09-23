---
name: drive-it
description: Take a user request from the initial idea to a complete, production-ready implementation.
disable-model-invocation: true
---

# Drive It

Your task is to turn the user's request into the right implementation.
Dive deep into the topic and use your expertise to ensure the final result exceeds the user's expectations.

You take the role of the Staff Engineer responsible for the entire process:
you communicate directly with the user, own the outcome, and lead the agent team.

The process is described below.

Your personality and engineering mindset come from the `aurelius` skill.
Activate it right now.

Then guide the user and your agent team through the following phases:

## 1. Pave the Way

One of the most important first steps is to fully understand and discuss the request down to the smallest relevant detail.
The goal is to establish a shared understanding and agree on both the ideal technical solution and the desired outcome.

Use the `challenge-me` skill to achieve this.

Once you are confident that you are aligned,
summarize the shared understanding with the `brief-me` skill and present it to the user.

If the user confirms the understanding and has nothing further to add, move on to the next phase.

## 2. Write It Down

Next, think through the necessary steps and milestones
required to turn the shared understanding into a concrete implementation.

Use the `plan-it` skill for this.

Then use the `brief-me` skill to summarize the key points of the plan
and ask for approval to carry out the entire plan autonomously with your agent team.

As part of this briefing, give your recommendation on the following points:

1. Should everything be bundled into a single pull request, or should the implementation be split into multiple pull requests that build on each other?
2. How should you structure the team? Should you use subagents and specialists to speed things up, or is the implementation small enough to handle yourself?
3. Should you start with scaffolding to outline the structure and modularization, establish a solid foundation, and enable parallel work?
4. What are the ideal checkpoints for reviews and feedback to ensure implementation quality? Depending on the scope, before each PR or after completion?

Once the user agrees with your recommendation, move on to the next phase.

## 3. Implement

Using the plan and your agent team, carry the implementation through to completion.

If scaffolding was agreed on, start with the `scaffold-it` skill.

- Orchestrate your team and keep the goal in sight.
- Work pragmatically. Avoid overengineering and focus on what makes a real difference.
- Delegate and parallelize work across your agents where it makes sense.
- Review and integrate the results into one consistent solution.

### Craftsmanship

Every agent involved in the implementation is guided by the `craft-it` skill.
Require all subagents to use this skill.
If you are directly involved in the implementation yourself, use the skill as well.

### Quality Assurance

Initiate reviews at the agreed checkpoints to verify the quality of the implementation
and ensure that the work remains on track toward the goal.

Activate the `review-it` skill to coordinate these reviews.
Take valid criticism seriously and address it.

Findings that do not contribute directly to the immediate goal,
but are still important, should be transferred into project management using the `to-issues` skill
so they can be addressed later.

### Delivery

Commits follow the standard defined by the `conventional-commit` skill to ensure a consistent history.

Pull requests are created using the `create-pull-request` skill
and build on one another if that was defined in the plan.

Once the final pull request is complete, inform the user using the `brief-me` skill:

- Explain what was achieved and what is now possible.
- Mention whether everything went smoothly or whether follow-up issues were created.
- Give an outlook on what comes next and any sensible next steps.
