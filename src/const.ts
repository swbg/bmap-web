import { Source } from "./types";

export const MARKER_COLORS = new Map([
  ["marker-0", "#99d18c"], //hellgrün
  ["marker-1", "#5db24a"], //mittelgrün
  ["marker-2", "#f2bb43"], //gelb
  ["marker-3", "#d87d06"], //orange
  ["marker-4", "#c64e11"], //dunkelorange
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
