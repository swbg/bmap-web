import { useMemo, useState } from "react";
import { Place, PlaceFeature } from "../types";
import { CloseButton, SearchButton } from "./Buttons";

function Suggestions({
  places,
  setActivePlace,
}: {
  places: Place[];
  setActivePlace: (newPlace: PlaceFeature | undefined) => void;
}) {
  return (
    <div className="suggestions">
      {places.map((place) => (
        <a
          onClick={() => setActivePlace({ source: place.source, id: place.placeId })}
          key={place.placeId}
        >
          {place.placeName}
        </a>
      ))}
    </div>
  );
}

const normalizeString = (s: string) => {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export default function SearchBar({
  places,
  expand,
  setActivePlace,
  setExpand,
}: {
  places: Map<number, Place>;
  expand: boolean;
  setActivePlace: (newPlace: PlaceFeature | undefined) => void;
  setExpand: (b: boolean) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Place[]>([]);

  const normalizedPlaces = useMemo(
    () =>
      Array.from(places.values()).map((place) => ({
        placeId: place.placeId,
        placeName: normalizeString(place.placeName),
      })),
    [places],
  );

  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);

    const value = normalizeString(e.target.value);
    if (value.length >= 3) {
      setSuggestions(
        normalizedPlaces
          .filter(({ placeName }) => placeName.includes(value))
          .slice(0, 10)
          .map(({ placeId }) => places.get(placeId)!),
      );
    }
  };

  if (!expand) {
    return <SearchButton onClick={() => setExpand(true)} />;
  }
  return (
    <div className="search-bar">
      <CloseButton onClick={() => setExpand(false)} />
      <form method="post" onSubmit={handleOnSubmit}>
        <input autoFocus placeholder="Suchen..." value={searchTerm} onChange={handleOnChange} />
        <Suggestions places={suggestions} setActivePlace={setActivePlace} />
      </form>
    </div>
  );
}
