import React, { useState } from "react";
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
  enum Control {
    None,
    Search,
    Filter,
  }
  const [expandControl, setExpandControl] = useState<Control>(Control.None);

  return (
    <div className="control-bar">
      <SearchBar
        places={places}
        expand={expandControl == Control.Search}
        setActivePlace={setActivePlace}
        setExpand={(b: boolean) => setExpandControl(b ? Control.Search : Control.None)}
      />
      <FilterBar
        filterState={filterState}
        expand={expandControl == Control.Filter}
        dispatchFilter={dispatchFilter}
        setExpand={(b: boolean) => setExpandControl(b ? Control.Filter : Control.None)}
      />
    </div>
  );
}
