"use client";

import { useCallback, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StagedImage = {
  id: string;
  file: File;
  previewUrl: string;
  isHistorical: boolean;
  caption: string;
};

type Props = {
  value: StagedImage[];
  onChange: (next: StagedImage[]) => void;
  maxFiles?: number;
};

export function ImageUpload({ value, onChange, maxFiles = 8 }: Props) {
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      const remaining = maxFiles - value.length;
      const toAdd = arr.slice(0, Math.max(0, remaining));
      const staged: StagedImage[] = toAdd.map((file) => ({
        id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isHistorical: false,
        caption: "",
      }));
      onChange([...value, ...staged]);
    },
    [value, onChange, maxFiles],
  );

  const removeAt = (id: string) => {
    const item = value.find((v) => v.id === id);
    if (item) URL.revokeObjectURL(item.previewUrl);
    onChange(value.filter((v) => v.id !== id));
  };

  const updateAt = (id: string, patch: Partial<StagedImage>) => {
    onChange(value.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  return (
    <div className="space-y-4">
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
        className={cn(
          "flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 cursor-pointer transition-colors text-center",
          dragOver
            ? "border-sepia-300 bg-sepia-700/10"
            : "border-sepia-700/40 hover:border-sepia-300/60 hover:bg-sepia-700/5",
        )}
      >
        <Upload className="h-7 w-7 text-sepia-300 mb-2" />
        <p className="font-display text-lg text-sepia-100">
          Trage fotografii aici
        </p>
        <p className="text-xs text-sepia-300/70 mt-1">
          sau apasă pentru a alege (max {maxFiles})
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </label>

      {value.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {value.map((img) => (
            <div
              key={img.id}
              className="rounded-md border border-sepia-700/30 bg-sepia-900/40 overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-sepia-800">
                <img
                  src={img.previewUrl}
                  alt=""
                  className={cn(
                    "h-full w-full object-cover",
                    img.isHistorical && "sepia-image",
                  )}
                />
                <button
                  type="button"
                  onClick={() => removeAt(img.id)}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-sepia-50 flex items-center justify-center hover:bg-destructive transition-colors"
                  aria-label="Șterge imaginea"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3 space-y-2">
                <label className="flex items-center gap-2 text-xs text-sepia-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={img.isHistorical}
                    onChange={(e) =>
                      updateAt(img.id, { isHistorical: e.target.checked })
                    }
                    className="accent-sepia-300"
                  />
                  Fotografie istorică
                </label>
                <input
                  type="text"
                  placeholder="Legendă (opțional)"
                  value={img.caption}
                  onChange={(e) => updateAt(img.id, { caption: e.target.value })}
                  className="w-full h-8 rounded border border-sepia-700/30 bg-sepia-50/5 px-2 text-xs text-sepia-50 placeholder:text-sepia-300/50"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="flex items-center gap-2 text-xs text-sepia-300/70 italic">
          <ImageIcon className="h-3.5 w-3.5" />
          Sfat: o fotografie veche + una de acum permite glisorul „atunci/acum”.
        </p>
      )}
    </div>
  );
}
