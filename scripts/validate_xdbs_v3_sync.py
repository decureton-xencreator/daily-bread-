from __future__ import annotations

import argparse
import json
from pathlib import Path


def require(condition: bool, message: str, issues: list[str]) -> None:
    if not condition:
        issues.append(message)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    issues: list[str] = []

    paths = {
        "index": root / "index.html",
        "edition": root / "editions/2026/07/daily-bread-2026-07-21.html",
        "release": root / "releases/XDBS-2.3.0.json",
        "sync": root / "releases/XDBS-3.0.0-sync.json",
        "warden": root / "reports/warden-report.md",
    }
    for name, path in paths.items():
        require(path.is_file(), f"missing:{name}:{path.relative_to(root)}", issues)
    if issues:
        print(json.dumps({"result": "FAIL", "issues": issues}, indent=2))
        return 1

    index = paths["index"].read_text(encoding="utf-8")
    edition = paths["edition"].read_text(encoding="utf-8")
    release = json.loads(paths["release"].read_text(encoding="utf-8"))
    sync = json.loads(paths["sync"].read_text(encoding="utf-8"))
    warden = paths["warden"].read_text(encoding="utf-8")

    for marker in ("ACADEMY COMMAND", "XEN GLOBE", "MISSION CONTROL", "ARCHIVE & MEMORY"):
        require(marker in index, f"index-marker:{marker}", issues)
    for marker in ("PROVENANCE", "Warden active", "Locally functional", "Demonstration"):
        require(marker in edition, f"edition-truth-marker:{marker}", issues)
    require('name="viewport"' in index and 'name="viewport"' in edition, "responsive-viewport", issues)
    require("data-action" in index and "type=\"button\"" in edition, "functional-controls", issues)
    require(release.get("deployment", {}).get("verified") is False, "deployment-must-remain-unverified", issues)
    require(release.get("releaseGates", {}).get("passed") < release.get("releaseGates", {}).get("total"), "release-gate-overstatement", issues)
    require(sync.get("canonicalArchitectureVersion") == "3.0", "canonical-version", issues)
    require(sync.get("implementationRelease") == "2.3.0", "implementation-version", issues)
    require(sync.get("truthState") == "REPOSITORY_COMPLETE_EXTERNAL_PENDING", "sync-truth-state", issues)
    require(len(sync.get("inputCommits", {})) == 2, "input-commit-lineage", issues)
    normalized_warden = warden.replace("**", "")
    deployment_blocked = "Deployment: BLOCKED" in normalized_warden
    deployment_verified = (
        "Deployment: VERIFIED" in normalized_warden
        and "workflow run" in normalized_warden
        and "HTTP 200" in normalized_warden
    )
    require(deployment_blocked or deployment_verified, "warden-deployment-boundary", issues)

    report = {"schemaVersion": "3.0-sync", "result": "PASS" if not issues else "FAIL", "checks": 16, "issues": issues}
    print(json.dumps(report, indent=2))
    return 0 if not issues else 1


if __name__ == "__main__":
    raise SystemExit(main())
