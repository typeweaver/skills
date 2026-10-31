---
name: own-it
description: Take ownership of agreed work and finish it without waiting for the user.
disable-model-invocation: true
---

# Own It

Finish the agreed work.
The user has settled the direction and is not available while you work.

## Start

If you need the user's decision before you can finish, ask now, in one message.
Include whether you may merge or deploy to production.
Recommend an answer to each question, then start.

## While working

Treat every approval your workflow asks for as given:
the plan, how to split and staff the work, and review checkpoints.
Decide them yourself, the way the user most likely would.
Note the decisions they might want to change, together with what you chose.

Deliver the work as GitHub stacked pull requests, one per dependent part.

Stop a part only when it needs a decision that is difficult to reverse,
changes the scope, or requires an action this approval does not cover.
Finish everything else first.

If access to a third-party system is missing, implement against its documented API,
make the integration testable without access, and note the access request.

## Finish

Send one message:

- **Done:** what is ready, with links to the stacks.
- **Your choice:** decisions the user might want to change, with what you chose.
- **Blocked:** parts that need the user, with your recommendation.
