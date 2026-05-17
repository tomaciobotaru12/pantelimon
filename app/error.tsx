"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center py-32">
      <div className="text-center max-w-md px-4">
        <p className="text-xs uppercase tracking-[0.3em] text-destructive/80">
          ceva s-a întâmplat
        </p>
        <h1 className="mt-2 font-display text-3xl text-sepia-50">
          Un cadru a căzut din rama veche.
        </h1>
        <p className="mt-3 font-serif text-sepia-200/80 text-sm">
          {error.message || "Eroare neașteptată."}
        </p>
        <Button onClick={reset} className="mt-6">
          Încearcă din nou
        </Button>
      </div>
    </div>
  );
}
