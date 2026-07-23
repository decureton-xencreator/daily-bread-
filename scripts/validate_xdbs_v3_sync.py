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

    current = json.loads((root / "data/current-edition.json").read_text(encoding="utf-8"))
    paths = {
        "index": root / "index.html",
        "edition": root / current["archivePath"],
        "release": root / f"releases/XDBS-{current['editionVersion']}.json",
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

    for marker in ("ACADEMY COMMAND", "XEN GLOBE", "MISSION CONTROL", "ARCHIVE & MEMORY", "XPS 3.2"):
        require(marker in index, f"index-marker:{marker}", issues)
    for marker in ("PROVENANCE", "Warden active", "Locally functional", "Demonstration", "XPS 3.2"):
        require(marker in edition, f"edition-truth-marker:{marker}", issues)
    require('name="viewport"' in index and 'name="viewport"' in edition, "responsive-viewport", issues)
    require("data-action" in index and "type=\"button\"" in edition, "functional-controls", issues)
    deployment = release.get("deployment", {})
    gates = release.get("releaseGates", {})
    pending_valid = deployment.get("verified") is False and gates.get("passed") == gates.get("total") - 1
    verified_valid = (
        deployment.get("verified") is True
        and gates.get("passed") == gates.get("total")
        and deployment.get("workflowRun")
        and deployment.get("verifiedAt")
    )
    require(pending_valid or verified_valid, "release-gate-overstatement", issues)
    require(sync.get("canonicalArchitectureVersion") == "3.0", "canonical-version", issues)
    require(current.get("editionVersion") == release.get("version"), "implementation-version", issues)
    require(sync.get("truthState") == "REPOSITORY_COMPLETE_EXTERNAL_PENDING", "sync-truth-state", issues)
    require(len(sync.get("inputCommits", {})) == 2, "input-commit-lineage", issues)
    normalized_warden = warden.replace("**", "")
    deployment_blocked = "Deployment: VERIFYING" in normalized_warden or "Deployment: BLOCKED" in normalized_warden
    deployment_verified = (
        "Deployment: VERIFIED" in normalized_warden
        and "workflow run" in normalized_warden
        and "HTTP 200" in normalized_warden
    )
    require(deployment_blocked or deployment_verified, "warden-deployment-boundary", issues)

    report = {"schemaVersion": "3.0-sync", "result": "PASS" if not issues else "FAIL", "checks": 18, "issues": issues}
    print(json.dumps(report, indent=2))
    return 0 if not issues else 1


if __name__ == "__main__":
    raise SystemExit(main())
