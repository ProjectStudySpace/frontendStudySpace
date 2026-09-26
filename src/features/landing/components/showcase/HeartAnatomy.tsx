import React from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

/**
 * Stylized anterior view of the heart for the sample study note. As in any
 * anterior view, the patient's right side (atrium and ventricle in blue,
 * deoxygenated) appears on the viewer's left, and the left side (red,
 * oxygenated) on the viewer's right, with the apex pointing down and to the
 * viewer's right. The aorta leaves the left ventricle and passes behind the
 * pulmonary trunk, which leaves the right ventricle in front of it.
 */

const K = "landing.showcase.studyNotes.heart";

const PALETTE = {
  muscle: "#f2c9c4",
  muscleEdge: "#b86b64",
  blueFill: "#9cc3f5",
  blueTube: "#6aa0e8",
  blueEdge: "#1e4f9c",
  redFill: "#f6a7a3",
  redTube: "#e0605a",
  redEdge: "#9f2a25",
  valve: "#fff4d6",
  node: "#f59e0b",
  label: "#374151",
  leader: "#6b7280",
};

/** A vessel drawn as a dark outline under a lighter lumen. */
const Vessel: React.FC<{ d: string; width: number; tube: string; edge: string }> = ({
  d,
  width,
  tube,
  edge,
}) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={edge} strokeWidth={width + 3} />
    <path d={d} stroke={tube} strokeWidth={width} />
  </g>
);

type Structure = "svc" | "ivc" | "ra" | "rv" | "pt" | "ao" | "la" | "lv" | "sa";

interface Callout {
  key: Structure;
  /** Where the label text sits. */
  label: { x: number; y: number; anchor: "start" | "end" };
  /** Leader line from beside the label to the structure. */
  leader: string;
  target: { x: number; y: number };
}

const CALLOUTS: Callout[] = [
  { key: "svc", label: { x: 6, y: 28, anchor: "start" }, leader: "M 36 24 L 100 30", target: { x: 100, y: 30 } },
  { key: "sa", label: { x: 6, y: 64, anchor: "start" }, leader: "M 36 60 L 113 84", target: { x: 113, y: 84 } },
  { key: "ra", label: { x: 6, y: 108, anchor: "start" }, leader: "M 36 104 L 104 106", target: { x: 104, y: 106 } },
  { key: "pt", label: { x: 6, y: 150, anchor: "start" }, leader: "M 36 146 L 153 120", target: { x: 153, y: 120 } },
  { key: "rv", label: { x: 6, y: 184, anchor: "start" }, leader: "M 36 180 L 122 172", target: { x: 122, y: 172 } },
  { key: "ivc", label: { x: 6, y: 236, anchor: "start" }, leader: "M 36 232 L 99 226", target: { x: 99, y: 226 } },
  { key: "ao", label: { x: 294, y: 22, anchor: "end" }, leader: "M 270 18 L 220 45", target: { x: 220, y: 45 } },
  { key: "la", label: { x: 294, y: 110, anchor: "end" }, leader: "M 270 106 L 212 104", target: { x: 212, y: 104 } },
  { key: "lv", label: { x: 294, y: 190, anchor: "end" }, leader: "M 270 186 L 206 176", target: { x: 206, y: 176 } },
];

interface HeartAnatomyProps {
  /** Labels and leader lines are drawn in. */
  labeled: boolean;
  reducedMotion: boolean;
}

