import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioMessagePlayerProps {
  src: string;
  isMine?: boolean;
}

export function AudioMessagePlayer({ src, isMine = false }: AudioMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-1 min-w-[200px] max-w-[260px]">
      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 shadow-md",
          isMine
            ? "bg-white text-primary hover:bg-white/90"
            : "bg-primary text-white hover:bg-primary/90",
        )}
        aria-label={isPlaying ? "Pausar áudio" : "Tocar áudio"}
      >
        {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1">
        {/* Animated Waveform Visualization */}
        <div className="flex items-center gap-0.5 h-6 cursor-pointer" onClick={togglePlay}>
          {[40, 75, 55, 90, 30, 80, 60, 100, 45, 85, 70, 50, 95, 60, 40, 80, 55, 70].map((h, i) => {
            const barProgress = (i / 18) * 100;
            const isPassed = barProgress <= progress;
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-all duration-150",
                  isMine
                    ? isPassed
                      ? "bg-white"
                      : "bg-white/40"
                    : isPassed
                      ? "bg-primary"
                      : "bg-white/20",
                  isPlaying && "animate-pulse",
                )}
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] opacity-80 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || 0)}</span>
        </div>
      </div>
    </div>
  );
}
