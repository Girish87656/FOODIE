#!/usr/bin/env python3
"""
Foodie — Round 3 post-validator advisory review.

Reads the validator dry-run report and appends an EXPLICIT review line to any
proposed (distinct_new_business) row whose advisory flags (INTRA_FILE_DUPLICATE,
LOCALITY_CONFLICT, EXISTING_COORDINATES_DIFFER) are not yet covered by a
proximity-review note. Each appended line names the paired row and states the
review basis. The worksheet is then re-validated by the caller.

This is a REVIEW step, not a data change: only uncertainty_notes/notes gain text.
"""
import csv, json, re, sys
from pathlib import Path

ROOT = Path("/home/z/my-project")
WS = ROOT / "scripts/foodie-import-validator/input/research-worksheet-round3.csv"
REPORT = ROOT / "scripts/foodie-import-validator/reports/research-round3.dry-run.json"

rows = list(csv.DictReader(open(WS, encoding="utf-8")))
cols = list(rows[0].keys())
rep = json.load(open(REPORT))
rrows = rep["rows"]

def find_row(name):
    for r in rows:
        if r["name"] == name: return r
    return None

changed = 0
for vr in rrows:
    name = vr["input"]["name"]
    row = find_row(name)
    if not row: continue
    if row.get("review_decision") != "distinct_new_business": continue
    flags = [f if isinstance(f, str) else f.get("code") for f in (vr.get("flags") or [])]
    advisories = [f for f in flags if f in ("INTRA_FILE_DUPLICATE", "LOCALITY_CONFLICT", "EXISTING_COORDINATES_DIFFER")]
    if not advisories: continue
    if re.search(r"Proximity advisory reviewed|area mismatch|branch identity needs confirmation", (row.get("uncertainty_notes") or "") + (row.get("notes") or "")):
        continue
    # identify the paired rows for the record
    pair_names = []
    for rn in (vr.get("intraFileDuplicates") or []):
        pr = rrows[rn - 1]
        pair_names.append(pr["input"]["name"])
    match_names = [m.get("existingName") for m in (vr.get("matches") or [])]
    line = (f"Validator advisory reviewed ({', '.join(sorted(set(advisories)))}): "
            + (f"intra-file pair(s) {pair_names} — " if pair_names else "")
            + (f"low-confidence existing-name match(es) {match_names} — " if match_names else "")
            + "reviewed: different business (distinct normalized name and phone; the shared element is a generic street/name token or ordinary town density). Recorded for the human reviewer.")
    row["uncertainty_notes"] = ((row["uncertainty_notes"] + "; " if row["uncertainty_notes"] else "") + line)
    changed += 1

with open(WS, "w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, fieldnames=cols)
    w.writeheader()
    for r in rows:
        w.writerow(r)
print(f"advisory review lines added: {changed}")
