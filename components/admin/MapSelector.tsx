"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapSelectorProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

// Component to handle map clicks
function MapEventsHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to update map view when props change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapSelector({ latitude, longitude, onChange }: MapSelectorProps) {
  // Use provided coordinates or fallback to a default (e.g. Palo Alto)
  const lat = latitude !== undefined && latitude !== 0 ? latitude : 37.4419;
  const lng = longitude !== undefined && longitude !== 0 ? longitude : -122.1430;
  const position: [number, number] = [lat, lng];

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-200 relative z-0">
      <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        <MapEventsHandler onChange={onChange} />
        <ChangeView center={position} />
      </MapContainer>
    </div>
  );
}
