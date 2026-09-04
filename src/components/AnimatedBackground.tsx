import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  className?: string;
  variant?: "default" | "auth" | "subtle" | "discovery";
  showParticles?: boolean;
  showHearts?: boolean;
}

export function AnimatedBackground({
  className,
  variant = "default",
  showParticles = true,
  showHearts = true,
}: AnimatedBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none",
        className,
      )}
      aria-hidden="true"
    >
      {/* Base Dark Velvet Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#16121a] via-[#1a1420] to-[#120e17]" />

      {/* Layer 1: Ambient Glowing Aurora Mesh Orbs */}
      <div className="absolute inset-0 opacity-70">
        {/* Orb 1: Primary Warm Flame/Coral */}
        <div
          className={cn(
            "absolute -top-[10%] left-[10%] h-[420px] w-[420px] rounded-full blur-[110px] animate-aurora",
            variant === "auth"
              ? "bg-gradient-to-tr from-rose-600/35 via-orange-500/25 to-amber-500/20"
              : "bg-gradient-to-tr from-primary/30 via-rose-600/20 to-amber-500/15",
          )}
        />

        {/* Orb 2: Deep Romantic Magenta/Violet */}
        <div
          className={cn(
            "absolute top-[35%] -right-[10%] h-[480px] w-[480px] rounded-full blur-[130px] animate-aurora-slow",
            "bg-gradient-to-br from-purple-600/30 via-pink-600/25 to-rose-700/20",
          )}
        />

        {/* Orb 3: Cosmic Gold/Warm Glow */}
        <div
          className={cn(
            "absolute -bottom-[10%] left-[20%] h-[400px] w-[400px] rounded-full blur-[120px] animate-aurora",
            "bg-gradient-to-t from-amber-600/25 via-rose-500/20 to-indigo-700/15",
          )}
        />

        {/* Extra Center subtle orb for Auth or Discovery */}
        {variant === "auth" && (
          <div className="absolute top-[40%] left-[30%] h-[350px] w-[350px] rounded-full blur-[140px] bg-rose-500/20 animate-pulse-glow" />
        )}
      </div>

      {/* Layer 2: Subtle Animated Floating Hearts/Symbols */}
      {showHearts && (
        <div className="absolute inset-0 opacity-25">
          <FloatingHeart className="top-[15%] left-[8%] animate-float" size={28} delay="0s" />
          <FloatingHeart className="top-[28%] right-[12%] animate-float-reverse" size={22} delay="1.5s" />
          <FloatingHeart className="top-[65%] left-[12%] animate-float" size={32} delay="3s" />
          <FloatingHeart className="top-[75%] right-[18%] animate-float-reverse" size={24} delay="2s" />
          <FloatingSparkle className="top-[22%] right-[28%] animate-twinkle" size={16} delay="0.5s" />
          <FloatingSparkle className="top-[48%] left-[20%] animate-twinkle" size={18} delay="2.5s" />
          <FloatingSparkle className="top-[82%] left-[45%] animate-twinkle" size={14} delay="1.8s" />
        </div>
      )}

      {/* Layer 3: Twinkling Micro-Particles */}
      {showParticles && (
        <div className="absolute inset-0 opacity-40">
          <Particle className="top-[10%] left-[25%]" delay="0s" />
          <Particle className="top-[18%] left-[75%]" delay="1.2s" />
          <Particle className="top-[32%] left-[45%]" delay="2.4s" />
          <Particle className="top-[45%] left-[85%]" delay="0.7s" />
          <Particle className="top-[60%] left-[15%]" delay="3.1s" />
          <Particle className="top-[70%] left-[65%]" delay="1.8s" />
          <Particle className="top-[88%] left-[30%]" delay="2.2s" />
          <Particle className="top-[92%] left-[80%]" delay="0.9s" />
        </div>
      )}

      {/* Layer 4: Modern Vignette & Micro Dot Grid for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,12,18,0.75)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
    </div>
  );
}

function FloatingHeart({
  className,
  size = 24,
  delay = "0s",
}: {
  className?: string;
  size?: number;
  delay?: string;
}) {
  return (
    <svg
      className={cn("absolute text-rose-400/40 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]", className)}
      style={{ animationDelay: delay }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function FloatingSparkle({
  className,
  size = 16,
  delay = "0s",
}: {
  className?: string;
  size?: number;
  delay?: string;
}) {
  return (
    <svg
      className={cn("absolute text-amber-300/50 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]", className)}
      style={{ animationDelay: delay }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

function Particle({ className, delay = "0s" }: { className?: string; delay?: string }) {
  return (
    <div
      className={cn(
        "absolute h-1.5 w-1.5 rounded-full bg-rose-200/50 shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-twinkle",
        className,
      )}
      style={{ animationDelay: delay }}
    />
  );
}
