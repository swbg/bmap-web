import { PropertyValueSpecification, SymbolLayerSpecification } from "maplibre-gl";
import { Colors } from "./const";

export function getMarkerLayout(markerName: string) {
  return {
    "icon-image": markerName,
    "icon-size": [
      "interpolate",
      ["linear"],
      ["zoom"],
      // zoom is 12 (or less) -> 20% size
      12,
      0.2,
      // zoom is 19 (or greater) -> 40% size
      19,
      0.4,
    ],
    "icon-offset": [0, -50.0],
    "icon-overlap": "always" as PropertyValueSpecification<"always">,
  } as SymbolLayerSpecification["layout"];
}

export function getMarkerPaint() {
  return {
    "icon-halo-width": [
      "interpolate",
      ["linear"],
      ["zoom"],
      // zoom is 12 (or less)
      12,
      0.5,
      // zoom is 19 (or greater)
      19,
      1.0,
    ],
    "icon-halo-color": [
      "case",
      [
        "any",
        ["to-boolean", ["feature-state", "hover"]],
        ["to-boolean", ["feature-state", "selected"]],
      ],
      Colors.HaloActive,
      Colors.Halo,
    ],
  } as SymbolLayerSpecification["paint"];
}
