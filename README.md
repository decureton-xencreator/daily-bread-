# Daily Bread

Xen Daily Bread is the daily operating brief and personal orientation experience, produced through **XDBS — Xen Daily Bread Studio** under the Xen Publishing System.

## Production standard

Daily Bread is an XPS-standard, mobile-first HTML publication.

Legacy markdown-only, plain-text, chat-prose, and generic report formats are deprecated. If publication fails, the system must report failure rather than silently downgrade the experience.

## XDBS Publisher v1.0 — Implemented

The repository now contains a durable publication pipeline:

- `index.html` — stable landing page for the current edition;
- `editions/YYYY/MM/` — immutable dated publications;
- `archive/index.html` — permanent archive navigation;
- `data/editions.json` — machine-readable edition manifest and current-edition pointer;
- `scripts/validate_site.py` — mobile and structural validation gate;
- `.github/workflows/pages.yml` — GitHub Pages validation and deployment workflow;
- `.nojekyll` — static publication-root configuration.

Publisher flow:

`XDBS render → validate → archive → update manifest → publish current edition → deploy → preserve`

GitHub Pages must use **GitHub Actions** as its deployment source. Once Pages is enabled for this private repository/account plan, the workflow deploys the publication at the repository Pages address.

## Required capabilities

- verified present date, local time, geolocation or active travel context;
- operating-mode calibration for home, work, travel, recovery, weekend, and mission states;
- Academy Command as a prime directive;
- World in 5 Minutes with tappable source links;
- local weather and travel guidance;
- markets when materially relevant;
- risk and opportunity radar;
- Water Cooler bullet cards;
- personalized Sports and Entertainment nodes;
- Xen Build Evolution;
- Xen Globe integration;
- focused execution plan;
- provenance and verification note.

## Active capability integrations

- XDBS — Xen Daily Bread Studio
  - Governed by `integrations/XDBS-DAILY-BREAD-PRODUCTION-CONTRACT-v1.0.md`
  - Canonical architecture remains in `decureton-xencreator/xen-operating-system`
- XMI — Xen Music Intelligence
  - Optional Song of the Day, Sound of the City, Emerging Artist Spotlight, and Local Scene Pulse
  - Governed by `integrations/XMI-DAILY-BREAD-INTEGRATION-v1.0.md`
  - Canonical architecture remains in `decureton-xencreator/xen-operating-system`

Daily Bread integrations must remain low-friction, permission-aware, private by default, truthful about runtime status, and consistent with canonical Xen capability contracts.
