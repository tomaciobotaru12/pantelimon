"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  userId: string;
  bucket?: string;
};

export function AdminImagePicker({
  label,
  value,
  onChange,
  userId,
  bucket = "location-images",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-sepia-100">{label}</span>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-destructive hover:underline inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Șterge
          </button>
        ) : null}
      </div>

      {value ? (
        <div className="relative rounded-md overflow-hidden border border-sepia-700/30 bg-sepia-800 aspect-[4/3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-sepia-700/40 hover:border-sepia-300/60 p-6 cursor-pointer aspect-[4/3] bg-sepia-800/30 text-center transition-colors">
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-sepia-300" />
              <span className="mt-2 text-xs text-sepia-300">Se urcă…</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-sepia-300" />
              <span className="mt-2 text-xs text-sepia-200">Click pentru a alege</span>
              <span className="text-[10px] text-sepia-300/60">sau lipește URL mai jos</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
        </label>
      )}

      <Input
        type="url"
        placeholder="https://… (sau folosește butonul de upload)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs"
      />

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
