// Micro-confession entry for the "Unsent" sprint (v2).
//
// The entry is a single unsent message: a short "To:" line saying
// who it was meant for, followed by the one line that was drafted
// and never sent. The program below emits those exact bytes to
// stdout and to entry.txt inside the harness output directory.

import * as fs from "node:fs";
import * as path from "node:path";

// The message itself, kept as a list of lines so the shape of the
// entry (one address line, one message line) is visible at a glance.
const ENTRY_LINES: readonly string[] = [
  "To: mum",
  "i miss dad too and i check your facebook every night to see if you're okay but i never comment because i don't want you crying at your desk again",
];

const TOTAL_GATE = { min: 1, max: 260 };
const MESSAGE_LINE_LIMIT = 200;

type Check = { ok: boolean; detail: string };

function checkLineCount(lines: readonly string[]): Check {
  return {
    ok: lines.length === 2,
    detail: `expected exactly 2 lines, got ${lines.length}`,
  };
}

function checkAddressLine(lines: readonly string[]): Check {
  const first = lines[0] ?? "";
  return {
    ok: first.startsWith("To: ") && first.length > "To: ".length,
    detail: `first line must name an addressee ("To: ..."), got ${JSON.stringify(first)}`,
  };
}

function checkMessageLine(lines: readonly string[]): Check {
  const message = lines[1] ?? "";
  return {
    ok: message.length > 0 && message.length <= MESSAGE_LINE_LIMIT,
    detail: `message line must be 1-${MESSAGE_LINE_LIMIT} chars, got ${message.length}`,
  };
}

function checkTotalLength(text: string): Check {
  return {
    ok: text.length >= TOTAL_GATE.min && text.length <= TOTAL_GATE.max,
    detail: `total length must be ${TOTAL_GATE.min}-${TOTAL_GATE.max} chars, got ${text.length}`,
  };
}

function checkNotBlank(text: string): Check {
  return {
    ok: text.trim().length > 0,
    detail: "entry must contain non-whitespace text",
  };
}

function checkNoStrayControlChars(text: string): Check {
  const bad = /[\r\t]/.test(text) || text.endsWith("\n");
  return {
    ok: !bad,
    detail: "entry must not contain CR/tabs or end with a newline",
  };
}

function validateEntry(lines: readonly string[], text: string): void {
  const checks: Check[] = [
    checkLineCount(lines),
    checkAddressLine(lines),
    checkMessageLine(lines),
    checkTotalLength(text),
    checkNotBlank(text),
    checkNoStrayControlChars(text),
  ];
  const failed = checks.filter((c) => !c.ok);
  if (failed.length > 0) {
    throw new Error(
      "entry failed validation: " + failed.map((c) => c.detail).join("; "),
    );
  }
}

function outputDirectory(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR;
  if (dir !== undefined && dir.length > 0) {
    return dir;
  }
  return "/output";
}

function emit(entry: string): void {
  const dir = outputDirectory();
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, "entry.txt");
  fs.writeFileSync(target, entry, "utf8");
  const roundTrip = fs.readFileSync(target, "utf8");
  if (roundTrip !== entry) {
    throw new Error("entry.txt round-trip mismatch");
  }
}

function main(): void {
  const entry = ENTRY_LINES.join("\n");
  validateEntry(ENTRY_LINES, entry);
  emit(entry);
  process.stdout.write(entry + "\n");
}

main();
