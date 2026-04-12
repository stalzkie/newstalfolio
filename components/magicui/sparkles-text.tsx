"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const GRAY_PALETTE = [
  "#1a1a1a",
  "#374151",
  "#4b5563",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
  "#e5e7eb",
];

interface Sparkle {
  id: number;
  x: string;
  y: string;
  color: string;
  scale: number;
  delay: number;
  duration: number;
}

function generateSparkle(): Sparkle {
  return {
    id: Math.random(),
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    color: GRAY_PALETTE[Math.floor(Math.random() * GRAY_PALETTE.length)],
    scale: Math.random() * 0.9 + 0.3,
    delay: Math.random() * 2.5,
    duration: Math.random() * 1.2 + 0.6,
  };
}

export interface SparklesTextProps {
  text: string;
  className?: string;
  sparklesCount?: number;
}

export function SparklesText({
  text,
  className,
  sparklesCount = 10,
}: SparklesTextProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const init = () =>
      setSparkles(Array.from({ length: sparklesCount }, generateSparkle));
    init();
    const id = setInterval(init, 2800);
    return () => clearInterval(id);
  }, [sparklesCount]);

  return (
    <span className={cn("relative inline-block", className)}>
      {sparkles.map((s) => (
        <span
          key={s.id}
          aria-hidden
          className="pointer-events-none absolute select-none"
          style={{
            left: s.x,
            top: s.y,
            color: s.color,
            transform: `scale(${s.scale})`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            animation: `sparkle-pop ${s.duration}s ease-in-out ${s.delay}s infinite`,
            zIndex: 10,
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0C12 0 12 12 0 12C12 12 12 24 12 24C12 24 12 12 24 12C12 12 12 0 12 0Z" />
          </svg>
        </span>
      ))}
      <span className="relative z-20">{text}</span>
    </span>
  );
}
