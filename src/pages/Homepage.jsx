import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import HeroCards from "../components/HeroCards";

const B =
  "https://gktcrehhhixfgwkixamg.supabase.co/storage/v1/object/public/yati/";
const U = "https://images.unsplash.com/";

function uSrc(id, w) {
  return `${U}${id}?auto=format&fit=crop&w=${w}&q=80`;
}
function uSrcset(id, widths) {
  return widths.map((w) => `${uSrc(id, w)} ${w}w`).join(", ");
}

const GIF = {
  morning: B + "morning.mp4",
  withAgents: B + "Founder_with_AI_agents_202605291326.mp4",
  deepWork: B + "deep_work.mp4",
};

const POSTER = {
  morning: uSrc("photo-1506784983877-45594efa4cbe", 600),
  withAgents: uSrc("photo-1551434678-e076c223a692", 600),
};

const IMG_ID = {
  osPreview: "photo-1551288049-bebda4e38f71",
  agentCMO: "photo-1519389950473-47ba0277781c",
  agentCRO: "photo-1521791136064-7986c2920216",
  agentCFO: "photo-1434030216411-0b793f4b4173",
  agentCOO: "photo-1478737270239-2f02b77fc618",
  audienceFounder: "photo-1556761175-4b46a572b786",
  audienceOperator: "photo-1504384308090-c894fdcc538d",
  audienceCreator: "photo-1611532736597-de2d4265fba3",
};

const AGENT_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";
const AUDIENCE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
const OS_SIZES = "(max-width: 1024px) 100vw, 50vw";


const RING_IMAGES = [
  "/ring1.jpeg",
  "/ring2.jpeg",
  "/ring3.jpeg",
  "/ring4.jpeg",
];

const HERO_CARDS = [
  {
    src: GIF.morning,
    posterId: "photo-1506784983877-45594efa4cbe",
    label: "Morning ritual",
    alt: "Founder starting their morning ritual at desk",
  },
  {
    src: GIF.withAgents,
    posterId: "photo-1551434678-e076c223a692",
    label: "With your agents",
    alt: "Founder collaborating with AI agents on screen",
  },
  {
    src: GIF.deepWork,
    posterId: "photo-1498050108023-c5249f4df085",
    label: "Deep work",
    alt: "Founder in deep focused work session",
  },
];

// ─── COPY ────────────────────────────────────────────────────────────────────

const SIGNALS = [
  "Recovery: 84%",
  "Resting HR: 58 bpm",
  "Sleep: 7h 12m",
  "Steps today: 4,210",
];

const HERO_PILLS = [
  { dot: "#605CFF", label: "yAtI Flow — Thread One & Thread Max" },
  { dot: "#C86DD7", label: "Digital C-Suite — your AI team" },
  { dot: "#FF6B8A", label: "Founder OS — your command center" },
];

const QUICK_LINKS = [
  { title: "yAtI Flow", text: "Thread One & Thread Max — early access", href: "/yati-flow" },
  { title: "Digital C-Suite", text: "Your invisible AI team", href: "/agents" },
  { title: "Founder OS", text: "Your daily command center", href: "/founder-os" },
  { title: "Community", text: "Founders who live it", href: "/community" },
];

// ── STORY TEASER — points to the dedicated /yAtI story page ──
const STORY = {
  kicker: <>Why <span className="normal-case">yAtIverse</span> exists</>,
  title: "yAtI — Your Story.",
  subtitle:
    "The path you carve, the wilderness you walk, the future only you can see.",
  lines: [
    "Pioneers move before the map exists.",
    "Footprints matter more than followers.",
    "Winter builds the ones who endure.",
  ],
  cta: "Read yAtI — Your Story",
  href: "/yAtI",
};

// ── THREE PILLARS ──
const PILLARS = [
  {
    id: "flow",
    eyebrow: "Pillar 01 · Wearables",
    name: "yAtI Flow",
    tagline: "Starts with your conversations. Built to grow.",
    text: "yAtI Flow is our line of AI-native wearables. Thread One and Thread Max capture your conversations and turn them into follow-ups. The Signal Ring follows later, tracking sleep, heart rate, activity, and recovery.",
    accent: "#605CFF",
    link: "/yati-flow",
    linkText: "Explore yAtI Flow",
  },
  {
    id: "csuite",
    eyebrow: "Pillar 02 · Your AI team",
    name: "Digital C-Suite",
    tagline: "Executives, without the overhead.",
    text: "Role-based AI agents — CMO, CRO, CFO, COO — each running real workflows in your business. Strategy, growth, finance, and execution, working in the background every day.",
    accent: "#FF6B8A",
    link: "/agents",
    linkText: "Meet your C-Suite",
  },
  {
    id: "os",
    eyebrow: "Pillar 03 · Your command center",
    name: "Founder OS",
    tagline: "Where it all comes together.",
    text: "One operating rhythm for goals, priorities, and decisions. Founder OS connects what you capture and what your agents produce into a single daily view.",
    accent: "#4ECDC4",
    link: "/founder-os",
    linkText: "See how it works",
  },
];

