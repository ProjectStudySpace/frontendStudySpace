import { describe, expect, it } from "vitest";
import {
  EASE_OUT_EXPO,
  fadeUp,
  getRevealVariants,
  scaleIn,
  staggerContainer,
} from "./presets";

describe("EASE_OUT_EXPO", () => {
  it("is the brand entrance cubic-bezier", () => {
    expect(EASE_OUT_EXPO).toEqual([0.22, 1, 0.36, 1]);
  });
});

describe("fadeUp", () => {
  it("starts hidden and offset, and settles visible at rest with defaults", () => {
    const variants = fadeUp();
    expect(variants.hidden).toEqual({ opacity: 0, y: 20 });
    expect(variants.visible).toEqual({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0, ease: EASE_OUT_EXPO },
    });
  });

  it("honours custom distance, duration and delay", () => {
    const variants = fadeUp({ distance: 16, duration: 0.8, delay: 0.2 });
    expect(variants.hidden).toEqual({ opacity: 0, y: 16 });
    expect(variants.visible).toMatchObject({
      transition: { duration: 0.8, delay: 0.2 },
    });
  });

  it("never produces negative timing values", () => {
    const variants = fadeUp({ duration: -1, delay: -0.5 });
    expect(variants.visible).toMatchObject({
      transition: { duration: 0, delay: 0 },
    });
  });
});

describe("scaleIn", () => {
  it("scales up subtly from 0.96 by default", () => {
    const variants = scaleIn();
    expect(variants.hidden).toEqual({ opacity: 0, scale: 0.96 });
    expect(variants.visible).toEqual({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, delay: 0, ease: EASE_OUT_EXPO },
    });
  });

  it("accepts a custom starting scale and delay", () => {
    const variants = scaleIn({ from: 0.9, delay: 0.3 });
    expect(variants.hidden).toEqual({ opacity: 0, scale: 0.9 });
    expect(variants.visible).toMatchObject({ transition: { delay: 0.3 } });
  });
});

describe("staggerContainer", () => {
  it("orchestrates children with the default stagger", () => {
    expect(staggerContainer()).toEqual({
      hidden: {},
      visible: { transition: { staggerChildren: 0.08, delayChildren: 0 } },
    });
  });

  it("uses the provided stagger and child delay", () => {
    expect(staggerContainer(0.1, 0.2).visible).toEqual({
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    });
  });

  it("clamps negative timings to zero", () => {
    expect(staggerContainer(-0.1, -1).visible).toEqual({
      transition: { staggerChildren: 0, delayChildren: 0 },
    });
  });
});

describe("getRevealVariants", () => {
  it("returns movement-based reveal when motion is allowed", () => {
    expect(getRevealVariants(false)).toEqual(fadeUp());
  });

  it("forwards options to the movement-based reveal", () => {
    expect(getRevealVariants(false, { distance: 24 })).toEqual(
      fadeUp({ distance: 24 }),
    );
  });

  it("returns opacity-only variants under reduced motion", () => {
    const variants = getRevealVariants(true, { distance: 24, delay: 0.1 });
    expect(variants.hidden).toEqual({ opacity: 0 });
    expect(variants.visible).toEqual({
      opacity: 1,
      transition: { duration: 0.3, delay: 0.1, ease: "linear" },
    });
    expect(JSON.stringify(variants)).not.toMatch(/"(y|x|scale)"/);
  });
});
