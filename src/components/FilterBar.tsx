import React, { useMemo, useState } from "react";
import { FilterAction } from "../types";
import { normalizeString } from "../utils";
import { CloseButton, FilterButton } from "./Buttons";

function Suggestions({
  suggestions,
  addFilterTerm,
}: {
  suggestions: string[];
  addFilterTerm: (term: string) => void;
}) {
  return (
    <div className="suggestions">
      {suggestions.map((suggestion) => (
        <a onClick={() => addFilterTerm(suggestion)} key={suggestion}>
          {suggestion}
        </a>
      ))}
    </div>
  );
}

export default function FilterBar({
  options,
  filterTerms,
  expand,
  dispatchFilter,
  setExpand,
}: {
  options: string[];
  filterTerms: string[];
  expand: boolean;
  dispatchFilter: React.Dispatch<FilterAction>;
  setExpand: (b: boolean) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const normalizedTerms = useMemo(
    () =>
      options.map((option) => ({
        displayTerm: option,
        normalizedTerm: normalizeString(option),
      })),
    [options],
  );

  const addFilterTerm = (term: string) => {
    dispatchFilter({ group: "brandName", key: term, visible: true });
    setSearchTerm("");
    setSuggestions([]);
    setExpand(false);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);

    const value = normalizeString(e.target.value);
    if (value.length >= 1) {
      setSuggestions(
        normalizedTerms
          .filter(({ normalizedTerm }) => normalizedTerm.includes(value))
          .slice(0, 10)
          .filter(({ displayTerm }) => !filterTerms.includes(displayTerm))
          .map(({ displayTerm }) => displayTerm),
      );
    } else {
      setSuggestions([]);
    }
  };

  if (!expand) {
    return <FilterButton onClick={() => setExpand(true)} />;
  }

  return (
    <div className="search-bar">
      <CloseButton onClick={() => setExpand(false)} />
      <input
        autoFocus
        placeholder="Nach Brauereien filtern..."
        value={searchTerm}
        onChange={handleOnChange}
      />
      <Suggestions suggestions={suggestions} addFilterTerm={addFilterTerm} />
    </div>
  );
}
