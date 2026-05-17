"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { decadeOf } from "@/lib/utils";
import type { StoryWithRelations } from "@/types/database";

export function StoryCard({ story }: { story: StoryWithRelations }) {
  const thumb =
    story.images?.[0]?.image_url ??
    story.location?.cover_image ??
    null;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/stories/${story.id}`}
        className="group flex flex-col h-full overflow-hidden rounded-lg border border-sepia-700/20 bg-sepia-900/40 hover:border-sepia-300/40 transition-colors"
      >
        <div className="aspect-[16/10] w-full overflow-hidden bg-sepia-800 relative">
          {thumb ? (
            <img
              src={thumb}
              alt={story.title}
              className="h-full w-full object-cover sepia-image transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sepia-700/60 font-display text-5xl italic">
              "
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-sepia-900/80 via-transparent to-transparent" />
          {story.year ? (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-sepia-900/80 text-sepia-100 text-[11px] px-2.5 py-1 backdrop-blur-sm">
              <Calendar className="h-3 w-3" />
              {story.year}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 p-5 flex-1">
          <h3 className="font-display text-xl text-sepia-50 group-hover:text-sepia-200 transition-colors leading-tight">
            {story.title}
          </h3>
          <p className="text-sm text-sepia-200/70 line-clamp-3 leading-relaxed font-serif">
            {story.memory}
          </p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2 text-xs text-sepia-300/70 min-w-0">
              {story.location ? (
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{story.location.title}</span>
                </span>
              ) : null}
              {story.profile?.username ? (
                <span className="truncate">· {story.profile.username}</span>
              ) : null}
            </div>
            {story.tags && story.tags.length > 0 ? (
              <Badge variant="outline" className="shrink-0">
                {story.tags[0]}
              </Badge>
            ) : decadeOf(story.year) ? (
              <Badge variant="outline" className="shrink-0">
                {decadeOf(story.year)}
              </Badge>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