const AVAILABILITY = [
  { name: "Thread One", pillar: "yAtI Flow", status: "Early access", accent: "#C9A84C", dot: "#F5C542" },
  { name: "Thread Max", pillar: "yAtI Flow", status: "Early access", accent: "#C9A84C", dot: "#F5C542" },
  { name: "Signal Ring", pillar: "yAtI Flow", status: "Coming later", accent: "#605CFF", dot: "#b9b0a2" },
  {
    name: "Founder OS",
    pillar: "Command center",
    status: "Early access",
    accent: "#4ECDC4",
    dot: "#F5C542",
  },
  {
    name: "Digital C-Suite",
    pillar: "AI executives",
    status: "Waitlist",
    accent: "#FF6B8A",
    dot: "#b9b0a2",
  },
];

const ECOSYSTEM_VALUE = [
  {
    title: "Unifies disconnected AI use cases",
    text: "Instead of separate tools for notes, content, tasks, and decisions — one connected system that grows with you.",
  },
  {
    title: "Turns conversations into momentum",
    text: "What Thread captures and what your agents produce become structured next actions, not lost data.",
  },
  {
    title: "Creates founder-level leverage",
    text: "Founder OS and your Digital C-Suite give a team of one the visibility and discipline of a much larger company.",
  },
  {
    title: "Scales with you, not ahead of you",
    text: "Start with Thread. Add the OS when you're ready. Activate agents as your business actually needs them.",
  },
];

const COST_COMPARISON = [
  {
    role: "CMO",
    label: "Chief Marketing Officer",
    cost: "$226K+",
    sub: "avg. base salary · US startup",
    accent: "#605CFF",
  },
  {
    role: "CRO",
    label: "Chief Revenue Officer",
    cost: "$200K+",
    sub: "avg. base salary · US startup",
    accent: "#C86DD7",
  },
  {
    role: "CFO",
    label: "Chief Financial Officer",
    cost: "$200K+",
    sub: "avg. base salary · US startup",
    accent: "#4ECDC4",
  },
  {
    role: "COO",
    label: "Chief Operating Officer",
    cost: "$151K+",
    sub: "avg. base salary · US startup",
    accent: "#FF6B8A",
  },
];

const BEFORE_AFTER = [
  {
    before: "10 tools open. None of them talking to each other.",
    after: "One OS. Gmail, Calendar, Slack and HubSpot connected. One place to decide.",
  },
  {
    before: "Hiring a CMO, CFO, and COO costs $600K+ a year.",
    after: "Your Digital C-Suite works 24/7 for a fraction of that.",
  },
  {
    before:
      "Follow-ups slip because the details lived in your head.",
    after: "Thread captures what was said. You decide from the record, not from memory.",
  },
];

const JOURNEY = [
  {
    n: "01",
    title: "Wear it",
    text: "Start with yAtI Flow. Thread One or Thread Max goes where you go.",
  },
  {
    n: "02",
    title: "Capture",
    text: "Conversations, ideas, and voice notes recorded and turned into summaries and next steps.",
  },
  {
    n: "03",
    title: "Build",
    text: "Activate Founder OS. Scattered thoughts become structured priorities and plans.",
  },
  {
    n: "04",
    title: "Scale",
    text: "Deploy your Digital C-Suite. AI executives handle strategy, growth, and ops while you focus.",
  },
];

const TIMELINE_CARDS = [
  {
    time: "06:00",
    title: "Morning check-in",
    text: "Recovery and readiness from your ring. Founder OS surfaces your top priority for the day.",
  },
  {
    time: "12:30",
    title: "Decision queue",
    text: "Three items ready for review. Market note flagged. Draft approved. Each takes under a minute.",
  },
  {
    time: "17:00",
    title: "Day closed",
    text: "Agents keep working. Content drafted. Leads scored. Numbers updated. You live your life.",
  },
];

const AGENTS = [
  {
    title: "AI CMO",
    color: "#605CFF",
    text: "Creates positioning, content strategy, campaigns, product messaging, and audience insights.",
    tasks: ["Brand positioning", "Content strategy", "Campaign ideas"],
    id: IMG_ID.agentCMO,
    alt: "Founder planning a go-to-market strategy",
  },
  {
    title: "AI CRO",
    color: "#C86DD7",
    text: "Scores leads, drafts outreach, supports deal coaching, and recommends next best actions.",
    tasks: ["Lead scoring", "Warm outreach", "Deal coaching"],
    id: IMG_ID.agentCRO,
    alt: "Professional connecting with a potential client",
  },
  {
    title: "AI CFO",
    color: "#4ECDC4",
    text: "Tracks budgets, runway, unit economics, investor updates, and financial decision scenarios.",
    tasks: ["Runway tracking", "Unit economics", "Investor updates"],
    id: IMG_ID.agentCFO,
    alt: "Founder reviewing financial metrics at desk",
  },
  {
    title: "AI COO",
    color: "#FF6B8A",
    text: "Turns goals into workflows, routines, delivery systems, and operating dashboards.",
    tasks: ["Goal-to-workflow", "Daily routines", "Operating dashboards"],
    id: IMG_ID.agentCOO,
    alt: "Operator managing execution systems",
  },
];

