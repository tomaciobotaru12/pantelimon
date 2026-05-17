"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import L, { type LatLngBoundsExpression } from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { createClient } from "@/lib/supabase/client";
import type { Location, StoryWithRelations } from "@/types/database";
import { LocationModal } from "@/components/map/location-modal";

const PANTELIMON_CENTER: [number, number] = [44.4498, 26.1551];

const PANTELIMON_BOUNDS: LatLngBoundsExpression = [
  [44.420, 26.115],
  [44.478, 26.225],
];

const officialIcon = L.divIcon({
  className: "custom-marker",
  iconSize: [32, 40],
  iconAnchor: [16, 38],
  html: `
    <div style="position:relative;width:32px;height:40px;cursor:pointer;">
      <svg viewBox="0 0 32 40" width="32" height="40" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0c8.84 0 16 6.84 16 15.28 0 11.43-16 24.72-16 24.72S0 26.71 0 15.28C0 6.84 7.16 0 16 0Z" fill="#d4b576" stroke="#3d2a1a" stroke-width="1.5"/>
        <circle cx="16" cy="15" r="6" fill="#211610"/>
      </svg>
    </div>
  `,
});

const adminIcon = L.divIcon({
  className: "custom-marker",
  iconSize: [32, 40],
  iconAnchor: [16, 38],
  html: `
    <div style="position:relative;width:32px;height:40px;cursor:grab;filter:drop-shadow(0 0 6px rgba(212,181,118,0.7));">
      <svg viewBox="0 0 32 40" width="32" height="40" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0c8.84 0 16 6.84 16 15.28 0 11.43-16 24.72-16 24.72S0 26.71 0 15.28C0 6.84 7.16 0 16 0Z" fill="#e8d5a8" stroke="#211610" stroke-width="2"/>
        <circle cx="16" cy="15" r="6" fill="#211610"/>
        <circle cx="16" cy="15" r="2" fill="#e8d5a8"/>
      </svg>
    </div>
  `,
});

const storyIcon = L.divIcon({
  className: "custom-marker",
  iconSize: [28, 36],
  iconAnchor: [14, 34],
  html: `
    <div style="position:relative;width:28px;height:36px;cursor:pointer;">
      <svg viewBox="0 0 28 36" width="28" height="36" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0c7.73 0 14 5.98 14 13.37 0 10-14 21.63-14 21.63S0 23.37 0 13.37C0 5.98 6.27 0 14 0Z" fill="#825c2e" stroke="#f5ecd9" stroke-width="1.5"/>
        <circle cx="14" cy="13" r="4.5" fill="#f5ecd9"/>
      </svg>
    </div>
  `,
});

// ───────────────────────────────────────────────────────────────
// LocationMarker — sub-component cu eventHandlers stabili.
// Acesta e fix-ul cheie: react-leaflet 5 nu re-atașează corect
// listeneri dacă obiectul eventHandlers se schimbă la fiecare render.
// ───────────────────────────────────────────────────────────────
const LocationMarker = memo(function LocationMarker({
  location,
  isAdmin,
  onClick,
  onDragEnd,
}: {
  location: Location;
  isAdmin: boolean;
  onClick: (loc: Location) => void;
  onDragEnd: (loc: Location, lat: number, lng: number) => void;
}) {
  const handlers = useMemo(
    () => ({
      click: () => onClick(location),
      dragend: (e: L.LeafletEvent) => {
        const m = e.target as L.Marker;
        const pos = m.getLatLng();
        onDragEnd(location, pos.lat, pos.lng);
      },
    }),
    [location, onClick, onDragEnd],
  );

  return (
    <Marker
      position={[location.lat, location.lng]}
      icon={isAdmin ? adminIcon : officialIcon}
      draggable={isAdmin}
      eventHandlers={handlers}
    />
  );
});

const StoryMarker = memo(function StoryMarker({
  story,
  onClick,
}: {
  story: StoryWithRelations;
  onClick: (s: StoryWithRelations) => void;
}) {
  const handlers = useMemo(
    () => ({ click: () => onClick(story) }),
    [story, onClick],
  );
  return (
    <Marker
      position={[story.lat!, story.lng!]}
      icon={storyIcon}
      eventHandlers={handlers}
    />
  );
});

// ───────────────────────────────────────────────────────────────

type Props = {
  locations: Location[];
  stories: StoryWithRelations[];
  isAdmin?: boolean;
};

export function MapView({ locations: initialLocations, stories, isAdmin = false }: Props) {
  const [locations, setLocations] = useState(initialLocations);
  const [selected, setSelected] = useState<Location | null>(null);
  const [selectedStory, setSelectedStory] = useState<StoryWithRelations | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setLocations(initialLocations), [initialLocations]);

  const storiesByLocation = useMemo(() => {
    const m = new Map<string, StoryWithRelations[]>();
    stories.forEach((s) => {
      if (!s.location_id) return;
      const arr = m.get(s.location_id) ?? [];
      arr.push(s);
      m.set(s.location_id, arr);
    });
    return m;
  }, [stories]);

  const looseStories = useMemo(
    () => stories.filter((s) => !s.location_id && s.lat != null && s.lng != null),
    [stories],
  );

  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleLocationClick = useCallback((loc: Location) => {
    setSelected(loc);
  }, []);

  const handleStoryClick = useCallback((s: StoryWithRelations) => {
    setSelectedStory(s);
  }, []);

  const handleDragEnd = useCallback(async (loc: Location, lat: number, lng: number) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("locations")
      .update({ lat, lng })
      .eq("id", loc.id);
    if (error) {
      setToast(`Eroare: ${error.message}`);
      return;
    }
    setLocations((prev) =>
      prev.map((l) => (l.id === loc.id ? { ...l, lat, lng } : l)),
    );
    setToast(`Mutat: ${loc.title}`);
  }, []);

  const handleLocationUpdated = useCallback((updated: Location) => {
    setLocations((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelected(updated);
    setToast(`Salvat: ${updated.title}`);
  }, []);

  const handleLocationDeleted = useCallback((id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
    setSelected(null);
    setToast("Loc șters.");
  }, []);

  return (
    <>
      <MapContainer
        center={PANTELIMON_CENTER}
        zoom={14}
        minZoom={13}
        maxZoom={18}
        maxBounds={PANTELIMON_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          bounds={PANTELIMON_BOUNDS}
        />

        {locations.map((loc) => (
          <LocationMarker
            key={loc.id}
            location={loc}
            isAdmin={isAdmin}
            onClick={handleLocationClick}
            onDragEnd={handleDragEnd}
          />
        ))}

        {looseStories.map((s) => (
          <StoryMarker key={s.id} story={s} onClick={handleStoryClick} />
        ))}
      </MapContainer>

      {isAdmin ? (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <span className="inline-flex items-center gap-2 rounded-full bg-sepia-300/95 text-sepia-900 text-xs uppercase tracking-widest px-3 py-1.5 shadow-lg pointer-events-auto">
            Mod admin — trage pinurile ca să le repoziționezi
          </span>
        </div>
      ) : null}

      {toast ? (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] rounded-md bg-sepia-900/95 text-sepia-50 px-4 py-2 text-sm border border-sepia-300/30 shadow-xl">
          {toast}
        </div>
      ) : null}

      <LocationModal
        location={selected}
        stories={selected ? storiesByLocation.get(selected.id) ?? [] : []}
        isAdmin={isAdmin}
        onClose={() => setSelected(null)}
        onUpdated={handleLocationUpdated}
        onDeleted={handleLocationDeleted}
      />

      <LocationModal
        location={null}
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
      />
    </>
  );
}
