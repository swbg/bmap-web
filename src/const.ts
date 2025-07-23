export enum Colors {
  Marker0 = "#5db24a", // dunkelgrün
  Marker1 = "#95c96c", // mittelgrün
  Marker2 = "#f2bb43", // gelb
  Marker3 = "#d87d06", // orange
  Marker4 = "#c64e11", // dunkelorange
  MarkerGrey = "#bbbbbb",
  MarkerActive = "#ff3fac", // pink
  MarkerDrop = "#2faad4", // blautürkis
  MarkerBag = "#9d6cc7", // violett
  Halo = "#ffffff",
}

export const Sources = ["circle", "drop", "bag"] as const;

export const ProductTypes = [
  "Helles",
  "Helles Alkoholfrei",
  "Weißbier",
  "Weißbier Alkoholfrei",
  "Weinschorle",
  "Aperol",
  "Spritz",
  "Spritz Alkoholfrei",
] as const;

export const BrandNames = [
  "Augustiner",
  "Tegernseer",
  "Hacker",
  "Spaten",
  "Löwenbräu",
  "Paulaner",
  "Giesinger",
] as const;
