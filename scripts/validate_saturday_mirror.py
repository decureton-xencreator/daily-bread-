#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
receipt = json.loads((ROOT / "governance/SATURDAY-MIRROR-REVIEW-RECEIPT.json").read_text(encoding="utf-8"))
runtime = json.loads((ROOT / "data/saturday-mirror-review.json").read_text(encoding="utf-8"))

checks = {
    "receipt_id": receipt.get("canonical_id") == "XMR-001",
    "canonical_repository": receipt.get("canonical_repository") == "decureton-xencreator/xen-operating-system",
    "canonical_path": receipt.get("canonical_path") == "Governance/Mirror/XMR-001-SATURDAY-MIRROR-REVIEW.md",
    "reciprocal": receipt.get("connection", {}).get("reciprocal_link_recorded") is True,
    "truth_state": receipt.get("connection", {}).get("truth_state") == "REPOSITORY_CONNECTED",
    "saturday": receipt.get("schedule", {}).get("day") == "SATURDAY" and runtime.get("trigger", {}).get("day_of_week") == 6,
    "timezone": receipt.get("schedule", {}).get("timezone") == runtime.get("trigger", {}).get("timezone") == "America/New_York",
    "missed_run": runtime.get("trigger", {}).get("missed_run") == "offer_on_next_open",
    "manual_commands": len(runtime.get("trigger", {}).get("manual_commands", [])) >= 3,
    "required_sections": len(runtime.get("sections", [])) == 10,
    "resume": receipt.get("state", {}).get("resume_required") is True and bool(runtime.get("persistence", {}).get("resume_key")),
    "private_state": receipt.get("state", {}).get("public_personal_state") is False,
    "storage": runtime.get("persistence", {}).get("storage_class") == "PRIVATE_LOCAL_OR_AUTHORIZED_BACKEND",
    "fail_closed": all(runtime.get("fail_closed", {}).get(k) is False for k in ("invent_missing_data", "claim_completion_without_all_sections", "expose_private_answers_publicly")),
}
failed = [name for name, passed in checks.items() if not passed]
print(json.dumps({"checks": checks, "passed": len(checks) - len(failed), "total": len(checks), "failed": failed}, indent=2))
raise SystemExit(1 if failed else 0)
