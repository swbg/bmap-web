import React from "react";
import { FilterAction, FilterState, Place, PlaceFeature } from "../types";
import FilterBar from "./FilterBar";
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
      <FilterBar filterState={filterState} dispatchFilter={dispatchFilter} />
    </div>
  );
}
