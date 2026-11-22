import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const U = "https://images.unsplash.com/";
function uSrc(id, w) { return `${U}${id}?auto=format&fit=crop&w=${w}&q=80`; }

const OS_PREVIEW_ID = "photo-1551288049-bebda4e38f71";

const TIMELINE_CARDS = [
  { time: "06:00", title: "Morning check-in",  text: "Yesterday's conversations, summarized. Founder OS surfaces your top priority for the day." },
  { time: "12:30", title: "Decision queue",    text: "Three items ready for review. Market note flagged. Draft approved. Each takes under a minute." },
  { time: "17:00", title: "Day closed",        text: "Agents keep working. Content drafted. Leads scored. Numbers updated. You live your life." },
];

const PILLARS_OF_OS = [
  {
    title: "Goals",
    text:  "One place for what you're actually trying to do this week, this month, this quarter — not scattered across docs and apps.",
    accent: "#605CFF",
  },
  {
    title: "Priorities",
    text:  "Founder OS surfaces what matters today, pulled from your captured conversations and your agents' overnight work.",
    accent: "#C86DD7",
  },
  {
    title: "Decisions",
    text:  "A clear queue of what needs your call — not a flood of notifications, just the things only you can decide.",
    accent: "#4ECDC4",
  },
  {
    title: "Rhythm",
    text:  "A weekly operating cadence that compounds, instead of starting from zero every Monday.",
    accent: "#FF6B8A",
  },
];

function Reveal({ children, delay = 0, className = "", style = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)",
               transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

export default function OSPage() {
  const [activeTimeline, setActiveTimeline] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveTimeline((p) => (p + 1) % TIMELINE_CARDS.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <SEO
        path="/founder-os"
        title="Founder OS — Your Command Center | yAtIverse"
        description="Founder OS connects what you capture and what your agents produce into a single daily view. One operating rhythm for goals, priorities, and decisions."
        canonical="https://yativerse.ai/founder-os"
        ogImage="https://yativerse.ai/og-image.png"
      />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />
        <main>

          {/* ══ HERO ══ */}
          <section className="relative px-6 pt-32 pb-20 overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none"
              style={{ background:"radial-gradient(ellipse 70% 50% at 50% 20%, rgba(78,205,196,0.14) 0%, transparent 65%)" }} />
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <Reveal>
                <span className="kicker mb-5 inline-block">Founder OS · Your command center</span>
                <h1 className="font-display font-bold leading-[1.02] tracking-[-0.03em] text-white mb-5"
                  style={{ fontSize:"clamp(36px,5.5vw,68px)" }}>
                  Your day —{" "}
                  <span className="text-gradient">without the chaos.</span>
                </h1>
                <p className="font-body text-lg text-white/55 leading-relaxed max-w-xl mx-auto mb-8">
                  Founder OS connects what you capture and what your agents produce into a single daily view. One operating rhythm for goals, priorities, and decisions.
                </p>
                <Link to="/waitlist" className="btn-primary">Join the Waitlist →</Link>
              </Reveal>
            </div>
          </section>

          {/* ══ DAY IN THE LIFE ══ */}
          <section className="py-20 px-6 border-t border-white/[0.06]" aria-labelledby="day-heading">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="flex flex-col gap-3">
                {TIMELINE_CARDS.map((card, i) => (
                  <button key={card.time} onClick={() => setActiveTimeline(i)}
                    aria-pressed={i === activeTimeline}
                    className={`rounded-2xl p-5 text-left transition-all duration-500 border ${
                      i === activeTimeline ? "bg-white/[0.07] border-white/20" : "bg-white/[0.02] border-white/[0.06] opacity-55"
                    }`}>
                    <p className="font-mono text-xs text-white/45 mb-1">{card.time}</p>
                    <p className="font-display font-semibold text-sm text-white mb-1">{card.title}</p>
                    <p className="font-body text-xs text-white/55 leading-relaxed">{card.text}</p>
                  </button>
                ))}
                <div className="relative rounded-2xl overflow-hidden mt-2 border border-white/[0.08]" style={{ height: 180 }}>
                  <img src={uSrc(OS_PREVIEW_ID, 800)} srcSet={`${uSrc(OS_PREVIEW_ID, 400)} 400w, ${uSrc(OS_PREVIEW_ID, 800)} 800w`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    alt="Founder OS dashboard showing goals, priorities, and daily workflow"
                    width={640} height={180} loading="lazy" decoding="async"
                    className="w-full h-full object-cover" />
                  <div aria-hidden="true" className="absolute inset-0"
                    style={{ background:"linear-gradient(135deg, rgba(78,205,196,0.2) 0%, transparent 60%)" }} />
                  <p className="absolute bottom-3 left-4 text-[10px] font-mono uppercase tracking-widest text-white/40">Founder OS · Preview</p>
                </div>
              </div>
              <Reveal delay={0.1}>
                <span id="day-heading" className="kicker mb-5 inline-block">A day with Founder OS</span>
                <h2 className="font-display font-bold tracking-tight text-white mb-5"
                  style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                  Know what matters,<br />before you open ten tabs.
                </h2>
                <p className="font-body text-base text-white/55 leading-relaxed mb-8 max-w-md">
                  Founder OS replaces scattered tabs, morning confusion, and end-of-day guilt with one clear operating rhythm. Know what matters. Let agents handle the rest. Watch it compound.
                </p>
                <Link to="/waitlist" className="btn-ghost">Join the Waitlist →</Link>
              </Reveal>
            </div>
          </section>

          {/* ══ FOUR PILLARS OF THE OS ══ */}
          <section className="py-20 px-6 border-t border-white/[0.06]" aria-labelledby="pillars-os-heading">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">What it organizes</span>
                  <h2 id="pillars-os-heading" className="font-display font-bold tracking-tight text-white"
                    style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                    One system.{" "}
                    <span className="text-gradient">Four moving parts.</span>
                  </h2>
                </Reveal>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PILLARS_OF_OS.map((p, i) => (
                  <Reveal key={p.title} delay={i * 0.07}>
                    <div className="glass rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/16 transition-all duration-300 h-full">
                      <div aria-hidden="true" className="h-1.5 w-full" style={{ background: p.accent, opacity: 0.85 }} />
                      <div className="p-6">
                        <h3 className="font-display font-semibold text-base text-white mb-2">{p.title}</h3>
                        <p className="font-body text-sm text-white/50 leading-relaxed">{p.text}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ CTA ══ */}
          <section className="py-24 px-6" aria-labelledby="cta-heading">
            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 px-8 md:px-12 py-16 text-center"
                style={{ background:"radial-gradient(ellipse 70% 60% at 50% 40%, rgba(78,205,196,0.16), rgba(5,8,20,0.92) 70%)" }}>
                <Reveal>
                  <h2 id="cta-heading" className="font-display font-bold tracking-tight text-white mb-4"
                    style={{ fontSize:"clamp(28px,4vw,48px)" }}>
                    Your command center is coming.
                  </h2>
                  <p className="font-body text-white/60 mt-2 max-w-xl mx-auto leading-relaxed mb-8">
                    Join the waitlist for early access to Founder OS.
                  </p>
                  <Link to="/waitlist" className="btn-primary !py-4 !px-10 !text-base uppercase tracking-wide">
                    Join the Waitlist →
                  </Link>
                </Reveal>
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}