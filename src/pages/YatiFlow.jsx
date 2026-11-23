import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, Check, ChevronDown, CalendarDays, FileText, Hash, ListChecks, Mail, Mic, Minus, Send, ShieldCheck, Sparkles, Users, Workflow } from "lucide-react";
import SEO from "../components/SEO";
import WaitlistForm from "../components/WaitlistForm";
import WaitlistModal from "../components/WaitlistModal";
import ScrollPopup from "../components/ScrollPopup";
import HeroVideo from "../components/HeroVideo";
import { captureAttribution, initMetaPixel, track } from "../lib/tracking";
import { FLOW_SEO, FLOW_PATH, SITE } from "../seo/yatiFlow";

// yAtI Flow campaign page (/yati-flow). One goal: early-access signup.
// Claims below come from the product docs and dashboard code. "Planned" items are labelled as planned.
const SOURCE = "flow-campaign";
const ev = (name, p = {}) => track(name, { campaign: "yati_flow", ...p }); // all thread_* events

const MODELS = [
  { id: "Thread One", tag: "Slim card", img: "/flow/thread-one.jpg", w: 225, h: 495, alt: "yAtI Flow Thread One slim card recorder", grams: 54, material: "Aluminum alloy", hl: ["87 × 56 mm, 5.9 mm thin", "54 g", "About 18 h recording"],
    d: "An ultra-slim aluminum card for your meeting table, pocket or bag, with a built-in magnet.", fit: "Choose Thread One if your best conversations happen across a desk or table." },
  { id: "Thread Max", tag: "Wearable capsule", img: "/flow/thread-max.jpg", w: 230, h: 405, alt: "yAtI Flow Thread Max wearable capsule recorder", grams: 23, material: "Aluminum alloy and ABS", hl: ["50.5 × 22 mm", "23 g", "21 h recording"],
    d: "A compact 23 g wearable capsule with a one-touch record button, for conversations on the move.", fit: "Choose Thread Max to capture conversations on the move." },
];
// Hardware specs from the manufacturer listings (LA519 = Thread One, LA367 = Thread Max).
// TODO: confirm against sample units; Thread One storage is listed as 8–128 GB options.
const SPEC_ROWS = [
  ["Form", "Slim card", "Wearable capsule"],
  ["Size", "87 × 56 × 5.9 mm (3.43 × 2.20 × 0.23 in)", "50.5 × 22 × 12.2 mm (1.99 × 0.87 × 0.48 in)"],
  ["Weight", "54 g (1.9 oz)", "23 g (0.81 oz)"],
  ["Material", "Aluminum alloy", "Aluminum alloy and ABS"],
  ["Recording time", "About 18 h", "21 h continuous"],
  ["Charging", "3 h (1 h with wireless charger)", "2 h"],
  ["Storage", "Up to 128 GB", "64 GB"],
  ["Controls", "Touch controls", "One-touch button and app"],
  ["Extras", "Built-in magnet, noise reduction", "Lightweight, all-day wear"],
  ["Operating temperature", "-5 to 40 °C", "-5 to 40 °C"],
];

const COMPARE_BASE = ["Records conversations", "Transcribes audio", "Creates summaries"];
const COMPARE_FLOW = [
  ["Records conversations"], ["Transcribes conversations"], ["Creates intelligent summaries"], ["Extracts action items"],
  ["Drafts emails for you to review"], ["Connects with Gmail, Calendar, Slack and HubSpot"],
  ["Helps with scheduling", "Free times suggested today; full scheduling planned"], ["Turns conversations into workflows", "Early access"],
];

const FLOW = [
  [Mic, "Conversation", "A meeting, a coffee, a hallway idea."], [Mic, "Recording", "Captured with Thread One or Thread Max."],
  [FileText, "Transcription", "A full transcript with audio playback."], [Sparkles, "AI insights", "A short summary of what mattered."],
  [ListChecks, "Action items", "Next steps you can edit."], [Send, "Your tools", "Email drafts you approve, plus Calendar, Slack and CRM context."],
];

