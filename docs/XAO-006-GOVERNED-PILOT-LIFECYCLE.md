# XAO-006 — Governed Pilot Lifecycle

Status: `REPOSITORY_IMPLEMENTED / LIVE PILOT PENDING`

XAO-006 governs an authorized Alpha One pilot from activation through closure. Its append-only lifecycle supports `AUTHORIZED`, `ACTIVE`, `PAUSED`, `COMPLETED`, and `ABORTED` states with actor, time, reason, and evidence recorded for every transition.

Completion is fail-closed: a pilot cannot be marked complete and Xen cannot permit a success claim without at least one measured outcome containing a baseline, result, unit, and metric identifier. An aborted pilot remains auditable and is never represented as success.

The repository implementation proves the lifecycle contract only. It does not prove a real pilot started, recovered, completed, produced an outcome, or received customer acceptance.

## Validation

```bash
node --test tests/alpha-one-*.test.mjs
python scripts/validate_site.py
```
