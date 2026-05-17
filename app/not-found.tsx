import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-32">
      <div className="text-center max-w-md px-4">
        <p className="text-xs uppercase tracking-[0.3em] text-sepia-300/70">
          404
        </p>
        <h1 className="mt-2 font-display text-4xl text-sepia-50">
          Locul ăsta n-are amintiri încă.
        </h1>
        <p className="mt-3 font-serif text-sepia-200/80">
          Pagina căutată nu există — poate a fost pavată, poate s-a dărâmat.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Înapoi la hartă</Link>
        </Button>
      </div>
    </div>
  );
}
