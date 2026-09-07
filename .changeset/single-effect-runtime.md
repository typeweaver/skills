---
"equip-it": patch
---

Fix the crash on startup when installed with npm or npx. The exact `effect`
pin conflicted with the peer ranges of `@effect/platform-node`'s transitive
packages, so npm nested a second `effect` copy and the two runtimes could not
share scopes. The effect packages now use compatible ranges, and the package
smoke test installs with npm and asserts a single `effect` copy.
