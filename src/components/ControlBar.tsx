import React, { useRef, useState } from "react";
import { Sources } from "../const";
import { FilterAction, FilterState, Place, PlaceFeature, Product } from "../types";
import FilterBar from "./FilterBar";
import { FilterPill, SourcePill } from "./FilterPill";
import SearchBar from "./SearchBar";

function DraggableRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseCoords = useRef({
    startX: 0,
    scrollLeft: 0,
  });
  const [touchIdentifier, setTouchIdentifier] = useState(0);
  // const [isPointerDown, setIsPointerDown] = useState(false);

  const handleOnTouchStart = (e: React.TouchEvent) => {
    if (!ref.current) return;

    const touch = e.targetTouches[0];
    setTouchIdentifier(touch.identifier);

    const startX = touch.screenX - ref.current.offsetLeft;
    const scrollLeft = ref.current.scrollLeft;
    mouseCoords.current = { startX, scrollLeft };
  };

  const handleOnTouchMove = (e: React.TouchEvent) => {
    if (!ref.current) return;
    e.preventDefault();

    const touch = Array.from(e.targetTouches).filter((t) => t.identifier === touchIdentifier)[0];
    if (!touch) return;

    const x = touch.screenX - ref.current.offsetLeft;
    const walkX = x - mouseCoords.current.startX;
    ref.current.scrollLeft = mouseCoords.current.scrollLeft - walkX;
  };

  // const handleOnPointerDown = (e: React.MouseEvent) => {
  //   if (!ref.current) return;

  //   const startX = e.pageX - ref.current.offsetLeft;
  //   const scrollLeft = ref.current.scrollLeft;
  //   mouseCoords.current = { startX, scrollLeft };

  //   setIsPointerDown(true);

  //   console.log(startX, scrollLeft);
  // };

  // const handleOnPointerMove = (e: React.MouseEvent) => {
  //   if (!ref.current) return;
  //   if (!isPointerDown) return;
  //   e.preventDefault();

  //   const x = e.pageX - ref.current.offsetLeft;
  //   const walkX = x - mouseCoords.current.startX;
  //   ref.current.scrollLeft = mouseCoords.current.scrollLeft - walkX;

  //   console.log(x, walkX);
  // };

  // const handleOnPointerUp = () => {
  //   setIsPointerDown(false);
  // };

  return (
    <div
      className="control-row"
      ref={ref}
      onTouchStart={handleOnTouchStart}
      onTouchMove={handleOnTouchMove}
      // onPointerDown={handleOnPointerDown}
      // onPointerMove={handleOnPointerMove}
      // onPointerUp={handleOnPointerUp}
    >
      {children}
    </div>
  );
}

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

  const removeFilterTerm = (term: string) => {
    dispatchFilter({ group: "brandName", key: term, visible: false });
  };

  return (
    <div className="control-bar">
      <DraggableRow>
        {filterState.brandName.map((filterTerm) => (
          <FilterPill key={filterTerm} term={filterTerm} removeFilterTerm={removeFilterTerm} />
        ))}
        {Sources.map((source) => (
          <SourcePill
            key={source}
            source={source}
            filterState={filterState}
            dispatchFilter={dispatchFilter}
          />
        ))}
      </DraggableRow>

      <div className="control-row">
        <SearchBar
          places={places}
          expand={expandControl == Control.Search}
          setActivePlace={setActivePlace}
          setExpand={(b: boolean) => setExpandControl(b ? Control.Search : Control.None)}
        />
      </div>

      <div className="control-row">
        <FilterBar
          options={[...new Set(Array.from(products.values()).map(({ brandName }) => brandName))]}
          filterTerms={filterState.brandName}
          expand={expandControl == Control.Filter}
          dispatchFilter={dispatchFilter}
          setExpand={(b: boolean) => setExpandControl(b ? Control.Filter : Control.None)}
        />
      </div>
    </div>
  );
}
