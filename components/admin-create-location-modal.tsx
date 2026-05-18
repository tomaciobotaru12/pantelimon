"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AdminImagePicker } from "@/components/admin-image-picker";
import { slugify } from "@/lib/utils";
import { Loader2, MapPin } from "lucide-react";
import type { Location } from "@/types/database";

type Props = {
  open: boolean;
  initialCoords: { lat: number; lng: number } | null;
  onClose: () => void;
  onCreated: (loc: Location) => void;
};

export function AdminCreateLocationModal({
  open,
  initialCoords,
  onClose,
  onCreated,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugDirty, setSlugDirty] = useState(false);
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [historicalImage, setHistoricalImage] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Resetează când se deschide / se schimbă coordonatele
  useEffect(() => {
    if (!open) return;
    setError(null);
    setTitle("");
    setSlug("");
    setSlugDirty(false);
    setDescription("");
    setPeriod("");
    setCoverImage("");
    setHistoricalImage("");
    setCurrentImage("");
    if (initialCoords) {
      setLat(initialCoords.lat.toFixed(5));
      setLng(initialCoords.lng.toFixed(5));
    } else {
      setLat("");
      setLng("");
    }
  }, [open, initialCoords]);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [open]);

  // Auto-slug când titlul se schimbă (până când userul îl modifică manual)
  useEffect(() => {
    if (!slugDirty) setSlug(slugify(title));
  }, [title, slugDirty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !slug.trim()) {
      setError("Titlul și slug-ul sunt obligatorii.");
      return;
    }
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setError("Coordonatele sunt invalide.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const res = await supabase
      .from("locations")
      .insert({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        historical_period: period.trim() || null,
        cover_image: coverImage.trim() || null,
        historical_image_url: historicalImage.trim() || null,
        current_image_url: currentImage.trim() || null,
        lat: latNum,
        lng: lngNum,
      })
      .select()
      .single();
    setPending(false);

    const data = res.data as Location | null;
    if (res.error || !data) {
      setError(res.error?.message ?? "Nu s-a putut crea locul.");
      return;
    }
    onCreated(data);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-sepia-900/95 border-sepia-700/30">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <p className="text-xs uppercase tracking-widest text-sepia-300/80 flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              Adaugă un loc · admin
            </p>
            <DialogTitle className="font-display text-2xl">
              {title || "Loc nou"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="c-title">Titlu</Label>
            <Input
              id="c-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Cinema Volga"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-slug">
              Slug (URL){" "}
              <span className="text-xs text-sepia-300/60 font-normal">
                (auto-generat din titlu)
              </span>
            </Label>
            <Input
              id="c-slug"
              value={slug}
              onChange={(e) => {
                setSlugDirty(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="cinema-volga"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-desc">Descriere</Label>
            <Textarea
              id="c-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Câteva fraze despre acest loc — istorie, atmosferă, oameni…"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-period">Perioadă istorică</Label>
              <Input
                id="c-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="ex: 1925 — 1991"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-cover">Cover image URL (opțional)</Label>
              <Input
                id="c-cover"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          {userId ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminImagePicker
                label="Atunci (fotografie istorică)"
                value={historicalImage}
                onChange={setHistoricalImage}
                userId={userId}
              />
              <AdminImagePicker
                label="Acum (fotografie curentă)"
                value={currentImage}
                onChange={setCurrentImage}
                userId={userId}
              />
            </div>
          ) : (
            <p className="text-xs text-sepia-300/60">Se încarcă uploader-ul…</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-lat">Latitudine</Label>
              <Input
                id="c-lat"
                type="number"
                step="0.00001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-lng">Longitudine</Label>
              <Input
                id="c-lng"
                type="number"
                step="0.00001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
              />
            </div>
          </div>
          <p className="text-xs text-sepia-300/60 -mt-1">
            Coordonatele au fost preluate din click-ul tău pe hartă. Le poți ajusta sau, după salvare, trage pinul cu mouse-ul.
          </p>

          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Se creează…
                </>
              ) : (
                "Creează locul"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Anulează
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
