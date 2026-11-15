import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
import SEO from "../components/SEO";
import WaitlistForm from "../components/WaitlistForm";
import { captureAttribution, initMetaPixel, track } from "../lib/tracking";

const PRICE = "Pricing announced when orders open"; // TODO: replace with the real price
const GALLERY = ["/pendant1.jpeg", "/pendant2.jpeg", "/pendant3.jpeg", "/pendant4.jpeg"]; // TODO: real device photos

const DETAILS = [
  "Records your conversations",
  "Transcribes and summarizes them with AI",
  "Creates action items and a draft follow-up email you review and send",
];

const FEATURES = [
  "Reliable sync to the yAtI app",
  "Transcription with audio playback",
  "Simple summaries",
  "Editable action items",
  "Searchable recording library",
  "Notes linked to your calendar meetings",
  "Works with Gmail and Google Calendar",
  "Sales Agent drafts the follow-up",
  "Launching on iPhone and Mac",
];

const Mock = ({ children }) => (
  <div className="mt-5 rounded-xl border border-white/10 bg-[#0a0e22] p-4 text-sm text-white/75">{children}</div>
);

const STEPS = [
  { t: "Capture", d: "Tap the pendant when a conversation starts. It syncs to the app.",
    v: <Mock><div className="flex h-10 items-end gap-1">{[4,9,6,14,8,16,10,5,12,7,15,9,4,11].map((h, i) => <span key={i} className="w-1.5 rounded bg-brand-purple" style={{ height: h * 2 }} />)}</div><p className="mt-2 text-xs text-white/45">Recording · 12:04</p></Mock> },
  { t: "Understand", d: "A transcript, summary and action items you can edit.",
    v: <Mock><p>Summary: Sam wants a rollout plan before Friday.</p><p className="mt-2 text-white/55">☐ Send rollout plan<br />☐ Book a follow-up call</p></Mock> },
  { t: "Follow up", d: "Pick a recording. The Sales Agent drafts the email.",
    v: <Mock><p className="text-xs text-white/45">Draft email</p><p className="mt-1">Hi Sam, thanks for your time today. Here is the rollout plan we discussed…</p></Mock> },
  { t: "Review and send", d: "You edit and you send. Nothing goes out on its own.",
    v: <Mock><div className="flex gap-2 text-center"><span className="flex-1 rounded-full bg-brand-purple py-2 font-semibold text-white">Approve</span><span className="flex-1 rounded-full border border-white/15 py-2">Edit</span></div></Mock> },
];

const FAQ = [
  ["When can I order the pendant?", "Orders open in a few weeks. Waitlist members are emailed first."],
  ["What does it cost?", "Pricing will be shared when orders open. Joining the waitlist is free and has no obligation."],
  ["Does it work on Android?", "We launch on iPhone and Mac first. Tell us your phone when you join and we will let you know when that changes."],
  ["Does it email people automatically?", "No. The Sales Agent writes a draft. You review, edit and send it."],
  ["Can I record anyone?", "Rules on recording conversations vary by place. You are responsible for getting consent where it is required."], // legal review before running ads
  ["Do I need the Signal Ring?", "No. The pendant works on its own."],
];

