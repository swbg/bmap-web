import { Place, PlaceFeature } from "./types";

export function formatPrice(price: number) {
  return `${Math.floor(price / 100)},${("00" + (price % 100)).slice(-2)}€`;
}

export function formatPhone(p: string) {
  if (p.slice(0, 3) === "089") {
    return "089 " + p.slice(3);
  }
  if (p.slice(0, 2) === "01") {
    return p.slice(0, 4) + " " + p.slice(4);
  }
  return p;
}

export function getSource(place: Place) {
  if (place.placeType === "Trinkbrunnen") return "drop";
  if (place.placeType === "Tankstelle" || place.placeType === "Späti") return "bag";
  return "circle";
}

export function getLocationState(): PlaceFeature | undefined {
  const pname = window.location.pathname.split("/");
  if (pname.length !== 3) return undefined;
  const source = pname[1];
  if (["circle", "drop", "bag"].indexOf(source) < 0) return undefined;

  const placeId = parseInt(pname[2]);
  if (isNaN(placeId)) return undefined;
  return { source, id: placeId };
}
