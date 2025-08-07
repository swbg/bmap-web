import React from "react";
import Bag from "../assets/bag.svg";
import Drop from "../assets/drop.svg";
import MarkerCircle from "../assets/marker-circle-flush.svg";
import { Sources } from "../const";
import { FilterAction, FilterState, Product, Source } from "../types";
import { CloseButton, FilterButton } from "./Buttons";
import FilterBar from "./FilterBar";

function makeSourceFilter(
  source: Source,
  filterState: FilterState,
  dispatchFilter: React.Dispatch<FilterAction>,
) {
  const [image, label] =
    source === "circle"
      ? [MarkerCircle, "Bars"]
      : source === "drop"
        ? [Drop, "Wasser"]
        : [Bag, "Kiosks"];

  const handleOnChange = (key: Source, visible: boolean) => {
    dispatchFilter({
      group: "source",
      key,
      visible,
    });
  };

  return (
    <div
      className="filter-option"
      key={source}
      onClick={() => handleOnChange(source, !filterState.source[source])}
    >
      <input
        type="checkbox"
        id={source}
        checked={filterState.source[source]}
        onChange={() => void 0}
        // onChange={handleOnChange}
      />
      {label}
      <img src={image} className={filterState.source[source] ? "" : "grayscale"} />
    </div>
  );
}

export default function FilterPanel({
  products,
  filterState,
  expand,
  dispatchFilter,
  setExpand,
}: {
  products: Map<number, Product>;
  filterState: FilterState;
  expand: boolean;
  dispatchFilter: React.Dispatch<FilterAction>;
  setExpand: (b: boolean) => void;
}) {
  if (!expand) {
    return <FilterButton onClick={() => setExpand(true)} />;
  }

  return (
    <div className="filter-panel">
      <CloseButton onClick={() => setExpand(false)} />
      <h4>Orte</h4>
      {Sources.map((source) => makeSourceFilter(source, filterState, dispatchFilter))}
      <h4>Brauereien</h4>
      <FilterBar
        options={[...new Set(Array.from(products.values()).map(({ brandName }) => brandName))]}
        filterTerms={filterState.brandName}
        dispatchFilter={dispatchFilter}
      />
    </div>
  );
}
