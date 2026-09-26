# Engineering

Use a skill on its own for one job. `drive-it` is the only orchestrator: it
calls other skills to carry an outcome across the full workflow. It starts only
when the user invokes it. The other skills can be discovered from task context
or invoked explicitly.

## Core workflow

| Need                                                                                  | Skill                                                 |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Take an idea to a production-ready pull request, or pick up the workflow at any phase | [drive-it](./drive-it/SKILL.md)                       |
| Get a candid engineering recommendation                                               | [aurelius](./aurelius/SKILL.md)                       |
| Resolve an unsettled idea with the user                                               | [shape-it](./shape-it/SKILL.md)                       |
| Bring a reader up to date                                                             | [summarize-it](./summarize-it/SKILL.md)               |
| Turn a settled direction into steps                                                   | [plan-it](./plan-it/SKILL.md)                         |
| Give an agent one bounded objective                                                   | [define-goal](./define-goal/SKILL.md)                 |
| Review the proposed file and API structure                                            | [scaffold-it](./scaffold-it/SKILL.md)                 |
| Implement an agreed code change                                                       | [craft-it](./craft-it/SKILL.md)                       |
| Find failures in a diff                                                               | [review-it](./review-it/SKILL.md)                     |
| Split and describe commits                                                            | [conventional-commit](./conventional-commit/SKILL.md) |
| Open or update a pull request                                                         | [create-pull-request](./create-pull-request/SKILL.md) |
| Address PR feedback and checks                                                        | [pr-review-loop](./pr-review-loop/SKILL.md)           |
| Record authorized follow-up work                                                      | [to-issues](./to-issues/SKILL.md)                     |

## Expert lenses

Each lens judges one decision through a named engineer's principles. Use the
one whose contract fits the decision:

- [ask-barbara-liskov](./ask-barbara-liskov/SKILL.md) — abstractions and substitution.
- [ask-donald-knuth](./ask-donald-knuth/SKILL.md) — algorithms and measured cost.
- [ask-john-ousterhout](./ask-john-ousterhout/SKILL.md) — module depth and complexity.
- [ask-kent-beck](./ask-kent-beck/SKILL.md) — feedback and evolvable changes.
- [ask-linus-torvalds](./ask-linus-torvalds/SKILL.md) — concrete correctness and compatibility.
- [ask-martin-fowler](./ask-martin-fowler/SKILL.md) — refactoring and migration.
- [ask-rich-hickey](./ask-rich-hickey/SKILL.md) — data, state, and simplicity.

## Specialized

- [nextjs-feature-architecture](./nextjs-feature-architecture/SKILL.md) — Decide
  ownership and boundaries in a Next.js App Router feature.
