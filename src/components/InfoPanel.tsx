import Clock from "../assets/clock.svg";
import Globe from "../assets/globe.svg";
import Location from "../assets/location.svg";
import Phone from "../assets/phone.svg";
import { OPENING_TIME_LABELS, OPENING_TIME_STATUS, PRODUCT_TYPES, WEEKDAY } from "../const";
import { Entry, OpeningTimeStatus, Place, Product } from "../types";
import { formatPrice, formatVolume } from "../utils";
import { CloseButton } from "./Buttons";

function formatPlaceType(placeType: string | undefined) {
  if (!placeType) return "";

  return <p className="info-subtitle">{placeType}</p>;
}

function googlifyAddress(address: string | undefined) {
  if (!address) return "";

  return (
    <p className="info-element">
      <img src={Location} />
      <a target="_blank" href={`https://www.google.com/maps/place/${encodeURIComponent(address)}/`}>
        {address}
      </a>
    </p>
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
    <p className="info-element">
      <img src={Phone} />
      <a className="a-phone" href={`tel:${phone}`}>
        {p}
      </a>
    </p>
  );
}

function formatWebsite(website: string | undefined) {
  if (!website) return "";

  return (
    <p className="info-element">
      <img src={Globe} />
      <a target="_blank" href={website}>
        {website}
      </a>
    </p>
  );
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
    <p className="info-element">
      <img src={Clock} />
      <div>
        {openingStatus == "unknown" ? (
          // Fallback if 24/7 open
          <div className="opening-hour-panel open">{breakify(hours)}</div>
        ) : (
          <>
            <div className={`opening-hour-panel ${openingStatus}`}>
              {OPENING_TIME_LABELS[openingStatus]}
            </div>
            <br />
            {breakify(hours)}
          </>
        )}
      </div>
    </p>
  );
}

function getOpeningStatus(hours: string): OpeningTimeStatus {
  const now = new Date();
  const berlinNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const currentDay = WEEKDAY[berlinNow.getDay()];
  const currentMinutes = berlinNow.getHours() * 60 + berlinNow.getMinutes();

  const dayRegex = new RegExp(`${currentDay}:\\s*(\\d{1,2}:\\d{2})-(\\d{1,2}:\\d{2})`);
  const match = hours.match(dayRegex);
  if (!match) return OPENING_TIME_STATUS.unknown;

  const [_, startStr, endStr] = match;
  const [startMins, endMins] = [startStr, endStr].map((t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  });

  const isOpen =
    endMins < startMins
      ? currentMinutes >= startMins || currentMinutes <= endMins
      : currentMinutes >= startMins && currentMinutes <= endMins;

  return isOpen ? OPENING_TIME_STATUS.open : OPENING_TIME_STATUS.closed;
}

function sortEntriesByProductType(
  entries: Entry[],
  products: Map<number, Product>,
  typeOrder: string[],
) {
  return [...entries].sort((a, b) => {
    const productA = products.get(a.productId);
    const productB = products.get(b.productId);

    if (!productA || !productB) return 0;

    const indexA = typeOrder.indexOf(productA.productType);
    const indexB = typeOrder.indexOf(productB.productType);

    return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
  });
}

function formatEntries(activeEntries: Entry[] | undefined, products: Map<number, Product>) {
  if (!activeEntries || activeEntries.length === 0) {
    return <p>Noch keine Preise verfügbar.</p>;
  }

  const sorted = sortEntriesByProductType(activeEntries, products, PRODUCT_TYPES);

  const grouped = new Map<string, Entry[]>();

  // Group by brand or fallback to product name
  for (const entry of sorted) {
    const product = products.get(entry.productId)!;
    const key = product.brandName || product.productName;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  const renderRow = (
    name: string,
    volume: string,
    price: string,
    options?: { indent?: boolean; bold?: boolean },
    key?: string,
  ) => (
    <tr key={key}>
      <td style={{ paddingLeft: options?.indent ? "1em" : 0 }}>
        {options?.bold ? <strong>{name}</strong> : name}
      </td>
      <td style={{ textAlign: "right" }}>{volume}</td>
      <td style={{ textAlign: "right" }}>{price}</td>
    </tr>
  );

  const rows: React.ReactNode[] = [];

  [...grouped.entries()].forEach(([groupKey, entries], index) => {
    const firstEntry = entries[0];
    const product = products.get(firstEntry.productId)!;

    // Spacer row between blocks
    if (index > 0) {
      rows.push(
        <tr key={`spacer-${index}`}>
          <td colSpan={3} style={{ height: "0.5em" }} />
        </tr>,
      );
    }

    if (entries.length === 1) {
      // Single entry → show full info in one line
      const entry = entries[0];
      const name =
        product.brandName && product.productName
          ? `${product.brandName} ${product.productName}`
          : product.productName;

      rows.push(
        renderRow(
          name,
          formatVolume(entry.volume),
          formatPrice(entry.price),
          { bold: true },
          `single-${index}`,
        ),
      );
    } else {
      // Grouped brand with heading + indented product rows (e.g multiple entries for a beer brand)
      rows.push(
        <tr key={`header-${index}`}>
          <td colSpan={3}>
            <strong>{groupKey}</strong>
          </td>
        </tr>,
      );

      entries.forEach((entry, i) => {
        const p = products.get(entry.productId)!;
        rows.push(
          renderRow(
            p.productName,
            formatVolume(entry.volume),
            formatPrice(entry.price),
            { indent: true },
            `entry-${groupKey}-${i}`,
          ),
        );
      });
    }
  });

  return (
    <table>
      <tbody>{rows}</tbody>
    </table>
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
      {formatEntries(activeEntries, products)}
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
      <div className="info-divider" />
      {activePlace.note && <p>{activePlace.note}</p>}
      <p>{source}</p>
    </div>
  );
}

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
