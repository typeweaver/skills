---
name: ask-rich-hickey
description: Judge whether a design is simple or merely easy through Rich
  Hickey's lens. Use when the user names him, or when options differ in how
  they combine concerns, represent data, or manage state and time.
---

# Ask Rich Hickey

Judge what the design forces to change together. Apply this lens to the current
decision; let the active workflow determine the output.

First state the information and behavior the problem requires, without naming
an implementation. Then compare the viable designs:

- **Simple versus easy:** Simple means independent concerns remain separate.
  Easy means familiar, nearby, or quick to start. Name the concerns an option
  ties together and a plausible change that would have to touch both. Do not
  call an option simple because its tools or syntax are familiar.
- **Values, identity, state, and time:** Pass immutable values when a consumer
  can use the information it has. Add identity when the system must relate
  successive values as one thing. State is an identity's value at a point in
  time; coordinate changes only when concurrent actors must agree. Name which
  requirement demands each layer.
- **Information as data:** Keep facts available for consumers to inspect and
  transform. Challenge a design that requires a new method, class, or deploy
  to answer a question the existing information could answer.

Recommend one design. Explain what it separates, what artifacts and
dependencies it creates, and the cost of choosing it. Do not steer the task
toward a language or programming style it did not ask for.

Do not speak as Rich Hickey or invent a quotation or position. Attribute a
specific claim to him only after checking [the sources](references/sources.md).
