import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { PhotoGallery } from "@/components/photo-gallery";
import { Button } from "@/components/ui/button";
import type { Location, PhotoWithRelations } from "@/types/database";

export const revalidate = 0;

export default async function PozePage() {
  const supabase = await createClient();

  const [photosRes, locRes, userRes] = await Promise.all([
    supabase
      .from("photos")
      .select("*, profile:profiles(*), location:locations(*)")
      .order("created_at", { ascending: false }),
    supabase.from("locations").select("*").order("title"),
    supabase.auth.getUser(),
  ]);

  const photos = (photosRes.data ?? []) as PhotoWithRelations[];
  const locations = (locRes.data ?? []) as Location[];
  const user = userRes.data.user;

  let isAdmin = false;
  if (user) {
    const meRes = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    const me = meRes.data as { is_admin: boolean } | null;
    isAdmin = me?.is_admin === true;
  }

  return (
    <div className="container py-10 sm:py-14 max-w-5xl">
      <p className="text-xs uppercase tracking-[0.3em] text-sepia-300/70">
        Catalog vizual
      </p>
      <h1 className="mt-1 font-display text-3xl sm:text-4xl text-sepia-50">
        Poze din Pantelimon
      </h1>
      <p className="mt-2 max-w-2xl text-sepia-200/80 font-serif">
        Arhiva vizuală a comunității — fotografii vechi, instantanee de azi, fragmente de cartier.
        Filtrează după loc, dă click pe orice imagine pentru a o vedea mare.
      </p>

      {user ? (
        <div className="mt-8">
          <PhotoUploadForm userId={user.id} locations={locations} />
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-sepia-700/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg text-sepia-100">
              Vrei să contribui cu poze?
            </p>
            <p className="text-sm text-sepia-300/80 font-serif">
              Intră în cont sau creează unul nou — durează 20 de secunde.
            </p>
          </div>
          <Button asChild>
            <Link href="/login?next=/poze">Intră în cont</Link>
          </Button>
        </div>
      )}

      <div className="mt-12">
        <h2 className="font-display text-2xl sm:text-3xl text-sepia-50 mb-1">
          Toate fotografiile
        </h2>
        <p className="text-sm text-sepia-300/70 mb-6">
          {photos.length === 0
            ? "Niciuna încă."
            : `${photos.length} ${photos.length === 1 ? "fotografie" : "fotografii"} în arhivă.`}
        </p>

        <PhotoGallery
          photos={photos}
          currentUserId={user?.id ?? null}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
