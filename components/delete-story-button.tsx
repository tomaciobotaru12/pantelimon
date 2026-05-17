"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function DeleteStoryButton({ storyId }: { storyId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    start(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("stories").delete().eq("id", storyId);
      if (error) {
        alert(error.message);
        return;
      }
      router.push("/feed");
      router.refresh();
    });
  };

  if (!confirming) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setConfirming(true)}
        className="text-destructive border-destructive/40 hover:bg-destructive/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
        Anulează
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleDelete}
        disabled={pending}
      >
        {pending ? "Se șterge…" : "Confirmă"}
      </Button>
    </div>
  );
}
