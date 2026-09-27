import { describe, expect, it } from "vitest";
import { computePaging, pageRange, spreadIndexAt } from "./paging";

describe("computePaging", () => {
  it("treats an unmeasured viewport as a single spread", () => {
    expect(computePaging({ scrollWidth: 0, clientWidth: 0, columns: 2, gap: 64 })).toEqual({
      totalPages: 1,
      totalSpreads: 1,
      step: 0,
    });
  });

  it("counts one spread when content fits in the viewport", () => {
    // Two 468px columns + 64px gap = 1000px.
    expect(computePaging({ scrollWidth: 1000, clientWidth: 1000, columns: 2, gap: 64 })).toEqual({
      totalPages: 2,
      totalSpreads: 1,
      step: 1064,
    });
  });

  it("counts overflowing columns as extra pages and spreads", () => {
    // Five columns at a 532px pitch, minus the trailing gap.
    const scrollWidth = 5 * 532 - 64;
    expect(computePaging({ scrollWidth, clientWidth: 1000, columns: 2, gap: 64 })).toEqual({
      totalPages: 5,
      totalSpreads: 3,
      step: 1064,
    });
  });

  it("maps one page per spread in single-column mode", () => {
    // Three 336px columns at a 400px pitch, minus the trailing gap.
    const result = computePaging({ scrollWidth: 3 * 400 - 64, clientWidth: 336, columns: 1, gap: 64 });
    expect(result).toEqual({ totalPages: 3, totalSpreads: 3, step: 400 });
  });
});

describe("spreadIndexAt", () => {
  it("rounds the scroll offset to the nearest spread and clamps it", () => {
    expect(spreadIndexAt(0, 1064, 3)).toBe(0);
    expect(spreadIndexAt(1000, 1064, 3)).toBe(1);
    expect(spreadIndexAt(99999, 1064, 3)).toBe(2);
    expect(spreadIndexAt(-20, 1064, 3)).toBe(0);
    expect(spreadIndexAt(500, 0, 1)).toBe(0);
  });
});

describe("pageRange", () => {
  it("returns the pages visible on a spread", () => {
    expect(pageRange(0, 2, 5)).toEqual({ first: 1, last: 2 });
    expect(pageRange(2, 2, 5)).toEqual({ first: 5, last: 5 });
    expect(pageRange(1, 1, 3)).toEqual({ first: 2, last: 2 });
  });
});
