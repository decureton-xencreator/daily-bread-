# XAO-004 — Production Activation Readiness

Status: `REPOSITORY_IMPLEMENTED / EXTERNAL CONFIGURATION PENDING`

XAO-004 adds a fail-closed readiness gate between the verified Alpha One repository contract and any production connection. It prevents a configured endpoint, an available credential, or a successful network call from being presented alone as production activation.

## Required gates

Production activation requires all of the following:

- named and approved identity provider;
- HTTPS Living Manual service endpoint;
- explicit tenant configuration;
- approved privacy review;
- approved organizational sources;
- explicit production authorization;
- successful service health check with a service version and timestamp.

The readiness result never includes credential material. It may report only whether credential material is present.

## Truth states

- `ACTIVATION_BLOCKED` — configuration or approvals are incomplete.
- `HEALTH_CHECK_REQUIRED` — configuration and approvals exist, but reachability is not evidenced.
- `HEALTH_CHECK_FAILED` — health evidence is missing or invalid.
- `PRODUCTION_CONNECTION_VERIFIED` — all gates pass and versioned, timestamped health evidence exists.

Repository tests use fictional configuration and do not constitute a live deployment, provider selection, privacy approval, source approval, or Checkmate authorization.

## Validation

```bash
node --test tests/alpha-one-client.test.mjs tests/alpha-one-activation.test.mjs
python scripts/validate_site.py
```
