import React from "react";
import { Sparkles } from "lucide-react";
import { Reveal, RevealItem } from "./Reveal";

interface SectionHeadingProps {
  title: string;
  subtitle: string;
  badge?: string;
}

/** Centered section heading that reveals badge, title and subtitle in turn. */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  badge,
}) => (
  <Reveal
    as="header"
    stagger={0.08}
    className="text-center mb-8 sm:mb-12 md:mb-16"
  >
    {badge && (
      <RevealItem className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 mb-3 sm:mb-4">
        <Sparkles size={14} className="text-indigo-600 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm font-medium text-gray-600">
          {badge}
        </span>
      </RevealItem>
    )}
    <RevealItem
      as="h2"
      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4"
    >
      {title}
    </RevealItem>
    <RevealItem
      as="p"
      className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4"
    >
      {subtitle}
    </RevealItem>
  </Reveal>
);
