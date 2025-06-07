import React from "react";
import Bag from "../assets/bag.svg";
import Drop from "../assets/drop.svg";
import MarkerCircle from "../assets/marker-circle-flush.svg";
import { LayerVisibility, Place, PlaceFeature, Source, VisibilityAction } from "../types";
import SearchBar from "./SearchBar";

function SourceLegend({
  source,
  layerVisibility,
  dispatchVisibility,
}: {
  source: Source;
  layerVisibility: LayerVisibility;
  dispatchVisibility: React.Dispatch<VisibilityAction>;
}) {
  const [image, label] =
    source === "circle"
      ? [MarkerCircle, "Bars"]
      : source === "drop"
        ? [Drop, "Wasser"]
        : [Bag, "Kiosks"];

  return (
    <div
      className={`control-button legend-button ${layerVisibility[source] ? "" : "grayscale"}`}
      onClick={() => dispatchVisibility({ source, visible: !layerVisibility[source] })}
    >
      <img src={image} />
      <span>{label}</span>
    </div>
  );
}

export default function ControlBar({
  places,
  layerVisibility,
  setActivePlace,
  dispatchVisibility,
}: {
  places: Map<number, Place>;
  layerVisibility: LayerVisibility;
  setActivePlace: (newPlace: PlaceFeature | undefined) => void;
  dispatchVisibility: React.Dispatch<VisibilityAction>;
}) {
  return (
    <div className="control-bar">
      <SearchBar places={places} setActivePlace={setActivePlace} />
      <SourceLegend
        source={"circle"}
        layerVisibility={layerVisibility}
        dispatchVisibility={dispatchVisibility}
      />
      <SourceLegend
        source={"drop"}
        layerVisibility={layerVisibility}
        dispatchVisibility={dispatchVisibility}
      />
      <SourceLegend
        source={"bag"}
        layerVisibility={layerVisibility}
        dispatchVisibility={dispatchVisibility}
      />
    </div>
  );
}
