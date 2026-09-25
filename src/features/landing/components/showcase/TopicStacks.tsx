import React, { useMemo, useRef } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { seededShuffle } from "../../motion/showcase";
import { useLoopActive, useTicker } from "./useSceneLoop";

interface Topic {
  key: "biology" | "languages" | "history";
  dot: string;
  bar: string;
  tint: string;
}

const TOPICS: Topic[] = [
  { key: "biology", dot: "bg-emerald-500", bar: "bg-emerald-400", tint: "bg-emerald-50" },
  { key: "languages", dot: "bg-indigo-500", bar: "bg-indigo-400", tint: "bg-indigo-50" },
  { key: "history", dot: "bg-pink-500", bar: "bg-pink-400", tint: "bg-pink-50" },
];

const CARDS_PER_TOPIC = 3;

const CARDS = TOPICS.flatMap((topic) =>
  Array.from({ length: CARDS_PER_TOPIC }, (_, i) => ({
    id: `${topic.key}-${i}`,
    topic,
  })),
);

type Card = (typeof CARDS)[number];

const SPRING = { type: "spring" as const, stiffness: 260, damping: 30 };

const MiniCard: React.FC<{ card: Card; stacked?: number }> = ({
  card,
  stacked,
}) => (
  <motion.div
    layoutId={card.id}
    layout
    transition={SPRING}
    className={`relative rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm ${
      stacked !== undefined && stacked > 0 ? "-mt-9 sm:-mt-10" : ""
    }`}
    style={{ zIndex: stacked ?? 0 }}
  >
    <div className={`mb-2 h-1.5 w-8 rounded-full ${card.topic.bar}`} />
    <div className="mb-1 h-1.5 w-full rounded-full bg-gray-100" />
    <div className="h-1.5 w-2/3 rounded-full bg-gray-100" />
  </motion.div>
);

/**
 * Topic organization: a mixed pile of cards shuffles, then every card flies
 * into its color-coded topic stack, on a loop while in view.
 */
export const TopicStacks: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const active = useLoopActive(ref);
  const tick = useTicker(active, 2600);

  // Even ticks show the shuffled pile, odd ticks the sorted stacks.
  const sorted = reducedMotion || tick % 2 === 1;
  const pile = useMemo(() => seededShuffle(CARDS, Math.floor(tick / 2) + 1), [tick]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative rounded-3xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6"
    >
      <LayoutGroup>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {TOPICS.map((topic) => (
            <div key={topic.key} className="min-w-0">
              <motion.div
                className={`mb-3 flex items-center gap-1.5 rounded-full px-2 py-1 ${topic.tint}`}
                animate={{ opacity: sorted ? 1 : 0.45 }}
                transition={{ duration: 0.4 }}
              >
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${topic.dot}`} />
                <span className="truncate text-[11px] sm:text-xs font-semibold text-gray-700">
                  {t(`landing.showcase.topicOrganization.topics.${topic.key}`)}
                </span>
              </motion.div>
              <div className="min-h-[7.5rem] sm:min-h-[8rem]">
                {sorted &&
                  CARDS.filter((card) => card.topic.key === topic.key).map(
                    (card, i) => <MiniCard key={card.id} card={card} stacked={i} />,
                  )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid min-h-[9.5rem] grid-cols-3 gap-2 sm:gap-3 rounded-2xl border border-dashed border-gray-200 p-2 sm:p-3">
          {!sorted && pile.map((card) => <MiniCard key={card.id} card={card} />)}
          {sorted && (
            <p className="col-span-3 self-center text-center text-xs text-gray-400">
              {t("landing.showcase.topicOrganization.sorted")}
            </p>
          )}
        </div>
      </LayoutGroup>
    </div>
  );
};
