# Warden Report — XDBS 2.2.0

**Evaluated:** 2026-07-20 04:58 EDT

**Release gates:** 8 / 9 passed

**Deployment:** BLOCKED — GitHub Pages site is not enabled.

## Capability truth states

- Application shell, current alias, dated archive, manifests, release record and publisher: **Repository-backed**.
- Command palette, focus timer, world clocks, archive search, local preferences, notes, completion state and XMI save/dismiss: **Locally functional**.
- Weather, markets, world intelligence and sports result: **Live retrieval**, source-linked and timestamped for this edition.
- Academy scores, XP, streak and course activity: **Demonstration data / local synchronization model**.
- Entertainment and XMI recommendations: **Demonstration data**.
- Calendar, private travel routes, health biometrics, personalized sports feed and AI-agent execution: **Not connected / unavailable**.
- GitHub Pages workflow: **Repository-backed**, but site creation is **blocked by unavailable repository-administration permission**.

## Findings

- No invented live data, secrets, private itinerary, personal Academy scores, calendar entries or biometrics were placed in public source.
- External links use explicit sources; the permanent edition uses safe new-tab link attributes.
- Responsive, reduced-motion, keyboard, focus, semantic and touch-target controls remain present.
- Structural validation is required before commit. Production is not live until both public URLs return successfully.

## Exact continuation

Enable GitHub Pages with **GitHub Actions** in repository settings, rerun `Publish XDBS Daily Bread`, verify the root and July 20 archive URL, then change deployment truth state from blocked to verified.
