import Clock from "../assets/clock.svg";
import Globe from "../assets/globe.svg";
import Location from "../assets/location.svg";
import Phone from "../assets/phone.svg";
import { OpeningLabels, OpeningStatus, ProductTypes, Weekdays } from "../const";
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

function formatEntries(activeEntries: Entry[] | undefined, products: Map<number, Product>) {
  if (!activeEntries) return <p>Noch keine Preise verfügbar.</p>;

  const entrySorter = (ea: Entry, eb: Entry) => {
    const pa = products.get(ea.productId)!.productType;
    const pb = products.get(eb.productId)!.productType;
    return ProductTypes.indexOf(pa) - ProductTypes.indexOf(pb);
  };

  return (
    <div className="info-element">
      <table>
        <tbody>
          {activeEntries.sort(entrySorter).map((e, i) => {
            const p = products.get(e.productId)!;
            return (
              <tr key={i}>
                <td>{p.brandName || p.productName}</td>
                <td>{p.brandName ? p.productName : ""}</td>
                <td>{formatVolume(e.volume)}</td>
                <td>{formatPrice(e.price)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
