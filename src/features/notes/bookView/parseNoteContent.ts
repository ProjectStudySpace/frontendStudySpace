export type NoteBlock =
  | { kind: "text"; text: string }
  | { kind: "image"; url: string; number: number };

/** Matches `[img:N]` with optional inner whitespace, case-insensitive. */
const IMAGE_MARKER = /\[\s*img\s*:\s*(\d+)\s*\]/gi;

/**
 * Splits note content into text and image blocks.
 * `[img:N]` places the N-th image (1-based) at that position. Markers that
 * point to missing images are dropped, each image is used at most once, and
 * images that are never referenced are appended at the end in order.
 */
export function parseNoteContent(content: string, imageUrls: string[]): NoteBlock[] {
  const blocks: NoteBlock[] = [];
  const used = new Set<number>();

  const pushText = (fragment: string) => {
    const text = fragment.trim();
    if (text) blocks.push({ kind: "text", text });
  };

  let cursor = 0;
  for (const match of content.matchAll(IMAGE_MARKER)) {
    pushText(content.slice(cursor, match.index));
    cursor = match.index + match[0].length;

    const number = Number(match[1]);
    const url = imageUrls[number - 1];
    if (url && !used.has(number)) {
      used.add(number);
      blocks.push({ kind: "image", url, number });
    }
  }
  pushText(content.slice(cursor));

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
