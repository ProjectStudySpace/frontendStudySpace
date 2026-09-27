import { describe, expect, it } from "vitest";
import {
  insertImageMarker,
  parseNoteContent,
  removeImageMarker,
} from "./parseNoteContent";

const URLS = ["a.png", "b.png", "c.png"];

describe("parseNoteContent", () => {
  it("returns a single text block when there are no images or markers", () => {
    expect(parseNoteContent("Hello\nworld", [])).toEqual([
      { kind: "text", text: "Hello\nworld" },
    ]);
  });

  it("returns no blocks for empty content and no images", () => {
    expect(parseNoteContent("", [])).toEqual([]);
    expect(parseNoteContent("   \n  ", [])).toEqual([]);
  });

  it("replaces a marker with an image block at its position", () => {
    expect(parseNoteContent("Intro\n[img:1]\nOutro", ["a.png"])).toEqual([
      { kind: "text", text: "Intro" },
      { kind: "image", url: "a.png", number: 1 },
      { kind: "text", text: "Outro" },
    ]);
  });

  it("accepts optional whitespace and any letter case in markers", () => {
    expect(parseNoteContent("x [ IMG : 2 ] y", URLS).slice(0, 3)).toEqual([
      { kind: "text", text: "x" },
      { kind: "image", url: "b.png", number: 2 },
      { kind: "text", text: "y" },
    ]);
  });

  it("preserves internal newlines inside text fragments", () => {
    const blocks = parseNoteContent("Line 1\n\nLine 2\n[img:1]", ["a.png"]);
    expect(blocks[0]).toEqual({ kind: "text", text: "Line 1\n\nLine 2" });
  });

  it("drops markers that point to missing images", () => {
    expect(parseNoteContent("A [img:5] B [img:0] C", ["a.png"])).toEqual([
      { kind: "text", text: "A" },
      { kind: "text", text: "B" },
      { kind: "text", text: "C" },
      { kind: "image", url: "a.png", number: 1 },
    ]);
  });

  it("uses each image at most once", () => {
    expect(parseNoteContent("[img:1] mid [img:1]", ["a.png"])).toEqual([
      { kind: "image", url: "a.png", number: 1 },
      { kind: "text", text: "mid" },
    ]);
  });

  it("appends unreferenced images at the end in order", () => {
    expect(parseNoteContent("Text [img:2]", URLS)).toEqual([
      { kind: "text", text: "Text" },
      { kind: "image", url: "b.png", number: 2 },
      { kind: "image", url: "a.png", number: 1 },
      { kind: "image", url: "c.png", number: 3 },
    ]);
  });

  it("renders only images when content is empty", () => {
    expect(parseNoteContent("", ["a.png"])).toEqual([
      { kind: "image", url: "a.png", number: 1 },
    ]);
  });
});

describe("insertImageMarker", () => {
  it("inserts the marker into empty text without extra newlines", () => {
    expect(insertImageMarker("", 0, 0, 1)).toEqual({ text: "[img:1]", caret: 7 });
  });

  it("puts the marker on its own line in the middle of a line", () => {
    expect(insertImageMarker("abcdef", 3, 3, 2)).toEqual({
      text: "abc\n[img:2]\ndef",
      caret: 11,
    });
  });

  it("does not add newlines already present around the cursor", () => {
    expect(insertImageMarker("abc\n\ndef", 4, 4, 1)).toEqual({
      text: "abc\n[img:1]\ndef",
      caret: 11,
    });
  });

  it("appends at the end of text on a new line", () => {
    expect(insertImageMarker("abc", 3, 3, 3)).toEqual({
      text: "abc\n[img:3]",
      caret: 11,
    });
  });

  it("replaces the selected range", () => {
    expect(insertImageMarker("a\nXYZ\nb", 2, 5, 1)).toEqual({
      text: "a\n[img:1]\nb",
      caret: 9,
    });
  });
});

describe("parseNoteContent whitespace", () => {
  it("keeps leading indentation of the first line", () => {
    expect(parseNoteContent("    indented code\nnext", [])).toEqual([
      { kind: "text", text: "    indented code\nnext" },
    ]);
  });

  it("keeps indentation on the line after a marker while dropping the line break", () => {
    expect(parseNoteContent("intro\n[img:1]\n  SELECT *\n  FROM t", URLS.slice(0, 1))).toEqual([
      { kind: "text", text: "intro" },
      { kind: "image", url: "a.png", number: 1 },
      { kind: "text", text: "  SELECT *\n  FROM t" },
    ]);
  });

  it("drops blank lines and trailing whitespace around markers", () => {
    expect(parseNoteContent("a  \n\n[img:1]\n\n\n  b\n\n", URLS.slice(0, 1))).toEqual([
      { kind: "text", text: "a" },
      { kind: "image", url: "a.png", number: 1 },
      { kind: "text", text: "  b" },
    ]);
  });
});

describe("removeImageMarker", () => {
  it("removes markers of the deleted image together with their line", () => {
    expect(removeImageMarker("a\n[img:2]\nb", 2)).toBe("a\nb");
  });

  it("renumbers markers after the deleted image", () => {
    expect(removeImageMarker("[img:1]\n[img:2]\n[img:3] x [IMG: 4]", 2)).toBe(
      "[img:1]\n[img:2] x [img:3]",
    );
  });

  it("leaves markers before the deleted image untouched", () => {
    expect(removeImageMarker("x [img:1] y", 3)).toBe("x [img:1] y");
  });

  it("removes an inline marker without joining surrounding words", () => {
    expect(removeImageMarker("see [img:1] here", 1)).toBe("see here");
  });
});
