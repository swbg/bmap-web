import Clock from "../assets/clock.svg";
import Globe from "../assets/globe.svg";
import Location from "../assets/location.svg";
import Phone from "../assets/phone.svg";
import { PRODUCT_TYPES } from "../const";
import { Entry, Place, Product } from "../types";
import { formatPrice, formatVolume } from "../utils";
import { CloseButton } from "./Buttons";

function showOptional(value: string | undefined) {
  return value && <p>{value}</p>;
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

  const breakify = (s: string) => {
    const l = s.split("Uhr ");
    return l.reduce<JSX.Element[]>((acc, e, i) => {
      if (i < l.length - 1) {
        return [...acc, <span key={2 * i}>{e + "Uhr"}</span>, <br key={2 * i + 1} />];
      } else {
        return [...acc, <span key={2 * i}>{e}</span>];
      }
    }, []);
  };

  return (
    <p className="info-element">
      <img src={Clock} />
      <div>{breakify(hours)}</div>
    </p>
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
  const entrySorter = (ea: Entry, eb: Entry) => {
    const pa = products.get(ea.productId)!.productType;
    const pb = products.get(eb.productId)!.productType;
    return PRODUCT_TYPES.indexOf(pa) - PRODUCT_TYPES.indexOf(pb);
  };

  return (
    <div className="info-panel">
      <CloseButton onClick={unsetActivePlace} />
      <h3>{activePlace.placeName}</h3>
      {showOptional(activePlace.placeType)}
      {googlifyAddress(activePlace.address)}
      {formatPhone(activePlace.phone)}
      {formatWebsite(activePlace.website)}
      {activeEntries ? (
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
      ) : (
        <p>Noch keine Preise verfügbar.</p>
      )}
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
      {showOptional(activePlace.placeType)}
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
      <p>{activePlace.note}</p>
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
