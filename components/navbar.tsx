import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, BookOpen, Camera, Plus, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { username: string | null; avatar_url: string | null } | null = null;
  if (user) {
    const res = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    profile = res.data as { username: string | null; avatar_url: string | null } | null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sepia-300/10 bg-sepia-900/60 backdrop-blur-xl supports-[backdrop-filter]:bg-sepia-900/40">
      <div className="container flex h-[68px] items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <span
            className={cn(
              "relative grid h-10 w-10 place-items-center rounded-full",
              "bg-gradient-to-br from-sepia-200 via-sepia-300 to-sepia-500",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(0,0,0,0.35)]",
              "ring-1 ring-sepia-200/40 ring-offset-2 ring-offset-sepia-900",
            )}
          >
            <span className="font-display italic text-sepia-900 text-xl leading-none -mt-0.5">A</span>
          </span>
          <span className="hidden sm:flex items-baseline gap-2 leading-none">
            <span className="font-display text-[19px] tracking-wide text-sepia-50 group-hover:text-sepia-100 transition-colors">
              Aici&nbsp;Era
            </span>
            <span className="h-3 w-px bg-sepia-300/30" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-sepia-300/70">
              Arhiva Pantelimonului
            </span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 sm:gap-1">
          <NavLink href="/map" icon={<MapPin className="h-3.5 w-3.5" />}>
            Harta
          </NavLink>
          <NavLink href="/feed" icon={<BookOpen className="h-3.5 w-3.5" />}>
            Povești
          </NavLink>
          <NavLink href="/poze" icon={<Camera className="h-3.5 w-3.5" />}>
            Poze
          </NavLink>

          <div className="mx-2 h-5 w-px bg-sepia-300/15 hidden sm:block" />

          {user ? (
            <>
              <Button asChild size="sm" variant="default" className="gap-1.5">
                <Link href="/stories/new">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Contribuie</span>
                </Link>
              </Button>
              <Link href="/profile" className="ml-2">
                <Avatar className="h-9 w-9 ring-1 ring-sepia-300/40 ring-offset-2 ring-offset-sepia-900 transition-all hover:ring-sepia-200">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.username ?? ""} />
                  ) : null}
                  <AvatarFallback>
                    {profile?.username?.[0]?.toUpperCase() ?? <UserIcon className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/login">Intră</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center gap-1.5 px-3 py-2 text-sm text-sepia-100/90 hover:text-sepia-50 transition-colors",
      )}
    >
      <span className="text-sepia-300/80 group-hover:text-sepia-200 transition-colors">{icon}</span>
      <span className="hidden sm:inline">{children}</span>
      <span className="pointer-events-none absolute left-3 right-3 bottom-1 h-px origin-left scale-x-0 bg-sepia-300/60 transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}
