import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import SEO from "../components/SEO";
import { captureAttribution, getAttribution, initMetaPixel, track } from "../lib/tracking";

// Single conversion goal: join the Thread Pendant waitlist (orders open in ~2-3 weeks).
const FORMSPREE = "https://formspree.io/f/mqeoyedd"; // same endpoint as /waitlist

function WaitlistForm({ where }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(FORMSPREE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, phone, source: "pendant-campaign", form_location: where, ...getAttribution() }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("success");
      track("waitlist_join", { location: where, phone });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="rounded-xl border border-brand-teal/30 bg-brand-teal/10 p-4 text-white">
        You are on the list. We will email you when pendant orders open.
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      onFocus={() => { if (!sessionStorage.getItem("yati_wl_started")) { sessionStorage.setItem("yati_wl_started", "1"); track("waitlist_start", { location: where }); } }}
      className="w-full max-w-lg"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor={`email-${where}`}>Email</label>
        <input
          id={`email-${where}`} type="email" required autoComplete="email" placeholder="you@company.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3.5 text-white placeholder-white/35 outline-none focus:border-brand-purple"
        />
        <button type="submit" disabled={status === "loading"} className="btn-primary justify-center disabled:opacity-50">
          {status === "loading" ? "Joining…" : "Join the waitlist"}
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-white/55">
        <label htmlFor={`phone-${where}`}>My phone is</label>
        <select id={`phone-${where}`} value={phone} onChange={(e) => setPhone(e.target.value)}
          className="rounded-md border border-white/15 bg-brand-bg px-2 py-1 text-white/80">
          <option value="">Select (optional)</option>
          <option>iPhone</option>
          <option>Android</option>
        </select>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-3 text-sm text-brand-rose">We could not save that. Check your email address and try again.</p>
      )}
    </form>
  );
}

const STEPS = [
  { t: "Capture", d: "Tap the pendant when a conversation starts. The recording syncs to the yAtI app." },
  { t: "Understand", d: "Get a transcript, a short summary and action items you can edit, with audio playback." },
  { t: "Follow up", d: "Pick a recording and the Sales Agent drafts the follow-up email." },
  { t: "Review and send", d: "You edit the draft and you send it. Nothing goes out on its own." },
];

const FEATURES = [
  ["Searchable recording library", "Find any conversation later by what was said."],
  ["Linked to your meetings", "Notes attach to the calendar meeting they belong to."],
  ["Works with Gmail and Calendar", "Uses the accounts you already have."],
  ["Editable everywhere", "Summaries, action items and email drafts are yours to change."],
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
  useEffect(() => {
    captureAttribution();
    initMetaPixel();
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, follow";
    document.head.appendChild(m);
    track("campaign_view", { campaign: "pendant" });
    return () => m.remove();
  }, []);

  function toTop() {
    track("cta_click", { location: "header" });
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => document.getElementById("email-hero")?.focus({ preventScroll: true }), 400);
  }

  return (
    <div className="min-h-screen bg-brand-bg font-body text-white">
      <SEO title="Every conversation, followed up" description="The Thread Pendant records your conversations. yAtI turns them into summaries and a follow-up draft you review and send. Join the waitlist." path="/pendant" />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-brand-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="yAtIverse home" className="flex items-center gap-2">
            <img src="/logo.png" alt="" width="28" height="28" className="h-7 w-7 rounded-md" />
            <span className="font-display text-base font-bold">yAtIverse</span>
          </Link>
          <button onClick={toTop} className="btn-primary !px-5 !py-2">Join the waitlist</button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 md:grid-cols-[1.15fr_0.85fr] md:pt-20">
          <div>
            <p className="mb-4 text-sm text-white/55">Thread Pendant by yAtIverse</p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] md:text-6xl">Every conversation, followed up.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              Wear the pendant. yAtI records, summarizes and drafts the follow-up email while you get on with building. You review and send.
            </p>
            <div id="hero-form" className="mt-8"><WaitlistForm where="hero" /></div>
            <p className="mt-4 text-sm text-white/50">Orders open in a few weeks. Waitlist members hear first. Launching on iPhone and Mac.</p>
          </div>
          <div className="flex justify-center">
            <img src="/pendant1.jpeg" alt="Thread Pendant on a rose-gold chain" width="768" height="1376" fetchpriority="high"
              className="max-h-[520px] w-auto rounded-3xl object-cover" />
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="font-display text-3xl font-bold md:text-4xl">From conversation to sent email</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.t}>
                  <span className="font-display text-sm text-brand-gold">Step {i + 1}</span>
                  <h3 className="mt-2 font-display text-xl font-bold">{s.t}</h3>
                  <p className="mt-2 leading-relaxed text-white/65">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Nothing you said gets lost</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {FEATURES.map(([t, d]) => (
              <div key={t}><h3 className="font-display text-xl font-bold">{t}</h3><p className="mt-2 text-white/65">{d}</p></div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Built for the founder’s day</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/70">
              Founders talk to customers, investors and teammates all day, and the follow-up is what gets dropped. yAtIverse puts AI in the things you already wear, so capturing a conversation takes no extra effort. The pendant and Sales Agent come first. We are building toward more, with the Signal Ring and Founder OS alongside.
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
            <h2 className="font-display text-3xl font-bold md:text-5xl">Be first to wear it.</h2>
            <p className="mb-8 mt-4 text-lg text-white/65">Join the waitlist and we will email you when orders open.</p>
            <WaitlistForm where="final" />
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
