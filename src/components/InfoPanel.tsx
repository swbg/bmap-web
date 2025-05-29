import { Entry, Place, Product } from "../types";
import { getSource } from "../utils";
import { formatPhone, formatPrice } from "../utils";
import { CloseButton } from "./Buttons";

function showOptional(value: string | undefined) {
  return value && <p>{value}</p>;
}

function googlifyAddress(address: string | undefined) {
  return (
    address && (
      <p>
        <a
          target="_blank"
          href={`https://www.google.com/maps/place/${encodeURIComponent(address)}/`}
        >
          {address}
        </a>
      </p>
    )
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
      {showOptional(activePlace.placeType)}
      {googlifyAddress(activePlace.address)}
      {activePlace.phone && <p>{formatPhone(activePlace.phone)}</p>}
      {activePlace.website && (
        <p>
          <a target="_blank" href={activePlace.website}>
            {activePlace.website}
          </a>
        </p>
      )}
      {activeEntries ? (
        <table>
          <tbody>
            {activeEntries.map((e, i) => (
              <tr key={i}>
                <td>
                  {products.get(e.productId)!.brandName} {products.get(e.productId)!.productName}
                </td>
                <td>{formatPrice(e.price)}</td>
              </tr>
            ))}
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
    <div className="info-panel">
      <CloseButton onClick={unsetActivePlace} />
      <h3>{activePlace.placeName}</h3>
      {showOptional(activePlace.placeType)}
      {googlifyAddress(activePlace.address)}
      {activePlace.note && <p>{breakify(activePlace.note)}</p>}
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
  if (getSource(activePlace) === "drop") {
    return <GenericPanel activePlace={activePlace} unsetActivePlace={unsetActivePlace} />;
  }
  if (getSource(activePlace) === "bag") {
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
