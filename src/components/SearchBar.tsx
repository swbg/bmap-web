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
  setActivePlace,
}: {
  places: Map<number, Place>;
  setActivePlace: (newPlace: PlaceFeature | undefined) => void;
}) {
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
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

  if (!showSearchBar) {
    return <SearchButton onClick={() => setShowSearchBar(true)} />;
  }
  return (
    <div className="search-bar">
      <form method="post" onSubmit={handleOnSubmit}>
        <CloseButton onClick={() => setShowSearchBar(false)} />
        <input autoFocus placeholder="Suchen..." value={searchTerm} onChange={handleOnChange} />
        <Suggestions places={suggestions} setActivePlace={setActivePlace} />
      </form>
    </div>
  );
}
