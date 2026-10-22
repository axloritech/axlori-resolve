/** Shared chart styling tokens (brand-consistent, plain solid colors). */
export const CHART = {
  submitted: "#2563EB",
  resolved: "#15803D",
  axis: "#64748B",
  grid: "#E2E8F0",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "#E2E8F0",
} as const;

/** Distinguishable solid segment colors for categorical charts. */
export const SEGMENT_COLORS = [
  "#2563EB",
  "#0F766E",
  "#B45309",
  "#0369A1",
  "#B91C1C",
  "#15803D",
  "#64748B",
];

export const TOOLTIP_STYLE = {
  backgroundColor: CHART.tooltipBg,
  border: `1px solid ${CHART.tooltipBorder}`,
  borderRadius: 10,
  fontSize: 13,
  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
} as const;
