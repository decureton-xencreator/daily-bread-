# XAO-008 — Xen Fixes Xen: Daily Bread Alpha 1

Daily Bread is the first protected Xen cell. Guardian admits only declared operations; Sentinel continuously compares telemetry with canonical invariants; Warden controls authority; XER contains, checkpoints, repairs, rolls back and requires Sentinel re-verification.

Repository readiness is complete only when the cell contract and conformance tests pass. Live readiness additionally requires authentic provider telemetry, a staging fault, rollback evidence, security/privacy acceptance, named pilot users and transaction-specific authorization.

Operator sequence: compile XPP `plan-only`; bind secret references; deploy staging; inject one reversible controlled failure; observe Sentinel; approve the bounded XER repair; verify recovery twice; capture digests; authorize pilot; press play; monitor.
