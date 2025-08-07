import { useMemo, useState } from "react";
import { Place, PlaceFeature } from "../types";
import { normalizeString } from "../utils";
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
    } else {
      setSuggestions([]);
    }
  };

  if (!expand) {
    return <SearchButton onClick={() => setExpand(true)} />;
  }
  return (
    <div className="search-bar">
      <CloseButton onClick={() => setExpand(false)} />
      <input
        autoFocus
        placeholder="Einen Ort suchen..."
        value={searchTerm}
        onChange={handleOnChange}
      />
      <Suggestions places={suggestions} setActivePlace={setActivePlace} />
    </div>
  );
}
