import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BeforeAfter } from "@/components/before-after";
import { Button } from "@/components/ui/button";
import { DeleteStoryButton } from "@/components/delete-story-button";
import { MapPin, Calendar, ArrowLeft, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: story } = await supabase
    .from("stories")
    .select("*, profile:profiles(*), location:locations(*), images:story_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (!story) return notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: me } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = me?.is_admin === true;
  }

  const images = story.images ?? [];
  const historical = images.find((i) => i.is_historical);
  const current = images.find((i) => !i.is_historical);

  const canEdit = user?.id === story.user_id || isAdmin;

  return (
    <article className="container py-10 sm:py-14 max-w-3xl">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm text-sepia-300 hover:text-sepia-50 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Înapoi la feed
      </Link>

      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-sepia-300/80">
        {story.location ? (
          <Link
            href={`/locations/${story.location.slug}`}
            className="inline-flex items-center gap-1 hover:text-sepia-50 transition-colors"
          >
            <MapPin className="h-3 w-3" />
            {story.location.title}
          </Link>
        ) : null}
        {story.year ? (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {story.year}
          </span>
        ) : null}
      </div>

      <h1 className="mt-3 font-display text-4xl sm:text-5xl text-sepia-50 leading-tight text-balance">
        {story.title}
      </h1>

      <div className="mt-5 flex items-center justify-between gap-3">
        <Link
          href={`/profile`}
          className="flex items-center gap-3 text-sepia-200 hover:text-sepia-50"
        >
          <Avatar className="h-9 w-9 border border-sepia-300/40">
            {story.profile?.avatar_url ? (
              <AvatarImage src={story.profile.avatar_url} alt={story.profile.username ?? ""} />
            ) : null}
            <AvatarFallback>
              {story.profile?.username?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm font-medium">{story.profile?.username ?? "anonim"}</p>
            <p className="text-xs text-sepia-300/70">{formatDate(story.created_at)}</p>
          </div>
        </Link>

        {canEdit ? (
          <div className="flex gap-2 items-center">
            {isAdmin && user?.id !== story.user_id ? (
              <span className="text-[10px] uppercase tracking-widest text-sepia-300 bg-sepia-700/30 px-2 py-1 rounded">
                admin
              </span>
            ) : null}
            <Button asChild size="sm" variant="outline">
              <Link href={`/stories/${story.id}/edit`} className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Editează
              </Link>
            </Button>
            <DeleteStoryButton storyId={story.id} />
          </div>
        ) : null}
      </div>

      {historical && current ? (
        <div className="mt-10">
          <p className="text-xs uppercase tracking-widest text-sepia-300/70 mb-2">
            Atunci · Acum
          </p>
          <BeforeAfter beforeUrl={historical.image_url} afterUrl={current.image_url} />
        </div>
      ) : images.length > 0 ? (
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {images.map((img) => (
            <figure key={img.id} className="space-y-1">
              <img
                src={img.image_url}
                alt={img.caption ?? story.title}
                className={`w-full rounded-md object-cover ${img.is_historical ? "sepia-image" : ""}`}
              />
              {img.caption ? (
                <figcaption className="text-xs text-sepia-300/70 italic">
                  {img.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}

      <div className="mt-10 font-serif text-lg leading-relaxed text-sepia-100/90 whitespace-pre-wrap">
        {story.memory}
      </div>

      {story.tags && story.tags.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {story.tags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      ) : null}
    </article>
  );
}
