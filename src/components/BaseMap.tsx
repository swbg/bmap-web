import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { markerColors } from "../const";
import { getLocationState, getSource, makeClickable, makeHoverable } from "../control";
import { fetchData, parseEntries, parsePOIs, parsePlaces, parseProducts } from "../data";
import { getMarkerLayout, getMarkerPaint } from "../layout";
import { Entry, FeaturePoint, POIJSON, PlaceJSON, Product } from "../types";
import InfoPanel from "./InfoPanel";

export default function BaseMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const center = [11.575892981950567, 48.137836512295905] as [number, number]; // lon, lat
  const zoom = 14;

  const [entries, setEntries] = useState<Map<number, Entry[]> | null>(null);
  const [places, setPlaces] = useState<Map<number, PlaceJSON> | null>(null);
  const [products, setProducts] = useState<Map<number, Product> | null>(null);
  const [pois, setPOIs] = useState<Map<number, POIJSON> | null>(null);

  const [activePlace, setActivePlace_] = useState<PlaceJSON | POIJSON | undefined>(undefined);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  const [hoveredPoint, setHoveredPoint] = useState<FeaturePoint | null>(null);

  useEffect(() => {
    if (!map.current) return;
    if (hoveredPoint !== null) {
      const { source, id } = hoveredPoint;
      map.current.setFeatureState({ source, id }, { hover: true });
      return () => {
        if (!map.current) return;
        map.current.setFeatureState({ source, id }, { hover: false });
      };
    }
  }, [map.current, hoveredPoint]);

  const setActivePlace = (newPlace: PlaceJSON | POIJSON | undefined) => {
    setActivePlace_((activePlace) => {
      if (!map.current) return newPlace;

      if (activePlace) {
        const source = getSource(activePlace);
        map.current.setFeatureState({ source, id: activePlace.id }, { selected: false });
        if (!newPlace) history.replaceState(null, "", " ");
      }
      if (newPlace) {
        const source = getSource(newPlace);
        map.current.setFeatureState({ source, id: newPlace.id }, { selected: true });
        history.replaceState(null, "", `/${source}/${newPlace.id}`);

        map.current.flyTo({
          center: newPlace.geometry.coordinates,
          zoom: Math.max(map.current.getZoom(), 16),
          easing: (t) => 1 - Math.pow(1 - t, 5),
        });
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
      // Fetch POIs
      const csvString = await fetchData("/pois.csv");
      if (!csvString) return;

      const pois = parsePOIs(csvString);
      setPOIs(pois);

      const { source, id } = getLocationState() || { source: null, id: null };
      if (source === "drinking-fountains") setActivePlace(pois.get(id));
    })();
  }, []);

  useEffect(() => {
    if (!entries) return;
    const fetchPlaces = async () => {
      const csvString = await fetchData("/places.csv");
      if (!csvString) return;

      const places = parsePlaces(csvString, entries);
      setPlaces(places);

      const { source, id } = getLocationState() || { source: null, id: null };
      if (source === "places") setActivePlace(places.get(id));
    };

    fetchPlaces();
  }, [entries]);

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
        ["marker-circle", "marker-drop"].map((markerName) => {
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
    if (!entries) return;
    if (!places) return;
    if (!products) return;

    map.current.addSource("places", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: Array.from(places.values()),
      },
    });
    map.current.addLayer({
      id: "places-markers",
      source: "places",
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

    makeHoverable(map, "places", "places-markers", setHoveredPoint);
    makeClickable(map, "places", "places-markers", setActivePlace, places);

    return () => {
      if (!map.current) return;
      if (map.current.getLayer("places-markers")) {
        map.current.removeLayer("places-markers");
      }
      if (map.current.getSource("places")) {
        map.current.removeSource("places");
      }
    };
  }, [map.current, isMapLoaded, entries, places, products]);

  useEffect(() => {
    if (!map.current) return;
    if (!isMapLoaded) return;
    if (!pois) return;

    map.current.addSource("drinking-fountains", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: Array.from(pois.values()).filter(
          ({ properties: { placeType } }) => placeType === "drinking-fountain",
        ),
      },
    });
    map.current.addLayer({
      id: "drinking-fountains-markers",
      source: "drinking-fountains",
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

    makeHoverable(map, "drinking-fountains", "drinking-fountains-markers", setHoveredPoint);
    makeClickable(map, "drinking-fountains", "drinking-fountains-markers", setActivePlace, pois);

    return () => {
      if (!map.current) return;
      if (map.current.getLayer("drinking-fountains-markers")) {
        map.current.removeLayer("drinking-fountains-markers");
      }
      if (map.current.getSource("drinking-fountains")) {
        map.current.removeSource("drinking-fountains");
      }
    };
  }, [map.current, isMapLoaded, pois]);

  return (
    <div className="map">
      <div className="map-container" ref={mapContainer} />
      {activePlace && entries && products && (
        <InfoPanel
          activePlace={activePlace}
          activeEntries={entries.get(activePlace.id)}
          products={products}
          unsetActivePlace={() => setActivePlace(undefined)}
        />
      )}
    </div>
  );
}
