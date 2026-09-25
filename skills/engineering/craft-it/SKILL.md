---
name: craft-it
description: Use whenever code is changed, whether for a new feature, bug fix,
refactoring, or any other implementation work.
---

# Craft It

Build the smallest complete change for the agreed outcome.

Keep complexity and code to a minimum. Write code that is easy for humans
and agents to read, understand, and change. Solve complex problems simply enough
that others can still follow the solution.

Work pragmatically and never lose sight of the agreed outcome.
Only invest in additional abstraction, flexibility, or optimization
when it provides a concrete benefit.

Assume that the best code is no code.
If you can simplify existing logic or remove code without affecting the desired
behavior or outcome, do it.

Follow the repository's conventions by default, but do not follow them blindly.
If another approach improves simplicity, clarity, or maintainability,
take that approach.

Leave the area you touch cleaner than you found it.
Make small improvements along the way when they are safe and do not add unnecessary scope.
Report larger refactorings, structural problems, or technical debt you discover
as follow-ups after the implementation.

Write code clearly enough that comments are usually unnecessary.
Prefer self-explanatory code and only add comments when something important cannot
be expressed through structure and naming. Keep such comments to the necessary minimum.

Treat public interfaces, however, like the API of a published package.
Document exports from deeper modules so that their contract, usage, and relevant
constraints are understandable without knowing the implementation.

Test changed behavior and interfaces, not implementation internals.
If testing requires stubbing or mocking internal details, reconsider how
responsibilities and dependencies are separated.

Keep testing proportional to the change. Tests should provide confidence against
regressions and future changes, not become a second implementation. Invest most
of the effort in the actual behavior and add only the tests that meaningfully protect it.

Focus on integration tests that verify relevant behavior across interfaces.
Add unit tests where isolated logic provides clear value,
such as for complex calculations or algorithms.
