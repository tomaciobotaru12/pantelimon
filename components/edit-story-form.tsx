"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Location, Story } from "@/types/database";

type Props = {
  story: Story;
  locations: Location[];
};

export function EditStoryForm({ story, locations }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(story.title);
  const [memory, setMemory] = useState(story.memory);
  const [year, setYear] = useState(story.year?.toString() ?? "");
  const [tagsInput, setTagsInput] = useState((story.tags ?? []).join(", "));
  const [locationId, setLocationId] = useState(story.location_id ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    start(async () => {
      const supabase = createClient();
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const { error: updateError } = await supabase
        .from("stories")
        .update({
          title: title.trim(),
          memory: memory.trim(),
          year: year ? Number(year) : null,
          tags: tags.length ? tags : null,
          location_id: locationId || null,
        })
        .eq("id", story.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push(`/stories/${story.id}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titlu</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="memory">Amintirea</Label>
        <Textarea
          id="memory"
          value={memory}
          onChange={(e) => setMemory(e.target.value)}
          rows={8}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="year">Anul</Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Etichete</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Loc martor</Label>
        <select
          id="location"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="h-10 w-full rounded-md border border-sepia-700/30 bg-sepia-50/5 px-3 text-sm text-sepia-50"
        >
          <option value="" className="bg-sepia-900">— niciunul —</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id} className="bg-sepia-900">
              {l.title}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Se salvează…</> : "Salvează"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/stories/${story.id}`)}
        >
          Anulează
        </Button>
      </div>
    </form>
  );
}
