import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-sepia-700/20 mt-20 bg-sepia-900/60">
      <div className="container py-10 grid gap-8 sm:grid-cols-3 text-sm text-sepia-300/80">
        <div>
          <p className="font-display text-sepia-50 text-lg">Aici Era</p>
          <p className="mt-2 max-w-xs">
            O arhivă vie a cartierului Pantelimon. Construită de comunitate, pentru memorie.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sepia-200 uppercase text-xs tracking-widest">Explorează</p>
          <Link href="/map" className="hover:text-sepia-50 transition-colors">Harta</Link>
          <Link href="/feed" className="hover:text-sepia-50 transition-colors">Povești</Link>
          <Link href="/poze" className="hover:text-sepia-50 transition-colors">Poze</Link>
          <Link href="/stories/new" className="hover:text-sepia-50 transition-colors">Contribuie</Link>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sepia-200 uppercase text-xs tracking-widest">Despre</p>
          <p>București · Sectorul 2</p>
          <p className="opacity-60">© {new Date().getFullYear()} Aici Era</p>
        </div>
      </div>
    </footer>
  );
}
