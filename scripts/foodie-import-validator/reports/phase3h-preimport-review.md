# Foodie — Phase 3H Pre-Import Review Package

**Date:** 2026-10-10 · **Purpose:** the refreshed human-approval package after the Phase 3H discovery round. **Nothing has been imported; nothing will be imported without explicit human approval.**

**Supersedes:** `phase3g-preimport-review.md` (8 rows) — this package carries **14 proposed records** (8 carried + 6 new).
**Inputs:** updated `input/research-worksheet-phase3d.csv` (sha256 `03b94f41…`, 45 rows) · `phase3h-discovery-evidence.md` (raw evidence, per-field source URLs) · fresh read-only baseline (re-fetched 2026-10-09T16:08:02Z — **14 rows, names identical** to every prior snapshot).
**Companion artifact:** `phase3h-proposed-import-manifest.json` (review artifact only — no executable SQL, no writes).
**Fresh validator run:** `research-2026-10-10-phase3h.dry-run.md` — **35 / 0 / 9 / 1 / 0 buckets · 16 candidate coordinates · 0 errors · 0 warnings** (byte-identical on re-run; idempotency re-proven).

---

## 1. What changed in this round

| | Phase 3G | Phase 3H (now) |
| --- | --- | --- |
| Worksheet rows | 31 | **45** (+14) |
| Proposed for approval | 8 | **14** (+6) |
| Possible-duplicate holds | 4 (+Mantralaya pair as needs-research) | 4 (unchanged; validator adds proximity advisories, see §5) |
| `needs_more_research` | 12 | 20 (+8 new) |
| do_not_import recommendations | 2 (rows 5, 10) | 3 (+ row 45 Lounge de La Réserve, out-of-zone) |
| Maps place URLs in project | 1 (row 9) | **2** (+ row 41 Durgashree — first rule-4-compliant Maps URL captured from a public short link; no place-page content readable) |
| Candidate coordinates (bucket 6) | 5 | **16** (10 new directory pins, all quarantined) |

**New round-6 promoted candidates (evidence quality: page-read listings; full per-field sources in `phase3h-discovery-evidence.md`):**

| Row | Candidate | Category | Locality | Phone | Hours | Ext. rating (source · date) | Coordinate status | Price |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 32 | Abhis Food Court | fast_food | Railway Station / Scout Camp Rd | +916361695837 (magicpin verified + district JSON-LD agree) | 17:00-22:00 (3 sources agree) | 4.9/1 (magicpin · 2026-10-10) | `candidate_coordinates` (district JSON-LD geo, identical pair in magicpin JSON-LD) | ₹ |
| 33 | Burger Time | fast_food | Doddaballapura town (Raj Kamal Theater) | +918553717034 (district + IG bio agree) | 10:45-20:45 (district + JD snippet agree) | 3.9/6 (district JSON-LD · 2026-10-10) | `candidate_coordinates` (district JSON-LD geo) | ₹ |
| 34 | Bbq Junction | restaurant | Doddaballapura town (Green Valley Layout) | +919945071428 (magicpin verified) | — (3-way conflict blanked) | 4.7/14 (magicpin · 2026-10-10) | `candidate_coordinates` (magicpin JSON-LD geo) | ₹ |
| 35 | Rajashree Veg And Non-Veg Family Restaurant | restaurant | Doddaballapura town (D Cross, Ward 3) | +919030376363 (district; second number on Snapchat noted) | — (2-way conflict blanked) | none (district 0.0 no-review default) | `candidate_coordinates` (district JSON-LD geo) | ₹ |
| 36 | Maha Naati Ruchi | restaurant | Doddaballapura town (Rojipura Court Rd) | +918095788474 (district; 2nd number corroborated by FB) | — (Tue-Sun spec, Monday absent → blank) | 4.2/546 (JD snippet · 2026-10-10) | `candidate_coordinates` (district JSON-LD geo) | ₹ |
| 37 | Palav Ramu Hotel | restaurant | Doddaballapura bus-stand area | — | 12:00-22:00 (RG) | 3.9/97 (Google aggregate as displayed by RG · 2026-10-10) | none (plus code recorded as string, never converted) | ₹ |

