import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import SEO from "../components/SEO";
import WaitlistForm from "../components/WaitlistForm";
import { captureAttribution, initMetaPixel, track } from "../lib/tracking";

// Campaign 1: introduce the brand. One goal: join the waitlist (brand + first product, the Thread Pendant).
const PROBLEMS = [
  "You are the seller, the marketer, the operator and the finance lead, all before lunch.",
  "The follow-up after a good conversation is the first thing to slip.",
  "Sleep and recovery get managed last, even though everything else depends on them.",
];

const SYSTEM = [
  { t: "Thread Pendant", tag: "First in line", d: "Captures your conversations. yAtI turns them into summaries, action items and a follow-up draft." },
  { t: "Signal Ring", tag: "Coming", d: "Tracks steps, sleep and recovery, so your energy is part of how you plan your day." },
  { t: "AI agents", tag: "Sales Agent first", d: "A Sales Agent drafts follow-ups from your CRM. More agents are planned." },
  { t: "Founder OS", tag: "Coming", d: "One place where your devices, data and agents work together." },
];

const FAQ = [
  ["What is yAtIverse?", "An AI ecosystem for founders: wearables, AI agents and a Founder OS that connects them."],
  ["What am I joining the waitlist for?", "Early access to yAtIverse, starting with the Thread Pendant. Orders for the pendant open in a few weeks, and waitlist members are emailed first."],
  ["Does it cost anything to join?", "No. Joining is free and carries no obligation. Pricing will be shared when orders open."],
  ["Do the AI agents act without me?", "No. Agents draft and suggest. You review and approve before anything is sent."],
  ["Which phones are supported?", "iPhone and Mac first. Tell us your phone when you join and we will let you know about Android."],
];

export default function BrandCampaign() {
  useEffect(() => {
    captureAttribution();
    initMetaPixel();
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, follow";
    document.head.appendChild(m);
    track("campaign_view", { campaign: "brand" });
    return () => m.remove();
  }, []);

  function toForm() {
    track("cta_click", { location: "header" });
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => document.getElementById("email-hero")?.focus({ preventScroll: true }), 400);
  }

  return (
    <div className="min-h-screen bg-brand-bg font-body text-white">
      <SEO title="Start up right" description="yAtIverse brings AI wearables and agents together for founders. Join the waitlist for early access, starting with the Thread Pendant." path="/start" />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-brand-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="yAtIverse home" className="flex items-center gap-2">
            <img src="/logo.png" alt="" width="28" height="28" className="h-7 w-7 rounded-md" />
            <span className="font-display text-base font-bold">yAtIverse</span>
          </Link>
          <button onClick={toForm} className="btn-primary !px-5 !py-2">Join the waitlist</button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 md:grid-cols-[1.15fr_0.85fr] md:pt-20">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] md:text-6xl">AI that lives in your day, not in another tab.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              yAtIverse brings wearables and AI agents together for founders. First up is the Thread Pendant, which captures your conversations and drafts the follow-up. You stay in charge.
            </p>
            <div id="hero-form" className="mt-8"><WaitlistForm where="hero" source="brand-campaign" /></div>
            <p className="mt-4 text-sm text-white/50">Free to join. Pendant orders open in a few weeks, and waitlist members hear first.</p>
          </div>
          <div className="flex justify-center">
            <img src="/pendant1.jpeg" alt="Thread Pendant on a rose-gold chain" width="768" height="1376" fetchpriority="high"
              className="max-h-[520px] w-auto rounded-3xl object-cover" />
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Founders do everything. Something always slips.</h2>
            <ul className="mt-8 space-y-4 text-lg text-white/70">{PROBLEMS.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-3xl font-bold md:text-4xl">One ecosystem, built around the founder</h2>
          <p className="mt-4 max-w-2xl text-lg text-white/65">We are launching in order, starting with the pendant. Joining the waitlist puts you first in line for all of it.</p>
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            {SYSTEM.map((s) => (
              <div key={s.t}>
                <div className="flex items-baseline gap-3">
                  <h3 className="font-display text-xl font-bold">{s.t}</h3>
                  <span className="text-sm text-brand-gold">{s.tag}</span>
                </div>
                <p className="mt-2 leading-relaxed text-white/65">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 max-w-lg"><WaitlistForm where="system" source="brand-campaign" /></div>
        </section>

        <section className="border-y border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="font-display text-3xl font-bold md:text-4xl">AI that drafts. You decide.</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/70">
              Every yAtIverse agent works the same way: it prepares the work and waits for your approval. Nothing is sent to a customer without you reading it first.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Questions, answered</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-4" onToggle={(e) => e.currentTarget.open && track("faq_open", { question: q })}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                  {q}<ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-3 leading-relaxed text-white/65">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="border-t border-white/[0.06] bg-brand-bg2 py-24 text-center">
          <div className="mx-auto flex max-w-2xl flex-col items-center px-5">
            <h2 className="font-display text-3xl font-bold md:text-5xl">Start up right. Be first in line.</h2>
            <p className="mb-8 mt-4 text-lg text-white/65">Join the waitlist and we will email you when pendant orders open.</p>
            <WaitlistForm where="final" source="brand-campaign" />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-white/50">
          <span>© {new Date().getFullYear()} yAtIverse</span>
          <nav aria-label="Legal" className="flex gap-5">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/cookie-policy" className="hover:text-white">Cookie Policy</Link>
            <a href="mailto:support@yativerse.ai" className="hover:text-white">support@yativerse.ai</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
