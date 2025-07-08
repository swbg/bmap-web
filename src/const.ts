import { Source } from "./types";

export const MARKER_COLORS = new Map([
  ["marker-0", "#6fd64d"], //hellgrün #6fd64d
  ["marker-1", "#5db24a"], //mittelgrün #5db24a, 5db24a
  ["marker-2", "#f2bb43"], //gelb #f2bb43
  ["marker-3", "#d87d06"], //orange #d87d06
  ["marker-4", "#c64e11"], //dunkelorange #c64e11
  ["marker-grey", "#bbbbbb"],
  ["marker-active", "#3C9EE7"],
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
