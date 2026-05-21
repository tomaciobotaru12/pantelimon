"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, ImageIcon, Camera } from "lucide-react";
import type { Location } from "@/types/database";

type StagedFile = {
  id: string;
  file: File;
  previewUrl: string;
};

type Props = {
  userId: string;
  locations: Location[];
};

export function PhotoUploadForm({ userId, locations }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [locationId, setLocationId] = useState("");
  const [year, setYear] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<StagedFile[]>([]);

  const addFiles = (fl: FileList | File[]) => {
    const arr = Array.from(fl).filter((f) => f.type.startsWith("image/"));
    const staged: StagedFile[] = arr.map((file) => ({
      id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...staged].slice(0, 12));
  };

  const removeAt = (id: string) => {
    const item = files.find((v) => v.id === id);
    if (item) URL.revokeObjectURL(item.previewUrl);
    setFiles(files.filter((v) => v.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError("Alege cel puțin o fotografie.");
      return;
    }

    start(async () => {
      const supabase = createClient();

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setProgress(`Se urcă imaginea ${i + 1} din ${files.length}…`);

        const ext = f.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${userId}/${Date.now()}-${i}-${Math.random()
          .toString(36)
          .slice(2, 6)}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("user-photos")
          .upload(path, f.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: f.file.type,
          });
        if (upErr) {
          setError(`Eroare la imagine: ${upErr.message}`);
          setProgress(null);
          return;
        }

        const { data: pub } = supabase.storage
          .from("user-photos")
          .getPublicUrl(path);

        const { error: insErr } = await supabase.from("photos").insert({
          user_id: userId,
          location_id: locationId || null,
          image_url: pub.publicUrl,
          caption: caption.trim() || null,
          year: year ? Number(year) : null,
        });
        if (insErr) {
          setError(insErr.message);
          setProgress(null);
          return;
        }
      }

      // Curăță preview-urile și formularul
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setFiles([]);
      setCaption("");
      setYear("");
      setProgress(null);
      router.refresh();
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="rounded-lg border border-sepia-700/30 bg-sepia-900/50 p-5 sm:p-6 space-y-5"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-sepia-300/70 inline-flex items-center gap-1.5">
          <Camera className="h-3 w-3" />
          Adaugă în catalog
        </p>
        <h2 className="mt-1 font-display text-2xl text-sepia-50">
          Urcă fotografii din Pantelimon
        </h2>
        <p className="mt-1 text-sm text-sepia-200/70 font-serif">
          Pozele tale intră direct în arhiva comunității. Vechi sau noi — toate contează.
        </p>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 cursor-pointer transition-colors text-center ${
          dragOver
            ? "border-sepia-300 bg-sepia-700/10"
            : "border-sepia-700/40 hover:border-sepia-300/60 hover:bg-sepia-700/5"
        }`}
      >
        <Upload className="h-7 w-7 text-sepia-300 mb-2" />
        <p className="font-display text-lg text-sepia-100">Trage pozele aici</p>
        <p className="text-xs text-sepia-300/70 mt-1">sau apasă pentru a alege (max 12)</p>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </label>

      {files.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="relative aspect-square overflow-hidden rounded border border-sepia-700/30 bg-sepia-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(f.id)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-sepia-50 flex items-center justify-center hover:bg-destructive transition-colors"
                aria-label="Șterge"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="flex items-center gap-2 text-xs text-sepia-300/60 italic">
          <ImageIcon className="h-3.5 w-3.5" />
          Acceptă JPG, PNG, WEBP. Fotografiile sunt publice în catalog.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="p-location">Locație (opțional)</Label>
          <select
            id="p-location"
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
          <Label htmlFor="p-year">Anul (opțional)</Label>
          <Input
            id="p-year"
            type="number"
            min={1850}
            max={new Date().getFullYear()}
            placeholder="ex: 1987"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="p-caption">Legendă (opțional)</Label>
        <Input
          id="p-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="ex: Tramvaiul 14 la Obor, vara"
        />
        <p className="text-xs text-sepia-300/60">
          Legenda se aplică tuturor pozelor încărcate odată.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button type="submit" disabled={pending || files.length === 0} className="w-full sm:w-auto">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {progress ?? "Se urcă…"}
            </>
          ) : (
            <>Publică ({files.length})</>
          )}
        </Button>
        <p className="text-xs text-sepia-300/70">
          Vei putea șterge orice poză din profilul tău.
        </p>
      </div>
    </motion.form>
  );
}
