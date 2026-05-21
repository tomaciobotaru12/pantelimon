"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, MapPin, Calendar, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PhotoWithRelations } from "@/types/database";

type Props = {
  photos: PhotoWithRelations[];
  currentUserId?: string | null;
  isAdmin?: boolean;
};

export function PhotoGallery({ photos: initial, currentUserId, isAdmin }: Props) {
  const [photos, setPhotos] = useState(initial);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => setPhotos(initial), [initial]);

  // Lista locațiilor distincte pentru filtru
  const locations = useMemo(() => {
    const m = new Map<string, string>();
    photos.forEach((p) => {
      if (p.location) m.set(p.location.id, p.location.title);
    });
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [photos]);

  const filtered = filter
    ? photos.filter((p) => p.location_id === filter)
    : photos;

  const openPhoto = filtered[openIdx ?? 0];

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
      else if (e.key === "ArrowRight")
        setOpenIdx((i) => (i! + 1) % filtered.length);
      else if (e.key === "ArrowLeft")
        setOpenIdx((i) => (i! - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, filtered.length]);

  const handleDelete = async (id: string) => {
    if (!confirm("Ștergi poza? Nu se poate anula.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setOpenIdx(null);
  };

  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-sepia-700/30 p-12 text-center">
        <p className="font-display text-2xl text-sepia-200">
          Încă nicio fotografie în catalog
        </p>
        <p className="mt-2 text-sepia-300/80 font-serif">
          Începe tu — încarcă prima fotografie cu Pantelimonul.
        </p>
      </div>
    );
  }

  return (
    <>
      {locations.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-widest text-sepia-300/70 mr-2">
            Filtrează:
          </span>
          <button
            onClick={() => setFilter("")}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filter === ""
                ? "bg-sepia-300 text-sepia-900 border-sepia-300"
                : "border-sepia-700/40 text-sepia-200 hover:border-sepia-300/60"
            }`}
          >
            Toate ({photos.length})
          </button>
          {locations.map(([id, title]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === id
                  ? "bg-sepia-300 text-sepia-900 border-sepia-300"
                  : "border-sepia-700/40 text-sepia-200 hover:border-sepia-300/60"
              }`}
            >
              {title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {filtered.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => setOpenIdx(i)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="group relative aspect-square overflow-hidden rounded-md bg-sepia-800 border border-sepia-700/20 hover:border-sepia-300/40 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image_url}
              alt={p.caption ?? ""}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sepia-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {p.year ? (
                <p className="text-[10px] uppercase tracking-widest text-sepia-200/90">
                  {p.year}
                </p>
              ) : null}
              {p.caption ? (
                <p className="text-xs text-sepia-50 line-clamp-2 mt-0.5">
                  {p.caption}
                </p>
              ) : null}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {openIdx !== null && openPhoto ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex flex-col"
            onClick={() => setOpenIdx(null)}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 text-sepia-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-xs text-sepia-300/80">
                {openIdx + 1} din {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                {(openPhoto.user_id === currentUserId || isAdmin) ? (
                  <button
                    onClick={() => handleDelete(openPhoto.id)}
                    className="text-xs text-destructive hover:text-destructive/80 px-3 py-1 rounded border border-destructive/40 hover:bg-destructive/10"
                  >
                    Șterge
                  </button>
                ) : null}
                <button
                  onClick={() => setOpenIdx(null)}
                  className="h-10 w-10 rounded-full bg-sepia-900/70 hover:bg-sepia-900 flex items-center justify-center text-sepia-50"
                  aria-label="Închide"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Săgeți + imagine */}
            <div
              className="flex-1 flex items-center justify-center px-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {filtered.length > 1 ? (
                <button
                  onClick={() =>
                    setOpenIdx((i) => (i! - 1 + filtered.length) % filtered.length)
                  }
                  className="absolute left-2 sm:left-6 h-12 w-12 rounded-full bg-sepia-900/70 hover:bg-sepia-900 flex items-center justify-center text-sepia-50"
                  aria-label="Anterioara"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              ) : null}

              <motion.img
                key={openPhoto.id}
                src={openPhoto.image_url}
                alt={openPhoto.caption ?? ""}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-h-[80vh] max-w-[90vw] object-contain rounded shadow-2xl"
              />

              {filtered.length > 1 ? (
                <button
                  onClick={() => setOpenIdx((i) => (i! + 1) % filtered.length)}
                  className="absolute right-2 sm:right-6 h-12 w-12 rounded-full bg-sepia-900/70 hover:bg-sepia-900 flex items-center justify-center text-sepia-50"
                  aria-label="Următoarea"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              ) : null}
            </div>

            {/* Footer metadata */}
            <div
              className="p-4 sm:p-6 text-sepia-100 max-w-3xl mx-auto w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {openPhoto.caption ? (
                <p className="font-serif text-lg text-sepia-50 italic mb-2">
                  „{openPhoto.caption}"
                </p>
              ) : null}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-sepia-300/80">
                {openPhoto.year ? (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {openPhoto.year}
                  </span>
                ) : null}
                {openPhoto.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {openPhoto.location.title}
                  </span>
                ) : null}
                {openPhoto.profile?.username ? (
                  <span className="inline-flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {openPhoto.profile.username}
                  </span>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
