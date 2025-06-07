import { placeToGeoJSON } from "./data";
import { Entry, Place, PlaceFeature, Source } from "./types";

export function makeHoverable(
  map: React.MutableRefObject<maplibregl.Map | null>,
  source: Source | null,
  layer: string,
  setHoveredPlace: React.Dispatch<React.SetStateAction<PlaceFeature | null>>,
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
      if (typeof hoveredId === "number") setHoveredPlace({ source, id: hoveredId });
    }
  });
  map.current.on("mouseleave", layer, () => {
    if (!map.current) return;
    setHoveredPlace((prev) => (prev ? (prev.source === source ? null : prev) : prev));
  });
}

export function makeClickable(
  map: React.MutableRefObject<maplibregl.Map | null>,
  source: Source,
  layer: string,
  setActivePlace: (newPlace: PlaceFeature | undefined) => void,
) {
  if (!map.current) return;

  // Select places by clicking
  type T = maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] };
  const selectPlace = (e: T) => {
    if (!e?.features) return;
    if (!map.current) return;

    const placeId = e.features[0].id;
    if (typeof placeId !== "number") return;
    setActivePlace({ source, id: placeId });
  };

  map.current.on("click", layer, (e) => selectPlace(e));
}

export function addPlacesSource(
  map: React.MutableRefObject<maplibregl.Map | null>,
  source: Source,
  places: Map<number, Place>,
  entries: Map<number, Entry[]> | null,
) {
  if (!map.current) return;

  map.current.addSource(source, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: Array.from(places.values())
        .filter((place) => place.source === source)
        .map((place) => placeToGeoJSON(place, entries)),
    },
  });
}
