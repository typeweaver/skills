# Skill philosophy

A skill is a document an agent runs. It earns its place in the agent's context
only by changing what the agent does. Everything below follows from that.

## A skill changes behavior or it does not ship

- A capable agent already knows generic engineering advice. A sentence the
  agent would follow anyway is a no-op: it costs attention and buys nothing.
  Test every sentence against the agent's default, and delete whole sentences
  that fail, not words.
- Teach only what moves the agent off its default: a specialized mindset, a
  domain fact, a judgment rule, a constraint, a fragile sequence, or an output
  contract.
- Judge the test by running the skill, not by debating it. Two people who
  disagree about a no-op disagree about the default.

## One responsibility per skill, said first

- Give each skill one behavioral responsibility: one family of triggers leading
  to one expected outcome. Name it in the first lines. Every instruction must
  support it.
- Add a skill only when no existing skill owns its trigger and outcome. Move a
  rule to another skill when it serves a different trigger or outcome. Use a
  reference file to disclose supporting detail, not to hide another
  responsibility.

## Tests, not adjectives

- When an evaluative word such as material, appropriate, sound, coherent, or
  genuine controls a decision or completion, define the evidence or decision
  rule behind it. Keep contextual judgment where the work requires it, and name
  the factors the agent must weigh.
- Give every anti-pattern its tell: the observable symptom in the agent's own
  output that says it has happened. A test that breaks on a refactor that
  changed no behavior. An abstraction whose deletion moves no complexity back
  into callers.
- Give costly, fragile, or drift-prone steps a completion criterion. Make it
  clear enough to tell done from not done and demanding enough to force the
  required legwork. Vague bounds invite the agent to end the step early.
- When test runs show the agent starting X before Y exists, add the
  self-interrupt at that point: "If you catch yourself doing X before Y exists,
  stop."

## Words the agent thinks with

- Define a few terms and use them exactly. Do not rotate synonyms: the agent
  should not have to infer whether two words mean the same thing. Define each
  term once instead of repeating its explanation.
- Prefer words the model already knows over coined ones. A known word recruits
  what the model already knows about it; a coined word must be paid for in
  definition.
- Prohibit only as a hard gate, and pair every prohibition with the target
  behavior so attention lands on what to do.

## Descriptions say what the user says

- The frontmatter description names the outcome and the trigger contexts that
  distinguish the skill from neighboring skills, using words a user or task
  would use. It does not summarize the body.
- Model-invoked skills get rich triggers because the agent must find them
  from context. User-only skills get a one-line summary a human reads while
  browsing commands, and the choice is encoded for every supported harness.
- Operative routing names the mechanism: "Call the Skill tool with
  `review-it`", not a bare skill name left for the model to interpret.
  Routing lives in orchestrators; a focused skill stays useful alone.

## Procedure and reference material stay apart

- Procedure is what the agent does, in order. Reference material is what it
  consults when a step needs it. Mixing them buries the procedure and makes the
  agent less likely to attend to each rule.
- Keep the procedure in the main file. Keep reference material every path needs
  beside it under one heading, so a concept's definition, rules, and caveats are
  read together. Move branch-specific reference material into a clearly named
  file and link it from the relevant step.
- Match specificity to risk. Principles for contextual judgment; exact
  sequences only for fragile or consistency-critical work.
- Long is a failure mode even when every line is live. Attention thins across
  the excess. Move branch-specific reference material out first. Split by
  responsibility or sequence when one execution path must cross material it
  does not use. Compress wording only after the hierarchy is right.

## The skill demonstrates its own voice

- Use plain, literal, imperative English in short sentences. Say what you mean.
  Avoid decorative metaphors, rhetorical setup, introductions, conclusions,
  and repeated checklists.
- A rule about output is written in the form it demands. A skill that asks for
  a brief is brief.
- A reason stays only when it lets the agent handle cases the rule does not
  name. A reason that merely justifies the rule to a reader is cut.

## The human keeps the wheel

- Ask at the user's decision level and recommend an answer they can accept or
  reject directly. Research facts yourself; ask only for missing choices that
  change the outcome.
- Authorization is action-specific. Approval to commit does not authorize
  pushing, publishing, deploying, creating external records, or merging. No
  harness adaptation or workflow automation weakens an approval gate.
- Discover the target repository's conventions and policy at execution time.
  Skills carry no organization-, team-, or person-specific policy.

## Evidence over opinion

- Forward-test new skills and behavior-sensitive revisions in clean contexts
  against a no-skill or previous-version baseline. Define the expected behavior
  change before the run. Compare representative tasks under the same harness
  and model settings, and repeat cases whose outcome varies. A difference that
  repeats is evidence of value; no observed difference is a reason to revise or
  remove the instruction.
- Read what the agent did, not what the skill says it should do, and revise
  from the difference. Read the transcript, not only the result: a skill that
  produces the right output while wasting the run on detours is still wrong.
- Test the description with prompts that should trigger it and with near
  misses that share its words but need something else. Use substantial tasks;
  an agent does not consult a skill for work it can do in one step.
- Generalize from feedback. A fix that only serves the test cases at hand
  overfits; when a problem resists, change the framing before adding another
  constraint. When every run rewrites the same helper, ship it as a script.
- When a session goes wrong, trace each user correction back to its cause: a
  wrong assumption, missing context, a rule that did not fire, or a rule that
  is a no-op. The output of that trace is the exact text change, not a
  request to improve something.
- Treat existing skill behavior as deliberate until a revision says otherwise,
  and run a separate compression pass only after behavior is right.
