# Editor Workflow

Use this scenario for an editor whose canvas, outline, inspector, and save
status share one unsaved working copy. It distinguishes durable server data,
the browser-owned draft, autosave mutations, and local recovery persistence.

Read [../state-coordination.md](../state-coordination.md) first.

## Shape one editing capability

```text
app/documents/[documentId]/page.tsx
features/document-editor/document-editor.tsx
features/document-editor/editor-contract.ts
features/document-editor/editor-provider.tsx
features/document-editor/editor-store.ts
features/document-editor/load-document.server.ts
features/document-editor/save-document.server.ts
features/document-editor/save-document.action.ts
features/document-editor/editor-recovery.client.ts
```

`DocumentEditor` is the composition root. Widgets stay inside the feature
because they jointly edit one document. Do not add `server.ts` until an
external server consumer exists. Client widgets import
`save-document.action.ts` (`'use server'`), which authorizes and delegates to
the private `save-document.server.ts`. Never import the `.server.ts` file from
a Client Component.

## Assign state precisely

| Value                                     | Owner                                    |
| ----------------------------------------- | ---------------------------------------- |
| Document identity                         | Route param                              |
| Authoritative document and revision       | Server                                   |
| Unsaved document working copy             | Scoped editor store                      |
| Base revision for the working copy        | Scoped editor store                      |
| Dirty state                               | Derived from working copy and saved base |
| Current selection shared by editor panels | Scoped editor store                      |
| Hover, focus, open menu, field draft      | Local widget state                       |
| Shareable editor mode or panel identity   | URL only when navigation must restore it |
| Save request and optimistic projection    | Explicit mutation lifecycle              |
| Crash-recovery snapshot                   | Versioned browser storage                |

The server owns the saved document. The editor store owns an unsaved working
copy derived from a named server revision. Browser storage may preserve a
recovery candidate; it never silently becomes the authoritative document.

## Define the working-copy lifecycle

Treat editing as a state machine with explicit transitions:

```text
load authoritative revision
  -> initialize working copy once
  -> apply semantic edit commands
  -> derive dirty state
  -> save snapshot with expected base revision
  -> accept new authoritative revision or enter conflict
  -> reconcile, discard, or reset deliberately
```

- Initialize one store per document provider. Do not synchronize every query
  result into the store through an effect.
- Key or reset the provider when `documentId` changes. Decide separately
  whether navigation with unsaved work is blocked, confirmed, or recovered.
- Store edit intent through commands such as `renameSection`, `moveBlock`,
  `updateField`, `undo`, and `redo`; do not publish arbitrary setters.
- Derive dirty and validation state where possible instead of maintaining
  loosely synchronized booleans.
- Keep widget-local drafts local until committing them into the shared working
  copy has clear product meaning.

If a server refresh returns a newer revision, do not overwrite the working
copy. Compare revisions and enter a defined reconciliation path.

## Treat save and autosave as concurrency protocols

Every save submits a stable snapshot plus its expected base revision. The
server reauthorizes the document, validates the command, and rejects stale
revisions as an expected conflict outcome.

For autosave:

- debounce creation of save work, not the meaning of individual edit commands;
- identify the snapshot or local sequence being saved;
- prevent an older response from marking newer edits as saved;
- define whether new edits queue, supersede, or run alongside an in-flight
  save;
- update the base revision only for the snapshot the server accepted;
- preserve enough local state to retry or surface a conflict without losing
  the working copy.

A short optimistic mutation can live in TanStack Query when server entities
are its natural projection. A long-lived editor draft with undo, selection,
and base-revision semantics belongs in the scoped editor workflow instead.

## Make persistence recovery-only

If browser storage protects against crashes:

- version the serialized shape and define migration or discard behavior;
- store document, tenant, user, base revision, and timestamp identity with the
  recovery candidate;
- reveal recovery only after browser hydration without changing the initial
  server render unexpectedly;
- compare the recovery base with the current authoritative revision;
- ask the product-defined question when recovery is stale instead of applying
  it automatically;
- clear sensitive data on save, discard, logout, tenant change, or expiry as
  the product contract requires.

Use durable server drafts when cross-device continuation or reliable recovery
is a product requirement. Browser storage is not a substitute for that system.

## Compose without leaking the store

```text
DocumentPage(documentId)
└── DocumentEditorProvider(initialDocument, baseRevision)
    └── page-owned workspace
        ├── DocumentOutline
        ├── EditorCanvas
        ├── SelectionInspector
        └── SaveStatus
```

The page loads and authorizes the initial document, owns the workspace layout,
and passes one serializable initialization contract. Each widget selects only
the editor state it needs. Server Components outside the provider may render
stable surrounding content but cannot read the client store.

Use URL state for an editor mode, selected section, or side panel only when a
copied URL and browser history should restore it. Otherwise selection stays in
the scoped workflow and transient chrome stays local.

## Handle hard cases

- **Concurrent edits:** Use server revisions or another domain concurrency
  token; distinguish conflict from network failure.
- **Undo after save:** Define whether history crosses save boundaries and how
  reverting relates to the new base revision.
- **Navigation:** Specify blocking, auto-save, discard, and recovery behavior
  for internal navigation, refresh, tab close, and document changes.
- **Large documents:** Use focused selectors, normalized editor data, and
  measured rendering strategies before splitting ownership across stores.
- **Validation:** Separate local structural validation, server business rules,
  and authorization failures.
- **Sensitive content:** Define what may enter browser storage, logs, query
  caches, error reports, and telemetry.

Realtime collaborative editing, offline mutation queues, multi-tab editing,
CRDTs, and operational transforms require separate ordering and conflict
architecture. Do not approximate them with local persistence plus a larger
Zustand store.

## Avoid

- Treating TanStack Query data as the mutable editor document.
- Copying every loaded document into a module-global Zustand store.
- Marking all changes saved when an older autosave response completes.
- Letting recovery storage silently overwrite a newer server revision.
- Exposing raw store mutation across the feature boundary.
- Putting document behavior in the page because it composes the panels.

## Verify

- Store tests cover semantic edits, derived dirty state, selection, undo, redo,
  reset, and document identity changes.
- Save tests cover authorization, validation, revisions, response reordering,
  retry, and conflicts.
- Recovery tests cover versioning, expiry, identity isolation, stale bases,
  restore, and discard.
- Integration tests cover navigation with unsaved work and every conflict
  outcome without data loss.
