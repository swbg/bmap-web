import { Source } from "./types";

export enum Colors {
  Marker0 = "#99d18c", // hellgrün
  Marker1 = "#5db24a", // mittelgrün
  Marker2 = "#f2bb43", // gelb
  Marker3 = "#d87d06", // orange
  Marker4 = "#c64e11", // dunkelorange
  MarkerGrey = "#bbbbbb",
  MarkerActive = "#3c9ee7", // mittelblau
  MarkerDrop = "#2faad4", // blautürkis
  MarkerBag = "#9d6cc7", // violett
  Halo = "#ffffff",
  HaloActive = "#3c9ee7", // same as MarkerActive
}

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

export const BRAND_NAMES = [
  "Augustiner",
  "Tegernseer",
  "Hacker",
  "Spaten",
  "Löwenbräu",
  "Paulaner",
  "Giesinger",
];
