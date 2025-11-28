// src/components/EventGeoMap.tsx
import 'leaflet/dist/leaflet.css';

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

// ---------- Types ----------
export interface GeoMarker {
  geo_latitude: number;
  geo_longitude: number;
  geo_city?: string;
  count?: number;
}

interface EventGeoMapProps {
  // make it lenient so it won't crash if wrong shape comes in
  markers?: GeoMarker[] | any;
}

// ---------- Fix Leaflet default icon ----------
const DefaultIcon = L.Icon.Default as any;
delete DefaultIcon.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ---------- Component ----------
export default function EventGeoMap({ markers }: EventGeoMapProps) {
  // 1) Normalize to a REAL array
  const safeMarkers: GeoMarker[] = Array.isArray(markers)
    ? markers.filter(
        (m) =>
          m &&
          typeof m.geo_latitude === "number" &&
          typeof m.geo_longitude === "number"
      )
    : [];

  // 2) Auto center to first valid marker, else Sri Lanka
  const center: [number, number] = useMemo(() => {
    if (safeMarkers.length > 0) {
      return [
        safeMarkers[0].geo_latitude,
        safeMarkers[0].geo_longitude,
      ];
    }
    return [7.8731, 80.7718]; // fallback center (Sri Lanka)
  }, [safeMarkers]);

  // 3) Debug (optional – keep while testing)
  console.log("EventGeoMap safeMarkers =", safeMarkers);

  return (
    <MapContainer
      center={center}
      zoom={safeMarkers.length > 0 ? 6 : 7}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {safeMarkers.map((m, i) => (
        <Marker
          key={i}
          position={[m.geo_latitude, m.geo_longitude]}
        >
          <Popup>
            <strong>{m.geo_city || "Unknown city"}</strong>
            <br />
            {m.count ?? 0} visits
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
