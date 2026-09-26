import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  getRevealVariants,
  staggerContainer,
  type RevealOptions,
} from "../motion/presets";

type RevealTag =
  | "div"
  | "section"
  | "header"
  | "ul"
  | "li"
  | "p"
  | "span"
  | "h2"
  | "h3";

// Every tag above shares the same Motion prop surface we rely on.
type MotionElement = typeof motion.div;

interface RevealProps extends RevealOptions {
  as?: RevealTag;
  className?: string;
  children?: React.ReactNode;
  /**
   * When set, this element orchestrates its `RevealItem` children with the
   * given stagger (seconds) instead of animating itself.
   */
  stagger?: number;
  /** Delay (seconds) before the first staggered child starts. */
  delayChildren?: number;
  /** Fraction of the element that must be visible to trigger. */
  amount?: number;
}

/**
 * Reveals its content once when scrolled into view. Under reduced motion the
 * content only fades in, without travel.
 */
export const Reveal: React.FC<RevealProps> = ({
  as = "div",
  className,
  children,
  stagger,
  delayChildren = 0,
  amount = 0.2,
  ...options
}) => {
  const reducedMotion = useReducedMotion() ?? false;
  const Component = motion[as] as MotionElement;
  const variants =
    stagger === undefined
      ? getRevealVariants(reducedMotion, options)
      : staggerContainer(stagger, delayChildren);

  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </Component>
  );
};

interface RevealItemProps extends RevealOptions {
  as?: RevealTag;
  className?: string;
  children?: React.ReactNode;
}

/** Child of a staggered `Reveal`; inherits the parent's visibility state. */
export const RevealItem: React.FC<RevealItemProps> = ({
  as = "div",
  className,
  children,
  ...options
}) => {
  const reducedMotion = useReducedMotion() ?? false;
  const Component = motion[as] as MotionElement;

  return (
    <Component
      className={className}
      variants={getRevealVariants(reducedMotion, options)}
    >
      {children}
    </Component>
  );
};
