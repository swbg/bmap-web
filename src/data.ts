import Papa from "papaparse";
import { Entry, POI, POIJSON, Place, PlaceJSON, Product } from "./types";

export async function fetchData(path: string) {
  try {
    const res = await fetch(path);
    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }
    return await res.text();
  } catch (err) {
    console.log((err as Error).message);
  }
}

export function parseEntries(csvString: string) {
  type T = (Entry & { placeId: number })[];
  const parsed = Papa.parse(csvString, {
    header: true,
    transform: (v: string, header: string) => {
      if (["placeId", "productId", "price", "volume"].indexOf(header) >= 0) return Number(v);
      return v;
    },
  }).data as T;

  const entries = new Map<number, Entry[]>();
  parsed.forEach(({ placeId, ...entry }) => {
    if (entries.has(placeId)) {
      entries.get(placeId)!.push(entry);
    } else {
      entries.set(placeId, [entry]);
    }
  });
  return entries;
}

function getPriceRating(entries: Entry[] | undefined) {
  if (entries === undefined) {
    return undefined;
  }
  const tmp = entries.filter((v) => v.volume > 0).map((v) => (0.5 * v.price) / v.volume);
  if (tmp.length > 0) {
    return tmp.reduce((acc, v) => (v < acc ? v : acc), 1);
  }
  return undefined;
}

export function parsePlaces(csvString: string, entries: Map<number, Entry[]>) {
  const parsed = Papa.parse(csvString, {
    header: true,
    transform: (v: string, header: string) => {
      if (["lon", "lat", "placeId"].indexOf(header) >= 0) return Number(v);
      return v;
    },
  }).data as Place[];

  const places = new Map<number, PlaceJSON>();
  parsed.forEach(({ placeId, lon, lat, ...place }) => {
    places.set(placeId, {
      type: "Feature",
      id: placeId,
      geometry: {
        type: "Point",
        coordinates: [lon, lat],
      },
      properties: { ...place, priceRating: getPriceRating(entries.get(placeId)) },
    });
  });
  return places;
}

export function parseProducts(csvString: string) {
  type T = (Product & { productId: number })[];
  const parsed = Papa.parse(csvString, {
    header: true,
    transform: (v: string, header: string) => {
      if (header === "productId") return Number(v);
      return v;
    },
  }).data as T;

  const products = new Map<number, Product>();
  parsed.forEach(({ productId, ...product }) => {
    if (products.has(productId)) {
      throw new Error(`Duplicate 'productId' ${productId}`);
    } else {
      products.set(productId, product);
    }
  });
  return products;
}

export function parsePOIs(csvString: string) {
  const parsed = Papa.parse(csvString, {
    header: true,
    transform: (v: string, header: string) => {
      if (["lon", "lat"].indexOf(header) >= 0) return Number(v);
      return v;
    },
  }).data as POI[];

  const pois = new Map<number, POIJSON>();
  parsed.forEach(({ lat, lon, ...poi }, idx) => {
    pois.set(idx, {
      type: "Feature",
      id: idx,
      geometry: {
        type: "Point",
        coordinates: [lon, lat],
      },
      properties: poi,
    } as POIJSON);
  });
  return pois;
}
