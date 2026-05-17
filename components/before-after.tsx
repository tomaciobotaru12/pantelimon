"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
};

export function BeforeAfter({
  beforeUrl,
  afterUrl,
  beforeLabel = "Atunci",
  afterLabel = "Acum",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updateFromClient = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] overflow-hidden rounded-lg select-none border border-sepia-700/30 bg-sepia-900"
      onMouseMove={(e) => dragging && updateFromClient(e.clientX)}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onTouchMove={(e) => updateFromClient(e.touches[0].clientX)}
    >
      {/* After (full background) */}
      <img
        src={afterUrl}
        alt={afterLabel}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute bottom-3 right-3 text-[11px] uppercase tracking-widest bg-sepia-900/80 text-sepia-100 px-2 py-1 rounded">
        {afterLabel}
      </span>

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeUrl}
          alt={beforeLabel}
          draggable={false}
          className="absolute inset-0 h-full object-cover sepia-image"
          style={{ width: containerRef.current?.clientWidth ?? "100%" }}
        />
        <span className="absolute bottom-3 left-3 text-[11px] uppercase tracking-widest bg-sepia-900/80 text-sepia-100 px-2 py-1 rounded">
          {beforeLabel}
        </span>
      </div>

      {/* Handle */}
      <motion.div
        className="absolute top-0 bottom-0 w-px bg-sepia-50 cursor-ew-resize shadow-[0_0_12px_rgba(245,236,217,0.7)]"
        style={{ left: `${position}%` }}
        onMouseDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-0 h-10 w-10 rounded-full bg-sepia-50 border-2 border-sepia-700 flex items-center justify-center text-sepia-900 text-xs font-bold shadow-lg">
          ‹ ›
        </div>
      </motion.div>

      {/* Invisible draggable overlay */}
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        aria-label="Glisor comparare imagini"
      />
    </div>
  );
}
