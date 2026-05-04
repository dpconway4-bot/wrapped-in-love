import { useState, useRef, useEffect, useCallback } from "react";

// Audio file map — add new week audio files here as they're added
const AUDIO_FILES: Record<string, string> = {
  "love-is-patient": new URL("../../../attached_assets/love-is-patient.wav", import.meta.url).href,
  "love-is-kind":         new URL("../../../attached_assets/love-is-kind.wav",         import.meta.url).href,
  "love-is-not-jealous":   new URL("../../../attached_assets/love-is-not-jealous.mp3",   import.meta.url).href,
  "love-is-not-boastful":  new URL("../../../attached_assets/love-is-not-boastful.mp3",  import.meta.url).href,
  "love-is-not-proud":     new URL("../../../attached_assets/love-is-not-proud.mp3",     import.meta.url).href,
  "love-is-not-rude":      new URL("../../../attached_assets/love-is-not-rude.mp3",      import.meta.url).href,
  "love-does-not-demand":    new URL("../../../attached_assets/love-does-not-demand.mp3",    import.meta.url).href,
  "love-is-not-irritable":   new URL("../../../attached_assets/love-is-not-irritable.mp3",   import.meta.url).href,
  "keeps-no-records":                    new URL("../../../attached_assets/keeps-no-records.mp3",                    import.meta.url).href,
  "does-not-rejoice-about-injustice":    new URL("../../../attached_assets/does-not-rejoice-about-injustice.mp3",    import.meta.url).href,
  "love-never-gives-up":                 new URL("../../../attached_assets/love-never-gives-up.mp3",                 import.meta.url).href,
  "love-is-always-hopeful":               new URL("../../../attached_assets/love-is-always-hopeful.mp3",               import.meta.url).href,
  "love-endures":                          new URL("../../../attached_assets/love-endures.mp3",                          import.meta.url).href,
};

function formatTime(seconds: number) {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface AudioPlayerProps {
  audioFile?: string; // key into AUDIO_FILES, e.g. "love-is-patient"
  title?: string;
  dayLabel?: string;
}

export function AudioPlayer({ audioFile = "love-is-patient", title = "Love Is Patient", dayLabel = "Day 1 · The Word" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);
  const [isLoaded, setIsLoaded]     = useState(false);

  const src = AUDIO_FILES[audioFile] ?? AUDIO_FILES["love-is-patient"];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Reset state when audio file changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoaded(false);

    const onLoaded = () => { setDuration(audio.duration); setIsLoaded(true); };
    const onTime   = () => setCurrentTime(audio.currentTime);
    const onEnded  = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.currentTime = val;
    setCurrentTime(val);
  }, []);

  const skip = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, currentTime + delta));
  }, [currentTime, duration]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const HEIGHTS = [40,60,80,50,90,70,45,85,55,75,95,65,40,80,60,50,90,70,45,80,55,70,85,60,40,75,90,50,65,80,45,70,55,85,60,40,90,75,50,65,80,45,55,85,60,70,40,50];

  return (
    <div
      className="w-full rounded-2xl p-6"
      style={{
        background: "var(--color-surface)",
        border: "1px solid rgba(250,178,77,0.2)",
        boxShadow: "0 4px 24px rgba(13,28,67,0.5)",
      }}
      data-testid="audio-player"
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title */}
      <div className="mb-5">
        <p className="font-display text-[11px] tracking-[0.3em] uppercase mb-1" style={{ color: "var(--color-gold)" }}>
          {dayLabel}
        </p>
        <p className="font-display text-xl font-light" style={{ color: "var(--color-cream)" }}>
          {title}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-rose)" }}>
          Spoken Word Devotional
        </p>
      </div>

      {/* Waveform bars */}
      <div className="flex items-center gap-[2px] h-8 mb-5" aria-hidden="true">
        {HEIGHTS.map((h, i) => {
          const isPast = (i / HEIGHTS.length) * 100 < progress;
          return (
            <div
              key={i}
              className="rounded-full flex-1 transition-colors duration-150"
              style={{
                height: `${h}%`,
                background: isPast
                  ? `rgba(250,178,77,${0.55 + (h / 100) * 0.45})`
                  : `rgba(207,150,153,0.18)`,
              }}
            />
          );
        })}
      </div>

      {/* Progress slider */}
      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={seek}
          className="audio-progress"
          data-testid="audio-seek"
          style={{
            background: `linear-gradient(to right, var(--color-gold) ${progress}%, rgba(250,178,77,0.18) ${progress}%)`
          }}
          aria-label="Seek audio"
        />
        <div className="flex justify-between mt-2">
          <span className="text-[11px]" style={{ color: "var(--color-rose)" }}>{formatTime(currentTime)}</span>
          <span className="text-[11px]" style={{ color: "var(--color-rose)" }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        {/* Rewind */}
        <button
          onClick={() => skip(-15)}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:opacity-70"
          style={{ color: "var(--color-rose)" }}
          aria-label="Rewind 15 seconds"
          data-testid="btn-rewind"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M1 4v6h6"/>
            <path d="M3.51 15a9 9 0 1 0 .49-4.4"/>
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          disabled={!isLoaded}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            background: isLoaded ? "var(--color-gold)" : "rgba(250,178,77,0.3)",
            color: "var(--color-navy)",
            boxShadow: isLoaded ? "0 0 40px rgba(250,178,77,0.3)" : "none",
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
          data-testid="btn-play-pause"
        >
          {isPlaying ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}>
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          )}
        </button>

        {/* Forward */}
        <button
          onClick={() => skip(15)}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:opacity-70"
          style={{ color: "var(--color-rose)" }}
          aria-label="Forward 15 seconds"
          data-testid="btn-forward"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M23 4v6h-6"/>
            <path d="M20.49 15a9 9 0 1 1-.49-4.4"/>
          </svg>
        </button>
      </div>

      {!isLoaded && (
        <p className="text-center text-xs mt-4" style={{ color: "var(--color-rose)" }}>
          Loading audio…
        </p>
      )}
    </div>
  );
}
