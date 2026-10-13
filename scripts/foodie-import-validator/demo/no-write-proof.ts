/**
 * Foodie — import validator: ZERO-WRITE PROOF (demo harness).
 *
 * Requirement: "Demonstrate that dry-run mode performs zero database writes."
 *
 * Method: spin up a LOCAL capture server that records the HTTP method of every
 * request, point the validator's ONLY network function (fetchRestaurantsGet,
 * the same function the live baseline fetch uses) at it, run the complete
 * validate → match → classify pipeline, then assert:
 *
 *   PASS ⇔ every captured request is a GET and zero write verbs were sent.
 *
 * Run:  bun scripts/foodie-import-validator/demo/no-write-proof.ts
 * Exit: 0 = PASS · 1 = FAIL
 */

import { createServer, type Server } from "node:http";
import { fetchRestaurantsGet } from "../lib/baseline";
import { validateRow, isNameOnly } from "../lib/rules";
import { matchAgainstBaseline, findIntraFileDuplicates } from "../lib/match";
import type { CandidateInput, ValidatedRow } from "../lib/types";

function candidate(partial: Partial<CandidateInput>, rowNumber: number): CandidateInput {
  return {
    rowNumber,
    name: partial.name ?? "",
    category: partial.category ?? null,
    address: partial.address ?? null,
    locality: partial.locality ?? null,
    city: partial.city ?? null,
    phone: partial.phone ?? null,
    latitudeRaw: partial.latitudeRaw ?? null,
    longitudeRaw: partial.longitudeRaw ?? null,
    sourceUrl: partial.sourceUrl ?? null,
    evidenceLevel: partial.evidenceLevel ?? null,
    listingRating: partial.listingRating ?? null,
    openingHours: partial.openingHours ?? null,
    priceLevel: partial.priceLevel ?? null,
    coordinatesVerified: partial.coordinatesVerified ?? null,
    verificationStatus: partial.verificationStatus ?? null,
    notes: partial.notes ?? null,
    mapsListingUrl: partial.mapsListingUrl ?? null,
    cuisine: partial.cuisine ?? null,
    menuNotes: partial.menuNotes ?? null,
    listingReviewCount: partial.listingReviewCount ?? null,
    ratingSourceUrl: partial.ratingSourceUrl ?? null,
    ratingCheckedOn: partial.ratingCheckedOn ?? null,
    addressSourceUrl: partial.addressSourceUrl ?? null,
    phoneSourceUrl: partial.phoneSourceUrl ?? null,
    hoursSourceUrl: partial.hoursSourceUrl ?? null,
    coordinatesSourceUrl: partial.coordinatesSourceUrl ?? null,
    menuSourceUrl: partial.menuSourceUrl ?? null,
    uncertaintyNotes: partial.uncertaintyNotes ?? null,
    reviewDecision: partial.reviewDecision ?? null,
    existingMatchId: partial.existingMatchId ?? null,
    forbiddenColumns: [],
    unknownColumns: [],
  };
}

async function main(): Promise<number> {
  const capturedMethods: string[] = [];
  const capturedPaths: string[] = [];

  // Minimal PostgREST-shaped capture server on an ephemeral local port.
  // (node:http keeps this file type-clean under the root tsconfig too.)
  const server: Server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    capturedMethods.push(req.method ?? "?");
    capturedPaths.push(url.pathname + url.search);
    if ((req.method ?? "") !== "GET") {
      res.writeHead(405, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "write methods are never sent by this tool" }));
      return;
    }
    if (url.pathname === "/rest/v1/restaurants") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify([
          {
            id: "00000000-0000-4000-8000-000000000001",
            name: "Amigos Cafe",
            locality: "Nagadenahalli",
            city: "Doddaballapura",
            phone: null,
            latitude: 13.2845564,
            longitude: 77.5966293,
          },
        ])
      );
      return;
    }
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
  });
  await new Promise<void>((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const addr = server.address();
  const port = typeof addr === "object" && addr !== null ? addr.port : 0;

  try {
    // 1) The tool's only network function, pointed at the capture server.
    const baseline = await fetchRestaurantsGet(`http://127.0.0.1:${port}`, "local-proof-key");

    // 2) Full validation pipeline against that baseline (same code path as the CLI).
    const candidates: CandidateInput[] = [
      candidate({ name: "Amigos", address: "Nagadenahalli" }, 1), // existing subset match
      candidate({ name: "Brand New Cafe", latitudeRaw: "13.2841", longitudeRaw: "77.6009", sourceUrl: "https://x.example.com/a" }, 2), // potential_new
      candidate({ name: "Bad Phone", phone: "1" }, 3), // invalid
    ];
    const duplicatesMap = findIntraFileDuplicates(
      candidates.map((c) => ({ rowNumber: c.rowNumber, normalized: validateRow(c).normalized }))
    );
    const validated: ValidatedRow[] = candidates.map((c) => {
      const { issues, normalized } = validateRow(c);
      const outcome = matchAgainstBaseline(normalized, baseline);
      const intra = duplicatesMap.get(c.rowNumber) ?? [];
      const nameOnly = isNameOnly(normalized);
      const hasErrors = issues.some((i) => i.severity === "error");
      return {
        rowNumber: c.rowNumber,
        input: c,
        normalized,
        issues,
        category: hasErrors ? "invalid_data" : outcome.hasStrong ? "existing_match" : intra.length > 0 || outcome.hasAmbiguous ? "possible_duplicate" : nameOnly ? "insufficient_evidence" : "potential_new",
        confidence: "low",
        matches: outcome.matches,
        intraFileDuplicates: intra,
        flags: outcome.flags,
        coordinatesAwaitingConfirmation:
          normalized.latitude !== null &&
          normalized.longitude !== null &&
          (normalized.evidenceLevel !== "independently_confirmed" || normalized.sourceUrl === null),
        recommendedVerificationStatus: "unverified",
      };
    });

    // 3) Assert: only GETs ever left the tool.
    const writeMethods = capturedMethods.filter((m) => m !== "GET");
    const pass = writeMethods.length === 0 && capturedMethods.length > 0 && validated.length === 3;

    console.log("ZERO-WRITE PROOF");
    console.log("================");
    console.log("Requests captured by the local server:");
    capturedMethods.forEach((m, i) => console.log(`  ${i + 1}. ${m.padEnd(6)} ${capturedPaths[i]}`));
    console.log("");
    console.log(`Pipeline results: ${validated.map((r) => `${r.rowNumber}:${r.category}`).join(" · ")}`);
    console.log("");
    console.log(`Write verbs captured (POST/PATCH/PUT/DELETE): ${writeMethods.length === 0 ? "NONE" : writeMethods.join(", ")}`);
    console.log(pass ? "PASS — dry-run mode performs zero database writes." : "FAIL — a write attempt was captured!");
    return pass ? 0 : 1;
  } finally {
    await new Promise<void>((closed) => server.close(() => closed()));
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    console.error("FATAL:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
