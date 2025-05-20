import { FeaturePoint, POIJSON, PlaceJSON } from "./types";

export function getSource(place: PlaceJSON | POIJSON) {
  if (place.properties.placeType === "drinking-fountain") return "drinking-fountains";
  return "places";
}

export function makeHoverable(
  map: React.MutableRefObject<maplibregl.Map | null>,
  source: string | null,
  layer: string,
  setHoveredPoint: React.Dispatch<React.SetStateAction<FeaturePoint | null>>,
) {
  if (!map.current) return;

  // Change mouse cursor on hover
  const setCursor = (c: string) => {
    if (!map.current) return;
    map.current.getCanvas().style.cursor = c;
  };

  map.current.on("mousemove", layer, () => setCursor("pointer"));
  map.current.on("mouseleave", layer, () => setCursor(""));

  if (source === null) return;

  // Change color on hover
  map.current.on("mousemove", layer, (e) => {
    if (!e?.features) return;
    if (!map.current) return;
    if (e.features.length > 0) {
      const hoveredId = e.features[0].id;
      if (typeof hoveredId === "number") setHoveredPoint({ source, id: hoveredId });
    }
  });
  map.current.on("mouseleave", layer, () => {
    if (!map.current) return;
    setHoveredPoint((prev) => (prev ? (prev.source === source ? null : prev) : prev));
  });
}

export function makeClickable(
  map: React.MutableRefObject<maplibregl.Map | null>,
  source: string,
  layer: string,
  setActivePlace: (newPlace: PlaceJSON | POIJSON | undefined, source: string) => void,
  placeMap: Map<number, PlaceJSON> | Map<number, POIJSON>,
) {
  if (!map.current) return;

  // Select places by clicking
  type T = maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] };
  const selectPlace = (e: T) => {
    if (!e?.features) return;
    if (!map.current) return;

    const placeId = e.features[0].id;
    if (typeof placeId !== "number") return;
    setActivePlace(placeMap.get(placeId), source);
  };

  map.current.on("click", layer, (e) => selectPlace(e));
}

export function getLocationState(): FeaturePoint | null {
  const pname = window.location.pathname.split("/");
  if (pname.length !== 2) return null;
  if (["places", "drinking-fountains"].indexOf(pname[0]) < 0) return null;

  const placeId = parseInt(pname[1]);
  if (isNaN(placeId)) return null;
  return { source: pname[0], id: placeId };
}
