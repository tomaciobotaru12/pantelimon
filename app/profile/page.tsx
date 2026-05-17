import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/story-card";
import { formatDate } from "@/lib/utils";
import { LogOut, Plus } from "lucide-react";
import type { Profile, StoryWithRelations } from "@/types/database";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const [profileRes, storiesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("stories")
      .select("*, profile:profiles(*), location:locations(*), images:story_images(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data as Profile | null;
  const list = (storiesRes.data ?? []) as StoryWithRelations[];
  const allImages = list.flatMap((s) => s.images ?? []);

  const displayName =
    profile?.username ?? user.email?.split("@")[0] ?? "vizitator";

  return (
    <div className="container py-10 sm:py-14">
      <div className="rounded-lg border border-sepia-700/20 bg-sepia-900/40 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Avatar className="h-20 w-20 border border-sepia-300/40">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={displayName} />
          ) : null}
          <AvatarFallback className="text-2xl">
            {displayName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-sepia-300/70">
            Membru al arhivei
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl text-sepia-50">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-sepia-300/80">
            Pe Aici Era din {profile ? formatDate(profile.created_at) : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-sepia-200">
            <span><strong className="text-sepia-50">{list.length}</strong> povești</span>
            <span><strong className="text-sepia-50">{allImages.length}</strong> fotografii</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild size="sm">
            <Link href="/stories/new" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Adaugă o amintire
            </Link>
          </Button>
          <form action="/auth/signout" method="post">
            <Button type="submit" size="sm" variant="outline" className="w-full">
              <LogOut className="h-4 w-4" />
              Ieși
            </Button>
          </form>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl sm:text-3xl text-sepia-50">
          Poveștile tale
        </h2>
        {list.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-sepia-700/30 p-10 text-center">
            <p className="font-display text-xl text-sepia-200">
              Încă n-ai lăsat nicio amintire
            </p>
            <p className="mt-2 text-sepia-300/80 font-serif">
              Începe cu o poveste — chiar și una scurtă contează.
            </p>
            <Button asChild className="mt-5">
              <Link href="/stories/new">Adaugă prima ta poveste</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        )}
      </section>

      {allImages.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl sm:text-3xl text-sepia-50">
            Fotografii adăugate
          </h2>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {allImages.map((img) => (
              <img
                key={img.id}
                src={img.image_url}
                alt={img.caption ?? ""}
                className={`w-full aspect-square object-cover rounded ${img.is_historical ? "sepia-image" : ""}`}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
