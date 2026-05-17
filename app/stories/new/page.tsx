import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoryForm } from "@/components/story-form";

export default async function NewStoryPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/stories/new")}`);
  }

  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .order("title");

  return (
    <div className="container py-10 sm:py-14 max-w-2xl">
      <p className="text-xs uppercase tracking-[0.3em] text-sepia-300/70">
        Contribuie la arhivă
      </p>
      <h1 className="mt-1 font-display text-3xl sm:text-4xl text-sepia-50">
        Adaugă o amintire
      </h1>
      <p className="mt-2 text-sepia-200/80 font-serif">
        O fotografie, o întâmplare, o frază — orice intră în arhiva cartierului.
      </p>

      <div className="mt-10">
        <StoryForm
          userId={user.id}
          locations={locations ?? []}
          defaultLocationId={location ?? null}
        />
      </div>
    </div>
  );
}
