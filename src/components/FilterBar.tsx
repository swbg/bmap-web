import React, { useState } from "react";
import { BRAND_NAMES } from "../const";
import { FilterAction, FilterState } from "../types";
import { FilterButton } from "./Buttons";

// const BRAND_IMAGES = new Map(
//   [
//     ["Augustiner", "/augustiner-30.png"],
//     ["Tegernseer", "/tegernseer-30.png"],
//     ["Hacker", "/hacker-30.png"],
//     ["Spaten", "/spaten-30.png"],
//     ["Löwenbräu", "/loewenbraeu-30.png"],
//   ],
//   // "Spaten",
//   // "Löwenbräu",
//   // "Paulaner",
//   // "Giesinger",
// );

export default function FilterBar({
  filterState,
  dispatchFilter,
}: {
  filterState: FilterState;
  dispatchFilter: React.Dispatch<FilterAction>;
}) {
  const [showFilterBar, setShowFilterBar] = useState<boolean>(false);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    console.log(e);
    dispatchFilter({ key: e.target.id, active: e.target.checked });
  };

  if (!showFilterBar) {
    return <FilterButton onClick={() => setShowFilterBar(true)} />;
  }
  return (
    <div className="filter-bar">
      {[...BRAND_NAMES, "Andere"].map((brandName) => (
        <div key={brandName}>
          <input
            type="checkbox"
            id={brandName}
            checked={filterState[brandName]}
            onChange={handleOnChange}
          />
          {/* {BRAND_IMAGES.has(brandName) && <img src={BRAND_IMAGES.get(brandName)} />} */}
          <label htmlFor={brandName}>{brandName}</label>
        </div>
      ))}
    </div>
  );
}
