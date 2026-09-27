import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NoteBlock } from "./parseNoteContent";
import { computePaging, pageRange, spreadIndexAt, type Paging } from "./paging";

/** Reader height: 70% of the viewport, kept between 420px and 640px. */
const READER_HEIGHT = "clamp(420px, 70vh, 640px)";
/** Figures may take up to ~55% of a page so they always fit in one column. */
const FIGURE_MAX_HEIGHT = `calc(${READER_HEIGHT} * 0.55)`;

interface NoteBookViewProps {
  title?: string | null;
  blocks: NoteBlock[];
  accentColor?: string;
  onImageClick: (url: string, number: number) => void;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export const NoteBookView: React.FC<NoteBookViewProps> = ({
  title,
  blocks,
  accentColor,
  onImageClick,
}) => {
  const { t } = useTranslation();
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [paging, setPaging] = useState<Paging>({ totalPages: 1, totalSpreads: 1, step: 0 });
  const [columns, setColumns] = useState(1);
  const [spread, setSpread] = useState(0);
  const spreadRef = useRef(0);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const style = window.getComputedStyle(content);
    const columnCount = parseInt(style.columnCount, 10) || 1;
    const next = computePaging({
      scrollWidth: content.scrollWidth,
      clientWidth: content.clientWidth,
      columns: columnCount,
      gap: parseFloat(style.columnGap) || 0,
    });
    setColumns(columnCount);
    setPaging((prev) =>
      prev.totalPages === next.totalPages &&
      prev.totalSpreads === next.totalSpreads &&
      prev.step === next.step
        ? prev
        : next,
    );
    // Keep the current spread aligned after a resize.
    const index = Math.min(spreadRef.current, next.totalSpreads - 1);
    spreadRef.current = index;
    setSpread(index);
    viewport.scrollTo({ left: index * next.step, behavior: "auto" });
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [blocks, title, measure]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [measure]);

  const goTo = (index: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const target = Math.min(Math.max(index, 0), paging.totalSpreads - 1);
    spreadRef.current = target;
    setSpread(target);
    viewport.scrollTo({
      left: target * paging.step,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const index = spreadIndexAt(viewport.scrollLeft, paging.step, paging.totalSpreads);
    spreadRef.current = index;
    setSpread(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(spread + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(spread - 1);
    }
  };

  const { first, last } = pageRange(spread, columns, paging.totalPages);
  const indicator =
    first === last
      ? t("components.noteBook.pageIndicator", { first, total: paging.totalPages })
      : t("components.noteBook.pagesIndicator", { first, last, total: paging.totalPages });
  const hasMultipleSpreads = paging.totalSpreads > 1;

  return (
    <div className="flex flex-col">
      <div
        ref={viewportRef}
        tabIndex={0}
        role="region"
        aria-label={t("components.noteBook.readerLabel")}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        className="relative overflow-x-auto overflow-y-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ height: READER_HEIGHT }}
      >
        <div
          ref={contentRef}
          className="h-full columns-1 md:columns-2 gap-x-16 [column-fill:auto]"
        >
          {title && (
            <header className="mb-6">
              <h3 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              <div
                className="mt-3 h-1 w-12 rounded-full"
                style={{ backgroundColor: accentColor || "#60A5FA" }}
              />
            </header>
          )}

          {blocks.length === 0 && (
            <p className="text-sm italic text-gray-400 dark:text-gray-500">
              {t("content.noContent")}
            </p>
          )}

          {blocks.map((block, index) =>
            block.kind === "text" ? (
              <p
                key={`text-${index}`}
                className="mb-4 whitespace-pre-wrap break-words text-[15px] leading-7 text-gray-700 dark:text-gray-300"
              >
                {block.text}
              </p>
            ) : (
              <figure
                key={`image-${block.number}`}
                className="my-5 break-inside-avoid"
              >
                <button
                  type="button"
                  onClick={() => onImageClick(block.url, block.number)}
                  className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <img
                    src={block.url}
                    alt={t("components.noteBook.figureAlt", { number: block.number })}
                    onLoad={measure}
                    className="mx-auto w-auto max-w-full object-contain"
                    style={{ maxHeight: FIGURE_MAX_HEIGHT }}
                  />
                </button>
                <figcaption className="mt-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {t("components.noteBook.figure", { number: block.number })}
                </figcaption>
              </figure>
            ),
          )}
        </div>
        {/* Extends the scroll range so the last spread aligns even when it has one filled column. */}
        {hasMultipleSpreads && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 h-px w-px"
            style={{ left: paging.totalSpreads * paging.step - 1 }}
          />
        )}
      </div>

      {hasMultipleSpreads && (
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-700 pt-3">
          <button
            type="button"
            onClick={() => goTo(spread - 1)}
            disabled={spread === 0}
            aria-label={t("components.noteBook.previousPage")}
            className="rounded-full p-2 text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400" aria-live="polite">
            {indicator}
          </span>
          <button
            type="button"
            onClick={() => goTo(spread + 1)}
            disabled={spread >= paging.totalSpreads - 1}
            aria-label={t("components.noteBook.nextPage")}
            className="rounded-full p-2 text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
