import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { markerColors } from "../const";
import { fetchData, parseEntries, parsePlaces, parseProducts } from "../data";
import { getMarkerLayout, getMarkerPaint } from "../layout";
import { addPlacesSource, makeClickable, makeHoverable } from "../map";
import { Entry, Place, PlaceFeature, Product } from "../types";
import { getLocationState } from "../utils";
import { SearchButton } from "./Buttons";
import InfoPanel from "./InfoPanel";
import SearchBar from "./SearchBar";

export default function BaseMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const center = [11.575892981950567, 48.137836512295905] as [number, number]; // lon, lat
  const zoom = 14;

  const [places, setPlaces] = useState<Map<number, Place> | null>(null);
  const [entries, setEntries] = useState<Map<number, Entry[]> | null>(null);
  const [products, setProducts] = useState<Map<number, Product> | null>(null);

  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);

  const [hoveredPlace, setHoveredPlace] = useState<PlaceFeature | null>(null);
  const [activePlace, setActivePlace_] = useState<PlaceFeature | undefined>(undefined);

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

  const setActivePlace = (newPlace: PlaceFeature | undefined) => {
    setActivePlace_((activePlace) => {
      if (!map.current) return newPlace;

      if (activePlace) {
        map.current.setFeatureState(activePlace, { selected: false });
        if (!newPlace) history.replaceState(null, "", " ");
      }
      if (newPlace) {
        map.current.setFeatureState(newPlace, { selected: true });
        history.replaceState(null, "", `/${newPlace.source}/${newPlace.id}`);

        if (places) {
          const place = places.get(newPlace.id);
          if (place) {
            map.current.flyTo({
              center: [place.lon, place.lat],
              zoom: Math.max(map.current.getZoom(), 16),
              easing: (t) => 1 - Math.pow(1 - t, 5),
            });
          }
        }
      }
      return newPlace;
    });
  };

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
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
    );

    map.current.on("load", () => {
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
          markerColors.get("marker-active")!,
          ["!", ["to-boolean", ["get", "priceRating"]]],
          markerColors.get("marker-grey")!,
          ["<", ["get", "priceRating"], 0.3],
          markerColors.get("marker-0")!,
          ["<", ["get", "priceRating"], 0.33],
          markerColors.get("marker-1")!,
          ["<", ["get", "priceRating"], 0.36],
          markerColors.get("marker-2")!,
          ["<", ["get", "priceRating"], 0.39],
          markerColors.get("marker-3")!,
          ["<", ["get", "priceRating"], 0.42],
          markerColors.get("marker-4")!,
          ["<", ["get", "priceRating"], 0.45],
          markerColors.get("marker-5")!,
          ["<", ["get", "priceRating"], 0.48],
          markerColors.get("marker-6")!,
          ["<", ["get", "priceRating"], 0.51],
          markerColors.get("marker-7")!,
          ["<", ["get", "priceRating"], 0.54],
          markerColors.get("marker-8")!,
          markerColors.get("marker-9")!,
        ],
        //
        "text-halo-width": 1.5,
        "text-halo-color": "#ffffff",
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
          markerColors.get("marker-active")!,
          "#2faad4",
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
          markerColors.get("marker-active")!,
          "#9d6cc7",
        ],
      },
    });

    const sources = ["circle", "drop", "bag"];
    for (const source of sources) {
      makeHoverable(map, source, `${source}-markers`, setHoveredPlace);
      makeClickable(map, source, `${source}-markers`, setActivePlace);
    }

    setActivePlace(getLocationState());

    return () => {
      if (!map.current) return;
      for (const source of sources) {
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
      ) : showSearchBar ? (
        <SearchBar
          places={places}
          setActivePlace={setActivePlace}
          setShowSearchBar={setShowSearchBar}
        />
      ) : (
        <SearchButton onClick={() => setShowSearchBar(true)} />
      )}
    </div>
  );
}
