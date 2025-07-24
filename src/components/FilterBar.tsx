import React, { useState } from "react";
import Bag from "../assets/bag.svg";
import Drop from "../assets/drop.svg";
import MarkerCircle from "../assets/marker-circle-flush.svg";
import { BrandNames, Sources } from "../const";
import { BrandName, FilterAction, FilterState, Source } from "../types";
import { CloseButton, FilterButton } from "./Buttons";

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

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchFilter({
      group: "source",
      key: e.target.id as Source,
      visible: e.target.checked,
    });
  };

  return (
    <div key={source} className="filter-option">
      <input
        type="checkbox"
        id={source}
        checked={filterState.source[source]}
        onChange={handleOnChange}
      />
      <label htmlFor={source}>{label}</label>
      <img src={image} className={filterState.source[source] ? "" : "grayscale"} />
    </div>
  );
}

function makeBrandNameFilter(
  brandName: BrandName,
  filterState: FilterState,
  dispatchFilter: React.Dispatch<FilterAction>,
) {
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchFilter({
      group: "brandName",
      key: e.target.id as BrandName,
      visible: e.target.checked,
    });
  };

  return (
    <div key={brandName} className="filter-option">
      <input
        type="checkbox"
        id={brandName}
        checked={filterState.brandName[brandName]}
        onChange={handleOnChange}
      />
      <label htmlFor={brandName}>{brandName}</label>
    </div>
  );
}

export default function FilterBar({
  filterState,
  expand,
  dispatchFilter,
  setExpand,
}: {
  filterState: FilterState;
  expand: boolean;
  dispatchFilter: React.Dispatch<FilterAction>;
  setExpand: (b: boolean) => void;
}) {
  if (!expand) {
    return <FilterButton onClick={() => setExpand(true)} />;
  }
  return (
    <div className="filter-bar">
      <CloseButton onClick={() => setExpand(false)} />
      <h4>Orte</h4>
      {Sources.map((source) => makeSourceFilter(source, filterState, dispatchFilter))}
      <h4>Marken</h4>
      {BrandNames.map((brandName) => makeBrandNameFilter(brandName, filterState, dispatchFilter))}
    </div>
  );
}
