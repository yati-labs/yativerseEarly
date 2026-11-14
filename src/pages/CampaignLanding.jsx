import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
import SEO from "../components/SEO";
import { captureAttribution, initMetaPixel, track, withAttribution } from "../lib/tracking";

// Single conversion goal: account signup. Every CTA goes to the existing
// signup flow (/login?mode=signup) with UTMs and click ids carried through.
function SignupCTA({ where, children = "Sign up", className = "" }) {
  return (
    <Link
      to={withAttribution("/login?mode=signup")}
      onClick={() => track("cta_click", { location: where, label: String(children) })}
      className={`btn-primary justify-center ${className}`}
    >
      {children}
    </Link>
  );
}

const PROBLEMS = [
  "A warm lead replies on Tuesday. By Friday nobody has answered.",
  "Deals go quiet and you only notice at the end of the month.",
  "You are the sales team, the marketer and the finance lead, so follow-up is the first thing to slip.",
];

const STEPS = [
  { t: "Create your account", d: "Sign up with email or Google. No credit card." },
  { t: "Connect HubSpot", d: "yAtI reads your deals and contacts so it knows where each one stands." },
  { t: "Review what it drafts", d: "Follow-ups and replies land in your inbox as drafts. Approve, edit or reject each one." },
];

const BENEFITS = [
  { t: "Fewer deals go cold", d: "Deals with no recent activity are flagged with a reason, so you see them early." },
  { t: "Faster replies", d: "A draft is waiting when you open the app. You edit it instead of starting from a blank page." },
  { t: "You stay in control", d: "Nothing is sent until you approve it. Every draft is yours to change." },
];

const FOR = [
  "Solo founders handling sales themselves",
  "Early-stage teams that already use HubSpot",
  "Founders who want an AI assistant but not an AI that emails prospects unsupervised",
];

const FAQ = [
  ["Does yAtI send emails on its own?", "No. It drafts, you approve. A message only goes out after you approve it."],
  ["Which CRM does it work with?", "HubSpot today. Connect your own account from Settings."],
  ["What does it cost to start?", "Signing up needs no credit card. New accounts start on a trial; plan details are on the Plan page after you sign in."],
  ["Do I need the Signal Ring?", "No. The ring and Founder OS are optional. You can start with the dashboard and your AI agents."],
  ["Who sees my CRM data?", "Your data stays in your account. See our Privacy Policy for how it is handled."],
  ["How do I get help?", "Email support@yativerse.ai."],
];

function InboxMock() {
  // Illustrative sample, labeled as such. Swap for a real screenshot when available.
  return (
    <figure className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0e22] p-5 text-left" aria-label="Example of a drafted follow-up awaiting approval">
      <div className="flex items-center justify-between text-xs text-white/50 font-body">
        <span>Needs your approval</span>
        <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-amber-300">No activity in 14 days</span>
      </div>
      <p className="mt-3 font-display text-base text-white">Acme Corp · Proposal</p>
      <p className="mt-3 rounded-xl bg-white/[0.04] p-3 text-sm leading-relaxed text-white/75 font-body">
        Hi Sam, wanted to check whether the proposal answered your questions on rollout. Happy to walk through it on a short call this week.
      </p>
      <div className="mt-4 flex gap-2 text-sm font-body">
        <span className="flex-1 rounded-full bg-brand-purple py-2 text-center font-semibold text-white">Approve</span>
        <span className="flex-1 rounded-full border border-white/15 py-2 text-center text-white/70">Edit</span>
        <span className="flex-1 rounded-full border border-white/15 py-2 text-center text-white/70">Reject</span>
      </div>
      <figcaption className="mt-3 text-[11px] text-white/35 font-body">Illustrative example with sample data.</figcaption>
    </figure>
  );
}

export default function CampaignLanding() {
  useEffect(() => {
    captureAttribution();
    initMetaPixel();
    // Paid landing page: keep out of organic search and the sitemap.
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, follow";
    document.head.appendChild(m);
    track("campaign_view");
    return () => m.remove();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg font-body text-white">
      <SEO
        title="Never let a deal go quiet again"
        description="yAtI watches your HubSpot pipeline and drafts the follow-up. You approve every message before it goes out."
        path="/sales-agent"
      />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-brand-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="yAtIverse home" className="flex items-center gap-2">
            <img src="/logo.png" alt="" width="28" height="28" className="h-7 w-7 rounded-md" />
            <span className="font-display text-base font-bold">yAtIverse</span>
          </Link>
          <SignupCTA where="header" className="!px-5 !py-2" />
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.1fr_0.9fr] md:pt-24">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] md:text-6xl">
              Never let a deal go quiet again.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              yAtI watches your HubSpot pipeline and drafts the follow-up. You read it, tweak it and approve it. Nothing is sent without you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <SignupCTA where="hero" />
              <span className="text-sm text-white/50">No credit card required</span>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <InboxMock />
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Follow-up is the first thing to slip.</h2>
            <ul className="mt-8 space-y-4 text-lg text-white/70">
              {PROBLEMS.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="font-display text-3xl font-bold md:text-4xl">An assistant that drafts, and waits for you.</h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            yAtI reads your deals, notices the ones that need attention, and writes the next message. Your job shrinks to one decision: send it, change it, or drop it.
          </p>
        </section>

        <section className="border-y border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Up and running in three steps</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.t}>
                  <span className="font-display text-sm text-brand-gold">Step {i + 1}</span>
                  <h3 className="mt-2 font-display text-xl font-bold">{s.t}</h3>
                  <p className="mt-2 text-white/65 leading-relaxed">{s.d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10"><SignupCTA where="how_it_works" /></div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-3xl font-bold md:text-4xl">What changes for you</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.t}>
                <h3 className="font-display text-xl font-bold">{b.t}</h3>
                <p className="mt-2 text-white/65 leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-brand-bg2 py-20">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Built for founders who sell</h2>
            <ul className="mt-8 space-y-3">
              {FOR.map((f) => (
                <li key={f} className="flex gap-3 text-lg text-white/75">
                  <Check size={20} className="mt-1 shrink-0 text-brand-teal" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            {/* TRUST: add real customer logos / testimonials here once available. None are shown on purpose. */}
            <p className="mt-8 text-white/55">
              Approval comes first by design: yAtI never contacts your prospects without your sign-off.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Questions, answered</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-4" onToggle={(e) => e.currentTarget.open && track("faq_open", { question: q })}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                  {q}
                  <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-white/65 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="border-t border-white/[0.06] bg-brand-bg2 py-24 text-center">
          <div className="mx-auto max-w-2xl px-5">
            <h2 className="font-display text-3xl font-bold md:text-5xl">Stop losing deals to silence.</h2>
            <p className="mt-4 text-lg text-white/65">Create your account in a minute. No credit card.</p>
            <div className="mt-8 flex justify-center"><SignupCTA where="final" /></div>
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
