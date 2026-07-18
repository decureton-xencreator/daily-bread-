# Xen Daily Bread — XDBS 2.0

XDBS 2.0 is the repository-backed Xen personal executive operating environment. The public application is a backend-free progressive web app with a permanent edition archive, structured data, local personalization, Academy resume actions, Mission Control, Globe, command palette, provenance and Warden diagnostics.

## Run and validate

Serve the repository root through any static HTTP server, then open `index.html`. Run `python scripts/validate_site.py` before release. Publishing `main` triggers the GitHub Pages workflow only after validation passes.

## Truth boundary

Core navigation and local state are functional. Launch Academy and entertainment content is demonstration data. News, weather, calendar, markets and sports are integration-ready but not connected; the product does not fabricate live data. Canonical architecture is referenced by public identifier and is not duplicated here.

## Publisher flow

`XDBS render → validate → archive → update manifest → publish current edition → deploy → preserve`

GitHub Pages uses GitHub Actions as its deployment source. A successful workflow and responding production URL are required before deployment is considered verified.
