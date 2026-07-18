# XDBS Publisher 2.0

Run `python scripts/publish.py --date YYYY-MM-DD --title "Title"` to copy a prepared dated edition into the manifest, then run `python scripts/validate_site.py`. Publishing to `main` triggers `.github/workflows/pages.yml`; validation must pass before deployment. The current interactive entry point remains `index.html`; dated editions are permanent snapshots.

Rollback: redeploy the prior known-good commit through GitHub Actions or revert the release commit. Do not delete dated editions. Restore `data/releases.json` and `data/editions.json` to the same release state.
