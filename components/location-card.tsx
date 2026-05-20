"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Location } from "@/types/database";

export function LocationCard({ location }: { location: Location }) {
  // Preferă poza istorică (atunci) — păstrează atmosfera nostalgică a homepage-ului.
  const imageUrl =
    location.historical_image_url ??
    location.current_image_url ??
    location.cover_image ??
    null;

  // Aplicăm sepia doar dacă imaginea NU e deja istorică (cele istorice arată
  // deja vechi, nu vrem dublu sepia).
  const isHistorical = !!location.historical_image_url;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/locations/${location.slug}`}
        className="group block overflow-hidden rounded-lg border border-sepia-700/20 bg-sepia-900/40 hover:border-sepia-300/40 transition-colors"
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-sepia-800 relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={location.title}
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                isHistorical ? "" : "sepia-image"
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sepia-700">
              <MapPin className="h-10 w-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-sepia-900 via-sepia-900/20 to-transparent" />
          {isHistorical ? (
            <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest bg-sepia-900/80 text-sepia-100 px-2 py-1 rounded backdrop-blur-sm">
              Atunci
            </span>
          ) : null}
        </div>
        <div className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sepia-300/70">
            {location.historical_period ?? "Pantelimon"}
          </p>
          <h3 className="mt-1 font-display text-xl text-sepia-50 group-hover:text-sepia-200 transition-colors">
            {location.title}
          </h3>
          {location.description ? (
            <p className="mt-2 text-sm text-sepia-200/70 line-clamp-2 leading-relaxed">
              {location.description}
            </p>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}
