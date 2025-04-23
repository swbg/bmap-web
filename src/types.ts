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

export type PlaceJSON = {
  type: "Feature";
  id: number;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    placeName: string;
    address: string;
    district: string;
    picture: boolean;
    placeType: string;
    website: string;
    phone: string;
    closed: boolean;
    placeId: number;
    priceRating: number;
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
