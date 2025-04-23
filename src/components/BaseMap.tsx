import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { fetchData, parseEntries, parsePlaces, parseProducts } from "../data";
import { Entry, PlaceJSON, Product } from "../types";
import InfoPanel from "./InfoPanel";

export default function BaseMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const center = [11.575892981950567, 48.137836512295905] as [number, number]; // lon, lat
  const zoom = 14;

  const [entries, setEntries] = useState<Map<number, Entry[]> | null>(null);
  const [places, setPlaces] = useState<PlaceJSON[] | null>(null);
  const [placeMapper, setPlaceMapper] = useState<Map<number, number> | null>(null);
  const [products, setProducts] = useState<Map<number, Product> | null>(null);

  const [activePlace, setActivePlace] = useState<PlaceJSON | undefined>(undefined);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  useEffect(() => {
    const fetchEntries = async () => {
      const csvString = await fetchData("./entries.csv");
      if (!csvString) return;
      setEntries(parseEntries(csvString));
    };
    const fetchProducts = async () => {
      const csvString = await fetchData("./products.csv");
      if (!csvString) return;
      setProducts(parseProducts(csvString));
    };

    fetchEntries();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!entries) return;
    const fetchPlaces = async () => {
      const csvString = await fetchData("./places.csv");
      if (!csvString) return;

      const places = parsePlaces(csvString, entries);
      const placeMapper = new Map<number, number>(places.map((v, idx) => [v.id, idx]));

      setPlaces(places as PlaceJSON[]);
      setPlaceMapper(placeMapper);
    };

    fetchPlaces();
  }, [entries]);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles-eu.stadiamaps.com/styles/osm_bright.json",
      center: center,
      zoom: zoom,
    });
    // Makes sure style has loaded before any data is added
    map.current.on("load", () => setIsMapLoaded(true));
  }, [mapContainer.current, center, zoom]);

  useEffect(() => {
    if (!map.current) return;
    if (!isMapLoaded) return;
    if (!entries) return;
    if (!places) return;
    if (!placeMapper) return;
    if (!products) return;

    map.current.addSource("places", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: places,
      },
    });
    map.current.addLayer({
      id: "places-markers",
      source: "places",
      type: "circle",
      paint: {
        "circle-radius": [
          "case",
          // Large when hovered
          ["boolean", ["feature-state", "hover"], false],
          9,
          // Regular when price available
          ["to-boolean", ["get", "priceRating"]],
          8,
          // Small if price not available
          4,
        ],
        "circle-color": [
          "case",
          // Interpolate based on price
          ["to-boolean", ["get", "priceRating"]],
          ["interpolate-lab", ["linear"], ["get", "priceRating"], 0.3, "#24c51a", 0.7, "#e22820"],
          "#333333",
        ],
        "circle-opacity": [
          "case",
          // Opaque if hovered
          ["boolean", ["feature-state", "hover"], false],
          1.0,
          // Opacity if price available
          ["to-boolean", ["get", "priceRating"]],
          0.6,
          // Higher opacity for small circles
          0.6,
        ],
      },
    });
    map.current.addLayer({
      id: "places-names",
      source: "places",
      type: "symbol",
      minzoom: 15,
      layout: {
        "text-field": ["get", "placeName"],
        "text-font": ["Noto Sans Regular"],
        "text-offset": [0, -0.5],
        "text-anchor": "bottom",
      },
    });

    // Grow marker circles on hover
    let hoveredPlaceId: string | number | undefined = undefined;
    map.current.on("mousemove", "places-markers", (e) => {
      if (!e?.features) return;
      if (!map.current) return;
      if (e.features.length > 0) {
        if (hoveredPlaceId !== undefined) {
          map.current.setFeatureState({ source: "places", id: hoveredPlaceId }, { hover: false });
        }
        hoveredPlaceId = e.features[0].id;
        map.current.setFeatureState({ source: "places", id: hoveredPlaceId }, { hover: true });
      }
    });
    map.current.on("mouseleave", "places-markers", () => {
      if (!map.current) return;
      if (hoveredPlaceId !== undefined) {
        map.current.setFeatureState({ source: "places", id: hoveredPlaceId }, { hover: false });
      }
      hoveredPlaceId = undefined;
    });

    // Center map on clicked circle
    // map.current.on("click", "places-markers", (e) => {
    //   if (!e?.features) return;
    //   if (!map.current) return;
    //   map.current.flyTo({
    //     center: e.features[0].geometry.coordinates,
    //   });
    // });

    // Change mouse cursor on hover
    map.current.on("mouseenter", "places-markers", () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "places-markers", () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = "";
    });

    map.current.on("click", "places-markers", (e) => {
      if (!e?.features) return;
      if (e.features.length === 0) return;
      if (!map.current) return;
      if (typeof e.features[0].id !== "number") return;
      const placeIdx = placeMapper.get(e.features[0].id);
      if (placeIdx !== undefined) setActivePlace(places[placeIdx]);
    });

    return () => {
      if (!map.current) return;
      if (map.current.getLayer("places-markers")) {
        map.current.removeLayer("places-markers");
      }
      if (map.current.getLayer("places-names")) {
        map.current.removeLayer("places-names");
      }
      if (map.current.getSource("places")) {
        map.current.removeSource("places");
      }
    };
  }, [map.current, isMapLoaded, entries, places, placeMapper, products]);

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