export default function PendantCampaign() {
  const [img, setImg] = useState(0);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    captureAttribution();
    initMetaPixel();
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, follow";
    document.head.appendChild(m);
    track("campaign_view", { campaign: "pendant" });
    // Sticky bar shows only while neither signup form is on screen.
    const seen = new Set();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id)));
      setShowBar(seen.size === 0 && window.scrollY > 200);
    });
    ["hero-form", "final-form"].forEach((id) => { const el = document.getElementById(id); el && io.observe(el); });
    return () => { m.remove(); io.disconnect(); };
  }, []);

  function toTop(where) {
    track("cta_click", { location: where });
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => document.getElementById("email-hero")?.focus({ preventScroll: true }), 400);
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-20 font-body text-white">
      <SEO title="Thread Pendant: every conversation, followed up" description="The Thread Pendant records your conversations. yAtI turns them into summaries and a follow-up draft you review and send. Join the waitlist." path="/pendant" />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-brand-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="yAtIverse home" className="flex items-center gap-2">
            <img src="/logo.png" alt="" width="28" height="28" className="h-7 w-7 rounded-md" />
          </Link>
          <button onClick={() => toTop("header")} className="btn-primary !px-5 !py-2">Join the waitlist</button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-10 md:grid-cols-2 md:pt-16">
          <div>
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-brand-bg2">
              <img src={GALLERY[img]} alt="Thread Pendant" width="768" height="960" fetchpriority="high" className="h-full w-full object-cover" />
            </div>
            <div className="mt-3 flex gap-3">
              {GALLERY.map((g, i) => (
                <button key={g} onClick={() => setImg(i)} aria-label={`Show image ${i + 1}`}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${i === img ? "border-brand-purple" : "border-transparent opacity-60"}`}>
                  <img src={g} alt="" width="64" height="64" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="md:pt-6">
            <span className="rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-brand-gold">New</span>
            <h1 className="mt-4 font-body text-4xl font-semibold tracking-tight md:text-6xl">Thread Pendant</h1>
            <p className="mt-3 text-xl text-white/80">Every conversation, followed up.</p>
            <p className="mt-4 max-w-md leading-relaxed text-white/65">Wear it. yAtI records, summarizes and drafts the follow-up while you get on with building. You review and send.</p>
            <p className="mt-6 text-lg font-semibold">{PRICE}</p>
            <div id="hero-form" className="mt-4"><WaitlistForm where="hero" source="pendant-campaign" askPhone /></div>
            <p className="mt-4 text-sm text-white/50">Orders open in a few weeks. Waitlist members hear first.</p>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Remember more. Follow up faster.</h2>
              <ol className="mt-8 space-y-4">
                {DETAILS.map((d, i) => (
                  <li key={d} className="flex gap-4 text-lg text-white/75"><span className="font-display text-brand-gold">{i + 1}</span>{d}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">Features</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {FEATURES.map((f) => (
                  <li key={f} className="flex gap-2 text-white/75"><Check size={18} className="mt-0.5 shrink-0 text-brand-teal" aria-hidden="true" />{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">From conversation to sent email</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.t} className="rounded-2xl border border-white/10 bg-brand-bg2 p-6">
                <span className="font-display text-sm text-brand-gold">Step {i + 1}</span>
                <h3 className="mt-1 font-display text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-white/65">{s.d}</p>
                {s.v}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/35">Illustrative examples with sample data.</p>
        </section>

        <section className="border-y border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Designed so you stay in control</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {[["You approve every email", "The Sales Agent writes a draft. Nothing is sent until you review it."],
                ["Everything is editable", "Summaries, action items and drafts are yours to change."],
                ["Your library, searchable", "Play back audio and find any conversation later."]].map(([t, d]) => (
                <div key={t}><h3 className="font-display text-xl font-bold">{t}</h3><p className="mt-2 text-white/65">{d}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">FAQs</h2>
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

        <section className="border-t border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
            <img src={GALLERY[2]} alt="" width="768" height="960" loading="lazy" className="max-h-[420px] w-full rounded-3xl object-cover" />
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Be first to wear it.</h2>
              <p className="mb-6 mt-4 text-lg text-white/65">Join the waitlist and we will email you when orders open.</p>
              <div id="final-form"><WaitlistForm where="final" source="pendant-campaign" askPhone /></div>
            </div>
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

      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-brand-bg/95 px-5 py-3 backdrop-blur transition-transform ${showBar ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!showBar}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div><p className="font-display font-bold">Thread Pendant</p><p className="text-xs text-white/55">Orders open soon</p></div>
          <button tabIndex={showBar ? 0 : -1} onClick={() => toTop("sticky_bar")} className="btn-primary !px-5 !py-2">Join the waitlist</button>
        </div>
      </div>
    </div>
  );
}
