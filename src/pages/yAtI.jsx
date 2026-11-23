import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { ROUTE_SEO } from "../seo/routes";

// ─── Fade-up helper ───────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay },
});

// ─── Updated SECTIONS (4 total) ─────────────────────────────────────
const SECTIONS = [
  {
    number: "01",
    eyebrow: "Walk Your Own Path",
    title: ["Followers optimize.", "Founders pioneer."],
    body: "Founders create categories, behaviors, and entirely new directions. They move before there is a trail to follow.",
    quote: "Invisible today. Unstoppable tomorrow.",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80",
    accent: "#FF3CB4",
  },
  {
    number: "02",
    eyebrow: "Massive Footprints",
    title: ["Impact larger", "than identity."],
    body: "The best entrepreneurs leave traces everywhere — markets, culture, behavior. Their influence expands beyond the company itself.",
    quote: "The best founders leave footprints bigger than their company.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80",
    accent: "#9A5BFF",
  },
  {
    number: "03",
    eyebrow: "Harsh Conditions",
    title: ["Startup winter", "creates legends."],
    body: "Rejection. Failed launches. Investor silence. Sleepless nights. Founders are forged through resistance.",
    quote: "Startup winter is where real founders are born.",
    image:
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=2000&q=80",
    accent: "#FF3CB4",
  },
  {
    number: "04",
    eyebrow: "Built for the Wild",
    title: ["Forged by uncertainty.", "Built for wilderness."],
    body: "Real builders operate in ambiguity. Low resources, impossible odds, unclear maps — this is where startups are born. The wilderness is not a threat; it is the proving ground.",
    quote: "The wilderness reveals the founders who endure.",
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=2000&q=80",
    accent: "#9A5BFF",
  },
];

// ─── MOTTO WALL (unchanged for now) ───────────────────────────────
const MOTTO = [
  { text: "Pioneers move before the map exists.", align: "text-left" },
  { text: "Footprints matter more than followers.", align: "text-right" },
  { text: "Winter builds the ones who endure.", align: "text-center" },
  { text: "The wilderness rewards those who walk alone.", align: "text-left" },
];

// ─── Background layers ─────────────────────────────────────────────
function BgLayers({ image, accentLeft = true }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{ background: `url(${image}) center/cover no-repeat` }}
      />
      <div className="absolute inset-0 bg-[#02030A]/70" />
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: accentLeft
            ? "radial-gradient(ellipse 60% 70% at 10% 50%, rgba(154,91,255,.3), transparent)"
            : "radial-gradient(ellipse 60% 70% at 90% 50%, rgba(255,60,180,.3), transparent)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, #02030A)",
        }}
      />
    </>
  );
}

// ─── Quote Card ───────────────────────────────────────────────────
function QuoteCard({ quote, accent }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden p-10"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        boxShadow: `0 0 80px ${accent}22`,
      }}
    >
      <div
        className="absolute left-0 top-8 bottom-8 w-[3px] rounded-full"
        style={{
          background: `linear-gradient(to bottom, ${accent}, transparent)`,
        }}
      />

      <span
        className="absolute top-2 right-6 select-none pointer-events-none font-serif leading-none"
        style={{ fontSize: "9rem", color: accent, opacity: 0.1 }}
        aria-hidden="true"
      >
        &ldquo;
      </span>

      <p
        className="text-[10px] uppercase tracking-[0.3em] mb-5 font-mono"
        style={{ color: `${accent}99` }}
      >
        Founder Translation
      </p>

      <blockquote
        className="font-display italic text-white/90 leading-[1.2] tracking-tight"
        style={{ fontSize: "clamp(20px,2.6vw,34px)" }}
      >
        &ldquo;{quote}&rdquo;
      </blockquote>
    </div>
  );
}

