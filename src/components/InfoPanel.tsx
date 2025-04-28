import Cross from "../assets/cross.svg";
import { Entry, PlaceJSON, Product } from "../types";
import { formatPhone, formatPrice } from "../utils";

export default function InfoPanel({
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
          <a href={`https://www.google.com/maps/place/${encodeURIComponent(p.address)}/`}>
            {p.address}
          </a>
        </p>
      )}
      {p.phone && <p>{formatPhone(p.phone)}</p>}
      {p.website && (
        <p>
          <a href={`"${p.website}"`}>{p.website}</a>
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
