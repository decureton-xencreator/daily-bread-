# Alpha One Evidence Federation Bridge

**Package:** XAO-010

**Version:** 1.0.0

**Truth state:** Runtime validated / XRI-006 held by contract mismatch

## Purpose

The bridge imports canonical Xen OS evidence into the Alpha One Activation Center. It validates the repository, observed `main` commit, exact capability contract, certification level, release commit, workflow run, timestamp and privacy boundary before supplying a gate receipt.

An identifier match is never enough. The current canonical repository contains two different XRI-006 meanings:

1. Xen Repository Intelligence Runtime Version 2.0, certified at repository level.
2. Governed Workflow Execution Runtime, implemented as a canonical candidate.

XAOA-001 requires the second contract at environment certification. The first receipt therefore cannot unlock the gate.

## Operator workflow

1. Open **Alpha One Activation**.
2. Read the **Evidence Federation** card.
3. Confirm the source repository and abbreviated observed commit.
4. If the state is **HELD**, read the collision or certification code.
5. Publish authentic contract-matching evidence in canonical Xen OS.
6. Regenerate `data/xri-evidence-federation.json` from canonical `main`.
7. Run the federation, Activation Center, Guardian and site tests.
8. Retry evaluation. XRI-007 appears only after XRI-006 is accepted.

## Acceptance contract

The target identifier and semantic contract must match. The source must be canonical `main` at a full commit SHA. A release commit and workflow run must be present. Certification must meet or exceed the gate minimum. Secrets, credentials and raw workflow logs are forbidden.

## Recovery and rollback

Malformed, stale, weak or mismatched evidence returns a named fail-closed decision and leaves the current gate unchanged. Roll back the bridge runtime, receipt, cache wiring and UI together. Never edit XAOA-001 evidence to simulate rollback or completion.

## Maintenance

Run `node --test tests/evidence-federation.test.mjs tests/activation-center.test.mjs` and `python scripts/validate_site.py`. Reconcile canonical evidence before every publication. A future automated connector may regenerate the receipt, but it must preserve the same deterministic validator and privacy boundary.
