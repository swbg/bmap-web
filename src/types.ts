import { BrandNames, ProductTypes, Sources } from "./const";

export type Source = (typeof Sources)[number];
export type ProductType = (typeof ProductTypes)[number];
export type BrandName = (typeof BrandNames)[number];

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
  productType: (typeof ProductTypes)[number];
};

export type FilterState = {
  source: { [key in (typeof Sources)[number]]: boolean };
  brandName: { [key in (typeof BrandNames)[number]]: boolean };
};

export type FilterAction = {
  group: keyof FilterState;
  key: (typeof BrandNames)[number] | (typeof Sources)[number];
  visible: boolean;
};
