import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Play } from "lucide-react";

interface IntroSplashProps {
  onComplete?: () => void;
  targetDurationSeconds?: number;
}

export function IntroSplash({ onComplete, targetDurationSeconds = 5.5 }: IntroSplashProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Check if intro was already shown in this session
    const seen = sessionStorage.getItem("medguard_intro_played");
    if (seen === "true") {
      setIsVisible(false);
      if (onComplete) onComplete();
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      const naturalDuration = video.duration || targetDurationSeconds;
      // Calculate playback rate to match target duration (5 - 6 seconds) smoothly
      if (naturalDuration > 0) {
        const rate = naturalDuration / targetDurationSeconds;
        // Clamp playback rate between 0.8x and 1.3x for smooth, natural playback
        video.playbackRate = Math.max(0.75, Math.min(1.4, rate));
      }
      
      video.play().then(() => {
        setHasStarted(true);
      }).catch((e) => {
        console.warn("Autoplay notice:", e);
        // If autoplay policy blocks, user can click anywhere or skip
        setHasStarted(true);
      });
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [targetDurationSeconds, onComplete]);

  // Track progress and finish at target duration
  useEffect(() => {
    if (!isVisible || !hasStarted) return;

    const startTime = Date.now();
    const durationMs = targetDurationSeconds * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        handleFinish();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isVisible, hasStarted, targetDurationSeconds]);

  const handleFinish = () => {
    setIsFading(true);
    sessionStorage.setItem("medguard_intro_played", "true");
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 700);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black transition-opacity duration-700 ease-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Video Container */}
      <div className="relative size-full overflow-hidden flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src="/intro.mp4"
          playsInline
          autoPlay
          muted
          preload="auto"
          onEnded={handleFinish}
          className="size-full object-contain md:object-cover"
        />

        {/* Subtle Vignette Overlay for Premium Feel */}
        <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-black/20 to-black/70" />

        {/* Top Header Bar with Skip Button */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/25 hover:border-white/40 active:scale-95 cursor-pointer shadow-lg"
          >
            <span>Skip Intro</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Bottom Smooth Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex flex-col items-center">
          <div className="w-full max-w-md">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/15 backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 transition-[width] duration-75 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
