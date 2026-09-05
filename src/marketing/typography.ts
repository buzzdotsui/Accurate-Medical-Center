/**
 * Shared display-heading DNA used across the public brand and staff portal.
 *
 * Variants intentionally define scale only. Family, weight, style, measure
 * behavior, line-height, and tracking remain identical for every use.
 */
export const displayHeadingClassName =
  "font-playfair not-italic font-bold leading-[1.04] tracking-[-0.035em] text-pretty";

export const displayHeadingVariantClassNames = {
  hero: "text-[clamp(2.5rem,5.4vw,5.75rem)]",
  section: "text-[clamp(2.35rem,6vw,4.75rem)]",
  appointment: "text-[clamp(2.35rem,8vw,3rem)]",
  auth: "text-[clamp(2.25rem,8.5vw,2.85rem)]",
} as const;

export const displayHeadingStyle = {
  fontFamily: "var(--font-playfair)",
  fontStyle: "normal",
} as const;
