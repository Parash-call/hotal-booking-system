import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

const MapView = ({ lat, lng, name }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;
    let map = null;

    import("leaflet").then((L) => {
      if (mapRef.current && !markerRef.current) {
        map = L.map(mapRef.current).setView([lat, lng], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        const icon = L.divIcon({
          className: "",
          html: `<div style="background:#c9a227;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);"><svg width="16" height="16" viewBox="0 0 24 24" fill="white" transform="rotate(45)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg></div>`,
        });

        L.marker([lat, lng], { icon }).addTo(map).bindPopup(`<strong>${name}</strong>`).openPopup();
        markerRef.current = true;
      }
    });

    return () => {
      if (map) map.remove();
      markerRef.current = false;
    };
  }, [lat, lng, name]);

  if (!lat || !lng) {
    return (
      <div className="map-container" style={{ display: "grid", placeItems: "center", color: "var(--muted)" }}>
        <div style={{ textAlign: "center" }}>
          <MapPin size={36} />
          <p>No map location available</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="map-container" />;
};

export default MapView;
