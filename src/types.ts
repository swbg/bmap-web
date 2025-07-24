import { BRAND_NAMES, OPENING_TIME_STATUS, PRODUCT_TYPES } from "./const";

export type Source = "circle" | "drop" | "bag";

export type Weekday =
  | "Sonntag"
  | "Montag"
  | "Dienstag"
  | "Mittwoch"
  | "Donnerstag"
  | "Freitag"
  | "Samstag";

export type OpenStatus = (typeof OPENING_TIME_STATUS)[keyof typeof OPENING_TIME_STATUS];

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
  productType: (typeof PRODUCT_TYPES)[number];
};

export type VisibilityState = {
  circle: boolean;
  drop: boolean;
  bag: boolean;
};

export type VisibilityAction = {
  source: Source;
  visible: boolean;
};

export type FilterState = {
  [key: (typeof BRAND_NAMES)[number]]: boolean;
};

export type FilterAction = {
  key: (typeof BRAND_NAMES)[number];
  active: boolean;
};
