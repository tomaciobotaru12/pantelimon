"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BeforeAfter } from "@/components/before-after";
import { AdminImagePicker } from "@/components/admin-image-picker";
import { MapPin, Calendar, ArrowRight, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Location, StoryWithRelations } from "@/types/database";

type Props = {
  location: Location | null;
  stories?: StoryWithRelations[];
  story?: StoryWithRelations | null;
  isAdmin?: boolean;
  onClose: () => void;
  onUpdated?: (loc: Location) => void;
  onDeleted?: (id: string) => void;
};

export function LocationModal({
  location,
  stories = [],
  story,
  isAdmin = false,
  onClose,
  onUpdated,
  onDeleted,
}: Props) {
  const open = !!location || !!story;
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // Resetează modul edit când se schimbă locația selectată
    setEditing(false);
  }, [location?.id, story?.id]);

  // Pentru locații: imaginile sunt setate de admin pe `locations.historical_image_url` / `.current_image_url`.
  // Pentru povești afișate prin modal: încă acceptăm vechile imagini (back-compat).
  const locationHistorical = location?.historical_image_url ?? null;
  const locationCurrent = location?.current_image_url ?? null;
  const storyImages = !location && story ? story.images ?? [] : [];
  const storyHistorical = storyImages.find((i) => i.is_historical) ?? null;
  const storyCurrent = storyImages.find((i) => !i.is_historical) ?? null;

  const historicalUrl = locationHistorical ?? storyHistorical?.image_url ?? null;
  const currentUrl = locationCurrent ?? storyCurrent?.image_url ?? null;
  const fallbackGallery = storyImages;

  const title = location?.title ?? story?.title ?? "";
  const description = location?.description ?? story?.memory ?? "";
  const period = location?.historical_period ?? (story?.year ? String(story.year) : null);

  if (!open) {
    return (
      <Dialog open={false} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="bg-sepia-900/95 border-sepia-700/30" />
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-sepia-900/95 border-sepia-700/30">
        {location && editing && isAdmin ? (
          <AdminEditForm
            location={location}
            onCancel={() => setEditing(false)}
            onSaved={(loc) => {
              setEditing(false);
              onUpdated?.(loc);
            }}
            onDeleted={(id) => {
              setEditing(false);
              onDeleted?.(id);
            }}
          />
        ) : (
          <div
            className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-sepia-300/80">
                  <MapPin className="h-3 w-3" />
                  Pantelimon
                  {period ? (
                    <>
                      <span className="opacity-50">·</span>
                      <Calendar className="h-3 w-3" />
                      <span>{period}</span>
                    </>
                  ) : null}
                </div>
                <DialogTitle className="font-display text-3xl">{title}</DialogTitle>
                <DialogDescription className="font-serif text-sepia-200/85 leading-relaxed text-base">
                  {description}
                </DialogDescription>
              </DialogHeader>

              {historicalUrl && currentUrl ? (
                <div>
                  <p className="text-xs uppercase tracking-widest text-sepia-300/70 mb-2">
                    Atunci · Acum
                  </p>
                  <BeforeAfter beforeUrl={historicalUrl} afterUrl={currentUrl} />
                </div>
              ) : historicalUrl || currentUrl ? (
                <img
                  src={(historicalUrl ?? currentUrl)!}
                  alt={title}
                  className={`w-full aspect-[16/10] object-cover rounded ${historicalUrl && !currentUrl ? "sepia-image" : ""}`}
                />
              ) : fallbackGallery.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {fallbackGallery.slice(0, 4).map((img) => (
                    <img
                      key={img.id}
                      src={img.image_url}
                      alt={img.caption ?? ""}
                      className="w-full aspect-[4/3] object-cover rounded sepia-image"
                    />
                  ))}
                </div>
              ) : null}

              {location && stories.length > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-widest text-sepia-300/70 mb-3">
                    Amintirile comunității
                  </p>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {stories.map((s) => (
                      <Link
                        key={s.id}
                        href={`/stories/${s.id}`}
                        className="block rounded-md border border-sepia-700/30 p-3 hover:border-sepia-300/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-display text-sepia-50">{s.title}</h4>
                          {s.year ? <Badge variant="outline">{s.year}</Badge> : null}
                        </div>
                        <p className="mt-1 text-sm text-sepia-200/70 line-clamp-2 font-serif">
                          {s.memory}
                        </p>
                        <p className="mt-1 text-xs text-sepia-300/60">
                          — {s.profile?.username ?? "anonim"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {location ? (
                  <Button asChild className="flex-1">
                    <Link href={`/locations/${location.slug}`} className="gap-1.5">
                      Vezi locația
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : story ? (
                  <Button asChild className="flex-1">
                    <Link href={`/stories/${story.id}`} className="gap-1.5">
                      Citește povestea
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline" className="flex-1">
                  <Link
                    href={{
                      pathname: "/stories/new",
                      query: location ? { location: location.id } : undefined,
                    }}
                  >
                    Adaugă o amintire
                  </Link>
                </Button>
              </div>

              {isAdmin && location ? (
                <div className="pt-3 border-t border-sepia-700/30">
                  <Button
                    onClick={() => setEditing(true)}
                    variant="secondary"
                    size="sm"
                    className="w-full gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editează locul (admin)
                  </Button>
                </div>
              ) : null}
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AdminEditForm({
  location,
  onCancel,
  onSaved,
  onDeleted,
}: {
  location: Location;
  onCancel: () => void;
  onSaved: (loc: Location) => void;
  onDeleted: (id: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState(location.title);
  const [slug, setSlug] = useState(location.slug);
  const [description, setDescription] = useState(location.description ?? "");
  const [period, setPeriod] = useState(location.historical_period ?? "");
  const [coverImage, setCoverImage] = useState(location.cover_image ?? "");
  const [historicalImage, setHistoricalImage] = useState(location.historical_image_url ?? "");
  const [currentImage, setCurrentImage] = useState(location.current_image_url ?? "");
  const [lat, setLat] = useState(location.lat.toString());
  const [lng, setLng] = useState(location.lng.toString());

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("locations")
      .update({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        historical_period: period.trim() || null,
        cover_image: coverImage.trim() || null,
        historical_image_url: historicalImage.trim() || null,
        current_image_url: currentImage.trim() || null,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      })
      .eq("id", location.id)
      .select()
      .single();
    setPending(false);
    if (error || !data) {
      setError(error?.message ?? "Nu s-a putut salva.");
      return;
    }
    onSaved(data);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("locations").delete().eq("id", location.id);
    setDeleting(false);
    if (error) {
      setError(error.message);
      return;
    }
    onDeleted(location.id);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSave}
      className="space-y-4"
    >
      <DialogHeader>
        <p className="text-xs uppercase tracking-widest text-sepia-300/80">
          Editează locul · admin
        </p>
        <DialogTitle className="font-display text-2xl">{location.title}</DialogTitle>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="e-title">Titlu</Label>
        <Input id="e-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="e-slug">Slug (URL)</Label>
        <Input id="e-slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="e-desc">Descriere</Label>
        <Textarea
          id="e-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="e-period">Perioadă istorică</Label>
          <Input id="e-period" value={period} onChange={(e) => setPeriod(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="e-cover">Cover image URL</Label>
          <Input id="e-cover" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
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
        <p className="text-xs text-sepia-300/60">Se încarcă uploader-ul de imagini…</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="e-lat">Latitudine</Label>
          <Input
            id="e-lat"
            type="number"
            step="0.0001"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="e-lng">Longitudine</Label>
          <Input
            id="e-lng"
            type="number"
            step="0.0001"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required
          />
        </div>
      </div>
      <p className="text-xs text-sepia-300/60 -mt-1">
        Sfat: în loc să editezi coordonatele aici, închide modalul și **trage pinul** pe hartă.
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
              Se salvează…
            </>
          ) : (
            "Salvează modificările"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Anulează
        </Button>
      </div>

      <div className="border-t border-sepia-700/30 pt-3">
        {!confirmDelete ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="w-full text-destructive border-destructive/40 hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Șterge locul
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              className="flex-1"
            >
              Anulează
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1"
            >
              {deleting ? "Se șterge…" : "Confirmă ștergerea"}
            </Button>
          </div>
        )}
      </div>
    </motion.form>
  );
}
