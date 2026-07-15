from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    ROOT / "index.html",
    ROOT / "archive" / "index.html",
    ROOT / "data" / "editions.json",
]


def fail(message: str) -> None:
    raise SystemExit(f"XDBS validation failed: {message}")


for path in REQUIRED:
    if not path.is_file():
        fail(f"missing required file: {path.relative_to(ROOT)}")

index = (ROOT / "index.html").read_text(encoding="utf-8").lower()
if "viewport" not in index:
    fail("index.html is not mobile-first: viewport meta tag missing")
if "daily bread" not in index:
    fail("index.html does not identify the Daily Bread publication")

manifest_path = ROOT / "data" / "editions.json"
try:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
except json.JSONDecodeError as exc:
    fail(f"invalid JSON in data/editions.json: {exc}")

if not isinstance(manifest, dict) or not isinstance(manifest.get("editions"), list):
    fail("data/editions.json must contain an editions array")
if not manifest["editions"]:
    fail("edition manifest is empty")

for edition in manifest["editions"]:
    for field in ("date", "title", "path", "status"):
        if not edition.get(field):
            fail(f"edition missing required field: {field}")
    edition_file = ROOT / edition["path"]
    if not edition_file.is_file():
        fail(f"manifest references missing edition: {edition['path']}")
    html = edition_file.read_text(encoding="utf-8").lower()
    if "viewport" not in html:
        fail(f"edition is not mobile-first: {edition['path']}")

print(f"XDBS validation passed: {len(manifest['editions'])} edition(s)")
