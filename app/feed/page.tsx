import { createClient } from "@/lib/supabase/server";
import { StoryCard } from "@/components/story-card";
import { FeedFilters } from "@/components/feed-filters";
import { decadeOf } from "@/lib/utils";
import type { Location, StoryWithRelations } from "@/types/database";

export const revalidate = 30;

type SearchParams = {
  q?: string;
  tag?: string;
  decade?: string;
  location?: string;
};

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("stories")
    .select("*, profile:profiles(*), location:locations(*), images:story_images(*)")
    .order("created_at", { ascending: false });

  if (params.location) query = query.eq("location_id", params.location);
  if (params.tag) query = query.contains("tags", [params.tag]);
  if (params.q) {
    query = query.or(
      `title.ilike.%${params.q}%,memory.ilike.%${params.q}%`,
    );
  }

  const [storiesRes, locRes] = await Promise.all([
    query,
    supabase.from("locations").select("*").order("title"),
  ]);

  const list = (storiesRes.data ?? []) as StoryWithRelations[];
  const locations = (locRes.data ?? []) as Location[];

  // Client-side decade filter (avoids needing a generated column).
  const filtered = params.decade
    ? list.filter((s) => decadeOf(s.year) === params.decade)
    : list;

  const allTags = Array.from(
    new Set(list.flatMap((s) => s.tags ?? []).filter(Boolean)),
  ).sort();
  const allDecades = Array.from(
    new Set(list.map((s) => decadeOf(s.year)).filter(Boolean) as string[]),
  ).sort();

  return (
    <div className="container py-10 sm:py-14">
      <p className="text-xs uppercase tracking-[0.3em] text-sepia-300/70">
        Feed
      </p>
      <h1 className="mt-1 font-display text-3xl sm:text-4xl text-sepia-50">
        Toate amintirile
      </h1>
      <p className="mt-2 max-w-2xl text-sepia-200/80 font-serif">
        Fiecare poveste e o piesă din mozaic. Caută după un cuvânt, un deceniu, o locație.
      </p>

      <div className="mt-8">
        <FeedFilters locations={locations} tags={allTags} decades={allDecades} />
      </div>

      <div className="mt-10">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-sepia-700/30 p-12 text-center">
            <p className="font-display text-2xl text-sepia-200">Încă nicio amintire aici</p>
            <p className="mt-2 text-sepia-300/80 font-serif">
              Schimbă filtrele sau lasă tu prima poveste.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
