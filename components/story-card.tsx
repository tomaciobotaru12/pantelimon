"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Calendar, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { decadeOf } from "@/lib/utils";
import type { StoryWithRelations } from "@/types/database";

export function StoryCard({ story }: { story: StoryWithRelations }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/stories/${story.id}`}
        className="group relative flex flex-col h-full overflow-hidden rounded-lg border border-sepia-700/20 bg-sepia-900/40 hover:border-sepia-300/40 hover:bg-sepia-900/60 transition-all p-6"
      >
        {/* Decorativ — ghilimea de fundal */}
        <Quote
          className="absolute -top-2 -right-2 h-24 w-24 text-sepia-300/[0.04] rotate-180 pointer-events-none"
          strokeWidth={1}
        />

        {/* Header — anul + decada / tag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {story.year ? (
            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-sepia-300/80">
              <Calendar className="h-3 w-3" />
              {story.year}
            </span>
          ) : (
            <span />
          )}
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

        {/* Titlu */}
        <h3 className="font-display text-2xl text-sepia-50 group-hover:text-sepia-100 transition-colors leading-tight text-balance">
          {story.title}
        </h3>

        {/* Linie subtilă */}
        <div className="my-4 h-px w-12 bg-sepia-300/30" />

        {/* Amintirea */}
        <p className="text-[15px] text-sepia-200/85 line-clamp-6 leading-relaxed font-serif italic">
          {story.memory}
        </p>

        {/* Footer — locație + autor */}
        <div className="mt-5 pt-4 border-t border-sepia-700/20 flex items-center justify-between gap-2 text-xs text-sepia-300/70">
          <span className="truncate">
            {story.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{story.location.title}</span>
              </span>
            ) : (
              <span className="italic">undeva în Pantelimon</span>
            )}
          </span>
          {story.profile?.username ? (
            <span className="truncate font-medium text-sepia-200/80">
              {story.profile.username}
            </span>
          ) : null}
        </div>
      </Link>
    </motion.article>
  );
}
