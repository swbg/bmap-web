import { POIJSON, PlaceJSON } from "./types";

export function getSource(place: PlaceJSON | POIJSON) {
  if (place.properties.placeType === "drinking-fountain") return "drinking-fountains";
  return "places";
}

export function makeHoverable(
  map: React.MutableRefObject<maplibregl.Map | null>,
  source: string | null,
  layer: string,
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
  let hoveredId: string | number | undefined = undefined;
  map.current.on("mousemove", layer, (e) => {
    if (!e?.features) return;
    if (!map.current) return;
    if (e.features.length > 0) {
      if (hoveredId !== undefined) {
        map.current.setFeatureState({ source, id: hoveredId }, { hover: false });
      }
      hoveredId = e.features[0].id;
      map.current.setFeatureState({ source, id: hoveredId }, { hover: true });
    }
  });
  map.current.on("mouseleave", layer, () => {
    if (!map.current) return;
    if (hoveredId !== undefined) {
      map.current.setFeatureState({ source, id: hoveredId }, { hover: false });
    }
    hoveredId = undefined;
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

    map.current.flyTo({
      center: (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number],
      zoom: Math.max(map.current.getZoom(), 16),
      easing: (t) => 1 - Math.pow(1 - t, 5),
    });
  };

  map.current.on("click", layer, (e) => selectPlace(e));
}
