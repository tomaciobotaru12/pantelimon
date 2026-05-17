"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import type { Location } from "@/types/database";

type Props = {
  locations: Location[];
  tags: string[];
  decades: string[];
};

export function FeedFilters({ locations, tags, decades }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = useMemo(
    () => ({
      q: searchParams.get("q") ?? "",
      tag: searchParams.get("tag") ?? "",
      decade: searchParams.get("decade") ?? "",
      location: searchParams.get("location") ?? "",
    }),
    [searchParams],
  );

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const hasFilters =
    current.q || current.tag || current.decade || current.location;

  return (
    <div className="rounded-lg border border-sepia-700/20 bg-sepia-900/40 p-4 sm:p-5 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sepia-300/60" />
        <Input
          defaultValue={current.q}
          onChange={(e) => update("q", e.target.value || null)}
          placeholder="Caută o amintire, un cuvânt, o stradă…"
          className="pl-9"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <select
          value={current.location}
          onChange={(e) => update("location", e.target.value || null)}
          className="h-10 rounded-md border border-sepia-700/30 bg-sepia-50/5 px-3 text-sm text-sepia-50"
        >
          <option value="" className="bg-sepia-900">Toate locațiile</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id} className="bg-sepia-900">
              {l.title}
            </option>
          ))}
        </select>

        <select
          value={current.decade}
          onChange={(e) => update("decade", e.target.value || null)}
          className="h-10 rounded-md border border-sepia-700/30 bg-sepia-50/5 px-3 text-sm text-sepia-50"
        >
          <option value="" className="bg-sepia-900">Orice deceniu</option>
          {decades.map((d) => (
            <option key={d} value={d} className="bg-sepia-900">
              Anii {d}
            </option>
          ))}
        </select>

        <select
          value={current.tag}
          onChange={(e) => update("tag", e.target.value || null)}
          className="h-10 rounded-md border border-sepia-700/30 bg-sepia-50/5 px-3 text-sm text-sepia-50"
        >
          <option value="" className="bg-sepia-900">Orice etichetă</option>
          {tags.map((t) => (
            <option key={t} value={t} className="bg-sepia-900">
              {t}
            </option>
          ))}
        </select>
      </div>

      {hasFilters ? (
        <button
          onClick={() => router.replace(pathname, { scroll: false })}
          className="inline-flex items-center gap-1.5 text-xs text-sepia-300 hover:text-sepia-50 transition-colors"
        >
          <X className="h-3 w-3" />
          Șterge filtrele
        </button>
      ) : null}
    </div>
  );
}
