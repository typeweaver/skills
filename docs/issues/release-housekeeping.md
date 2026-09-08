# Release housekeeping: 0.1.0 GitHub release and branch auto-delete

## Context

`equip-it@0.1.0` was published manually as the bootstrap, so no GitHub
release exists for its tag; 0.1.1 and later get one from the publish job.
Merged pull-request branches are not deleted automatically.

## Goal

Release history on GitHub is complete and merged branches disappear.

## Acceptance criteria

- GitHub release for tag `equip-it@0.1.0` exists, titled like the automated
  ones, with the 0.1.0 section of `cli/CHANGELOG.md` as body.
- Repository setting "Automatically delete head branches" is enabled and the
  stale branches of already merged pull requests are removed.

## References

- `cli/CHANGELOG.md`
