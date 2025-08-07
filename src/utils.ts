import { Place, PlaceFeature } from "./types";

export function formatPrice(price: number) {
  return `${Math.floor(price / 100)},${("00" + (price % 100)).slice(-2)}€`;
}

export function formatVolume(volume: number | undefined) {
  if (!volume) return "";
  return `0,${(volume + "").slice(0, 2)} l`;
}

export function getSource(place: Omit<Place, "source">) {
  if (place.placeType === "Trinkbrunnen") return "drop";
  if (place.placeType === "Tankstelle" || place.placeType === "Späti") return "bag";
  return "circle";
}

export function getLocationState(places: Map<number, Place>): PlaceFeature | undefined {
  const pname = window.location.pathname.split("/");
  if (pname.length !== 3 || pname[1] !== "place") return undefined;

  const place = places.get(parseInt(pname[2]));
  if (!place) return undefined;
  return { source: place.source, id: place.placeId };
}

export function normalizeString(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
