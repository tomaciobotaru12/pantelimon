"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

const PANTELIMON_CENTER: [number, number] = [44.4498, 26.1551];

type Props = {
  value: { lat: number; lng: number } | null;
  onChange: (v: { lat: number; lng: number } | null) => void;
};

function ClickHandler({ onChange }: { onChange: Props["onChange"] }) {
  const [Comp, setComp] = useState<React.ComponentType<{ onChange: Props["onChange"] }> | null>(
    null,
  );
  useEffect(() => {
    let mounted = true;
    import("react-leaflet").then(({ useMapEvents }) => {
      function Inner({ onChange }: { onChange: Props["onChange"] }) {
        useMapEvents({
          click(e) {
            onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
          },
        });
        return null;
      }
      if (mounted) setComp(() => Inner);
    });
    return () => {
      mounted = false;
    };
  }, []);
  if (!Comp) return null;
  return <Comp onChange={onChange} />;
}

const pinIconHtml = `
  <svg viewBox="0 0 32 40" width="32" height="40" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0c8.84 0 16 6.84 16 15.28 0 11.43-16 24.72-16 24.72S0 26.71 0 15.28C0 6.84 7.16 0 16 0Z" fill="#d4b576" stroke="#3d2a1a" stroke-width="1.5"/>
    <circle cx="16" cy="15" r="6" fill="#211610"/>
  </svg>`;

export function LocationPicker({ value, onChange }: Props) {
  const [mounted, setMounted] = useState(false);
  const [icon, setIcon] = useState<unknown>(null);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((L) => {
      setIcon(
        L.divIcon({
          className: "custom-marker",
          iconSize: [32, 40],
          iconAnchor: [16, 38],
          html: pinIconHtml,
        }),
      );
    });
  }, []);

  if (!mounted) {
    return (
      <div className="h-72 w-full rounded-md border border-sepia-700/30 bg-sepia-800/30 flex items-center justify-center text-sepia-300 animate-pulse">
        Se deschide harta…
      </div>
    );
  }

  return (
    <div className="h-72 w-full overflow-hidden rounded-md border border-sepia-700/30 relative">
      <MapContainer
        center={value ? [value.lat, value.lng] : PANTELIMON_CENTER}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {value && icon ? (
          // @ts-expect-error icon type widened
          <Marker position={[value.lat, value.lng]} icon={icon} />
        ) : null}
      </MapContainer>
      <p className="absolute bottom-2 left-2 right-2 text-center text-[11px] uppercase tracking-widest text-sepia-100 bg-sepia-900/85 rounded px-2 py-1 pointer-events-none z-[400]">
        Apasă pe hartă pentru a marca locul exact
      </p>
    </div>
  );
}