Every rating is an **external directory rating** with source URL + check date — strictly separate from Foodie community reviews (none exist anywhere).

**New holds (needs_more_research, excluded from the manifest):** Shawarma Cartel (address conflict + multi-branch claim) · Udupi Upahar (3-4 same-name listings + temp-closed banner) · Hasanamba Iyengar Bakery (no listing exists — IG reel only) · Durgashree Samruddhi Grand Veg (Grand/Garden family split; strongest listing of the round otherwise: verified magicpin 3.9/868 + Maps place URL) · Desi Family Dhaba And Restaurant (**in-zone** GITAM/Nagadenahalli, 2025 JD listing, snippet-only, rating conflict) · Zoop Cafe (queued name "Diamond" found nowhere) · Five Star Kohli Hut (exact-name verified listing; brand-family question). Out-of-zone: Lounge de La Réserve (Raghunathapura, Devanahalli Rd — do_not_import recommendation recorded; override possible).

**Discovery leads recorded, not researched (snippet-only, `phase3h-discovery-evidence.md` §18):** Zen Cafe (Nagadenahalli, JD listing created 2025-09-08 — strongest), Rajputana Restaurant, Ananya Vana (opens 2026), MR3519, Sri Matha Sagar, Sarangi Fine Dine, Darbar The Cafe, Nippat Masale Stall.

---

## 2. Carried 3G rows — unchanged

Rows 2 (The Shri Cafe and Restaurant), 4 (Epicurus), 8 (Lotus Gardenia), 12 (Best Choice Bakery), 14 (Rainbow Huts), 15 (Hotel Bindushree), 17 (Sri Vinayaka Food Point), 23 (Kiran Tiffin Room) carry over verbatim from `phase3g-preimport-review.md` §1-§2 with their full review cards. No new evidence was gathered for them this round (Maps place-page lookups remain unavailable in this environment; see `phase3f-maps-evidence-update.md`).

## 3. The 14 quarantined coordinates

All 16 coordinate-bearing rows stay `candidate_coordinates` (validator bucket 6). Promotion to `independently confirmed` requires non-listing evidence: an on-site visit with GPS capture at the exact premises, recorded with checker + date (WORKFLOW rule 10). New proximity advisories in the validator report are **cross-directory pin artifacts, not identity matches**: rows 15/32/44 (~30-85 m cluster on Scout Camp / K.G Govindapura — Bindushree's plus-code decode vs Abhis's and Kohli Hut's magicpin JSON-LD pins), rows 17/20 (~85 m, known), rows 6/24 (Mantralaya pair, known). All pairs have distinct names/phones; on-site GPS settles the pins, not more directories.

## 4. Baseline recheck

The validator ran against the freshly re-fetched baseline (single read-only GET, zero writes): **14 rows, names identical** — 0 existing-record matches, 0 errors, 0 warnings. None of the 45 candidates duplicates any of the 14 live records (the row-32 Abhis ↔ Abhiram adjacency was reviewed: different road, phone, ~4 km apart).

## 5. Tests re-run this round

- 6/6 fixtures (valid, duplicates, forbidden-fields, malformed, missing-fields, research-fields): buckets/flags/codes identical to documented expectations; only the baseline sha256/fetched-at lines moved (honest snapshot refresh).
- Zero-write proof: **PASS** (capture server sees `GET` only, no write verbs).
- Idempotency: two identical runs → byte-identical reports (sha256-verified).

## 6. Approval checklist for the human

- [ ] Approve / amend / strike each of the 14 rows in `phase3h-proposed-import-manifest.json` (8 carried + 6 new).
- [ ] Confirm row 8's mixed bar+rooms profile is in pilot scope (carried from 3G).
- [ ] Choose next actions for the holds (§3 here + §3 of 3G) and the 16 candidate pins.
- [ ] Optionally resolve the row-42 Desi Family Dhaba question (highest-value in-zone lead) via a second source or phone call.
- [ ] Only after approval: a separate, reviewed import SQL path is prepared (never by this tool) — all rows enter as `unverified`, missing values as NULL, community-rating fields untouched.

**Safety: no live Supabase writes or migrations; no app source changes; no commits/pushes/deployment; no secrets; no executable write SQL anywhere; nothing imported. STOP — explicit human approval required.**
