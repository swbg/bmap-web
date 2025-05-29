export type Place = {
  placeId: number;
  lat: number;
  lon: number;
  placeName: string;
  placeType: string;
  address: string;
  website: string;
  phone: string;
  note: string;
  closed: boolean;
};

export const placeProperties = [
  "placeId",
  "placeName",
  "placeType",
  "address",
  "website",
  "phone",
  "note",
  "closed",
] as (keyof Place)[];

type GeoJSONPoint = {
  type: "Feature";
  id: number;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
};

export type PlaceFeature = {
  source: string;
  id: number;
};

export type PlaceGeoJSON = GeoJSONPoint & {
  properties: {
    placeId: number;
    placeName: string;
    placeType: string;
    address: string;
    website: string;
    phone: string;
    note: string;
    closed: boolean;
    priceRating: number | undefined;
  };
};

export type Entry = {
  price: number;
  volume: number;
  vomFass: boolean;
  date: string;
  productId: number;
};

export type Product = {
  brandName: string;
  productName: string;
  productType: string;
};
