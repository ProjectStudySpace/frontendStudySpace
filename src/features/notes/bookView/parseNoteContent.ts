export type NoteBlock =
  | { kind: "text"; text: string }
  | { kind: "image"; url: string; number: number };

/** Matches `[img:N]` with optional inner whitespace, case-insensitive. */
const IMAGE_MARKER = /\[\s*img\s*:\s*(\d+)\s*\]/gi;
const LEADING_BLANK_LINES = /^(?:[ \t]*\r?\n)+/;

/**
 * Splits note content into text and image blocks.
 * `[img:N]` places the N-th image (1-based) at that position. Markers that
 * point to missing images are dropped, each image is used at most once, and
 * images that are never referenced are appended at the end in order.
 */
export function parseNoteContent(content: string, imageUrls: string[]): NoteBlock[] {
  const blocks: NoteBlock[] = [];
  const used = new Set<number>();

  // Drop blank lines and trailing whitespace around markers, but keep the
  // indentation of a content line that starts on its own line (code
  // snippets, nested lists). Spaces after an inline marker are not
  // indentation, so they are dropped.
  const pushText = (fragment: string, afterMarker: boolean) => {
    const withoutBlankLines = fragment.replace(LEADING_BLANK_LINES, "");
    const startsInline = afterMarker && withoutBlankLines === fragment;
    const text = (startsInline ? withoutBlankLines.trimStart() : withoutBlankLines).trimEnd();
    if (text) blocks.push({ kind: "text", text });
  };

  let cursor = 0;
  for (const match of content.matchAll(IMAGE_MARKER)) {
    pushText(content.slice(cursor, match.index), cursor > 0);
    cursor = match.index + match[0].length;

    const number = Number(match[1]);
    const url = imageUrls[number - 1];
    if (url && !used.has(number)) {
      used.add(number);
      blocks.push({ kind: "image", url, number });
    }
  }
  pushText(content.slice(cursor), cursor > 0);

  imageUrls.forEach((url, index) => {
    const number = index + 1;
    if (!used.has(number)) blocks.push({ kind: "image", url, number });
  });

  return blocks;
}

/**
 * Replaces the selection with an `[img:n]` marker placed on its own line.
 * Returns the new text and the caret position right after the marker.
 */
export function insertImageMarker(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  n: number,
): { text: string; caret: number } {
  const before = text.slice(0, selectionStart);
  const after = text.slice(selectionEnd);
  const lead = before === "" || before.endsWith("\n") ? "" : "\n";
  const trail = after === "" || after.startsWith("\n") ? "" : "\n";
  const inserted = `${lead}[img:${n}]`;

  return {
    text: `${before}${inserted}${trail}${after}`,
    caret: before.length + inserted.length,
  };
}

/**
 * Keeps markers in sync when image `n` is removed from the form: markers of
 * the removed image disappear (with their own line when they sit alone on
 * it) and markers of later images shift down by one.
 */
export function removeImageMarker(text: string, n: number): string {
  const REMOVED = "\u0000";
  const marked = text.replace(IMAGE_MARKER, (match, digits: string) => {
    const number = Number(digits);
    if (number === n) return REMOVED;
    return number > n ? `[img:${number - 1}]` : match;
  });

  return marked
    .replace(/\r?\n[ \t]*\u0000[ \t]*(?=\r?\n|$)/g, "")
    .replace(/^[ \t]*\u0000[ \t]*(?:\r?\n|$)/, "")
    .replace(/[ \t]*\u0000/g, "");
}
