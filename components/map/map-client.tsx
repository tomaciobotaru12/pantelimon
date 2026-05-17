"use client";

import dynamic from "next/dynamic";
import type { Location, StoryWithRelations } from "@/types/database";

const MapView = dynamic(
  () => import("@/components/map/map-view").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sepia-300 font-display text-xl animate-pulse">
        Se deschide harta…
      </div>
    ),
  },
);

export function MapClient(props: {
  locations: Location[];
  stories: StoryWithRelations[];
  isAdmin?: boolean;
}) {
  return (
    <div className="absolute inset-0">
      <MapView {...props} />
    </div>
  );
}
