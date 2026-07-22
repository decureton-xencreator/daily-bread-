# XAO-003 — Governed Daily Bread Consumption

Status: `REPOSITORY_IMPLEMENTED / SERVICE_CONNECTION_PENDING`

Daily Bread now contains the governed consumer boundary for Xen Alpha One Living Manuals. The front door can request approved-source explanations in English or Spanish and start employee practice, but it never treats an uncited response as authoritative.

## Controls

- Identity and tenant context must come from an injected identity provider.
- Service calls must use an injected transport; no production endpoint or credential is embedded.
- Every non-escalated answer must include an approved source ID and version.
- Missing identity, transport, citation, or valid service response fails closed to `WARDEN ESCALATION`.
- Practice is visibly separated from live employment evaluation.
- Demo, live-approved, practice, and unavailable states remain visible in the interface.

## External activation gates

Production activation still requires an approved identity provider, trusted service transport, deployed Living Manual endpoint, tenant configuration, privacy review, and real organizational source approval. Repository implementation is not evidence of deployment.

## Validation

Run:

```bash
python scripts/validate_site.py
node --test tests/alpha-one-client.test.mjs
```
