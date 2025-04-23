import { Entry, PlaceJSON, Product } from "../types";
import { formatPrice } from "../utils";

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
  if (activeEntries === undefined) return;

  return (
    <div className="info-panel">
      <div className="info-row">
        <p>{activePlace.properties.placeName}</p>
        <div className="info-close" onClick={unsetActivePlace}>
          X
        </div>
      </div>
      <p>{activePlace.properties.address}</p>
      <p>{activePlace.properties.website}</p>
      <ul>
        {activeEntries.map((e, i) => (
          <li key={i}>
            {formatPrice(e.price)} {products.get(e.productId)!.brandName}{" "}
            {products.get(e.productId)!.productName}
          </li>
        ))}
      </ul>
    </div>
  );
}
