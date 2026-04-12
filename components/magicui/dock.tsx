"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { PropsWithChildren, useRef } from "react";

const MAGNIFICATION = 60;
const DISTANCE = 100;
const BASE_SIZE = 40;

export interface DockProps {
  className?: string;
  children: React.ReactNode;
  magnification?: number;
  distance?: number;
}

export interface DockIconProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  label?: string;
}

const DockContext = React.createContext<{
  mouseX: ReturnType<typeof useMotionValue<number>>;
  magnification: number;
  distance: number;
} | null>(null);

export function Dock({
  className,
  children,
  magnification = MAGNIFICATION,
  distance = DISTANCE,
}: PropsWithChildren<DockProps>) {
  const mouseX = useMotionValue(Infinity);

  return (
    <DockContext.Provider value={{ mouseX, magnification, distance }}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          "flex h-14 sm:h-16 items-end gap-2 sm:gap-3 rounded-2xl border border-gray-200 bg-white/90 px-3 sm:px-4 pb-2 sm:pb-3 shadow-xl backdrop-blur-md",
          className
        )}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

export function DockIcon({ className, children, onClick, label }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = React.useContext(DockContext);

  if (!ctx) {
    return (
      <div
        ref={ref}
        onClick={onClick}
        title={label}
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-xl",
          className
        )}
        style={{ width: BASE_SIZE, height: BASE_SIZE }}
      >
        {children}
      </div>
    );
  }

  const { mouseX, magnification, distance } = ctx;

  const distanceValue = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distanceValue,
    [-distance, 0, distance],
    [BASE_SIZE, magnification, BASE_SIZE]
  );

  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      ref={ref}
      style={{ width, height: width }}
      onClick={onClick}
      title={label}
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-xl transition-colors",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
