import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const U = "https://images.unsplash.com/";
function uSrc(id, w) { return `${U}${id}?auto=format&fit=crop&w=${w}&q=80`; }

const IMG_ID = {
  agentCMO: "photo-1519389950473-47ba0277781c",
  agentCRO: "photo-1521791136064-7986c2920216",
  agentCFO: "photo-1434030216411-0b793f4b4173",
  agentCOO: "photo-1478737270239-2f02b77fc618",
};

const AGENT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

const AGENTS = [
  {
    title: "AI CMO",
    role:  "Brand & demand",
    color: "#605CFF",
    text:  "Creates positioning, content strategy, campaigns, product messaging, and audience insights.",
    tasks: ["Brand positioning", "Content strategy", "Campaign ideas"],
    id: IMG_ID.agentCMO, alt: "Founder planning a go-to-market strategy",
  },
  {
    title: "AI CRO",
    role:  "Revenue growth",
    color: "#C86DD7",
    text:  "Scores leads, drafts outreach, supports deal coaching, and recommends next best actions.",
    tasks: ["Lead scoring", "Warm outreach", "Deal coaching"],
    id: IMG_ID.agentCRO, alt: "Professional connecting with a potential client",
  },
  {
    title: "AI CFO",
    role:  "Financial discipline",
    color: "#4ECDC4",
    text:  "Tracks budgets, runway, unit economics, investor updates, and financial decision scenarios.",
    tasks: ["Runway tracking", "Unit economics", "Investor updates"],
    id: IMG_ID.agentCFO, alt: "Founder reviewing financial metrics at desk",
  },
  {
    title: "AI COO",
    role:  "Execution engine",
    color: "#FF6B8A",
    text:  "Turns goals into workflows, routines, delivery systems, and operating dashboards.",
    tasks: ["Goal-to-workflow", "Daily routines", "Operating dashboards"],
    id: IMG_ID.agentCOO, alt: "Operator managing execution systems",
  },
];

