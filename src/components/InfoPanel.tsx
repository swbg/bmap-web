import React from "react";
import Clock from "../assets/clock.svg";
import Globe from "../assets/globe.svg";
import Location from "../assets/location.svg";
import Phone from "../assets/phone.svg";
import {
  OpeningLabels,
  OpeningStatus,
  ProductTypes,
  Weekdays,
  labelCategoryFurtherDrinks,
  labelFurther,
  labelNoPrices,
  labelNonAlcoholic,
} from "../const";
import { Entry, Place, Product } from "../types";
import { formatPrice, formatVolume } from "../utils";
import { CloseButton } from "./Buttons";

function formatPlaceType(placeType: string | undefined) {
  if (!placeType) return "";

  return <p className="info-subtitle">{placeType}</p>;
}

function googlifyAddress(address: string | undefined) {
  if (!address) return "";

  return (
    <div className="info-element">
      <img src={Location} />
      <a target="_blank" href={`https://www.google.com/maps/place/${encodeURIComponent(address)}/`}>
        {address}
      </a>
    </div>
  );
}

function formatPhone(phone: string | undefined) {
  if (!phone) return "";

  let p;
  if (phone.slice(0, 3) === "089") {
    p = "089 " + phone.slice(3);
  }
  if (phone.slice(0, 2) === "01") {
    p = phone.slice(0, 4) + " " + phone.slice(4);
  }
  return (
    <div className="info-element">
      <img src={Phone} />
      <a className="a-phone" href={`tel:${phone}`}>
        {p}
      </a>
    </div>
  );
}

function formatWebsite(website: string | undefined) {
  if (!website) return "";

  return (
    <div className="info-element">
      <img src={Globe} />
      <a target="_blank" href={website}>
        {website}
      </a>
    </div>
  );
}

/* -------------------------  Gastro Panel ------------------------- */

// Sort entries per location by productType to get groups
function sortEntriesByProductType(
  entries: Entry[],
  products: Map<number, Product>,
  typeOrder: string[],
) {
  const typePriority = new Map<string, number>(typeOrder.map((type, i) => [type, i]));

  return [...entries].sort((a, b) => {
    const productA = products.get(a.productId);
    const productB = products.get(b.productId);
    if (!productA || !productB) return 0;

    const idxA = typePriority.get(productA.productType) ?? Infinity;
    const idxB = typePriority.get(productB.productType) ?? Infinity;

    return idxA - idxB;
  });
}
// Get entries belongs to Weinschorle, Spritz or Non alcohol Spritz
function isCategoryFurtherDrinks(product: Product): boolean {
  const nameLower = product.productName.toLowerCase();
  return labelCategoryFurtherDrinks.some((token) => nameLower.includes(token.toLowerCase()));
}

// Reneder product name, style non-alcoholic string
function renderProductName(name: string): React.ReactNode[] {
  return name.split(labelNonAlcoholic).flatMap((part, i, arr) => [
    part,
    ...(i < arr.length - 1
      ? [
          <span key={`alko-${i}`} className="info_small_panel_text">
            {labelNonAlcoholic}
          </span>,
        ]
      : []),
  ]);
}

function renderBrandRow(brand: string, index: number) {
  return (
    <div key={`brand-${index}`} className="info_brand-row">
      <div className="info_brand">{brand}</div>
    </div>
  );
}

function renderProductRow(entry: Entry, product: Product, groupKey: string, i: number) {
  const isFurther = groupKey === labelFurther;

  return (
    <div key={`entry-${groupKey}-${i}`} className="info_menu-row info_product-row indent">
      <div className="info_product">{renderProductName(product.productName)}</div>
      <div className="info_volume">{formatVolume(entry.volume)}</div>
      <div className="info_price">
        {isFurther && <span className="info_small_panel_text">ab</span>}
        <span className="price-value">{formatPrice(entry.price)}</span>
      </div>
    </div>
  );
}

/* Format main tabel for the drink entries in the info panel*/
export function formatDrinkEntries(
  activeEntries: Entry[] | undefined,
  products: Map<number, Product>,
) {
  if (!activeEntries || activeEntries.length === 0) {
    return <p className="info_product">{labelNoPrices} 😕</p>;
  }

  // Sort entries once by product type
  const sortedEntries = sortEntriesByProductType(activeEntries, products, [...ProductTypes]);

  // Group entries by brand or as "further"
  const groupedEntries = new Map<string, Entry[]>();
  const furtherEntries: Entry[] = [];

  for (const entry of sortedEntries) {
    const product = products.get(entry.productId);
    if (!product) continue;

    if (isCategoryFurtherDrinks(product)) {
      furtherEntries.push(entry);
    } else {
      const brandKey = product.brandName || product.productName || "Unbekannt";
      if (!groupedEntries.has(brandKey)) groupedEntries.set(brandKey, []);
      groupedEntries.get(brandKey)!.push(entry);
    }
  }

  if (furtherEntries.length) groupedEntries.set(labelFurther, furtherEntries);

  return (
    <div className="info_menu">
      {Array.from(groupedEntries.entries()).flatMap(([brand, entries], groupIndex) => [
        renderBrandRow(brand, groupIndex),
        ...entries.map((entry, i) => {
          const product = products.get(entry.productId)!;
          return renderProductRow(entry, product, brand, i);
        }),
      ])}
    </div>
  );
}

