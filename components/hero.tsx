"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[680px] w-full overflow-hidden flex items-center justify-center">
      {/* Background image — pantelimon.webp */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-slow-pan"
        style={{
          backgroundImage: "url('/pantelimon.webp')",
          filter: "sepia(0.35) brightness(0.55) contrast(1.05) saturate(0.95)",
        }}
      />
      {/* Paper grain on top */}
      <div className="absolute inset-0 paper-grain" />
      {/* Dark gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-sepia-900/70 via-sepia-900/40 to-sepia-900/95" />
      {/* Vignette */}
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_30%,rgba(15,10,6,0.7)_100%)]" />

      {/* Content */}
      <div className="relative z-10 container text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-sepia-200/90 border border-sepia-300/40 rounded-full px-4 py-1.5 backdrop-blur-md bg-sepia-900/30">
            <MapPin className="h-3 w-3" />
            Pantelimon · București
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-display text-balance text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-sepia-50 leading-[1.05] max-w-5xl mx-auto drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          Sub blocurile Pantelimonului
          <br />
          <em className="italic text-sepia-200 font-normal">există un alt oraș.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.9 }}
          className="mt-8 max-w-2xl mx-auto text-base sm:text-lg text-sepia-100/85 leading-relaxed font-serif drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
        >
          O hartă vie a amintirilor. Hala Obor, lacul, tramvaiul 14, curtea din spatele blocului.
          Locuri care încă există — și locuri care există doar în memorie.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="text-base px-8 shadow-lg shadow-black/40">
            <Link href="/map" className="gap-2">
              Explorează Pantelimonul
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-base bg-sepia-900/40 backdrop-blur-md border-sepia-200/40 text-sepia-50 hover:bg-sepia-900/60"
          >
            <Link href="/feed">Citește poveștile</Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll cue — anchored to viewport bottom, separat de butoane */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{
          opacity: { duration: 1.2, delay: 2 },
          y: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 2.4 },
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-sepia-200/70"
      >
        <span className="text-[10px] uppercase tracking-[0.35em]">Coboară în amintiri</span>
        <ChevronDown className="h-4 w-4" />
      </motion.div>
    </section>
  );
}
