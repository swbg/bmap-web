import Bag from "../assets/bag.svg";
import Close from "../assets/close.svg";
import Drop from "../assets/drop.svg";
import MarkerCircle from "../assets/marker-circle-flush.svg";
import { FilterAction, FilterState, Source } from "../types";

function getImageLabel(source: Source) {
  if (source == "circle") return [MarkerCircle, "Gastro"];
  if (source == "bag") return [Bag, "Kiosks"];
  return [Drop, "Wasser"];
}

export function SourcePill({
  source,
  filterState,
  dispatchFilter,
}: {
  source: Source;
  filterState: FilterState;
  dispatchFilter: React.Dispatch<FilterAction>;
}) {
  const [image, label] = getImageLabel(source);

  const handleOnChange = (key: Source, visible: boolean) => {
    dispatchFilter({
      group: "source",
      key,
      visible,
    });
  };

  return (
    <div
      className={`filter-pill source-pill ${filterState.source[source] || "disabled"}`}
      key={source}
      onClick={() => handleOnChange(source, !filterState.source[source])}
    >
      {label}
      <img src={image} />
    </div>
  );
}

export function FilterPill({
  term,
  removeFilterTerm,
}: {
  term: string;
  removeFilterTerm: (term: string) => void;
}) {
  return (
    <div className="filter-pill" onClick={() => removeFilterTerm(term)}>
      {term}
      <div className="filter-close">
        <img src={Close} />
      </div>
    </div>
  );
}