const AUDIENCE = [
  {
    title: "First-time founders",
    text: "Stop guessing what to do next. yAtIverse gives you a repeatable launch rhythm from day one.",
    id: IMG_ID.audienceFounder,
    alt: "Young founder focused at their laptop",
  },
  {
    title: "Operators and builders",
    text: "Connect strategy, execution, content, and follow-up without adding another tool to your stack.",
    id: IMG_ID.audienceOperator,
    alt: "Operator reviewing dashboards at a coworking space",
  },
  {
    title: "Vision-led creators",
    text: "Keep identity, audience, product, and momentum aligned as your personal brand becomes a business.",
    id: IMG_ID.audienceCreator,
    alt: "Creator filming content in a well-lit studio",
  },
];



// ─── END COPY ────────────────────────────────────────────────────────────────

function Img({
  id,
  widths = [400, 800],
  sizes = "100vw",
  alt,
  className = "",
  style = {},
  loading = "lazy",
  fetchpriority = "auto",
  width,
  height,
}) {
  const src = uSrc(id, widths[widths.length - 1]);
  const srcset = uSrcset(id, widths);
  return (
    <img
      src={src}
      srcSet={srcset}
      sizes={sizes}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      fetchpriority={fetchpriority}
      decoding="async"
      width={width}
      height={height}
    />
  );
}

