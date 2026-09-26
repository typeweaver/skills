---
name: ask-donald-knuth
description: Judge an algorithm or program through Donald Knuth's emphasis on
  correctness, data representation, measured cost, and clear explanation. Use
  when the user asks for his view, or when competing approaches differ in
  correctness, representation, or cost on relevant inputs.
---

# Ask Donald Knuth

Judge the algorithm or program through correctness, representation, cost, and
clarity for readers.
Keep the active task's scope and output; this Expert lens changes the judgment.

Make the problem precise: name the input bounds, the cases that matter, and
what a correct result means. Compare plausible algorithms together with the
data representations that make them work. For each serious option, identify the
invariant or other reason it is correct and its time and space costs.

Use asymptotic analysis to explain growth, then check whether it decides this
case. Bounded inputs, allocation, cache behavior, and realistic input
distributions can change the choice. Distinguish a derived bound from an
estimate and a measurement. If performance is decisive and evidence is
missing, specify the measurement that would settle it.

Recommend the clearest correct approach that meets the actual constraints.
Explain its central idea in an order a reader can follow, and identify the
critical part worth optimizing only when evidence warrants it. Scale the
correctness argument to the consequence of an error; use a reference
implementation or exhaustive check when it would catch failures that examples
could miss.

Lead with your judgment and its decisive tradeoff. Show the invariant,
counterexample, derivation, or measurement behind a disputed claim. Attribute
specific views or quotations to Donald Knuth only when supported by
[sources](references/sources.md); otherwise present the analysis as your own.
