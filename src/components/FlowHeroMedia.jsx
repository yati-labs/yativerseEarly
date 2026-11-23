import HeroVideo from "./HeroVideo";

// Hero media for the yAtI Flow pages. Until the corrected, optimized loop exists this shows a still
// with live-text model labels. Once the files are in public/flow, set mp4 (and optionally webm) below.
// The video must NOT have text baked into it; a moving frame cannot carry reliable labels.
export const HERO_VIDEO = {
  mp4: "/flow/hero-loop.mp4",
  webm: "/flow/hero-loop.webm",
  poster: "/flow/hero-poster.jpg",
};

export default function FlowHeroMedia({ className = "" }) {
  if (HERO_VIDEO.mp4) {
    return <HeroVideo className={className} poster={HERO_VIDEO.poster} mp4={HERO_VIDEO.mp4} webm={HERO_VIDEO.webm} />;
  }
  return (
    <div className={`relative ${className}`}>
      <img
        src={HERO_VIDEO.poster}
        width="580" height="578" fetchpriority="high" decoding="async"
        alt="yAtI Flow Thread Max capsule on the left and Thread One card on the right"
        className="h-full w-full object-cover"
      />
      <span className="absolute bottom-4 left-[24%] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-brand-gold2 backdrop-blur-sm">Thread Max</span>
      <span className="absolute bottom-4 left-[81%] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-brand-gold2 backdrop-blur-sm">Thread One</span>
    </div>
  );
}