export const HeartAnatomy: React.FC<HeartAnatomyProps> = ({ labeled, reducedMotion }) => {
  const { t } = useTranslation();

  return (
    <svg
      viewBox="0 0 300 250"
      role="img"
      aria-label={t("landing.showcase.studyNotes.heartLabel")}
      className="w-full"
    >
      {/* Behind the heart: vessels that run posterior to it */}
      <Vessel d="M 178 74 C 152 68 132 74 116 80" width={10} tube={PALETTE.blueTube} edge={PALETTE.blueEdge} />
      <Vessel d="M 230 66 L 230 122" width={16} tube={PALETTE.redTube} edge={PALETTE.redEdge} />
      <Vessel d="M 236 96 L 268 90" width={8} tube={PALETTE.redTube} edge={PALETTE.redEdge} />
      <Vessel d="M 238 116 L 268 122" width={8} tube={PALETTE.redTube} edge={PALETTE.redEdge} />
      <Vessel d="M 106 170 L 98 234" width={16} tube={PALETTE.blueTube} edge={PALETTE.blueEdge} />
      <Vessel d="M 108 14 L 108 86" width={18} tube={PALETTE.blueTube} edge={PALETTE.blueEdge} />

      {/* Myocardium */}
      <path
        d="M 80 82 C 98 68 148 70 168 78 C 198 70 244 72 250 94 C 258 124 250 172 222 208 C 202 234 176 238 160 222 C 128 212 94 192 84 152 C 76 124 72 96 80 82 Z"
        fill={PALETTE.muscle}
        stroke={PALETTE.muscleEdge}
        strokeWidth="1.5"
      />

      {/* Right atrium and right ventricle (deoxygenated) */}
      <path
        d="M 90 88 C 84 98 84 116 92 128 L 132 128 L 134 92 C 122 82 102 82 90 88 Z"
        fill={PALETTE.blueFill}
        stroke={PALETTE.blueEdge}
        strokeWidth="1.2"
      />
      <path
        d="M 94 138 L 158 138 L 160 204 C 148 210 132 206 118 194 C 102 180 94 160 94 138 Z"
        fill={PALETTE.blueFill}
        stroke={PALETTE.blueEdge}
        strokeWidth="1.2"
      />

      {/* Left atrium and left ventricle (oxygenated), with the thicker LV wall */}
      <path
        d="M 178 86 C 198 78 228 82 236 94 C 242 106 238 122 230 128 L 180 128 L 176 94 Z"
        fill={PALETTE.redFill}
        stroke={PALETTE.redEdge}
        strokeWidth="1.2"
      />
      <path
        d="M 170 138 L 232 138 C 238 160 230 188 208 206 C 196 216 182 216 174 208 Z"
        fill={PALETTE.redFill}
        stroke={PALETTE.redEdge}
        strokeWidth="1.2"
      />

      {/* Tricuspid (RA -> RV) and mitral (LA -> LV) valve leaflets */}
      <g stroke={PALETTE.valve} strokeWidth="3" strokeLinecap="round">
        <path d="M 100 131 L 110 144" />
        <path d="M 126 131 L 116 144" />
        <path d="M 186 131 L 196 144" />
        <path d="M 226 131 L 214 144" />
      </g>

      {/* Great arteries: aortic arch branches, aorta, then the pulmonary trunk in front */}
      <Vessel d="M 170 38 L 162 8" width={7} tube={PALETTE.redTube} edge={PALETTE.redEdge} />
      <Vessel d="M 190 34 L 190 6" width={7} tube={PALETTE.redTube} edge={PALETTE.redEdge} />
      <Vessel d="M 208 38 L 216 8" width={7} tube={PALETTE.redTube} edge={PALETTE.redEdge} />
      <Vessel
        d="M 176 136 C 170 110 144 96 144 68 C 144 42 168 32 190 34 C 214 36 230 50 230 70"
        width={16}
        tube={PALETTE.redTube}
        edge={PALETTE.redEdge}
      />
      <Vessel
        d="M 150 148 C 150 116 160 90 178 74 C 200 62 236 62 266 68"
        width={13}
        tube={PALETTE.blueTube}
        edge={PALETTE.blueEdge}
      />

      {/* Sinoatrial node, where the superior vena cava meets the right atrium */}
      <circle cx="113" cy="84" r="4" fill={PALETTE.node} stroke="#b45309" strokeWidth="1" />

      {/* Labels with leader lines */}
      <g fontSize="11" fontWeight="700" fill={PALETTE.label}>
        {CALLOUTS.map(({ key, label, leader, target }, i) => {
          const delay = reducedMotion || !labeled ? 0 : 0.1 + i * 0.08;
          const duration = reducedMotion ? 0 : 0.45;
          return (
            <g key={key}>
              <motion.path
                d={leader}
                fill="none"
                stroke={PALETTE.leader}
                strokeWidth="0.9"
                initial={false}
                animate={{ pathLength: labeled ? 1 : 0, opacity: labeled ? 1 : 0 }}
                transition={{ duration, delay }}
              />
              <motion.circle
                cx={target.x}
                cy={target.y}
                r="1.8"
                fill={PALETTE.label}
                initial={false}
                animate={{ opacity: labeled ? 1 : 0 }}
                transition={{ duration, delay }}
              />
              <motion.text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                initial={false}
                animate={{ opacity: labeled ? 1 : 0 }}
                transition={{ duration, delay: delay + (reducedMotion ? 0 : 0.2) }}
              >
                {t(`${K}.${key}.abbr`)}
              </motion.text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/** Structures in legend order, grouped by circulation. */
export const HEART_LEGEND: Array<{ key: Structure; side: "right" | "left" | "node" }> = [
  { key: "svc", side: "right" },
  { key: "ivc", side: "right" },
  { key: "ra", side: "right" },
  { key: "rv", side: "right" },
  { key: "pt", side: "right" },
  { key: "la", side: "left" },
  { key: "lv", side: "left" },
  { key: "ao", side: "left" },
  { key: "sa", side: "node" },
];
