"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";

interface PhotoLocation {
  id: number;
  longitude: number;
  latitude: number;
  name: string;
}

// Generate random locations around Stockholm city center
function generateRandomStockholmLocations(count: number): PhotoLocation[] {
  // Stockholm center coordinates
  const stockholmLat = 59.3293;
  const stockholmLng = 18.0686;

  const locations: PhotoLocation[] = [];
  const locationNames = [
    "Gamla Stan",
    "Djurgården",
    "Södermalm",
    "Norrmalm",
    "Östermalm",
    "Vasastan",
    "Kungsholmen",
    "City Hall",
    "Royal Palace",
    "Skansen",
    "NK",
    "The Globe",
    "Nobel Museum",
    "Fotografiska",
    "Central Station",
    "Vasa Museum",
  ];

  for (let i = 0; i < count; i++) {
    // Random offset within ~2km
    const latOffset = (Math.random() - 0.5) * 0.04;
    const lngOffset = (Math.random() - 0.5) * 0.06;

    locations.push({
      id: i + 1,
      latitude: stockholmLat + latOffset,
      longitude: stockholmLng + lngOffset,
      name: locationNames[i % locationNames.length],
    });
  }

  return locations;
}

export function GpsMapChart() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [photoLocations] = useState<PhotoLocation[]>(
    generateRandomStockholmLocations(10)
  );

  const mapStyle =
    "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current as HTMLElement,
      style: mapStyle, // Use the constant
      center: [18.0686, 59.3293], // Stockholm center
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl());

    // Add markers when map loads
    map.current.on("load", () => {
      photoLocations.forEach((location) => {
        // Create marker element
        const markerEl = document.createElement("div");
        markerEl.className = "custom-marker";
        markerEl.style.backgroundColor = "#ff4b4b";
        markerEl.style.width = "20px";
        markerEl.style.height = "20px";
        markerEl.style.borderRadius = "50%";
        markerEl.style.border = "2px solid white";
        markerEl.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";

        // Add marker to map
        if (map.current) {
          new maplibregl.Marker(markerEl)
            .setLngLat([location.longitude, location.latitude])
            .setPopup(
              new maplibregl.Popup().setHTML(
                `<h3>${location.name}</h3>` as string
              )
            )
            .addTo(map.current);
        }
      });
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [photoLocations]);

  return (
    <Card>
      <CardHeader className="space-y-0 p-4 pb-0">
        <CardTitle className="text-base font-rocgrotesk">
          Photo Locations
        </CardTitle>
        <CardDescription className="text-xs">
          Geographic distribution of photos in Stockholm
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div
          ref={mapContainer}
          className="h-[200px] w-full rounded-md overflow-hidden"
        />
      </CardContent>
    </Card>
  );
}
