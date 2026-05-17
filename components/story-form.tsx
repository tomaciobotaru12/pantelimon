"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LocationPicker } from "@/components/map/location-picker";
import { Loader2 } from "lucide-react";
import type { Location } from "@/types/database";

type Props = {
  userId: string;
  locations: Location[];
  defaultLocationId?: string | null;
};

export function StoryForm({ userId, locations, defaultLocationId }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [memory, setMemory] = useState("");
  const [year, setYear] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [locationId, setLocationId] = useState<string>(defaultLocationId ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !memory.trim()) {
      setError("Titlul și amintirea sunt obligatorii.");
      return;
    }

    start(async () => {
      const supabase = createClient();

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const { data: story, error: insertError } = await supabase
        .from("stories")
        .insert({
          user_id: userId,
          location_id: locationId || null,
          title: title.trim(),
          memory: memory.trim(),
          year: year ? Number(year) : null,
          tags: tags.length ? tags : null,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
        })
        .select()
        .single();

      if (insertError || !story) {
        setError(insertError?.message ?? "Nu s-a putut salva povestea.");
        return;
      }

      router.push(`/stories/${story.id}`);
      router.refresh();
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <div className="space-y-2">
        <Label htmlFor="title">Titlu</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex: Sâmbăta dimineața la Obor"
          maxLength={140}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="memory">Amintirea</Label>
        <Textarea
          id="memory"
          value={memory}
          onChange={(e) => setMemory(e.target.value)}
          placeholder="Spune povestea așa cum o ții minte — locuri, oameni, mirosuri, zgomote…"
          rows={10}
          required
        />
        <p className="text-xs text-sepia-300/60">
          Doar text. Fotografiile „atunci/acum" pentru fiecare loc sunt curatoriate de admin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="year">Anul</Label>
          <Input
            id="year"
            type="number"
            inputMode="numeric"
            min={1850}
            max={new Date().getFullYear()}
            placeholder="ex: 1987"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Etichete (separate prin virgulă)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="copilărie, piață, tramvai"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Loc martor (opțional)</Label>
        <select
          id="location"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="h-10 w-full rounded-md border border-sepia-700/30 bg-sepia-50/5 px-3 text-sm text-sepia-50"
        >
          <option value="" className="bg-sepia-900">— alege un loc —</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id} className="bg-sepia-900">
              {l.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Punct pe hartă (opțional)</Label>
        <p className="text-xs text-sepia-300/70">
          Pune un pin acolo unde s-a întâmplat. Util mai ales dacă nu există un loc martor.
        </p>
        <LocationPicker value={coords} onChange={setCoords} />
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Se publică…
            </>
          ) : (
            "Publică povestea"
          )}
        </Button>
        <p className="text-xs text-sepia-300/70">
          Vei putea edita sau șterge povestea oricând din profilul tău.
        </p>
      </div>
    </motion.form>
  );
}
