import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { GeoMetric, GeoSummaryLocation } from "@services/geoSummaryApi";

interface EventGeoMapProps {
  markers?: GeoSummaryLocation[];
  metric?: GeoMetric;
}

const DefaultIcon = L.Icon.Default as any;
delete DefaultIcon.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function EventGeoMap({ markers, metric = "events" }: EventGeoMapProps) {
  const safeMarkers: GeoSummaryLocation[] = Array.isArray(markers)
    ? markers.filter(
        (m) =>
          m &&
          typeof m.geo_latitude === "number" &&
          typeof m.geo_longitude === "number"
      )
    : [];

  const sriLankaCenter: [number, number] = [7.8731, 80.7718];

  return (
    <MapContainer
      center={sriLankaCenter}
      zoom={7}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {safeMarkers.map((m, i) => (
        <Marker key={i} position={[m.geo_latitude as number, m.geo_longitude as number]}>
          <Popup>
            <strong>{m.geo_country || "Unknown Country"}</strong>
            <br />
            Region: {m.geo_region || "N/A"}
            <br />
            {m.geo_city ? (
              <>
                City: {m.geo_city}
                <br />
              </>
            ) : null}
            {metric === "unique_visitors"
              ? `Unique Visitors: ${m.count ?? m.unique_visitors_count ?? 0}`
              : `Events: ${m.count ?? m.events_count ?? 0}`}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
