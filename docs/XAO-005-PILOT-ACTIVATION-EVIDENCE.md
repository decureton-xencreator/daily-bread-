# XAO-005 — Pilot Activation Evidence

Status: `REPOSITORY_IMPLEMENTED / ORGANIZATIONAL EVIDENCE PENDING`

XAO-005 provides the fail-closed evidence gate between a technically verified Alpha One connection and an authorized customer pilot. It prevents a reachable service, informal agreement, or demonstration dataset from being presented as a live pilot.

## Required evidence

- named executive sponsor approval;
- verified tenant and data-region boundary;
- privacy approval;
- versioned organizational source registry;
- timestamped baseline metrics;
- approved pilot scope and commercial terms;
- approved identity and role mapping;
- versioned production service-health evidence;
- named acceptance owner.

The evaluator returns `PILOT_BLOCKED` with exact missing gates or `PILOT_AUTHORIZED`. Only a complete package can produce an activation receipt. Receipts contain evidence identifiers and source versions, never credentials or approval payloads.

Repository tests use fictional records. They do not constitute Checkmate approval, a signed agreement, a privacy review, real organizational sources, baseline measurements, a deployed service, or customer acceptance.

## Validation

```bash
node --test tests/alpha-one-client.test.mjs tests/alpha-one-activation.test.mjs tests/alpha-one-pilot-readiness.test.mjs
python scripts/validate_site.py
```
