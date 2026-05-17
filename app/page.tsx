import Link from "next/link";
import { Hero } from "@/components/hero";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/story-card";
import { LocationCard } from "@/components/location-card";
import { ArrowRight, BookOpen, MapPin, Camera } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: locations }, { data: stories }] = await Promise.all([
    supabase.from("locations").select("*").limit(6),
    supabase
      .from("stories")
      .select("*, profile:profiles(*), location:locations(*), images:story_images(*)")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  return (
    <>
      <Hero />

      {/* Manifesto strip */}
      <section className="relative py-24 sm:py-32 border-t border-sepia-700/20">
        <div className="container max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sepia-300/70">
            Arhiva vie
          </p>
          <h2 className="mt-4 font-display text-3xl sm:text-5xl text-sepia-50 leading-tight text-balance">
            Cartierul nu e doar betonul, ci poveștile care îl traversează.
          </h2>
          <p className="mt-6 font-serif text-lg text-sepia-200/80 leading-relaxed">
            Aici Era e o hartă comunitară. Locuri, fotografii vechi, amintiri ale unor oameni
            care au crescut între blocurile Pantelimonului. O arhivă deschisă — la care poți
            adăuga și tu.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24">
        <div className="container grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: MapPin,
              title: "Explorezi harta",
              text: "Lacul, Obor, Morarilor, Baicului — fiecare punct ascunde o poveste, un an, o fotografie.",
            },
            {
              icon: Camera,
              title: "Compari trecutul",
              text: "Glisezi între cum era și cum e acum. Aceleași străzi, ani diferiți.",
            },
            {
              icon: BookOpen,
              title: "Adaugi memoria ta",
              text: "Ai o amintire, o fotografie de la bunici, o întâmplare? Locul ei e aici.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="relative rounded-lg border border-sepia-700/20 bg-sepia-900/40 p-6 backdrop-blur-sm"
            >
              <Icon className="h-6 w-6 text-sepia-300" />
              <h3 className="mt-4 font-display text-xl text-sepia-50">{title}</h3>
              <p className="mt-2 text-sm text-sepia-200/80 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Locations */}
      {locations && locations.length > 0 ? (
        <section className="py-16 sm:py-24 border-t border-sepia-700/20">
          <div className="container">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-sepia-300/70">
                  Locuri martor
                </p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl text-sepia-50">
                  Pantelimonul, punct cu punct
                </h2>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/map" className="gap-1.5">
                  Vezi harta
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((l) => (
                <LocationCard key={l.id} location={l} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Recent stories */}
      {stories && stories.length > 0 ? (
        <section className="py-16 sm:py-24 border-t border-sepia-700/20">
          <div className="container">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-sepia-300/70">
                  Adăugate recent
                </p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl text-sepia-50">
                  Amintiri din cartier
                </h2>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/feed" className="gap-1.5">
                  Toate poveștile
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="py-20 sm:py-32 border-t border-sepia-700/20">
        <div className="container text-center max-w-2xl">
          <h2 className="font-display text-3xl sm:text-5xl text-sepia-50 leading-tight">
            Adaugi o poveste la arhivă?
          </h2>
          <p className="mt-4 font-serif text-sepia-200/80 text-lg">
            E nevoie de o amintire, o fotografie, un loc pe hartă. Restul îl facem împreună.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/stories/new" className="gap-2">
              Contribuie acum
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
