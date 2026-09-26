import React, { useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ImageIcon, RotateCw } from "lucide-react";
import { EASE_OUT_EXPO } from "../../motion/presets";
import {
  AFIB_BEATS,
  ecgStripPath,
  imageCardFrame,
} from "../../motion/richContent";
import { useLoopActive, useTicker } from "./useSceneLoop";

const ECG_WIDTH = 300;
const ECG_HEIGHT = 60;
const ECG_PATH = ecgStripPath({
  width: ECG_WIDTH,
  height: ECG_HEIGHT,
  beats: AFIB_BEATS,
});
const SORTED_BEATS = [...AFIB_BEATS].sort((a, b) => a - b);

const K = "landing.showcase.imageFlashcards";

/** Graph-paper ECG background shared by both sides of the card. */
const EcgPaper: React.FC<{ id: string }> = ({ id }) => (
  <>
    <defs>
      <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 H 0 V 10" fill="none" stroke="#fecdd3" strokeWidth="0.6" />
      </pattern>
    </defs>
    <rect width={ECG_WIDTH} height={ECG_HEIGHT} fill="#fff1f2" />
    <rect width={ECG_WIDTH} height={ECG_HEIGHT} fill={`url(#${id})`} />
  </>
);

/**
 * Image flashcard: the question is an ECG strip that traces itself, and the
 * answer carries its own annotated image. Autoplays in view (question, then
 * answer); clicking the card hands control to the visitor.
 */
export const ImageFlashcardDemo: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const baseId = useId().replace(/:/g, "");
  const [manualFlip, setManualFlip] = useState<boolean | null>(null);
  const active = useLoopActive(ref) && manualFlip === null;
  const tick = useTicker(active, 1600);

  const frame = reducedMotion ? { flipped: false, loop: 0 } : imageCardFrame(tick);
  const flipped = manualFlip ?? frame.flipped;

  const sides = [
    { key: "sideQuestion", on: !flipped },
    { key: "sideAnswer", on: flipped },
  ] as const;

  return (
    <div
      ref={ref}
      className="relative mx-auto max-w-md rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-indigo-50 p-4 sm:p-8"
    >
      <div style={{ perspective: 1200 }} className="mb-5">
        <motion.button
          type="button"
          onClick={() => setManualFlip(!flipped)}
          aria-pressed={flipped}
          aria-label={t(`${K}.flipLabel`)}
          className="relative block h-72 w-full rounded-2xl text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 sm:h-80"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, ease: EASE_OUT_EXPO }}
        >
          {/* Question side: the image is the question */}
          <span
            className="absolute inset-0 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:p-6"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-rose-500" />
                <span className="truncate">{t(`${K}.cardTopic`)}</span>
              </span>
              <span className="inline-flex flex-shrink-0 items-center gap-1 text-xs font-medium text-gray-400">
                <ImageIcon size={12} aria-hidden="true" />
                {t(`${K}.cardKind`)}
              </span>
            </span>
            <span className="text-lg font-semibold text-gray-900 sm:text-xl">
              {t(`${K}.cardQuestion`)}
            </span>
            <svg
              viewBox={`0 0 ${ECG_WIDTH} ${ECG_HEIGHT}`}
              role="img"
              aria-label={t(`${K}.ecgLabel`)}
              className="min-h-0 w-full flex-1 rounded-lg border border-rose-100"
              preserveAspectRatio="none"
            >
              <EcgPaper id={`${baseId}q`} />
              <motion.path
                key={reducedMotion ? "static" : frame.loop}
                d={ECG_PATH}
                fill="none"
                stroke="#be123c"
                strokeWidth="1.5"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={reducedMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, ease: "linear" }}
              />
            </svg>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <RotateCw size={12} aria-hidden="true" />
              {t("landing.showcase.selfAssessment.tapToFlip")}
            </span>
          </span>

          {/* Answer side: text plus an annotated image */}
          <span
            className="absolute inset-0 flex flex-col justify-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 p-5 text-white shadow-xl sm:p-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-rose-100">
              {t("landing.showcase.selfAssessment.answerLabel")}
            </span>
            <span className="text-xl font-bold sm:text-2xl">{t(`${K}.answerTitle`)}</span>
            <span className="text-sm leading-snug text-rose-50 sm:text-base">
              {t(`${K}.answerBody`)}
            </span>
            <svg
              viewBox={`0 0 ${ECG_WIDTH} ${ECG_HEIGHT}`}
              role="img"
              aria-label={t(`${K}.answerImageLabel`)}
              className="mt-2 h-20 w-full rounded-lg bg-white/95 sm:h-24"
              preserveAspectRatio="none"
            >
              <EcgPaper id={`${baseId}a`} />
              <path
                d={ECG_PATH}
                fill="none"
                stroke="#be123c"
                strokeWidth="1.5"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {SORTED_BEATS.slice(1).map((beat, i) => {
                const from = SORTED_BEATS[i];
                const y = i % 2 === 0 ? 4 : 9;
                return (
                  <path
                    key={beat}
                    d={`M ${from + 1} ${y + 3} V ${y} H ${beat - 1} V ${y + 3}`}
                    fill="none"
                    stroke={i % 2 === 0 ? "#4f46e5" : "#0891b2"}
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          </span>
        </motion.button>
      </div>

      {/* Which side of the card carries the image right now */}
      <ul className="mb-4 flex flex-wrap justify-center gap-2">
        {sides.map(({ key, on }) => (
          <li
            key={key}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
              on
                ? "border-rose-300 bg-rose-500 text-white"
                : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            <ImageIcon size={12} aria-hidden="true" />
            {t(`${K}.${key}`)}
          </li>
        ))}
      </ul>

      <p className="text-center text-xs text-gray-400">
        {t("landing.showcase.sampleNote")}
      </p>
    </div>
  );
};
