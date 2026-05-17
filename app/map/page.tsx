import { createClient } from "@/lib/supabase/server";
import { MapClient } from "@/components/map/map-client";
import type { Location, StoryWithRelations } from "@/types/database";

export const revalidate = 0;

export default async function MapPage() {
  const supabase = await createClient();
  const [locRes, storyRes, userRes] = await Promise.all([
    supabase.from("locations").select("*"),
    supabase
      .from("stories")
      .select("*, profile:profiles(*), location:locations(*), images:story_images(*)")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const locations = (locRes.data ?? []) as Location[];
  const stories = (storyRes.data ?? []) as StoryWithRelations[];
  const user = userRes.data.user;

  let isAdmin = false;
  if (user) {
    const profileRes = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    const profile = profileRes.data as { is_admin: boolean } | null;
    isAdmin = profile?.is_admin === true;
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="container py-6">
        <p className="text-xs uppercase tracking-[0.3em] text-sepia-300/70">
          Harta vie
        </p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl text-sepia-50">
          Pantelimon, punct cu punct
        </h1>
        <p className="mt-2 max-w-2xl text-sepia-200/80 font-serif">
          Apasă pe un marker. Fiecare are o poveste, o fotografie, un an. Markerele aurii sunt
          locuri martor; cele cu inima de hârtie sunt amintiri lăsate de comunitate.
        </p>
      </div>
      <div className="relative flex-1 border-t border-sepia-700/20" style={{ height: "calc(100vh - 220px)", minHeight: 500 }}>
        <MapClient
          locations={locations}
          stories={stories}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
