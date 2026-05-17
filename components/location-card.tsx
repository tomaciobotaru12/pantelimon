"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Location } from "@/types/database";

export function LocationCard({ location }: { location: Location }) {
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
          {location.cover_image ? (
            <img
              src={location.cover_image}
              alt={location.title}
              className="h-full w-full object-cover sepia-image transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sepia-700">
              <MapPin className="h-10 w-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-sepia-900 via-sepia-900/20 to-transparent" />
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