const INTEG = [
  { n: "Gmail", I: Mail, tag: "In Founder OS", b: "Turn conversations into ready-to-review email drafts.", d: "Connect your Gmail. Approved drafts are sent from your account and replies are tracked." },
  { n: "Google Calendar", I: CalendarDays, tag: "In Founder OS", b: "Make follow-ups and meetings easier to schedule.", d: "Your assistant can suggest free times when drafting replies and see your meetings. Linking each recording to its meeting is part of early access." },
  { n: "Slack", I: Hash, tag: "In Founder OS", b: "Get drafts and deal alerts where you already work.", d: "A morning digest of drafts and replies, plus alerts for deals at risk, posted to your Slack. Sharing conversation insights is planned." },
  { n: "HubSpot", I: Users, tag: "Read-only today", b: "Ground follow-ups in your real deals and contacts.", d: "Your contacts and deals are read from your HubSpot. Saving notes and tasks back to HubSpot is planned for January 2027." },
];

const FEATURES = [
  ["Capture", "Never rely on memory", "Record conversations with a wearable or slim recorder."],
  ["Transcription", "Words you can replay", "A full transcript with audio playback."],
  ["AI summaries", "The point, in seconds", "A short summary of what mattered."],
  ["Action items", "Nothing slips", "Next steps, editable before you act."],
  ["Email drafting", "Follow-ups written for you", "Drafted from the conversation. You review and send."],
  ["Smarter scheduling", "Fewer back-and-forths", "Calendar-aware drafts can suggest free times. Full scheduling is planned.", "Planned"],
  ["Connected tools", "Works where you work", "Gmail, Google Calendar, Slack and HubSpot."],
];

const STEPS = [["Capture", "Record the conversation with Thread One or Thread Max."], ["Review", "Read the transcript, summary and action items."], ["Draft", "yAtI drafts the follow-up from what was said."], ["Approve", "You edit and approve. Nothing goes out without you."]];

const USES = [
  [Briefcase, "Professionals in meetings", "Leave with next steps, not a blank page."], [Sparkles, "Founders and entrepreneurs", "Keep every customer and investor conversation moving."],
  [Send, "Sales teams", "Follow up while the conversation is fresh."], [FileText, "Consultants", "Turn client calls into clear recaps."],
  [Users, "Business owners", "Spend less time on admin after the meeting."], [Workflow, "Anyone juggling follow-ups", "One place for what was said and what is next."],
];

const FAQ = [
  ["What is yAtI Flow?", "yAtI Flow is a family of AI conversation recorders, Thread One and Thread Max, that work with the yAtI app and Founder OS to record, transcribe and summarize conversations and prepare follow-ups."],
  ["Is it just an AI voice recorder?", "No. Beyond recording, transcription and summaries, it extracts action items and drafts emails for you to review. It connects with Gmail, Google Calendar, Slack and HubSpot, with each connection labelled by its current status."],
  ["Does it send emails on its own?", "No. yAtI drafts, you review and approve. Nothing is sent without your approval."],
  ["Which integrations work today?", "In Founder OS today: Gmail (approved drafts are sent from your account), Google Calendar, Slack (digests and alerts) and read-only HubSpot. Saving notes and tasks to HubSpot is planned for January 2027."],
  ["How is my data handled?", "Details on storage and deletion will be published before orders open. See our Privacy Policy for how we handle data today."],
  ["Can I record anyone?", "Rules on recording conversations vary by place. You are responsible for getting consent where it is required."], // legal review before ads
  ["What phones and computers does it work with?", "iPhone and Mac first. Android is planned after testing."],
  ["When can I order?", "We will email waitlist members first when orders open. Pricing is announced then."],
  ["Which model should I pick?", "Thread One is a slim card (87 × 56 mm, 54 g) for tables, pockets and bags. Thread Max is a compact wearable capsule (50.5 × 22 mm, 23 g). Both work with yAtI."],
  ["How long does the battery last?", "Thread One records for about 18 hours. Thread Max records for 21 hours continuously."],
];

