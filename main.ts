// Unsent: The Micro-Confession Sprint — a make.fun bounty entry.
//
// One micro-confession in two parts: a "To:" line naming who the
// message was meant for, and the single line that was typed into the
// draft box and never sent. The program prints the entry to stdout
// and writes the exact same bytes, with no trailing newline, to
// entry.txt inside the harness output directory.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "To: my ex-roommate\n" +
  "i kept your spare key for two years after you moved out because giving it back meant admitting you weren't coming back";

// The sealed gate allows 1 to 260 characters in the whole file, and
// the judge brief caps the unsent message itself at one line of at
// most 200 characters, so both limits are checked here before writing.
const MAX_TOTAL_CHARS = 260;
const MAX_MESSAGE_CHARS = 200;

const lines = ENTRY.split("\n");
if (lines.length !== 2) {
  throw new Error("entry must be exactly two lines: a To: line and the message");
}
if (!lines[0].startsWith("To: ")) {
  throw new Error("entry must start with a To: line");
}
if (lines[1].length > MAX_MESSAGE_CHARS) {
  throw new Error(`message line is ${lines[1].length} chars, over the 200-char cap`);
}
if (ENTRY.length < 1 || ENTRY.length > MAX_TOTAL_CHARS) {
  throw new Error(`entry is ${ENTRY.length} chars, outside the 1-260 gate`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only whitespace");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");

console.log(ENTRY);
