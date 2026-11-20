import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import SEO from "../components/SEO";
import WaitlistForm from "../components/WaitlistForm";
import HeroVideo from "../components/HeroVideo";
import { captureAttribution, initMetaPixel, track } from "../lib/tracking";

// Campaign 2: yAtI FLOW (Thread Max + Thread One). One goal: join the waitlist.
// TODO: replace /flow/*.jpg placeholders with the original renders / real device photos.
const MODELS = [
  { id: "Thread Max", tag: "Wearable design", img: "/flow/thread-max.jpg", w: 248, h: 382, cap: "Wearable capture",
    d: "A compact capsule for capturing the conversations and ideas that happen while you are building." },
  { id: "Thread One", tag: "Slim card design", img: "/flow/thread-one.jpg", w: 295, h: 363, cap: "Slim card capture",
    d: "A slim recorder for your meeting table, pocket or bag. A different shape for the same founder ambition." },
];

const TABS = {
  followup: { label: "Follow-up", title: "Keep the conversation moving.", input: "“Maya wants to explore a pilot. Send the overview and ask about a follow-up next week.”",
    head: "Sales Agent draft", body: "Hi Maya, great meeting you. Here is the overview we discussed. Would you like to find a time next week to talk through the pilot?", state: "Review before sending" },
  crm: { label: "HubSpot", title: "Put the next step in the right place.", input: "Approved meeting summary + a confirmed HubSpot contact or deal.",
    head: "Planned CRM action", body: "Save the meeting note. Create a follow-up task with a confirmed owner and due date. You review before anything is written to HubSpot.", state: "Planned for January 2027" },
};

const FAQ = [
  ["When can I order?", "Orders open in a few weeks. Waitlist members are emailed first. Final configuration and pricing are confirmed when orders open."],
  ["Does Founder OS send emails automatically?", "No. The Sales Agent prepares a draft. You review and send."],
  ["Is HubSpot available at launch?", "Approved HubSpot notes and tasks are planned for January 2027."],
  ["Can I use Android?", "iPhone and Mac come first. Android is planned after testing."],
  ["Is this a replacement for my CRM?", "No. The aim is to connect your conversations to the tools you already use. HubSpot stays your customer system."],
  ["Can I record anyone?", "Rules on recording conversations vary by place. You are responsible for getting consent where it is required."], // legal review before running ads
];

const BEYOND = [
  ["Linked to the right meeting", "Connect Gmail and Calendar so each recording lands with the meeting it belongs to. You confirm the match."],
  ["Know who said what", "Speaker labels you can rename, so a transcript reads like a real conversation."],
  ["One account across your devices", "The same yAtI account works across your yAtI devices."],
];

// Public-safe version of the internal roadmap: no funding or staffing language.
const PATH = [
  { when: "Phase I · Post-Thanksgiving 2026", t: "Capture & follow up", items: ["Transcripts, summaries and next steps", "Gmail draft and calendar context"], note: "iPhone and Mac first. Device availability follows testing." },
  { when: "Phase II · Planned January 2027", t: "Connect your sales work", items: ["Android after testing", "Approved HubSpot notes and tasks", "CRM-informed follow-ups"], note: "" },
  { when: "Phase III · Planned for early 2027", t: "Build customer memory", items: ["Ask questions across your conversations", "Meeting preparation briefs", "Small-team shared history"], note: "" },
];

const cream = "bg-[#f4f1e9] text-[#191b1d]";
const h2 = "text-3xl font-semibold tracking-tight md:text-5xl";

