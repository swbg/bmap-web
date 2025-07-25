import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useReducer, useRef, useState } from "react";
import { BRAND_NAMES, Colors, SOURCES } from "../const";
import { fetchData, parseEntries, parsePlaces, parseProducts } from "../data";
import { getMarkerLayout, getMarkerPaint } from "../layout";
import { addPlacesSource, makeClickable, makeHoverable } from "../map";
import {
  Entry,
  FilterAction,
  FilterState,
  Place,
  PlaceFeature,
  Product,
  VisibilityAction,
  VisibilityState,
} from "../types";
import { getLocationState } from "../utils";
import ControlBar from "./ControlBar";
import InfoPanel from "./InfoPanel";

export default function BaseMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const center = [11.575892981950567, 48.137836512295905] as [number, number]; // lon, lat
  const zoom = 14;

  const [places, setPlaces] = useState<Map<number, Place> | null>(null);
  const [entries, setEntries] = useState<Map<number, Entry[]> | null>(null);
  const [products, setProducts] = useState<Map<number, Product> | null>(null);

  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  const [hoveredPlace, setHoveredPlace] = useState<PlaceFeature | null>(null);
  const [activePlace, setActivePlace_] = useState<PlaceFeature | undefined>(undefined);

  const defaultVisibility = { circle: true, drop: true, bag: true };
  const visibilityReducer = (state: VisibilityState, action: VisibilityAction) => {
    if (!map.current) return state;
    map.current.setLayoutProperty(
      `${action.source}-markers`,
      "visibility",
      action.visible ? "visible" : "none",
    );
    return { ...state, [action.source]: action.visible };
  };
  const [layerVisibility, dispatchVisibility] = useReducer(visibilityReducer, defaultVisibility);

  const defaultFilter = [...BRAND_NAMES, "Andere"].reduce((acc, k) => ({ ...acc, [k]: true }), {});
  const filterReducer = (state: FilterState, action: FilterAction) => {
    console.log(state, action);
    return { ...state, [action.key]: action.active };
  };
  const [filterState, dispatchFilter] = useReducer(filterReducer, defaultFilter);

  const setActivePlace = (newPlace: PlaceFeature | undefined) => {
    setActivePlace_((activePlace) => {
      if (!map.current) return newPlace;

      if (activePlace) {
        map.current.setFeatureState(activePlace, { selected: false });
        if (!newPlace) history.replaceState(null, "", "/");
      }
      if (newPlace && places?.has(newPlace.id)) {
        const place = places.get(newPlace.id)!;
        map.current.setFeatureState(newPlace, { selected: true });
        history.replaceState(null, "", `/place/${newPlace.id}`);
        dispatchVisibility({ source: newPlace.source, visible: true });
        map.current.flyTo({
          center: [place.lon, place.lat],
          zoom: Math.max(map.current.getZoom(), 15),
          easing: (t) => 1 - Math.pow(1 - t, 5),
        });
      }
      return newPlace;
    });
  };

  useEffect(() => {
    if (!map.current) return;
    if (hoveredPlace !== null) {
      map.current.setFeatureState(hoveredPlace, { hover: true });
      return () => {
        if (!map.current) return;
        map.current.setFeatureState(hoveredPlace, { hover: false });
      };
    }
  }, [map.current, hoveredPlace]);

  useEffect(() => {
    (async () => {
      // Fetch entries
      const csvString = await fetchData("/entries.csv");
      if (!csvString) return;
      setEntries(parseEntries(csvString));
    })();
    (async () => {
      // Fetch products
      const csvString = await fetchData("/products.csv");
      if (!csvString) return;
      setProducts(parseProducts(csvString));
    })();
    (async () => {
      // Fetch places
      const csvString = await fetchData("/places.csv");
      if (!csvString) return;

      const places = parsePlaces(csvString);
      setPlaces(places);
      // console.log("setPlaces", places);
    })();
  }, []);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "/osm_clean.json",
      center: center,
      zoom: zoom,
      minZoom: 12,
      maxZoom: 19,
    });
    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
    );
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    map.current.addControl(geolocate);

    map.current.on("load", () => {
      // geolocate.trigger();
      // Make sure style has loaded before any data is added
      Promise.all(
        ["marker-circle", "marker-drop", "marker-bag"].map((markerName) => {
          const img = new Image(100, 115);
          img.src = `/${markerName}.png`;
          return new Promise((resolve) => {
            img.onload = () => {
              if (!map.current) return;
              map.current.addImage(markerName, img, { sdf: true });
              resolve(0);
            };
          });
        }),
      ).then(() => setIsMapLoaded(true));
    });
  }, [mapContainer.current, center, zoom]);

  useEffect(() => {
    if (!map.current) return;
    if (!isMapLoaded) return;
    if (!places) return;
    if (!entries) return;
    if (!products) return;

    addPlacesSource(map, "circle", places, entries);
    addPlacesSource(map, "drop", places, null);
    addPlacesSource(map, "bag", places, null);

    map.current.addLayer({
      id: "circle-markers",
      source: "circle",
      type: "symbol",
      layout: {
        ...getMarkerLayout("marker-circle"),
        //
        "text-field": ["get", "placeName"],
        "text-font": ["Open Sans Regular"],
        "text-offset": [0, 0],
        "text-anchor": "top",
        "text-line-height": 1.05,
        "text-optional": true,
      },
      paint: {
        ...getMarkerPaint(),
        "icon-color": [
          // TypeScript makes it hard to generate this dynamically
          "case",
          [
            "any",
            ["to-boolean", ["feature-state", "hover"]],
            ["to-boolean", ["feature-state", "selected"]],
          ],
          Colors.MarkerActive,
          ["!", ["to-boolean", ["get", "priceRating"]]],
          Colors.MarkerGrey,
          ["<", ["get", "priceRating"], 0.38],
          Colors.Marker0,
          ["<", ["get", "priceRating"], 0.45],
          Colors.Marker1,
          ["<", ["get", "priceRating"], 0.48],
          Colors.Marker2,
          ["<", ["get", "priceRating"], 0.56],
          Colors.Marker3,
          Colors.Marker4,
        ],
        //
        "text-halo-width": 1.5,
        "text-halo-color": Colors.Halo,
      },
    });
    map.current.addLayer({
      id: "drop-markers",
      source: "drop",
      type: "symbol",
      layout: getMarkerLayout("marker-drop"),
      paint: {
        ...getMarkerPaint(),
        "icon-color": [
          "case",
          [
            "any",
            ["to-boolean", ["feature-state", "hover"]],
            ["to-boolean", ["feature-state", "selected"]],
          ],
          Colors.MarkerActive,
          Colors.MarkerDrop,
        ],
      },
    });
    map.current.addLayer({
      id: "bag-markers",
      source: "bag",
      type: "symbol",
      layout: getMarkerLayout("marker-bag"),
      paint: {
        ...getMarkerPaint(),
        "icon-color": [
          "case",
          [
            "any",
            ["to-boolean", ["feature-state", "hover"]],
            ["to-boolean", ["feature-state", "selected"]],
          ],
          Colors.MarkerActive,
          Colors.MarkerBag,
        ],
      },
    });

    for (const source of SOURCES) {
      makeHoverable(map, source, `${source}-markers`, setHoveredPlace);
      makeClickable(map, source, `${source}-markers`, setActivePlace);
    }

    // Parse window location
    setActivePlace(getLocationState(places));

    return () => {
      if (!map.current) return;
      for (const source of SOURCES) {
        if (map.current.getLayer(`${source}-markers`)) {
          map.current.removeLayer(`${source}-markers`);
        }
        if (map.current.getSource(source)) {
          map.current.removeSource(source);
        }
      }
    };
  }, [map.current, isMapLoaded, places, entries, products]);

  if (!(places && entries && products)) {
    return (
      <div className="map">
        <div className="map-container" ref={mapContainer} />
      </div>
    );
  }

  return (
    <div className="map">
      <div className="map-container" ref={mapContainer} />
      {activePlace ? (
        <InfoPanel
          activePlace={places.get(activePlace.id)!}
          activeEntries={entries.get(activePlace.id)}
          products={products}
          unsetActivePlace={() => setActivePlace(undefined)}
        />
      ) : (
        <ControlBar
          places={places}
          layerVisibility={layerVisibility}
          filterState={filterState}
          setActivePlace={setActivePlace}
          dispatchVisibility={dispatchVisibility}
          dispatchFilter={dispatchFilter}
        />
      )}
    </div>
  );
}
