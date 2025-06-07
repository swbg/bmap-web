import { Source } from "./types";

export const MARKER_COLORS = new Map([
  ["marker-0", "#17a962"],
  ["marker-1", "#1eb147"],
  ["marker-2", "#26ba2b"],
  ["marker-3", "#4dc22e"],
  ["marker-4", "#78cb36"],
  ["marker-5", "#a4d33e"],
  ["marker-6", "#d1dc46"],
  ["marker-7", "#e5cc4e"],
  ["marker-8", "#edb056"],
  ["marker-9", "#f6945e"],
  ["marker-grey", "#bbbbbb"],
  ["marker-active", "#19c19e"],
]);

export const SOURCES = ["circle", "drop", "bag"] as Source[];

export const PRODUCT_TYPES = [
  "Helles",
  "Helles Alkoholfrei",
  "Weißbier",
  "Weißbier Alkoholfrei",
  "Weinschorle",
  "Aperol",
  "Spritz",
];
