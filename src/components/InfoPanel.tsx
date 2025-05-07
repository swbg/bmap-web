import Cross from "../assets/cross.svg";
import { getSource } from "../control";
import { Entry, POIJSON, PlaceJSON, Product } from "../types";
import { formatPhone, formatPrice } from "../utils";

function PlacePanel({
  activePlace,
  activeEntries,
  products,
  unsetActivePlace,
}: {
  activePlace: PlaceJSON;
  activeEntries: Entry[] | undefined;
  products: Map<number, Product>;
  unsetActivePlace: () => void;
}) {
  const p = activePlace.properties;
  return (
    <div className="info-panel">
      <div className="info-close" onClick={unsetActivePlace}>
        <img src={Cross} />
      </div>
      <h3>{p.placeName}</h3>
      {p.address && (
        <p>
          <a
            target="_blank"
            href={`https://www.google.com/maps/place/${encodeURIComponent(p.address)}/`}
          >
            {p.address}
          </a>
        </p>
      )}
      {p.phone && <p>{formatPhone(p.phone)}</p>}
      {p.website && (
        <p>
          <a target="_blank" href={p.website}>
            {p.website}
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

function POIPanel({
  activePlace,
  unsetActivePlace,
}: {
  activePlace: POIJSON;
  unsetActivePlace: () => void;
}) {
  const p = activePlace.properties;
  return (
    <div className="info-panel">
      <div className="info-close" onClick={unsetActivePlace}>
        <img src={Cross} />
      </div>
      <h3>{p.placeName}</h3>
      <p>{p.note}</p>
      <p>{p.source}</p>
    </div>
  );
}

export default function InfoPanel({
  activePlace,
  activeEntries,
  products,
  unsetActivePlace,
}: {
  activePlace: PlaceJSON | POIJSON;
  activeEntries: Entry[] | undefined;
  products: Map<number, Product>;
  unsetActivePlace: () => void;
}) {
  if (getSource(activePlace) === "drinking-fountains") {
    return <POIPanel activePlace={activePlace as POIJSON} unsetActivePlace={unsetActivePlace} />;
  } else {
    return (
      <PlacePanel
        activePlace={activePlace as PlaceJSON}
        activeEntries={activeEntries}
        products={products}
        unsetActivePlace={unsetActivePlace}
      />
    );
  }
}
