import Bag from "../assets/bag.svg";
import Close from "../assets/close.svg";
import Drop from "../assets/drop.svg";
import Filter from "../assets/filter.svg";
import MarkerCircle from "../assets/marker-circle-flush.svg";
import Search from "../assets/search.svg";
import { FilterAction, FilterState, Source } from "../types";

export function CloseButton({ onClick }: { onClick: React.MouseEventHandler<HTMLDivElement> }) {
  return (
    <div className="close-button" onClick={onClick}>
      <img src={Close} />
    </div>
  );
}

export function SearchButton({ onClick }: { onClick: React.MouseEventHandler<HTMLDivElement> }) {
  return (
    <div className="control-button" onClick={onClick}>
      <img src={Search} />
    </div>
  );
}

export function LegendButton({
  source,
  filterState,
  dispatchFilter,
}: {
  source: Source;
  filterState: FilterState;
  dispatchFilter: React.Dispatch<FilterAction>;
}) {
  const [image, label] =
    source === "circle"
      ? [MarkerCircle, "Bars"]
      : source === "drop"
        ? [Drop, "Wasser"]
        : [Bag, "Kiosks"];

  return (
    <div
      className={`control-button legend-button ${filterState.source[source] ? "" : "grayscale"}`}
      onClick={() =>
        dispatchFilter({ group: "source", key: source, visible: !filterState.source[source] })
      }
    >
      <img src={image} />
      <span>{label}</span>
    </div>
  );
}

export function FilterButton({ onClick }: { onClick: React.MouseEventHandler<HTMLDivElement> }) {
  return (
    <div className="control-button filter-button" onClick={onClick}>
      <img src={Filter} />
    </div>
  );
}
