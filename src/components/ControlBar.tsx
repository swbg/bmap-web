import React from "react";
import {
  FilterAction,
  FilterState,
  Place,
  PlaceFeature,
  VisibilityAction,
  VisibilityState,
} from "../types";
import { LegendButton } from "./Buttons";
import SearchBar from "./SearchBar";

export default function ControlBar({
  places,
  layerVisibility,
  setActivePlace,
  dispatchVisibility,
}: {
  places: Map<number, Place>;
  layerVisibility: VisibilityState;
  filterState: FilterState;
  setActivePlace: (newPlace: PlaceFeature | undefined) => void;
  dispatchVisibility: React.Dispatch<VisibilityAction>;
  dispatchFilter: React.Dispatch<FilterAction>;
}) {
  return (
    <div className="control-bar">
      <SearchBar places={places} setActivePlace={setActivePlace} />
      <LegendButton
        source={"circle"}
        layerVisibility={layerVisibility}
        dispatchVisibility={dispatchVisibility}
      />
      <LegendButton
        source={"drop"}
        layerVisibility={layerVisibility}
        dispatchVisibility={dispatchVisibility}
      />
      <LegendButton
        source={"bag"}
        layerVisibility={layerVisibility}
        dispatchVisibility={dispatchVisibility}
      />
      {/* <FilterBar filterState={filterState} dispatchFilter={dispatchFilter} /> */}
    </div>
  );
}
