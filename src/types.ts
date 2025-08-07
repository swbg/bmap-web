import { ProductTypes, Sources } from "./const";

export type Source = (typeof Sources)[number];
export type ProductType = (typeof ProductTypes)[number];

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
  validUntil: boolean;
  source: Source;
};

type GeoJSONPoint = {
  type: "Feature";
  id: number;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
};

export type PlaceFeature = {
  source: Source;
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
    validUntil: boolean;
    priceRating: number | undefined;
    brandNames: string[];
  };
};

export type Entry = {
  // indexed by placeId: number;
  productId: number;
  price: number;
  volume: number;
  vomFass: boolean;
  validFrom: string;
  lastUpdate: string;
  validUntil: string;
};

export type Product = {
  // indexed by productId: number;
  brandName: string;
  productName: string;
  productType: (typeof ProductTypes)[number];
};

export type FilterState = {
  source: { [key in (typeof Sources)[number]]: boolean };
  brandName: string[];
};

export type FilterAction = {
  group: keyof FilterState;
  key: (typeof Sources)[number] | string;
  visible: boolean;
};
