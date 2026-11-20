import { useState } from "react";

// Looping, muted, decorative hero video. Falls back to the poster image when the
// visitor prefers reduced motion or has Data Saver on, and while files are missing.
export default function HeroVideo({ poster, mp4 = "/video/hero.mp4", webm = "/video/hero.webm", className = "aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl bg-brand-bg2" }) {
  const [still] = useState(
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      navigator.connection?.saveData === true
  );
  return (
    <div className={className} aria-hidden="true">
      {still ? (
        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: poster ? `url(${poster})` : undefined }} />
      ) : (
        <video
          className="h-full w-full object-cover"
          autoPlay muted loop playsInline preload="metadata" poster={poster} aria-hidden="true" tabIndex={-1}
        >
          {webm && <source src={webm} type='video/webm; codecs="vp9"' />}
          <source src={mp4} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
