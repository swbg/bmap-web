import React from "react";
import { FilterAction, FilterState, Place, PlaceFeature } from "../types";
import { LegendButton } from "./Buttons";
import SearchBar from "./SearchBar";

export default function ControlBar({
  places,
  filterState,
  setActivePlace,
  dispatchFilter,
}: {
  places: Map<number, Place>;
  filterState: FilterState;
  setActivePlace: (newPlace: PlaceFeature | undefined) => void;
  dispatchFilter: React.Dispatch<FilterAction>;
}) {
  return (
    <div className="control-bar">
      <SearchBar places={places} setActivePlace={setActivePlace} />
      <LegendButton source={"circle"} filterState={filterState} dispatchFilter={dispatchFilter} />
      <LegendButton source={"drop"} filterState={filterState} dispatchFilter={dispatchFilter} />
      <LegendButton source={"bag"} filterState={filterState} dispatchFilter={dispatchFilter} />
      {/* <FilterBar filterState={filterState} dispatchFilter={dispatchFilter} /> */}
    </div>
  );
}