function GastroPanel({
  activePlace,
  activeEntries,
  products,
  unsetActivePlace,
}: {
  activePlace: Place;
  activeEntries: Entry[] | undefined;
  products: Map<number, Product>;
  unsetActivePlace: () => void;
}) {
  return (
    <div className="info-panel">
      <CloseButton onClick={unsetActivePlace} />
      <h3>{activePlace.placeName}</h3>
      {formatPlaceType(activePlace.placeType)}
      <div className="info-divider" />
      {googlifyAddress(activePlace.address)}
      {formatPhone(activePlace.phone)}
      {formatWebsite(activePlace.website)}
      {formatDrinkEntries(activeEntries, products)}
    </div>
  );
}

/* -------------------------  Kiosk Panel ------------------------- */

function getOpeningStatus(hours: string): OpeningStatus {
  const now = new Date();
  const berlinNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const currentDay = Weekdays[berlinNow.getDay()];
  const currentMinutes = berlinNow.getHours() * 60 + berlinNow.getMinutes();

  const dayRegex = new RegExp(`${currentDay}:\\s*(\\d{1,2}:\\d{2})-(\\d{1,2}:\\d{2})`);
  const match = hours.match(dayRegex);
  if (!match) return OpeningStatus.Unknown;

  const [_, startStr, endStr] = match;
  const [startMins, endMins] = [startStr, endStr].map((t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  });

  const isOpen =
    endMins < startMins
      ? currentMinutes >= startMins || currentMinutes <= endMins
      : currentMinutes >= startMins && currentMinutes <= endMins;

  return isOpen ? OpeningStatus.Open : OpeningStatus.Closed;
}

function formatHours(hours: string | undefined) {
  if (!hours) return "";

  const openingStatus = getOpeningStatus(hours);

  const breakify = (s: string) => {
    const l = s.trim().split("Uhr ");
    if (l.length == 1) {
      return <span>{l[0]}</span>;
    }
    return (
      <table>
        <tbody>
          {l.map((e, i) => {
            const [day, hours] = e.split(": ");
            return (
              <tr key={i}>
                <td>{day}</td>
                <td>{i < l.length - 1 ? hours + "Uhr" : hours}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="info-element">
      <img src={Clock} />
      <div>
        {openingStatus === OpeningStatus.Unknown ? (
          // Fallback if 24/7 open
          <div className="opening-hour-panel open">{breakify(hours)}</div>
        ) : (
          <>
            <div className={`opening-hour-panel ${openingStatus}`}>
              {OpeningLabels[openingStatus]}
            </div>
            {breakify(hours)}
          </>
        )}
      </div>
    </div>
  );
}

function KioskPanel({
  activePlace,
  unsetActivePlace,
}: {
  activePlace: Place;
  unsetActivePlace: () => void;
}) {
  return (
    <div className="info-panel">
      <CloseButton onClick={unsetActivePlace} />
      <h3>{activePlace.placeName}</h3>
      {formatPlaceType(activePlace.placeType)}
      <div className="info-divider" />
      {googlifyAddress(activePlace.address)}
      {formatHours(activePlace.note)}
    </div>
  );
}

/* -------------------------  Trinkbrunnen Panel ------------------------- */

function GenericPanel({
  activePlace,
  unsetActivePlace,
}: {
  activePlace: Place;
  unsetActivePlace: () => void;
}) {
  let source = "";

  if (activePlace.placeType == "Trinkbrunnen") {
    source = "dl-de/by-2-0: Landeshauptstadt München - opendata.muenchen.de";
  }

  return (
    <div className="info-panel">
      <CloseButton onClick={unsetActivePlace} />
      <h3>{activePlace.placeName}</h3>
      {formatPlaceType(activePlace.placeType)}
      <div className="info-divider" />
      {activePlace.note && <div className="info-element">{activePlace.note}</div>}
      <div className="info-element">{source}</div>
    </div>
  );
}

/* -------------------------  Main  ------------------------- */

export default function InfoPanel({
  activePlace,
  activeEntries,
  products,
  unsetActivePlace,
}: {
  activePlace: Place;
  activeEntries: Entry[] | undefined;
  products: Map<number, Product>;
  unsetActivePlace: () => void;
}) {
  if (activePlace.source === "drop") {
    return <GenericPanel activePlace={activePlace} unsetActivePlace={unsetActivePlace} />;
  }
  if (activePlace.source === "bag") {
    return <KioskPanel activePlace={activePlace} unsetActivePlace={unsetActivePlace} />;
  }
  return (
    <GastroPanel
      activePlace={activePlace}
      activeEntries={activeEntries}
      products={products}
      unsetActivePlace={unsetActivePlace}
    />
  );
}
