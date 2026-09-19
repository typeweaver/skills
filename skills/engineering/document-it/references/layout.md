# Default documentation layout

Use this tree only when the repository has no documentation layout. Do not
create a directory that no document will live in. Do not move existing files
to match it.

```
README.md              What the project is, how to get a first success, link to the map.
AGENTS.md              Pointers and constraints an agent must load every session.
docs/README.md         The map: one line per document, the question it answers.
docs/decisions/        Decisions. Filename `NNNN-title-with-dashes.md`.
docs/<topic>.md        Any other document. Name the file for the question.
```

## Homes

| Question the reader arrives with  | Home                           |
| --------------------------------- | ------------------------------ |
| What is this, and how do I start? | `README.md`                    |
| What must I follow on every task? | `AGENTS.md`                    |
| Which document answers X?         | `docs/README.md`               |
| Why did we choose X over Y?       | `docs/decisions/NNNN-title.md` |
| Any other question                | `docs/<slug>.md`               |

## The map

`docs/README.md` is a list, not a second README. Each line is a link and the
question that document answers:

```
- [Get a first success](../README.md) — What is this, and how do I start?
- [Why NATS](decisions/0001-use-nats.md) — Why NATS over Kafka?
```

Do not add a line for a document that does not exist. Do not describe the
document in a paragraph when the question fits on the line.

## Decisions

Number monotonically from `0001`, or from one more than the highest number
already used in the ADR directory. Do not reuse a number.