function RingCarousel({ images, intervalMs = 3200 }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setActive((p) => (p + 1) % images.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [paused, images.length, intervalMs]);

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`yAtI Flow ring — view ${i + 1}`}
          width={640}
          height={420}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === active ? 0.8 : 0, minHeight: 420 }}
        />
      ))}
      <div
        className="absolute top-4 right-4 flex gap-1.5 z-10"
        role="tablist"
        aria-label="Ring image selector"
      >
        {images.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-label={`Show ring view ${i + 1}`}
            onClick={() => {
              setActive(i);
              setPaused(true);
            }}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === active ? "#ffffff" : "rgba(255,255,255,0.3)",
              transform: i === active ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Reveal({ children, delay = 0, className = "", style = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function Homepage() {
  const [sig, setSig] = useState(0);
  const [activeTimeline, setActiveTimeline] = useState(0);
  const signal = useMemo(() => SIGNALS[sig], [sig]);

  useEffect(() => {
    const id = setInterval(() => setSig((p) => (p + 1) % SIGNALS.length), 2500);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const id = setInterval(
      () => setActiveTimeline((p) => (p + 1) % TIMELINE_CARDS.length),
      2800,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <SEO
        path="/"
        title="yAtIverse — AI Lifestyle for Founders. yAtI Flow, Digital C-Suite & OS."
        description="yAtIverse is an AI lifestyle for founders, built on three pillars: yAtI Flow (Thread One and Thread Max, with the Signal Ring to follow), a Digital C-Suite of AI executives, and a Founder OS connecting it all into one daily rhythm."
        canonical="https://yativerse.ai/"
        ogImage="https://yativerse.ai/og-image.png"
      />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />
        <main>
          {/* ══ HERO ══ */}
          <section
            aria-label="yAtIverse — AI lifestyle for founders"
            className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 55% at 50% 30%, rgba(96,92,255,0.14) 0%, transparent 68%), radial-gradient(ellipse 45% 35% at 72% 72%, rgba(200,109,215,0.08) 0%, transparent 60%)",
              }}
            />

            <div className="relative z-10 max-w-3xl w-full text-center mx-auto">
              <Link
                to="/yati-flow"
                aria-label="yAtI Flow — Thread One and Thread Max, early access"
                className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide border border-white/10 bg-white/[0.05] text-[#F5C542] hover:text-white transition-colors"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#605CFF] animate-pulse flex-shrink-0"
                  aria-hidden="true"
                />
                Introducing yAtI Flow &nbsp;
                <span className="text-brand-purple font-semibold">
                  Thread One & Thread Max →
                </span>
              </Link>

              <h1
                className="font-display font-bold leading-[1.0] tracking-[-0.03em] text-white mb-4"
                style={{ fontSize: "clamp(44px,7vw,88px)" }}
              >
                Start Up Right!
                <span className="text-gradient">
                  <br />
                  Build what matters.
                </span>
              </h1>

              <p className="font-body text-lg text-white/60 max-w-xl mx-auto leading-relaxed mb-3">
                yAtI Flow captures your conversations. Founder OS organizes your
                priorities. Your Digital C-Suite supports marketing, revenue,
                finance, and operations.
              </p>

              <p className="font-mono text-xs text-white/65 mb-8 tracking-wide">
                Thread · an AI team · an operating system — built to work
                together
              </p>


              <ul
                className="flex flex-wrap gap-2.5 justify-center mb-10 list-none"
                aria-label="yAtIverse products"
              >
                {HERO_PILLS.map((tab) => (
                  <li
                    key={tab.label}
                    className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] px-3.5 py-1.5 rounded-full text-xs font-body text-white/60"
                  >
                    <span
                      aria-hidden="true"
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: tab.dot,
                        boxShadow: `0 0 6px ${tab.dot}`,
                      }}
                    />
                    {tab.label}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3 justify-center mb-10">
                <Link to="/yati-flow" className="btn-primary"> Get early access to yAtI Flow →
                </Link>
                <Link to="/waitlist" className="btn-ghost"> Join the general waitlist
                </Link>
              </div>
              <p className="text-xs text-white/65 font-body">
                Free to join · No credit card · Orders for Thread One and Thread Max are not open yet
              </p>
            </div>

            <section
              aria-label="yAtIverse founder lifestyle previews"
              className="relative z-10 w-full max-w-4xl mx-auto mt-16 px-4"
            >
              <HeroCards cards={HERO_CARDS} />
            </section>
          </section>

          {/* ── QUICK LINKS ── */}
          <nav
            aria-label="yAtIverse product navigation"
            className="border-t border-white/[0.06]"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.06]">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  className="px-6 py-5 hover:bg-white/[0.03] transition-colors group"
                >
                  <p className="font-display font-semibold text-sm text-white mb-1 group-hover:text-brand-purple transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs font-body text-white/65">{item.text}</p>
                </Link>
              ))}
            </div>
          </nav>

          {/* ══ STORY TEASER — links to dedicated /yAtI page ══ */}
          <section
            className="py-20 px-6 border-t border-white/[0.06]"
            id="story"
            aria-labelledby="story-heading"
          >
            <div className="max-w-6xl mx-auto">
              <Reveal>
                <Link to={STORY.href} className="block group">
                  <div className="relative rounded-[2rem] overflow-hidden border border-white/[0.08] hover:border-white/20 transition-all duration-500">
                    {/* Background visual — placeholder for image/animation */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 z-0"
                      style={{
                        background:
                          "radial-gradient(ellipse 70% 70% at 30% 30%, rgba(96,92,255,0.22), transparent 55%), radial-gradient(ellipse 60% 60% at 80% 70%, rgba(200,109,215,0.16), transparent 55%), rgba(8,8,14,0.9)",
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 z-0 opacity-[0.07]"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                      }}
                    />

                    <div className="relative z-10 px-8 md:px-16 py-16 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
                      <div>
                        <span className="kicker mb-5 inline-block">
                          {STORY.kicker}
                        </span>
                        <h2
                          id="story-heading"
                          className="font-display font-bold tracking-tight text-white mb-3"
                          style={{ fontSize: "clamp(32px,4.5vw,56px)" }}
                        >
                          {STORY.title}
                        </h2>
                        <p className="font-body text-base text-white/55 leading-relaxed max-w-md mb-8">
                          {STORY.subtitle}
                        </p>
                        <span className="inline-flex items-center gap-2 font-display font-semibold text-sm text-white border-b border-white/30 pb-1 group-hover:border-white/70 transition-colors">
                          {STORY.cta}
                          <span className="transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-col gap-4">
                        {STORY.lines.map((line, i) => (
                          <div
                            key={i}
                            className="font-display text-lg md:text-xl text-white/70 leading-snug pl-5 border-l-2"
                            style={{
                              borderColor:
                                i === 0
                                  ? "#605CFF"
                                  : i === 1
                                    ? "#C86DD7"
                                    : "#FF6B8A",
                            }}
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            </div>
          </section>

          {/* ══ THREE PILLARS ══ */}
          <section
            className="py-20 px-6 border-t border-white/[0.06]"
            id="pillars"
            aria-labelledby="pillars-heading"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <Reveal>
                  <span className="kicker mb-5 inline-block">
                    The ecosystem
                  </span>
                  <h2
                    id="pillars-heading"
                    className="font-display font-bold tracking-tight text-white"
                    style={{ fontSize: "clamp(28px,3.5vw,44px)" }}
                  >
                    Three pillars.{" "}
                    <span className="text-gradient">One lifestyle.</span>
                  </h2>
                  <p className="font-body text-base text-white/65 leading-relaxed mt-4">
                    Each one stands on its own. Together, they compound.
                  </p>
                </Reveal>
              </div>

              <div className="grid lg:grid-cols-3 gap-5">
                {PILLARS.map((p, i) => (
                  <Reveal key={p.id} delay={i * 0.1}>
                    <div className="glass rounded-[1.5rem] overflow-hidden border border-white/[0.08] hover:border-white/16 transition-all duration-300 h-full flex flex-col">
                      <div
                        aria-hidden="true"
                        className="h-1.5 w-full"
                        style={{ background: p.accent, opacity: 0.85 }}
                      />
                      <div className="p-7 flex flex-col flex-1">
                        <span
                          className="font-mono text-[10px] font-semibold uppercase tracking-widest mb-4"
                          style={{ color: p.accent }}
                        >
                          {p.eyebrow}
                        </span>
                        <h3 className="font-display font-bold text-2xl text-white mb-2">
                          {p.name}
                        </h3>
                        <p
                          className="font-display text-sm mb-4"
                          style={{ color: p.accent }}
                        >
                          {p.tagline}
                        </p>
                        <p className="font-body text-sm text-white/55 leading-relaxed mb-6 flex-1">
                          {p.text}
                        </p>
                        <Link
                          to={p.link}
                          className="text-xs font-medium font-body inline-flex items-center gap-1.5"
                          style={{ color: p.accent }}
                        >
                          {p.linkText} →
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Availability status table */}
              <Reveal delay={0.3}>
                <div className="mt-6 glass rounded-2xl overflow-hidden border border-white/[0.08]">
                  {AVAILABILITY.map((row, i) => (
                    <div
                      key={row.name}
                      className={`flex items-center justify-between px-6 py-4 ${i !== AVAILABILITY.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background: row.accent,
                            boxShadow: `0 0 6px ${row.accent}`,
                          }}
                          aria-hidden="true"
                        />
                        <span className="font-display font-semibold text-sm text-white">
                          {row.name}
                        </span>
                        <span className="font-body text-xs text-white/65 hidden sm:inline">
                          · {row.pillar}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: row.dot }}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-xs uppercase tracking-widest text-white/55">
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Simple ecosystem flow diagram */}
              <Reveal delay={0.4}>
                <div className="mt-6 glass rounded-2xl p-8">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 flex-wrap">
                    {[
                      { label: "Thread", sub: "Capture", accent: "#605CFF" },
                      { label: "OS", sub: "Structure", accent: "#4ECDC4" },
                      { label: "Agents", sub: "Leverage", accent: "#FF6B8A" },
                      {
                        label: "Outcome",
                        sub: "You decide",
                        accent: "#F5C542",
                      },
                    ].map((step, i, arr) => (
                      <div
                        key={step.label}
                        className="flex items-center gap-3 sm:gap-2"
                      >
                        <div className="flex flex-col items-center text-center px-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center mb-2 border"
                            style={{
                              borderColor: `${step.accent}50`,
                              background: `${step.accent}14`,
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ background: step.accent }}
                              aria-hidden="true"
                            />
                          </div>
                          <span className="font-display font-semibold text-sm text-white">
                            {step.label}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-white/65 mt-0.5">
                            {step.sub}
                          </span>
                        </div>
                        {i < arr.length - 1 && (
                          <span
                            className="text-white/20 text-lg flex-shrink-0"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ══ yAtI FLOW — pillar 01 detail ══ */}
          <section
            className="py-20 px-6 border-t border-white/[0.06]"
            id="wearables"
            aria-labelledby="flow-heading"
          >
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <Reveal>
                <span className="kicker mb-5 inline-block">
                  Pillar 01 · Wearables
                </span>
                <h2
                  id="flow-heading"
                  className="font-display font-bold tracking-tight text-white mb-5"
                  style={{ fontSize: "clamp(28px,3.5vw,44px)" }}
                >
                  It starts with a conversation.{" "}
                  <span className="text-gradient">
                    It's just the beginning.
                  </span>
                </h2>
                <p className="font-body text-base text-white/55 leading-relaxed mb-4 max-w-md">
                  Thread One and Thread Max record your conversations, turn them into summaries and action items, and draft the follow-up for you to review and send.
                </p>
                <p className="font-body text-sm text-white/65 leading-relaxed mb-8 max-w-md">
                  They feed Founder OS and your Digital C-Suite with what was said and what comes next. The Signal Ring follows later, adding sleep, heart rate and recovery.
                </p>
                <Link to="/yati-flow" className="btn-ghost"> Explore Thread One & Thread Max →
                </Link>
              </Reveal>

              <Reveal delay={0.15}>
                <div
                  className="relative rounded-[2rem] overflow-hidden border border-white/[0.08]"
                  style={{
                    minHeight: 420,
                    background:
                      "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(96,92,255,0.18), rgba(5,8,20,0.9) 70%)",
                  }}
                >
                  <img src="/flow/flow-devices.jpg" alt="yAtI Flow Thread One and Thread Max" width="580" height="578" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-white/65 mb-0.5">
                          <span className="normal-case">yAtI</span> Flow · Early access
                        </p>
                        <p className="font-display text-sm font-semibold text-white">
                          Thread One & Thread Max
                        </p>
                      </div>
                      <span
                        className="w-2 h-2 rounded-full bg-[#77d6a1] animate-pulse flex-shrink-0"
                        style={{ boxShadow: "0 0 8px #77d6a1" }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ══ DIGITAL C-SUITE — pillar 02 detail ══ */}
          <section
            className="py-20 px-6 border-t border-white/[0.06]"
            id="agents"
            aria-labelledby="agents-heading"
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-end mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">
                    Pillar 02 · Your AI team
                  </span>
                  <h2
                    id="agents-heading"
                    className="font-display font-bold tracking-tight text-white mb-5"
                    style={{ fontSize: "clamp(28px,3.5vw,44px)" }}
                  >
                    They work while you sleep.{" "}
                    <span className="text-gradient">You wake up ahead.</span>
                  </h2>
                  <p className="font-body text-base text-white/55 leading-relaxed max-w-md">
                    Role-based AI executives across strategy, marketing,
                    revenue, and operations. Each one owns a function. All of
                    them report to you.
                  </p>
                </Reveal>
                <Reveal delay={0.1} className="lg:text-right">
                  <Link to="/waitlist" className="btn-ghost">
                    Join the Waitlist →
                  </Link>
                </Reveal>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {AGENTS.map((a, i) => (
                  <Reveal key={a.title} delay={i * 0.07}>
                    <article className="glass rounded-2xl overflow-hidden hover:border-white/14 transition-all duration-300 group hover:-translate-y-1 cursor-default h-full">
                      <div
                        className="relative overflow-hidden"
                        style={{ height: 120 }}
                      >
                        <Img
                          id={a.id}
                          widths={[200, 400]}
                          sizes={AGENT_SIZES}
                          alt={a.alt}
                          width={400}
                          height={120}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(to bottom, transparent 20%, rgba(5,8,20,0.9) 100%)`,
                          }}
                        />
                      </div>
                      <div className="p-5">
                        <span
                          className="inline-block text-[10px] font-mono font-medium tracking-widest uppercase px-2.5 py-1 rounded-full mb-3"
                          style={{
                            background: `${a.color}18`,
                            color: a.color,
                            border: `1px solid ${a.color}30`,
                          }}
                        >
                          {a.title}
                        </span>
                        <p className="font-body text-xs text-white/55 leading-relaxed mb-3">
                          {a.text}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {a.tasks.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-body px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/65"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ FOUNDER OS — pillar 03 detail ══ */}
          <section
            className="py-20 px-6 border-t border-white/[0.06]"
            id="os"
            aria-labelledby="os-heading"
          >
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="flex flex-col gap-3">
                {TIMELINE_CARDS.map((card, i) => (
                  <button
                    key={card.time}
                    onClick={() => setActiveTimeline(i)}
                    aria-pressed={i === activeTimeline}
                    className={`rounded-2xl p-5 text-left transition-all duration-500 border ${
                      i === activeTimeline
                        ? "bg-white/[0.07] border-white/20"
                        : "bg-white/[0.02] border-white/[0.06] opacity-55"
                    }`}
                  >
                    <p className="font-mono text-xs text-white/65 mb-1">
                      {card.time}
                    </p>
                    <p className="font-display font-semibold text-sm text-white mb-1">
                      {card.title}
                    </p>
                    <p className="font-body text-xs text-white/55 leading-relaxed">
                      {card.text}
                    </p>
                  </button>
                ))}
                <div
                  className="relative rounded-2xl overflow-hidden mt-2 border border-white/[0.08]"
                  style={{ height: 180 }}
                >
                  <Img
                    id={IMG_ID.osPreview}
                    widths={[400, 800]}
                    sizes={OS_SIZES}
                    alt="Founder OS dashboard showing goals, priorities, and daily workflow"
                    width={640}
                    height={180}
                    className="w-full h-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(96,92,255,0.2) 0%, transparent 60%)",
                    }}
                  />
                  <p className="absolute bottom-3 left-4 text-[10px] font-mono uppercase tracking-widest text-white/65">
                    Founder OS · Preview
                  </p>
                </div>
              </div>
              <Reveal delay={0.1}>
                <span className="kicker mb-5 inline-block">
                  Pillar 03 · Your command center
                </span>
                <h2
                  id="os-heading"
                  className="font-display font-bold tracking-tight text-white mb-5"
                  style={{ fontSize: "clamp(28px,3.5vw,44px)" }}
                >
                  Your day —<br />
                  without the chaos.
                </h2>
                <p className="font-body text-base text-white/55 leading-relaxed mb-8 max-w-md">
                  Founder OS replaces your scattered tabs, morning confusion,
                  and end-of-day guilt with one clear operating rhythm. Know
                  what matters. Let agents handle the rest. Watch it compound.
                </p>
                <Link to="/waitlist" className="btn-ghost">
                  Join the Waitlist →
                </Link>
              </Reveal>
            </div>
          </section>

          {/* ══ ECOSYSTEM VALUE ══ */}
          <section
            className="py-20 px-6 border-t border-white/[0.06]"
            aria-labelledby="value-heading"
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">Why it works</span>
                  <h2
                    id="value-heading"
                    className="font-display font-bold leading-tight tracking-tight text-white"
                    style={{ fontSize: "clamp(28px,3.5vw,44px)" }}
                  >
                    Three pillars, built to compound.
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="font-body text-base text-white/58 leading-relaxed lg:pt-14">
                    Every part of yAtIverse makes the next part more useful. The
                    Thread captures what was said. The OS gives you structure. The
                    C-Suite gives you leverage.
                  </p>
                </Reveal>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ECOSYSTEM_VALUE.map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.07}>
                    <div className="glass rounded-2xl p-6 hover:border-white/14 transition-colors duration-300 h-full">
                      <span
                        aria-hidden="true"
                        className="block font-mono text-2xl font-bold mb-4 leading-none"
                        style={{ color: "rgba(96,92,255,0.55)" }}
                      >
                        ✓
                      </span>
                      <h3 className="font-display font-semibold text-base text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="font-body text-sm text-white/65 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ SAVINGS / COST SECTION ══ */}
          <section
            className="py-20 px-6 border-t border-white/[0.06]"
            aria-labelledby="savings-heading"
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">
                    What you save
                  </span>
                  <h2
                    id="savings-heading"
                    className="font-display font-bold leading-tight tracking-tight text-white"
                    style={{ fontSize: "clamp(28px,3.5vw,44px)" }}
                  >
                    A real C-Suite costs
                    <br />
                    <span className="text-gradient">$750K+ a year.</span>
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="font-body text-base text-white/58 leading-relaxed lg:pt-14">
                    Hiring a full-time CMO, CRO, CFO, and COO in a US startup
                    costs over $750,000 in base salaries alone — before
                    benefits, bonuses, or equity. yAtIverse gives you AI support
                    across marketing, revenue, finance, and operations, with
                    every recommendation and draft coming to you to review.
                    Illustrative only; not a like-for-like replacement.
                  </p>
                </Reveal>
              </div>

              {/* Cost cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {COST_COMPARISON.map((item, i) => (
                  <Reveal key={item.role} delay={i * 0.07}>
                    <div className="glass rounded-2xl overflow-hidden border border-white/[0.08] h-full">
                      <div
                        aria-hidden="true"
                        className="h-1 w-full"
                        style={{ background: item.accent, opacity: 0.7 }}
                      />
                      <div className="p-5">
                        <span
                          className="font-mono text-[10px] tracking-widest uppercase mb-2 block"
                          style={{ color: item.accent }}
                        >
                          {item.role}
                        </span>
                        <p
                          className="font-display font-bold text-white mb-1"
                          style={{ fontSize: "clamp(20px,2.5vw,28px)" }}
                        >
                          {item.cost}
                        </p>
                        <p className="font-body text-xs text-white/65 leading-relaxed">
                          {item.label}
                        </p>
                        <p className="font-mono text-[10px] text-white/25 mt-1">
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Total vs yAtIverse row */}
              <Reveal delay={0.32}>
                <div className="glass rounded-2xl p-6 grid sm:grid-cols-2 gap-4 items-center">
                  <div className="flex items-start gap-3">
                    <span
                      className="text-white/20 text-lg font-bold flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      ✕
                    </span>
                    <div>
                      <p className="font-display font-semibold text-white text-base mb-1">
                        Full C-Suite hire
                      </p>
                      <p
                        className="font-display font-bold text-white/65"
                        style={{ fontSize: "clamp(20px,2vw,24px)" }}
                      >
                        $750,000+ / year
                      </p>
                      <p className="font-body text-xs text-white/65 mt-1">
                        Base salaries only · benefits, bonuses & equity extra
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:border-l sm:border-white/[0.06] sm:pl-4">
                    <span
                      className="text-[#77d6a1] text-lg font-bold flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <div>
                      <p className="font-display font-semibold text-white text-base mb-1">
                        Your Digital C-Suite
                      </p>
                      <p
                        className="font-display font-bold text-[#77d6a1]"
                        style={{ fontSize: "clamp(20px,2vw,24px)" }}
                      >
                        A fraction of that
                      </p>
                      <p className="font-body text-xs text-white/65 mt-1">
                        24/7 · no hiring · no notice period · no equity dilution
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.4}>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/20 text-center mt-5">
                  Salary data sourced from Built In, ZipRecruiter, and
                  Salary.com · 2025–2026
                </p>
              </Reveal>
            </div>
          </section>

          {/* ══ BEFORE / AFTER ══ */}
          <section
            className="py-20 px-6 border-t border-white/[0.06]"
            aria-labelledby="before-after-heading"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">
                    The difference
                  </span>
                  <h2
                    id="before-after-heading"
                    className="font-display font-bold tracking-tight text-white"
                    style={{ fontSize: "clamp(28px,3.5vw,44px)" }}
                  >
                    Before yAtIverse.{" "}
                    <span className="text-gradient">After yAtIverse.</span>
                  </h2>
                </Reveal>
              </div>
              <div className="grid gap-4 max-w-3xl mx-auto">
                {BEFORE_AFTER.map((item, i) => (
                  <Reveal key={i} delay={i * 0.08}>
                    <div className="glass rounded-2xl p-6 grid sm:grid-cols-2 gap-4 items-center">
                      <div className="flex items-start gap-3">
                        <span
                          className="text-white/20 text-lg font-bold flex-shrink-0 mt-0.5"
                          aria-hidden="true"
                        >
                          ✕
                        </span>
                        <p className="font-body text-sm text-white/65 leading-relaxed">
                          {item.before}
                        </p>
                      </div>
                      <div className="flex items-start gap-3 sm:border-l sm:border-white/[0.06] sm:pl-4">
                        <span
                          className="text-[#77d6a1] text-lg font-bold flex-shrink-0 mt-0.5"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <p className="font-body text-sm text-white/80 leading-relaxed">
                          {item.after}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ JOURNEY ══ */}
          <section
            className="py-20 px-6 border-t border-white/[0.06]"
            id="journey"
            aria-labelledby="journey-heading"
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">The path</span>
                  <h2
                    id="journey-heading"
                    className="font-display font-bold leading-tight tracking-tight text-white"
                    style={{ fontSize: "clamp(28px,3.5vw,44px)" }}
                  >
                    Start with a conversation.
                    <br />
                    End up running a company.
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="font-body text-base text-white/58 leading-relaxed lg:pt-14">
                    Every product you add compounds the one before it. The more
                    of yAtIverse you use, the more leverage you get.
                  </p>
                </Reveal>
              </div>
              <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {JOURNEY.map((item, i) => (
                  <li key={item.title}>
                    <Reveal delay={i * 0.07}>
                      <div className="glass rounded-2xl p-6 hover:border-white/14 transition-colors duration-300 h-full">
                        <span
                          aria-hidden="true"
                          className="block font-mono text-4xl font-bold mb-4 leading-none"
                          style={{ color: "rgba(96,92,255,0.35)" }}
                        >
                          {item.n}
                        </span>
                        <h3 className="font-display font-semibold text-base text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="font-body text-sm text-white/65 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ══ AUDIENCE ══ */}
          <section
            className="py-20 px-6 border-t border-white/[0.06]"
            aria-labelledby="audience-heading"
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start mb-14">
                <Reveal>
                  <span className="kicker mb-5 inline-block">Who it's for</span>
                  <h2
                    id="audience-heading"
                    className="font-display font-bold tracking-tight text-white"
                    style={{ fontSize: "clamp(28px,3.5vw,44px)" }}
                  >
                    Built for real builders,{" "}
                    <span className="text-gradient">
                      not just tech tourists.
                    </span>
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="font-body text-base text-white/55 leading-relaxed lg:pt-14">
                    Whether you're validating your first idea or running a lean
                    operation solo — yAtIverse gives you the infrastructure that
                    used to cost a full-time staff.
                  </p>
                </Reveal>
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                {AUDIENCE.map((a, i) => (
                  <Reveal key={a.title} delay={i * 0.08}>
                    <article className="glass rounded-[1.75rem] overflow-hidden hover:border-white/14 transition-all duration-300 group hover:-translate-y-1 cursor-default h-full">
                      <div
                        className="relative overflow-hidden"
                        style={{ height: 200 }}
                      >
                        <Img
                          id={a.id}
                          widths={[500, 800]}
                          sizes={AUDIENCE_SIZES}
                          alt={a.alt}
                          width={600}
                          height={200}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to bottom, transparent 40%, rgba(5,8,20,0.8) 100%)",
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-display font-semibold text-base text-white mb-2">
                          {a.title}
                        </h3>
                        <p className="font-body text-sm text-white/55 leading-relaxed">
                          {a.text}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ══ CTA ══ */}
          <section className="py-24 px-6" aria-labelledby="cta-heading">
            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10">
                <div aria-hidden="true" className="absolute inset-0 z-0">
                  <video
                    src={GIF.withAgents}
                    poster={POSTER.withAgents}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                    style={{ opacity: 0.22 }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(96,92,255,0.32), rgba(5,8,20,0.88) 65%)",
                    }}
                  />
                </div>
                <div className="relative z-10 px-8 md:px-12 py-16 text-center">
                  <Reveal>
                    <h2
                      id="cta-heading"
                      className="font-display font-bold tracking-tight text-white mb-4"
                      style={{ fontSize: "clamp(32px,4vw,56px)" }}
                    >
                      The founders building with AI today
                      <br />
                      <span className="text-gradient">
                        will be the ones everyone else studies tomorrow.
                      </span>
                    </h2>
                    <p className="font-body text-white/60 mt-4 max-w-xl mx-auto leading-relaxed mb-8">
                      Join the waitlist. yAtI Flow ships first. Your Digital
                      C-Suite and Founder OS follow. Your AI lifestyle starts
                      here.
                    </p>
                    <Link
                      to="/waitlist"
                      className="btn-primary !py-4 !px-10 !text-base uppercase tracking-wide"
                      aria-label="Join the yAtIverse waitlist"
                    >
                      Get in Early →
                    </Link>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/25 mt-5">
                      Free to join · No credit card · Limited spots
                    </p>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