export default function PendantCampaign() {
  const [model, setModel] = useState("Not sure yet");
  const [tab, setTab] = useState("followup");
  const [showBar, setShowBar] = useState(false);
  const t = TABS[tab];

  useEffect(() => {
    captureAttribution();
    initMetaPixel();
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, follow";
    document.head.appendChild(m);
    track("campaign_view", { campaign: "flow" });
    const seen = new Set(); // sticky bar shows only while neither form is on screen
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id)));
      setShowBar(seen.size === 0 && window.scrollY > 200);
    });
    ["hero-form", "join-form"].forEach((id) => { const el = document.getElementById(id); el && io.observe(el); });
    return () => { m.remove(); io.disconnect(); };
  }, []);

  function goHero(where) {
    track("cta_click", { location: where });
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => document.getElementById("email-hero")?.focus({ preventScroll: true }), 400);
  }
  function pick(id) {
    setModel(id);
    track("model_interest", { model: id });
    document.getElementById("join")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-20 font-body text-white">
      <SEO title="Thread Max and Thread One by yAtI FLOW" description="Capture the conversation, get a follow-up draft you review and send. Join the waitlist for yAtI FLOW: Thread Max and Thread One." path="/pendant" />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-brand-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="yAtIverse home"><img src="/logo.png" alt="yAtIverse" width="34" height="28" className="h-7 w-auto" /></Link>
          <button onClick={() => goHero("header")} className="btn-primary !px-5 !py-2">Join the waitlist</button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-12 md:grid-cols-[1.05fr_1fr] md:pt-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">yAtI FLOW · Startup Right</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Turn founder conversations into your <span className="text-brand-gold2">next move.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
              Meet Thread Max and Thread One. Capture the conversation, get a follow-up draft, and build toward a connected sales workflow with Founder OS. You review and send.
            </p>
            <div id="hero-form" className="mt-8"><WaitlistForm where="hero" source="flow-campaign" model={model} /></div>
            <p className="mt-4 text-xs leading-relaxed text-white/50">Free to join. iPhone and Mac first. Android planned.<br />Renders show proposed branding; final finish may vary.</p>
          </div>
          <div className="relative flex items-end justify-center gap-4 overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_50%_60%,rgba(201,168,76,0.16),transparent_65%)] px-4 py-10">
            {/* Background loop. Files: public/flow/hero-loop.mp4 and hero-poster.jpg. Hidden until they exist. */}
            <HeroVideo className="absolute inset-0" poster="/flow/hero-poster.jpg" mp4="/flow/hero-loop.mp4" webm={null} />
            {MODELS.map((m) => (
              <figure key={m.id} className="relative w-[46%] text-center">
                <div className="overflow-hidden rounded-2xl bg-[#14151a]">
                  <img src={m.img} alt={`${m.id} concept`} width={m.w} height={m.h} fetchpriority="high" className="h-auto w-full" />
                </div>
                <figcaption className="mt-3 text-sm font-semibold">{m.id}<span className="block text-xs font-normal text-white/50">{m.cap}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-4 border-t border-white/10 px-5 py-6 text-sm text-white/60 sm:grid-cols-2 md:grid-cols-4">
          <span><b className="text-white">Capture</b> the conversation</span><span><b className="text-white">Prepare</b> the follow-up</span>
          <span><b className="text-white">Connect</b> your sales workflow</span><span><b className="text-white">You</b> approve every send</span>
        </div>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">One product line · two form factors</p>
          <h2 className={`${h2} mt-3`}>Keep your momentum. Choose your Thread.</h2>
          <p className="mt-4 max-w-xl text-white/65">Pick the shape that fits your day. Final configuration, pricing and availability are confirmed before orders open.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {MODELS.map((m) => (
              <article key={m.id} className="rounded-2xl border border-white/10 bg-brand-bg2 p-7">
                <span className="rounded-full border border-brand-gold/40 px-3 py-1 text-[11px] uppercase tracking-wider text-brand-gold2">{m.tag}</span>
                <div className="my-6 flex h-72 items-center justify-center rounded-xl bg-[#14151a]">
                  <img src={m.img} alt={m.id} width={m.w} height={m.h} loading="lazy" className="max-h-full w-auto" />
                </div>
                <h3 className="font-display text-2xl font-bold">{m.id}</h3>
                <p className="mt-2 text-white/65">{m.d}</p>
                <button onClick={() => pick(m.id)} className="btn-primary mt-6 !px-6 !py-2.5">I’m interested</button>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/40">Concept renders, not shown to relative scale.</p>
        </section>

        <section className={`${cream} py-20`}>
          <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7b5c06]">Founder OS · built around the next step</p>
              <h2 className={`${h2} mt-3`}>A useful note is just the beginning.</h2>
              <p className="mt-4 text-[#575b60]">The work after the conversation matters as much as the conversation itself.</p>
              <ol className="mt-6 divide-y divide-[#cecac0] border-y border-[#cecac0]">
                {[["Capture with FLOW", "Bring a conversation into your workflow."], ["Prepare a follow-up", "The Sales Agent drafts a message. You review and send."], ["Connect the next action", "HubSpot notes and tasks are planned for January 2027."]].map(([a, b], i) => (
                  <li key={a} className="flex gap-5 py-4"><span className="text-sm text-[#856914]">0{i + 1}</span><div><strong className="block">{a}</strong>{b}</div></li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl border border-[#d9d4c9] bg-white p-7 shadow-xl shadow-black/5">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#696969]">Illustrative workflow · not a live app</p>
              <div role="tablist" aria-label="Workflow examples" className="my-5 flex gap-2">
                {Object.entries(TABS).map(([k, v]) => (
                  <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                    className={`rounded px-4 py-2 text-sm ${tab === k ? "bg-[#1a1c1f] text-white" : "border border-[#b5b3ad]"}`}>{v.label}</button>
                ))}
              </div>
              <h3 className="font-display text-xl font-bold">{t.title}</h3>
              <p className="mt-3 border-l-4 border-[#c49b28] bg-[#f4f1e9] p-4 text-[15px]">{t.input}</p>
              <div className="border-b border-[#e1ddd5] py-5"><strong>{t.head}</strong><p className="mt-2 text-[15px] text-[#3a3d40]">{t.body}</p></div>
              <span className="mt-4 inline-block rounded bg-[#f4e5b0] px-2 py-1 text-xs text-[#51411a]">{t.state}</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className={h2}>More than a recording.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {BEYOND.map(([a, b]) => (
              <div key={a} className="border-t border-white/15 pt-5"><h3 className="font-display text-xl font-bold">{a}</h3><p className="mt-2 text-white/65">{b}</p></div>
            ))}
          </div>
        </section>

        <section className={`${cream} py-20`} id="path">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7b5c06]">A clear launch path</p>
            <h2 className={`${h2} mt-3`}>Start useful. Get more connected.</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {PATH.map((p) => (
                <article key={p.t} className="border-t-2 border-[#c49b28] pt-5">
                  <p className="text-xs text-[#856914]">{p.when}</p>
                  <h3 className="mt-2 font-display text-xl font-bold">{p.t}</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] text-[#3a3d40]">{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                  {p.note && <p className="mt-3 text-sm text-[#575b60]">{p.note}</p>}
                </article>
              ))}
            </div>
            <p className="mt-8 text-xs text-[#575b60]">Planned features are not guaranteed, and timing may change as we test with founders.</p>
          </div>
        </section>

        <section id="join" className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">Early access</p>
            <h2 className={`${h2} mt-3`}>Build your next chapter. Keep the thread.</h2>
            <p className="mt-4 max-w-md text-white/65">Tell us which model interests you. We will email you when orders open. Free to join, no purchase required.</p>
          </div>
          <div id="join-form" className="rounded-2xl border border-white/10 bg-brand-bg2 p-7">
            <WaitlistForm where="final" source="flow-campaign" askPhone askConsent stacked model={model} onModelChange={setModel} />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 pb-20">
          <h2 className={h2}>A few useful answers.</h2>
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
      </main>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-white/50">
          <span>© {new Date().getFullYear()} yAtIverse · Startup Right</span>
          <nav aria-label="Legal" className="flex gap-5">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/cookie-policy" className="hover:text-white">Cookie Policy</Link>
            <a href="mailto:support@yativerse.ai" className="hover:text-white">support@yativerse.ai</a>
          </nav>
        </div>
      </footer>

      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-brand-bg/95 px-5 py-3 backdrop-blur transition-transform ${showBar ? "translate-y-0" : "translate-y-full"}`} aria-hidden={!showBar}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="text-sm"><b>yAtI FLOW</b> <span className="text-white/55">· Early access</span></p>
          <button tabIndex={showBar ? 0 : -1} onClick={() => goHero("sticky_bar")} className="btn-primary !px-5 !py-2">Join the waitlist</button>
        </div>
      </div>
    </div>
  );
}
