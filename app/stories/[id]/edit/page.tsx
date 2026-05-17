import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditStoryForm } from "@/components/edit-story-form";

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/stories/${id}/edit`);

  const { data: story } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!story) notFound();

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = me?.is_admin === true;

  if (story.user_id !== user.id && !isAdmin) redirect(`/stories/${id}`);

  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .order("title");

  return (
    <div className="container py-10 sm:py-14 max-w-2xl">
      <p className="text-xs uppercase tracking-[0.3em] text-sepia-300/70">
        Editează
      </p>
      <h1 className="mt-1 font-display text-3xl sm:text-4xl text-sepia-50">
        {story.title}
      </h1>
      <div className="mt-8">
        <EditStoryForm story={story} locations={locations ?? []} />
      </div>
    </div>
  );
}
