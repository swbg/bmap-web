import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { markerColors } from "../const";
import { fetchData, parseEntries, parsePlaces, parseProducts } from "../data";
import { Entry, PlaceJSON, Product } from "../types";
import InfoPanel from "./InfoPanel";

export default function BaseMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const center = [11.575892981950567, 48.137836512295905] as [number, number]; // lon, lat
  const zoom = 14;

  const [entries, setEntries] = useState<Map<number, Entry[]> | null>(null);
  const [places, setPlaces] = useState<Map<number, PlaceJSON> | null>(null);
  const [products, setProducts] = useState<Map<number, Product> | null>(null);

  const [activePlace, setActivePlace_] = useState<PlaceJSON | undefined>(undefined);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  const setActivePlace = (newPlace: PlaceJSON | undefined) => {
    setActivePlace_((activePlace) => {
      if (!map.current) return newPlace;

      if (activePlace) {
        map.current.setFeatureState({ source: "places", id: activePlace.id }, { selected: false });
      }
      if (newPlace) {
        map.current.setFeatureState({ source: "places", id: newPlace.id }, { selected: true });
      }
      return newPlace;
    });
  };

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

      setPlaces(parsePlaces(csvString, entries));
    };

    fetchPlaces();
  }, [entries]);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "./osm_clean.json",
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
      const sdfImage = new Image(100, 115);
      sdfImage.src = "./marker-sdf.png";
      sdfImage.onload = () => {
        if (!map.current) return;
        map.current.addImage("marker-sdf", sdfImage, { sdf: true });

        // Make sure style has loaded before any data is added
        setIsMapLoaded(true);
      };
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
        "icon-image": "marker-sdf",
        "icon-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          // zoom is 12 (or less) -> 20% size
          12,
          0.2,
          // zoom is 19 (or greater) -> 40% size
          19,
          0.4,
        ],
        "icon-offset": [0, -50.0],
        "icon-overlap": "always",
      },
      paint: {
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
        // "icon-halo-blur": 0.9,
        "icon-halo-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          // zoom is 12 (or less)
          12,
          0.5,
          // zoom is 19 (or greater)
          19,
          1.0,
        ],
        "icon-halo-color": "#ffffff",
      },
    });
    map.current.addLayer({
      id: "places-names",
      source: "places",
      type: "symbol",
      minzoom: 13,
      layout: {
        "text-field": ["get", "placeName"],
        "text-font": ["Open Sans Regular"],
        "text-offset": [0, 0],
        "text-anchor": "top",
        "text-line-height": 1.05,
      },
      paint: {
        "text-halo-width": 1.5,
        "text-halo-color": "#ffffff",
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

    // Change mouse cursor on hover
    map.current.on("mousemove", "places-markers", () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "places-markers", () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = "";
    });
    map.current.on("mousemove", "places-names", () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "places-names", () => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = "";
    });

    // Select places by clicking
    type T = maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] };
    const selectPlace = (e: T) => {
      if (!e?.features) return;
      if (!map.current) return;

      const placeId = e.features[0].id;
      if (typeof placeId !== "number") return;
      setActivePlace(places.get(placeId));

      map.current.flyTo({
        center: (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number],
        zoom: Math.max(map.current.getZoom(), 16),
        easing: (t) => 1 - Math.pow(1 - t, 5),
      });
    };
    map.current.on("click", "places-markers", (e) => selectPlace(e));
    map.current.on("click", "places-names", (e) => selectPlace(e));

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
  }, [map.current, isMapLoaded, entries, places, products]);

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
