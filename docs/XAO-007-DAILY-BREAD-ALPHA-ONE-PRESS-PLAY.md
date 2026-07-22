# XAO-007 — Daily Bread Alpha One Press Play

**Status:** Repository implemented / external evidence gated

**Pilot:** Xen Daily Bread

**Root authority:** Darren Cureton

## Purpose

This package reduces Alpha One preparation to a governed profile and a manual workflow while preserving the distinction between configuration, activation, and measured pilot success.

## Operator sequence

1. Copy `config/alpha-one.daily-bread.template.json` to `config/alpha-one.daily-bread.json`.
2. Replace every placeholder with approved, non-secret identifiers and terms.
3. Store credentials only in the governed `ALPHA_ONE_IDENTITY_CREDENTIAL` environment secret.
4. Run **Alpha One Press Play** in `plan-only` mode and retain the plan artifact.
5. Add authentic identity, privacy, commercial, service-health, baseline, and acceptance evidence required by XAO-004 through XAO-006.
6. Run `staging-readiness`; its protected environment must remain closed until that evidence is attached and the gate is intentionally completed.
7. Run `pilot-authorize` only after staging acceptance. Start the lifecycle at `AUTHORIZED`, then transition through the governed runtime.

## Truth boundary

The template is intentionally invalid. A filled profile can produce `PLAN_READY`; it cannot manufacture identity, approvals, health evidence, baselines, pilot outcomes, or production certification. The workflow retains no raw secret or personal-content value in its plan artifact.
