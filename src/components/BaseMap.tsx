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

  const [activePlace, setActivePlace] = useState<PlaceJSON | undefined>(undefined);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  const unsetActivePlace = (activePlace: PlaceJSON) => {
    setActivePlace(undefined);
    if (!map.current) return;
    map.current.setFeatureState({ source: "places", id: activePlace.id }, { selected: false });
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

    // Makes sure style has loaded before any data is added
    map.current.on("load", () => {
      for (const [markerName, markerColor] of markerColors.entries()) {
        const svgImage = new Image(50, 63);
        svgImage.onload = () => {
          if (!map.current) return;
          map.current.addImage(markerName, svgImage);
        };
        const pin = `<svg viewBox="0 0 50 63" fill="${markerColor}" version="1.1" width="50" height="63" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"> <path stroke-width="3.32084" d="M 0.09369395,23.722748 C 0.09369395,10.857977 11.265833,0.39086988 25,0.39086988 c 13.734168,0 24.906306,10.46710712 24.906306,23.33187812 0,19.331528 -20.367713,35.653045 -23.568672,38.218063 -0.199083,0.159483 -0.331751,0.265833 -0.388953,0.316392 -0.26766,0.23412 -0.608129,0.351927 -0.948681,0.351927 -0.340469,0 -0.681021,-0.117807 -0.948515,-0.351927 -0.0572,-0.05056 -0.189786,-0.156743 -0.388704,-0.316143 C 20.46257,59.376706 0.09369395,43.054857 0.09369395,23.722748 Z M 25.000083,37.240895 c 6.80075,0 12.313844,-5.595866 12.313844,-12.498815 0,-16.3432445 -24.627687,-16.3432462 -24.627687,0 0,6.902949 5.513093,12.498815 12.313843,12.498815 z" style="stroke:#ffffff;stroke-width:3;stroke-dasharray:none;stroke-opacity:1" /></svg>`;
        svgImage.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(pin);
      }

      // TODO: Set isLoaded only when all markers have loaded
      setIsMapLoaded(true);
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
        "icon-image": [
          // TypeScript makes it hard to generate this dynamically
          "case",
          ["!", ["to-boolean", ["get", "priceRating"]]],
          "marker-grey",
          ["<", ["get", "priceRating"], 0.3],
          "marker-0",
          ["<", ["get", "priceRating"], 0.33],
          "marker-1",
          ["<", ["get", "priceRating"], 0.36],
          "marker-2",
          ["<", ["get", "priceRating"], 0.39],
          "marker-3",
          ["<", ["get", "priceRating"], 0.42],
          "marker-4",
          ["<", ["get", "priceRating"], 0.45],
          "marker-5",
          ["<", ["get", "priceRating"], 0.48],
          "marker-6",
          ["<", ["get", "priceRating"], 0.51],
          "marker-7",
          ["<", ["get", "priceRating"], 0.54],
          "marker-8",
          "marker-9",
        ],
        "icon-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          // zoom is 12 (or less) -> 40% size
          12,
          0.4,
          // zoom is 20 (or greater) -> 80% size
          20,
          0.8,
        ],
        "icon-offset": [0, -30.0],
        "icon-overlap": "always",
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

    // Center map on clicked circle
    // map.current.on("click", "places-markers", (e) => {
    //   if (!e?.features) return;
    //   if (!map.current) return;
    //   map.current.flyTo({
    //     center: e.features[0].geometry.coordinates,
    //   });
    // });

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
      if (e.features.length === 0) return;
      if (!map.current) return;

      const placeId = e.features[0].id;
      if (typeof placeId !== "number") return;
      if (placeId !== undefined) {
        setActivePlace(places.get(placeId));
        // Keep active place highlighted
        map.current.setFeatureState({ source: "places", id: placeId }, { selected: true });
      }
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
          unsetActivePlace={() => unsetActivePlace(activePlace)}
        />
      )}
    </div>
  );
}