function R({ children, className = "" }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return <motion.div className={className} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>{children}</motion.div>;
}
const Tag = ({ children, tone = "gold" }) => <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone === "gold" ? "bg-brand-gold/15 text-brand-gold2" : "bg-white/10 text-white/60"}`}>{children}</span>;
const cream = "bg-[#f4f1e9] text-[#191b1d]";
const h2 = "text-3xl font-semibold tracking-tight md:text-5xl";
const eyebrow = "text-xs font-bold uppercase tracking-[0.16em]";

export default function YatiFlow() {
  const [model, setModel] = useState("Not sure yet");
  const [modal, setModal] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [open, setOpen] = useState(null);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const viewed = useRef(false);

  const formEvents = { onStart: (where) => ev("thread_signup_start", { location: where }), onSuccess: (where, m) => ev("thread_signup_complete", { location: where, model: m }) };

  useEffect(() => {
    captureAttribution(); initMetaPixel();
    if (!viewed.current) { viewed.current = true; ev("thread_page_view"); track("campaign_view", { campaign: "yati_flow" }); }
    const ld = document.createElement("script"); ld.type = "application/ld+json"; ld.id = "ld-yati-flow";
    ld.text = JSON.stringify({ "@context": "https://schema.org", "@graph": [
      ...MODELS.map((m) => ({ "@type": "Product", name: `yAtI Flow ${m.id}`, description: m.d, image: SITE + m.img, brand: { "@type": "Brand", name: "yAtI Flow" }, weight: { "@type": "QuantitativeValue", value: m.grams, unitCode: "GRM" }, material: m.material })),
      { "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ] });
    document.head.appendChild(ld);
    const hit = new Set();
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      const pct = (window.scrollY / h) * 100;
      [20, 50, 75, 90].forEach((t) => { if (pct >= t && !hit.has(t)) { hit.add(t); ev(`thread_scroll_${t}`); } });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const seen = new Set(); // sticky CTA shows once the hero form has scrolled away
    const io = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id))); setShowBar(seen.size === 0 && window.scrollY > 200); });
    ["hero-form", "final-form"].forEach((id) => { const el = document.getElementById(id); el && io.observe(el); });
    return () => { ld.remove(); window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setActive((a) => (a + 1) % FLOW.length), 1800);
    return () => clearInterval(t);
  }, [reduce]);

  function openModal(where) { ev("thread_hero_cta_click", { location: where }); track("modal_open", { trigger: where }); setModal(true); }
  function pick(id) { setModel(id); ev("thread_variant_select", { model: id }); track("model_interest", { model: id }); track("modal_open", { trigger: "model_card" }); setModal(true); }
  function toggle(n) { ev("thread_integration_click", { integration: n }); setOpen(open === n ? null : n); }

  return (
    <div className="min-h-screen bg-brand-bg pb-20 font-body text-white">
      <SEO raw title={FLOW_SEO.title} description={FLOW_SEO.description} image={FLOW_SEO.image} path={FLOW_PATH} />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-brand-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="yAtIverse home"><img src="/logo.png" alt="yAtIverse" width="34" height="28" className="h-7 w-auto" /></Link>
          <button onClick={() => openModal("header")} className="btn-primary !px-5 !py-2">Get early access</button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-12 md:grid-cols-[1.05fr_1fr] md:pt-20">
          <div>
            <p className={`${eyebrow} text-brand-gold`}><span className="normal-case">yAtI</span> Flow + Founder OS</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">Your conversations. <span className="text-brand-gold2">Put to work.</span></h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">Meet yAtI Flow: Thread One and Thread Max. AI-powered companions that record, transcribe and summarize your conversations, then help turn them into email drafts, follow-ups and action.</p>
            <div id="hero-form" className="mt-8" onClickCapture={(e) => e.target.closest?.('button[type="submit"]') && ev("thread_hero_cta_click", { location: "hero" })}>
              <WaitlistForm where="hero" source={SOURCE} cta="Get early access" model={model} {...formEvents} />
            </div>
            <a href="#journey" onClick={() => ev("thread_demo_click")} className="mt-5 inline-block text-sm font-semibold text-brand-gold2 underline-offset-4 hover:underline">Discover what it can do →</a>
            <p className="mt-4 text-xs leading-relaxed text-white/65">Free to join. No purchase required. Works with iPhone and Mac. Android is planned.</p>
          </div>
          <HeroVideo className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-brand-bg2" poster="/flow/flow-devices.jpg" mp4="/flow/hero-loop.mp4" webm={null} />
        </section>

        <div className="mx-auto grid max-w-6xl gap-3 border-t border-white/10 px-5 py-6 text-sm text-white/65 sm:grid-cols-3">
          <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-brand-gold" aria-hidden="true" /> You review and approve every email</span>
          <span className="flex items-center gap-2"><Mail size={16} className="text-brand-gold" aria-hidden="true" /> Gmail, Calendar, Slack, HubSpot</span>
          <span className="flex items-center gap-2"><Check size={16} className="text-brand-gold" aria-hidden="true" /> Two models, one yAtI account</span>
        </div>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <R><p className={`${eyebrow} text-brand-gold`}>The difference</p><h2 className={`${h2} mt-3`}>Not just another AI voice recorder.</h2></R>
          <div className="mt-10 grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
            <R className="rounded-2xl border border-white/10 p-7 opacity-80">
              <h3 className="font-display text-lg font-bold text-white/70">A typical AI recorder</h3>
              <ul className="mt-5 space-y-3 text-white/60">{COMPARE_BASE.map((c) => <li key={c} className="flex gap-3"><Minus size={18} className="mt-0.5 shrink-0" aria-hidden="true" />{c}</li>)}</ul>
            </R>
            <R className="rounded-2xl border border-brand-gold/40 bg-gradient-to-br from-brand-gold/10 to-transparent p-7">
              <h3 className="font-display text-lg font-bold text-brand-gold2">yAtI Flow</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">{COMPARE_FLOW.map(([c, note]) => <li key={c} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-brand-teal" aria-hidden="true" /><span>{c}{note && <span className="block text-xs text-white/65">{note}</span>}</span></li>)}</ul>
            </R>
          </div>
        </section>

        <section id="journey" className={`${cream} py-20`}>
          <div className="mx-auto max-w-6xl px-5">
            <R><p className={`${eyebrow} text-[#7b5c06]`}>From conversation to action</p><h2 className={`${h2} mt-3`}>Say it once. Let it work.</h2></R>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {FLOW.map(([I, t], i) => (
                <li key={t} aria-current={active === i && !reduce} className={`rounded-2xl border p-5 text-center transition ${active === i && !reduce ? "border-[#c49b28] bg-white shadow-lg" : "border-[#d9d4c9] bg-white/60"}`}>
                  <I size={26} className="mx-auto text-[#856914]" aria-hidden="true" /><p className="mt-3 font-display font-bold">{t}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 min-h-[2rem] text-center text-lg text-[#3a3d40]" aria-live="off">{FLOW[active][2]}</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <R><h2 className={h2}>Your favorite tools, connected.</h2><p className="mt-4 max-w-xl text-white/65">Each connection is labeled with where it stands today.</p></R>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {INTEG.map(({ n, I, tag, b, d }) => (
              <div key={n} className="rounded-2xl border border-white/10 bg-brand-bg2 p-6">
                <button onClick={() => toggle(n)} aria-expanded={open === n} className="flex w-full items-start justify-between gap-4 text-left">
                  <span className="flex items-start gap-4"><I size={26} className="mt-1 shrink-0 text-brand-gold" aria-hidden="true" /><span><span className="flex items-center gap-3"><span className="font-display text-xl font-bold">{n}</span><Tag>{tag}</Tag></span><span className="mt-1 block text-white/70">{b}</span></span></span>
                  <ChevronDown size={18} className={`mt-1 shrink-0 transition-transform ${open === n ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {open === n && <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-relaxed text-white/65">{d}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <R><h2 className={h2}>Features that make a difference.</h2></R>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(([t, o, d, tag]) => (
                <R key={t}><p className="text-xs uppercase tracking-wider text-brand-gold">{t} {tag && <Tag tone="mute">{tag}</Tag>}</p><h3 className="mt-2 font-display text-xl font-bold">{o}</h3><p className="mt-2 text-white/65">{d}</p></R>
              ))}
            </div>
          </div>
        </section>

        <section className={`${cream} py-20`}>
          <div className="mx-auto max-w-6xl px-5">
            <R><h2 className={h2}>How it works.</h2></R>
            <ol className="mt-10 grid gap-6 md:grid-cols-4">
              {STEPS.map(([t, d], i) => (<li key={t} className="border-t-2 border-[#c49b28] pt-4"><span className="text-sm text-[#856914]">0{i + 1}</span><h3 className="font-display text-xl font-bold">{t}</h3><p className="mt-1 text-[#3a3d40]">{d}</p></li>))}
            </ol>
            <div className="mt-10"><button onClick={() => openModal("how_it_works")} className="btn-primary">Get early access</button></div>
          </div>
        </section>

        <section id="models" className="mx-auto max-w-6xl px-5 py-20">
          <R><p className={`${eyebrow} text-brand-gold`}>One family, two form factors</p><h2 className={`${h2} mt-3`}>Thread One or Thread Max.</h2></R>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {MODELS.map((m) => (
              <article key={m.id} className="rounded-2xl border border-white/10 bg-brand-bg2 p-7">
                <Tag>{m.tag}</Tag>
                <div className="my-6 flex h-72 items-center justify-center rounded-xl bg-[#14151a]"><img src={m.img} alt={m.alt} width={m.w} height={m.h} loading="lazy" className="max-h-full w-auto" /></div>
                <h3 className="font-display text-2xl font-bold">{m.id}</h3>
                <p className="mt-2 text-white/70">{m.d}</p><p className="mt-2 text-sm text-white/55">{m.fit}</p>
                <ul className="mt-4 flex flex-wrap gap-2">{m.hl.map((h) => <li key={h} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">{h}</li>)}</ul>
                <button onClick={() => pick(m.id)} className="btn-primary mt-6 !px-6 !py-2.5">I’m interested in {m.id}</button>
              </article>
            ))}
          </div>
          <R className="mt-12 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">Thread One and Thread Max specifications</caption>
              <thead className="bg-brand-bg2 text-white/70"><tr><th scope="col" className="p-4 font-semibold">Specification</th><th scope="col" className="p-4 font-semibold">Thread One</th><th scope="col" className="p-4 font-semibold">Thread Max</th></tr></thead>
              <tbody className="divide-y divide-white/10">{SPEC_ROWS.map(([k, a, b]) => <tr key={k}><th scope="row" className="p-4 font-normal text-white/55">{k}</th><td className="p-4">{a}</td><td className="p-4">{b}</td></tr>)}</tbody>
            </table>
          </R>
        </section>

        <section className="border-y border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <R><h2 className={h2}>Built for people who live in conversations.</h2></R>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {USES.map(([I, t, d]) => (<R key={t}><I size={22} className="text-brand-gold" aria-hidden="true" /><h3 className="mt-3 font-display text-lg font-bold">{t}</h3><p className="mt-1 text-white/65">{d}</p></R>))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-20">
          <h2 className={h2}>Questions, answered.</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-4" onToggle={(e) => e.currentTarget.open && track("faq_open", { question: q })}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">{q}<ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
                <p className="mt-3 leading-relaxed text-white/65">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="join" className="border-t border-white/[0.06] bg-brand-bg2 py-24">
          <div className="mx-auto grid max-w-5xl gap-10 px-5 md:grid-cols-2 md:items-center">
            <div><h2 className={h2}>Stop just taking notes. Start getting things done.</h2><p className="mt-4 text-white/65">Free to join. No purchase required. We will email you when orders open.</p></div>
            <div id="final-form" className="rounded-2xl border border-white/10 bg-brand-bg p-7"><WaitlistForm where="final" source={SOURCE} askPhone askConsent stacked cta="Get early access" model={model} onModelChange={setModel} {...formEvents} /></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-white/65">
          <span>© {new Date().getFullYear()} yAtIverse · Start Up Right!</span>
          <nav aria-label="Legal" className="flex gap-5"><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link><Link to="/cookie-policy" className="hover:text-white">Cookie Policy</Link><a href="mailto:support@yativerse.ai" className="hover:text-white">support@yativerse.ai</a></nav>
        </div>
      </footer>

      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-brand-bg/95 px-5 py-3 backdrop-blur transition-transform ${showBar ? "translate-y-0" : "translate-y-full"}`} aria-hidden={!showBar}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="hidden text-sm sm:block"><b>yAtI Flow</b> <span className="text-white/55">· Free to join</span></p>
          <button tabIndex={showBar ? 0 : -1} onClick={() => openModal("sticky_bar")} className="btn-primary w-full justify-center !py-2.5 sm:w-auto sm:!px-6">Get early access</button>
        </div>
      </div>

      <ScrollPopup source={SOURCE} blocked={modal} model={model} onModelChange={setModel} onEvent={ev} formEvents={formEvents} onOpenSignup={(w) => { track("modal_open", { trigger: w }); setModal(true); }} />
      <WaitlistModal open={modal} onClose={() => setModal(false)} source={SOURCE} model={model} onModelChange={setModel} cta="Get early access" {...formEvents} />
    </div>
  );
}
