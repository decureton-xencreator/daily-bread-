# Warden Report — XDBS 2.3.0

**Evaluated:** 2026-07-21 05:01 EDT

**Release gates:** 8 / 9 passed

**Deployment:** BLOCKED — workflow `29817324127` failed because the Pages site does not exist and the workflow integration cannot create it.

## Capability truth states

- Application shell, current alias, dated archive, manifests, release record and publisher: **Repository-backed**.
- Command palette, focus timer, world clocks, archive search, local preferences, notes, completion state and XMI save/dismiss: **Locally functional**.
- Weather, markets, world intelligence and sports schedule: **Live retrieval**, source-linked and timestamped for this edition.
- Academy scores, XP, streak and course activity: **Demonstration data / local synchronization model**.
- Entertainment and XMI recommendations: **Demonstration data**.
- Calendar, private travel routes, health biometrics, personalized sports feed and AI-agent execution: **Not connected / unavailable**.
- GitHub Pages workflow: **Repository-backed / failed**; `actions/configure-pages` returned `Resource not accessible by integration` while attempting to create the missing Pages site.

## Findings

- No invented live data, secrets, private itinerary, personal Academy scores, calendar entries or biometrics were placed in public source.
- External links use explicit sources; the permanent edition uses safe new-tab link attributes.
- Responsive, reduced-motion, keyboard, focus, semantic and touch-target controls remain present.
- Structural validation passed before commit. Production is not current until both public URLs return successfully.
- Xenesis fail-closed enforcement and XEW-001 are inherited through a bounded synchronization record; unsupported capability claims remain blocked.

## Exact continuation

Enable Pages with **GitHub Actions** in repository settings, rerun workflow `29817324127`, verify the root and July 21 archive URL, then change deployment truth state to verified only if both respond with XDBS 2.3.0.
