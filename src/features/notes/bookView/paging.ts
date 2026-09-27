export interface PagingInput {
  /** Scroll width of the multi-column content (all column boxes). */
  scrollWidth: number;
  /** Visible width of the multi-column content. */
  clientWidth: number;
  /** Columns shown per spread (1 on mobile, 2 on wider screens). */
  columns: number;
  /** Column gap in px. */
  gap: number;
}

export interface Paging {
  totalPages: number;
  totalSpreads: number;
  /** Horizontal distance between spreads: one viewport plus one gap. */
  step: number;
}

/**
 * Derives page and spread counts from a CSS multi-column layout. Overflow
 * columns repeat at a pitch of `columnWidth + gap`, so one spread advances by
 * `clientWidth + gap`.
 */
export function computePaging({ scrollWidth, clientWidth, columns, gap }: PagingInput): Paging {
  if (clientWidth <= 0 || columns <= 0) {
    return { totalPages: 1, totalSpreads: 1, step: 0 };
  }
  const columnWidth = (clientWidth - gap * (columns - 1)) / columns;
  const pitch = columnWidth + gap;
  const totalPages = Math.max(1, Math.round((scrollWidth + gap) / pitch));
  return {
    totalPages,
    totalSpreads: Math.ceil(totalPages / columns),
    step: clientWidth + gap,
  };
}

export function spreadIndexAt(scrollLeft: number, step: number, totalSpreads: number): number {
  if (step <= 0) return 0;
  const index = Math.round(scrollLeft / step);
  return Math.min(Math.max(index, 0), Math.max(totalSpreads - 1, 0));
}

export function pageRange(
  spreadIndex: number,
  columns: number,
  totalPages: number,
): { first: number; last: number } {
  const first = spreadIndex * columns + 1;
  return { first, last: Math.min(first + columns - 1, totalPages) };
}
