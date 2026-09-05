type BrandLockupProps = {
  size?: "header" | "footer" | "compact";
  className?: string;
};

const primaryStyle = {
  fontFamily: "var(--font-playfair)",
  fontWeight: 700,
  letterSpacing: "-0.02em",
} as const;

const secondaryStyle = {
  fontFamily: "var(--font-heading)",
  fontWeight: 600,
  letterSpacing: "0.22em",
} as const;

/** Shared visual lockup for the header, mobile drawer, and footer. */
export function BrandLockup({ size = "header", className = "" }: BrandLockupProps) {
  const sizeClassName = {
    header: "text-[16px] sm:text-[17px]",
    footer: "text-[16px] sm:text-[17px]",
    compact: "text-[12px]",
  }[size];

  return (
    <div className={`flex flex-col leading-[1.05] ${sizeClassName} ${className}`}>
      <span style={primaryStyle}>Accurate</span>
      <span
        className="mt-1 text-[0.52em] uppercase text-current/55"
        style={secondaryStyle}
      >
        Medical Center
      </span>
    </div>
  );
}