const COST_COMPARISON = [
  { role: "CMO", label: "Chief Marketing Officer", cost: "$226K+", sub: "avg. base salary · US startup", accent: "#605CFF" },
  { role: "CRO", label: "Chief Revenue Officer",   cost: "$200K+", sub: "avg. base salary · US startup", accent: "#C86DD7" },
  { role: "CFO", label: "Chief Financial Officer", cost: "$200K+", sub: "avg. base salary · US startup", accent: "#4ECDC4" },
  { role: "COO", label: "Chief Operating Officer", cost: "$151K+", sub: "avg. base salary · US startup", accent: "#FF6B8A" },
];

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Each agent owns a function",
    text:  "Strategy, marketing, sales, finance, and operations — each agent runs real workflows inside that domain, every day.",
  },
  {
    n: "02",
    title: "They report to you",
    text:  "No agent acts unsupervised on anything that matters. Recommendations and drafts come to you for review and approval.",
  },
  {
    n: "03",
    title: "They connect through Founder OS",
    text:  "Your Digital C-Suite plugs into the same daily rhythm as everything else in yAtIverse — one system, not four separate tools.",
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

export default function AgentsPage() {
  return (
    <>
      <SEO
        path="/agents"
        title="Digital C-Suite — AI Executive Agents | yAtIverse"
        description="Role-based AI executives across strategy, marketing, sales, finance, and operations. The Digital C-Suite gives founders leadership support without enterprise overhead."
        canonical="https://yativerse.ai/agents"
        ogImage="https://yativerse.ai/og-image.png"
      />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />
        <main>

          {/* ══ HERO ══ */}
          <section className="relative px-6 pt-32 pb-20 overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none"
              style={{ background:"radial-gradient(ellipse 70% 50% at 50% 20%, rgba(255,107,138,0.14) 0%, transparent 65%)" }} />
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <Reveal>
                <span className="kicker mb-5 inline-block">Digital C-Suite · Your AI team</span>
                <h1 className="font-display font-bold leading-[1.02] tracking-[-0.03em] text-white mb-5"
                  style={{ fontSize:"clamp(36px,5.5vw,68px)" }}>
                  Executives,{" "}
                  <span className="text-gradient">without the overhead.</span>
                </h1>
                <p className="font-body text-lg text-white/55 leading-relaxed max-w-xl mx-auto mb-8">
                  Role-based AI agents — CMO, CRO, CFO, COO — each running real workflows in your business. Strategy, growth, finance, and execution, working in the background every day.
                </p>
                <Link to="/waitlist" className="btn-primary">Join the Waitlist →</Link>
              </Reveal>
            </div>
          </section>

          {/* ══ AGENT GRID ══ */}
          <section className="py-20 px-6 border-t border-white/[0.06]" aria-labelledby="agents-heading">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">Meet the team</span>
                  <h2 id="agents-heading" className="font-display font-bold tracking-tight text-white"
                    style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                    Four roles.{" "}
                    <span className="text-gradient">One invisible team.</span>
                  </h2>
                </Reveal>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {AGENTS.map((a, i) => (
                  <Reveal key={a.title} delay={i * 0.07}>
                    <article className="glass rounded-2xl overflow-hidden hover:border-white/14 transition-all duration-300 group hover:-translate-y-1 cursor-default h-full">
                      <div className="relative overflow-hidden" style={{ height: 140 }}>
                        <img src={uSrc(a.id, 400)} srcSet={`${uSrc(a.id, 200)} 200w, ${uSrc(a.id, 400)} 400w`}
                          sizes={AGENT_SIZES} alt={a.alt} width={400} height={140} loading="lazy" decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div aria-hidden="true" className="absolute inset-0"
                          style={{ background:"linear-gradient(to bottom, transparent 20%, rgba(5,8,20,0.9) 100%)" }} />
                      </div>
                      <div className="p-5">
                        <span className="inline-block text-[10px] font-mono font-medium tracking-widest uppercase px-2.5 py-1 rounded-full mb-2"
                          style={{ background:`${a.color}18`, color:a.color, border:`1px solid ${a.color}30` }}>
                          {a.title}
                        </span>
                        <p className="font-display text-xs font-semibold mb-3" style={{ color: a.color }}>{a.role}</p>
                        <p className="font-body text-xs text-white/55 leading-relaxed mb-3">{a.text}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {a.tasks.map((t) => (
                            <span key={t} className="text-[10px] font-body px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50">{t}</span>
                          ))}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ HOW IT WORKS ══ */}
          <section className="py-20 px-6 border-t border-white/[0.06]" aria-labelledby="how-heading">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">How it works</span>
                  <h2 id="how-heading" className="font-display font-bold tracking-tight text-white"
                    style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                    Leadership support,{" "}
                    <span className="text-gradient">without the org chart.</span>
                  </h2>
                </Reveal>
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                {HOW_IT_WORKS.map((item, i) => (
                  <Reveal key={item.n} delay={i * 0.08}>
                    <div className="glass rounded-2xl p-6 h-full">
                      <span aria-hidden="true" className="block font-mono text-3xl font-bold mb-4 leading-none"
                        style={{ color:"rgba(255,107,138,0.4)" }}>{item.n}</span>
                      <h3 className="font-display font-semibold text-base text-white mb-2">{item.title}</h3>
                      <p className="font-body text-sm text-white/50 leading-relaxed">{item.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ SAVINGS ══ */}
          <section className="py-20 px-6 border-t border-white/[0.06]" aria-labelledby="savings-heading">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">What you save</span>
                  <h2 id="savings-heading" className="font-display font-bold leading-tight tracking-tight text-white"
                    style={{ fontSize:"clamp(28px,3.5vw,44px)" }}>
                    A real C-Suite costs<br />
                    <span className="text-gradient">$750K+ a year.</span>
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="font-body text-base text-white/58 leading-relaxed lg:pt-14">
                    Hiring CMO, CRO, CFO, and COO full-time costs over $750,000 in base salaries alone — before benefits, bonuses, or equity. Your Digital C-Suite gives you the same functional coverage, working 24/7, at a fraction of the cost.
                  </p>
                </Reveal>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {COST_COMPARISON.map((item, i) => (
                  <Reveal key={item.role} delay={i * 0.07}>
                    <div className="glass rounded-2xl overflow-hidden border border-white/[0.08] h-full">
                      <div aria-hidden="true" className="h-1 w-full" style={{ background: item.accent, opacity: 0.7 }} />
                      <div className="p-5">
                        <span className="font-mono text-[10px] tracking-widest uppercase mb-2 block"
                          style={{ color: item.accent }}>{item.role}</span>
                        <p className="font-display font-bold text-white mb-1"
                          style={{ fontSize:"clamp(20px,2.5vw,28px)" }}>{item.cost}</p>
                        <p className="font-body text-xs text-white/35 leading-relaxed">{item.label}</p>
                        <p className="font-mono text-[10px] text-white/25 mt-1">{item.sub}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.32}>
                <div className="glass rounded-2xl p-6 grid sm:grid-cols-2 gap-4 items-center">
                  <div className="flex items-start gap-3">
                    <span className="text-white/20 text-lg font-bold flex-shrink-0 mt-0.5" aria-hidden="true">✕</span>
                    <div>
                      <p className="font-display font-semibold text-white text-base mb-1">Full C-Suite hire</p>
                      <p className="font-display font-bold text-white/40" style={{ fontSize:"clamp(20px,2vw,24px)" }}>$750,000+ / year</p>
                      <p className="font-body text-xs text-white/30 mt-1">Base salaries only · benefits, bonuses & equity extra</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:border-l sm:border-white/[0.06] sm:pl-4">
                    <span className="text-[#77d6a1] text-lg font-bold flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                    <div>
                      <p className="font-display font-semibold text-white text-base mb-1">Your Digital C-Suite</p>
                      <p className="font-display font-bold text-[#77d6a1]" style={{ fontSize:"clamp(20px,2vw,24px)" }}>A fraction of that</p>
                      <p className="font-body text-xs text-white/30 mt-1">24/7 · no hiring · no notice period · no equity dilution</p>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.4}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/20 text-center mt-5">
                  Salary data sourced from Built In, ZipRecruiter, and Salary.com · 2025–2026
                </p>
              </Reveal>
            </div>
          </section>

          {/* ══ CTA ══ */}
          <section className="py-24 px-6" aria-labelledby="cta-heading">
            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 px-8 md:px-12 py-16 text-center"
                style={{ background:"radial-gradient(ellipse 70% 60% at 50% 40%, rgba(255,107,138,0.16), rgba(5,8,20,0.92) 70%)" }}>
                <Reveal>
                  <h2 id="cta-heading" className="font-display font-bold tracking-tight text-white mb-4"
                    style={{ fontSize:"clamp(28px,4vw,48px)" }}>
                    Build your invisible team.
                  </h2>
                  <p className="font-body text-white/60 mt-2 max-w-xl mx-auto leading-relaxed mb-8">
                    Join the waitlist to get early access to your Digital C-Suite as it rolls out.
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