import React, { useState } from "react";
import { FilterAction, FilterState, Place, PlaceFeature, Product } from "../types";
import FilterPanel from "./FilterPanel";
import SearchBar from "./SearchBar";

export default function ControlBar({
  places,
  products,
  filterState,
  setActivePlace,
  dispatchFilter,
}: {
  places: Map<number, Place>;
  products: Map<number, Product>;
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
      <FilterPanel
        products={products}
        filterState={filterState}
        expand={expandControl == Control.Filter}
        dispatchFilter={dispatchFilter}
        setExpand={(b: boolean) => setExpandControl(b ? Control.Filter : Control.None)}
      />
    </div>
  );
}
