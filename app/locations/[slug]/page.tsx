import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoryCard } from "@/components/story-card";
import { BeforeAfter } from "@/components/before-after";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, ArrowRight } from "lucide-react";
import type { Location, StoryWithRelations } from "@/types/database";

export const revalidate = 60;

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const locRes = await supabase
    .from("locations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  const location = locRes.data as Location | null;
  if (!location) return notFound();

  const storiesRes = await supabase
    .from("stories")
    .select("*, profile:profiles(*), location:locations(*), images:story_images(*)")
    .eq("location_id", location.id)
    .order("created_at", { ascending: false });

  const stories = storiesRes.data as StoryWithRelations[] | null;

  const list = (stories ?? []) as StoryWithRelations[];
  const historicalUrl = location.historical_image_url;
  const currentUrl = location.current_image_url;

  return (
    <div className="container py-10 sm:py-14">
      <Link
        href="/map"
        className="inline-flex items-center gap-1.5 text-sm text-sepia-300 hover:text-sepia-50 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Înapoi la hartă
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] items-start">
        <div>
          <p className="text-xs uppercase tracking-widest text-sepia-300/80 inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location.historical_period ?? "Pantelimon"}
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl text-sepia-50 leading-tight text-balance">
            {location.title}
          </h1>
          {location.description ? (
            <p className="mt-6 font-serif text-lg text-sepia-100/90 leading-relaxed whitespace-pre-wrap">
              {location.description}
            </p>
          ) : null}

          <Button asChild className="mt-8" size="lg">
            <Link
              href={{ pathname: "/stories/new", query: { location: location.id } }}
              className="gap-1.5"
            >
              Adaugă o amintire aici
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div>
          {historicalUrl && currentUrl ? (
            <BeforeAfter beforeUrl={historicalUrl} afterUrl={currentUrl} />
          ) : historicalUrl || currentUrl || location.cover_image ? (
            <img
              src={(historicalUrl ?? currentUrl ?? location.cover_image)!}
              alt={location.title}
              className={`w-full aspect-[4/3] object-cover rounded-lg border border-sepia-700/30 ${historicalUrl && !currentUrl ? "sepia-image" : ""}`}
            />
          ) : (
            <div className="w-full aspect-[4/3] rounded-lg border border-dashed border-sepia-700/30 flex items-center justify-center text-sepia-700">
              <MapPin className="h-10 w-10" />
            </div>
          )}
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl sm:text-3xl text-sepia-50">
          Amintirile comunității
        </h2>
        {list.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-sepia-700/30 p-10 text-center">
            <p className="font-display text-xl text-sepia-200">
              Încă nicio amintire aici
            </p>
            <p className="mt-2 text-sepia-300/80 font-serif">
              Lasă tu prima — o fotografie, o întâmplare, o frază.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
