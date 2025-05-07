export type Place = {
  placeName: string;
  address: string;
  district: string;
  picture: boolean;
  placeType: string;
  website: string;
  phone: string;
  lat: number;
  lon: number;
  closed: boolean;
  placeId: number;
};

export const placeProperties = [
  "placeName",
  "address",
  "district",
  "picture",
  "placeType",
  "website",
  "phone",
  "closed",
  "placeId",
] as (keyof Place)[];

type GeoJSONPoint = {
  type: "Feature";
  id: number;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
};

export type PlaceJSON = GeoJSONPoint & {
  properties: {
    placeName: string;
    address: string;
    district: string;
    picture: boolean;
    placeType: string;
    website: string;
    phone: string;
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

export type POI = {
  lat: number;
  lon: number;
  placeName: string;
  placeType: string;
  note: string;
  source: string;
};

export type POIJSON = GeoJSONPoint & {
  properties: {
    placeName: string;
    placeType: string;
    note: string;
    source: string;
  };
};
