// Validated categorical/status palette (dataviz skill reference/palette.md).
// Fixed order — never cycle or reassign per-filter.
export const CATEGORICAL = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

export const INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  gridline: "#e1e0d9",
  baseline: "#c3c2b7",
  surface: "#fcfcfb",
};

/** Sentiment reads as a state, not a series — map it to the status palette. */
export function sentimentColor(sentimiento: string): string {
  const s = sentimiento.toLowerCase();
  if (s.includes("positiv")) return STATUS.good;
  if (s.includes("negativ")) return STATUS.critical;
  return INK.muted; // neutro / sin dato
}
