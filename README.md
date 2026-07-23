# Xen Daily Bread — XDBS 3.0 Living OS

XDBS 3.0 is the repository-backed Xen personal executive operating environment and front door of Xen OS. It combines a premium Living Publication, executive narrative briefing, mission control, Xen Globe navigation, contextual World Clock, Academy Priority Dashboard, embedded lesson runtimes, source-linked intelligence, local state, archive, provenance and diagnostics.

## Canonical architecture

- `decureton-xencreator/xen-operating-system/architecture/xdbs/XDBS-001-XEN-DAILY-BREAD-STUDIO-ARCHITECTURE-v3.0.md`
- `decureton-xencreator/xen-operating-system/architecture/xdbs/XDBS-003-FAMILY-DEPENDENCY-MAP-v1.0.md`

## Governing experience standard

Daily Bread is not a chat response, static report, decorative dashboard, or one-line card wall. It is a mobile-first executive home screen where the user can:

- orient to current time, place, priorities and operating mode;
- read richer VLOG-style intelligence;
- open verified source articles;
- launch Xen Studios and action surfaces;
- start or resume Academy lessons;
- complete validated lesson nodes;
- update mission, progress and activity state;
- return to the Daily Bread home screen.

Every card and button must lead somewhere meaningful or be clearly labeled preview/unavailable. Every information panel must contain substantive information, not a promise about what will eventually appear.

## Quality floor

All releases must meet or exceed the approved XDBS Living Publication quality standard:

- refined executive and magazine visual hierarchy;
- mobile-first responsive layout;
- no horizontal overflow;
- readable phone typography and touch targets;
- subtle, purposeful micro-interactions;
- richer contextual writing using `What it is → Why it matters → Darren takeaway → Action`;
- active lesson nodes with real teaching, correction, retry and completion;
- factual source links and visible truth states;
- three-pass editorial, functional and responsive QC.

## Run and validate

Serve the repository root through any static HTTP server, then open `index.html`. Run `python scripts/validate_site.py` before release. Publishing `main` triggers the GitHub Pages workflow only after validation passes.

## Truth boundary

Repository-backed navigation, local state and current implemented controls may be functional. News, weather, calendar, markets, sports, finance-account data and cross-Studio synchronization require their connected services. The product must not fabricate live data or claim remote persistence when only local state is available.

An Academy lesson may be labeled active only when it can be taught and completed at full Xen Academy quality. Text-presence checks are insufficient; validation must assess correctness and explain errors.

## Publisher flow

`Context → Verify → Intelligence → Narrative → XPS Render → Runtime Bind → Responsive QC → Functional QC → Editorial QC ×3 → Archive → Manifest → Release → Publish → Preserve → Evolve`

## XER and Warden inheritance

This repository is a governed member of the Xen repository federation. Canonical architecture and authority remain in `decureton-xencreator/xen-operating-system`.

It inherits AM-002 Version 1.3 terminal-completion behavior, XGW Warden lifecycle gates, and XER incident, degraded-state, recovery-evidence and federation-drift contracts. This repository does not claim an autonomous self-healing runtime unless repository-local cell policies, checkpoints, repair sources and validation evidence are implemented.

It also inherits the XGS-001–006 protected-cell contract: Sentinel evaluation, Guardian authorization, Warden truth-gating, and checkpointed XER repair planning with rollback and re-verification. This inheritance is a governance contract, not evidence of an external autonomous repair daemon.

Canonical XER records:

- `Foundation/XER/XER-MANIFEST.json`
- `Foundation/XER/XER-CAPABILITY-REGISTRY.json`
- `Foundation/XER/XER-FAMILY-DEPENDENCY-MAP.md`
- `Reports/SWS-XER-FEDERATION-2026-07-19.json`
