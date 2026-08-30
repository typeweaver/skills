# shadcn and Tailwind UI Boundaries

Use this guidance only when the target repository uses shadcn and Tailwind.
Treat shadcn components as maintained application source, whether they came
from the registry or were developed locally.

## Map the architecture to the stack

Use the repository's established paths when they differ. In the conventional
shadcn layout:

| Architecture owner        | Conventional location |
| ------------------------- | --------------------- |
| Shared UI                 | `components/ui`       |
| Shared product components | `components`          |
| Feature behavior and UI   | `features/<name>`     |

- `components/ui` owns shadcn primitives, canonical variants, semantic tokens,
  and custom design-system primitives without feature behavior.
- `components` may compose shared UI for several features, but it owns neither
  application behavior nor authoritative product state.
- Features own widget composition, responsive arrangement, local spacing,
  domain content, domain state, and inseparable domain presentation.

Prefer UI dependencies that flow from `app` to `features` to `components` to
`components/ui`.

## Decide where presentation belongs

```text
Reusable visual or interaction primitive? -> components/ui
Reusable product composition, no owner?   -> components
Feature-specific behavior or composition? -> keep it in the feature
```

- Inspect existing primitives and variants before creating custom markup.
  Compose an existing primitive or add a coherent central variant when it
  expresses the intended interaction.
- A canonical primitive may enter `components/ui` on its first use when it
  intentionally defines an application-wide contract. First use permits
  centralization; it does not require it.
- Give locally developed primitives the same token, accessibility, variant,
  and composition discipline as registry-derived components.
- Keep domain-specific visualizations inside their feature when their markup is
  inseparable from the capability. They may use native semantic elements and
  domain-specific geometry, but must not recreate a general-purpose input,
  button, card, badge, dialog, or other shared primitive.
- Move product-aware composition to `components` only after it has multiple
  real consumers and no feature is its natural owner.

## Maintain one design language

- Keep reusable colors, typography, radii, borders, shadows, control sizing,
  and interaction states in semantic tokens, shared primitives, or their
  variants.
- Use Tailwind inside features for composition and local layout, not to create
  competing control styles.
- Do not override a shared visual or interaction contract independently in each
  feature.
- Do not generalize a one-feature exception by changing a base primitive for
  every consumer. Add a named variant only when its semantics and visual
  contract remain coherent beyond the original call site.
