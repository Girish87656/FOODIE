/**
 * Foodie — import validator: minimal RFC-4180-style CSV parsing.
 *
 * Zero dependencies: supports quoted fields, escaped quotes (""), commas and
 * newlines inside quotes, and CRLF/LF line endings. Good enough for the small,
 * human-authored import files this tool is meant to validate.
 */

export interface ParsedCsv {
  headers: string[];
  /** One entry per data row; each entry has the same length as `headers`. */
  rows: string[][];
  /** Fatal file-level problems (duplicate headers, ragged rows). */
  fileErrors: string[];
}

export function parseCsv(text: string): ParsedCsv {
  const fileErrors: string[] = [];
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;
  let started = false;

  const pushField = () => {
    record.push(field);
    field = "";
    started = false;
  };
  const pushRecord = () => {
    pushField();
    records.push(record);
    record = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"' && field === "" && !started) {
      inQuotes = true;
      started = true;
      continue;
    }
    if (ch === ",") {
      pushField();
      continue;
    }
    if (ch === "\n") {
      pushRecord();
      continue;
    }
    if (ch === "\r") {
      if (text[i + 1] === "\n") i++;
      pushRecord();
      continue;
    }
    field += ch;
    started = true;
  }
  // Flush the final record (no trailing newline in the file).
  if (field !== "" || record.length > 0 || started) pushRecord();

  // Drop completely-empty trailing records.
  const nonEmpty = records.filter((r) => r.some((cell) => cell.trim() !== ""));
  if (nonEmpty.length === 0) {
    return { headers: [], rows: [], fileErrors: ["CSV file is empty"] };
  }

  const headers = nonEmpty[0].map((h) => h.trim());
  const seen = new Map<string, number>();
  for (const h of headers) {
    const n = seen.get(h.toLowerCase()) ?? 0;
    if (n === 1) fileErrors.push(`Duplicate CSV header: "${h}"`);
    seen.set(h.toLowerCase(), n + 1);
  }

  const rows: string[][] = [];
  for (const r of nonEmpty.slice(1)) {
    if (r.length === headers.length) {
      rows.push(r);
      continue;
    }
    if (r.length === 1 && r[0].trim() === "") continue; // stray blank line
    fileErrors.push(
      `Ragged row: expected ${headers.length} fields, found ${r.length} (row starts with "${(r[0] ?? "").slice(0, 40)}")`
    );
  }
  return { headers, rows, fileErrors };
}

/** Canonical snake_case form used to map CSV headers onto known fields. */
export function headerToField(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}