// ─── Manifesto Section ────────────────────────────────────────────
function ManifestoSection({ section, index }) {
  const reversed = index % 2 !== 0;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden border-t border-white/[0.05]">
      <BgLayers image={section.image} accentLeft={!reversed} />

      <div
        className={`relative z-10 max-w-6xl mx-auto w-full px-6 lg:px-12 grid lg:grid-cols-2 gap-16 xl:gap-24 items-center py-24 ${
          reversed ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Content */}
        <motion.div {...fadeUp(0)} className="relative">
          <span
            className="absolute -top-10 -left-2 select-none pointer-events-none font-display font-bold leading-none"
            style={{
              fontSize: "clamp(120px,18vw,220px)",
              color: "rgba(255,255,255,0.025)",
              zIndex: -1,
            }}
            aria-hidden="true"
          >
            {section.number}
          </span>

          <div className="flex items-center gap-3 mb-6">
            <span
              className="text-[10px] uppercase tracking-[0.3em] font-mono px-3 py-1 rounded-full"
              style={{
                color: section.accent,
                background: `${section.accent}18`,
                border: `1px solid ${section.accent}40`,
              }}
            >
              {section.number}
            </span>
            <span className="text-[10px] uppercase tracking-[0.28em] font-mono text-white">
              {section.eyebrow}
            </span>
          </div>

          <div
            className="mb-7 h-px w-14"
            style={{
              background: `linear-gradient(to right, ${section.accent}, transparent)`,
            }}
          />

          <h2
            className="font-display font-bold tracking-[-0.04em] leading-[0.92] mb-7"
            style={{ fontSize: "clamp(42px,5.5vw,86px)" }}
          >
            <span className="text-white">{section.title[0]}</span>
            <br />
            <span style={{ color: section.accent }}>{section.title[1]}</span>
          </h2>

          <p className="text-white/55 text-[17px] leading-relaxed max-w-md">
            {section.body}
          </p>
        </motion.div>

        {/* Quote */}
        <motion.div {...fadeUp(0.12)}>
          <QuoteCard quote={section.quote} accent={section.accent} />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function YATI() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <>
      <SEO path="/yAtI" {...ROUTE_SEO["/yAtI"]} />

      <div className="bg-[#02030A] text-white min-h-screen overflow-hidden">
        <Navbar />

        {/* Global atmosphere */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 18% 0%, rgba(120,70,255,.2), transparent 48%), radial-gradient(circle at 82% 15%, rgba(255,60,180,.18), transparent 48%), #02030A",
          }}
        />

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
        >
          {/* Background layers */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80) center/cover no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-[#02030A]/80" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 25%, rgba(154,91,255,.32), transparent)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-64 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, transparent, #02030A)",
            }}
          />

          {/* Hero content */}
          <motion.div
            style={{ y: heroY }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <motion.div {...fadeUp(0)} className="mb-10">
              <span
                className="text-[11px] uppercase tracking-[0.35em] font-mono px-4 py-2 rounded-full"
                style={{
                  color: "#9A5BFF",
                  background: "rgba(154,91,255,0.1)",
                  border: "1px solid rgba(154,91,255,0.3)",
                }}
              >
                Your Story
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.07)}
              className="font-display font-bold text-white tracking-[-0.05em] leading-[0.88]"
              style={{ fontSize: "clamp(66px,11vw,160px)" }}
            >
              yAtI —
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #9A5BFF 0%, #FF3CB4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Your Story.
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.15)}
              className="mt-10 text-white/50 text-lg max-w-lg leading-relaxed"
            >
              yAtI is your story — the path you carve, the wilderness you walk,
              and the future only you can see.
            </motion.p>

            <motion.div
              {...fadeUp(0.22)}
              className="mt-16 flex flex-col items-center gap-2 text-white/25"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono">
                Scroll
              </span>
              <div
                className="w-px h-10"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(154,91,255,0.6), transparent)",
                }}
              />
            </motion.div>
          </motion.div>
        </section>

        {/* ── MANIFESTO SECTIONS ───────────────────────────────── */}
        {SECTIONS.map((section, i) => (
          <ManifestoSection key={section.number} section={section} index={i} />
        ))}

        {/* ── MOTTO WALL ───────────────────────────────────────── */}
        <section className="relative py-40 px-6 lg:px-16 border-t border-white/[0.05] overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(154,91,255,.3), transparent)",
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto space-y-10">
            {MOTTO.map((item, i) => (
              <motion.div
                key={item.text}
                {...fadeUp(i * 0.07)}
                className={item.align}
              >
                <span
                  className="font-display font-bold tracking-tight leading-none inline-block"
                  style={{
                    fontSize: "clamp(22px,3vw,48px)",
                    background:
                      i % 3 === 0
                        ? "linear-gradient(90deg, #fff 60%, rgba(255,255,255,0.35))"
                        : i % 3 === 1
                          ? "linear-gradient(90deg, rgba(255,255,255,0.35), #fff)"
                          : "linear-gradient(90deg, rgba(255,255,255,0.4), #fff 50%, rgba(255,255,255,0.4))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section className="relative border-t border-white/[0.05] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(154,91,255,.16), transparent), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(255,60,180,.12), transparent)",
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-40 grid lg:grid-cols-[1fr_auto] gap-16 items-end">
            <div>
              <motion.p
                {...fadeUp(0)}
                className="text-[11px] uppercase tracking-[0.35em] font-mono text-white/25 mb-8"
              >
                Ready to build?
              </motion.p>

              <motion.h2
                {...fadeUp(0.06)}
                className="font-display font-bold tracking-[-0.05em] leading-[0.9] text-white"
                style={{ fontSize: "clamp(52px,8vw,120px)" }}
              >
                Leave footprints.
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #9A5BFF 0%, #FF3CB4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Not excuses.
                </span>
              </motion.h2>
            </div>

            <motion.div
              {...fadeUp(0.12)}
              className="flex flex-col items-end gap-8 pb-2"
            >
              <Link
                to="/waitlist"
                className="group flex items-center gap-3 px-8 py-4 rounded-full text-white text-sm font-medium tracking-wide transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: "linear-gradient(135deg, #9A5BFF, #FF3CB4)",
                  boxShadow: "0 0 40px rgba(154,91,255,0.4)",
                }}
              >
                Enter the yAtIverse
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          <div className="relative z-10 border-t border-white/[0.05] px-6 lg:px-12 py-5 flex items-center justify-between">
            <span className="text-[11px] font-mono text-white tracking-[0.3em]">
              yAtIverse
            </span>
            <div
              className="h-px flex-1 mx-8"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(154,91,255,0.25), transparent)",
              }}
            />
            <span className="text-[11px] font-mono text-white uppercase tracking-[0.3em]">
              Built for wilderness.
            </span>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
