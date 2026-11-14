import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { joinWaitlist } from "../lib/api";
import { getAttribution } from "../lib/tracking";
import { fadeUp, fadeLeft, fadeRight } from "../lib/motion";

const PERKS = [
  {
    icon: "🚀",
    title: "Early access",
    desc: "Be first into yAtI OS, agents, and the full ecosystem before public launch.",
  },
  {
    icon: "💍",
    title: "Founder pricing",
    desc: "Waitlist members get exclusive early pricing on wearables and platform.",
  },
  {
    icon: "🤝",
    title: "Shape the product",
    desc: "Your feedback directly influences what gets built. We actually listen.",
  },
  {
    icon: "🌐",
    title: "Community access",
    desc: "Instant entry into the private Discord for builders and founders.",
  },
];

const FAQS = [
  {
    q: "Is yAtIverse available right now?",
    a: "We're in early access. Joining the waitlist puts you first in line when we open doors.",
  },
  {
    q: "What does it cost?",
    a: "We'll share pricing with waitlist members first. Expect founder-friendly tiers for early-stage builders.",
  },
  {
    q: "Do I need the wearables?",
    a: "No. You can start with yAtI OS and AI agents. Wearables deepen the experience but aren't required.",
  },
  {
    q: "What happens after I join?",
    a: "Confirmation email, access to our private Discord, and early updates on launch timing.",
  },
  {
    q: "Who is yAtIverse built for?",
    a: "Ambitious people aged 16–30: solo founders, creators, operators, students with big ideas, and digital-native builders.",
  },
];

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=60&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=60&q=80",
];

export default function Waitlist() {
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [done, setDone] = useState(false);
  const [faq, setFaq] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (form.name && form.email) setDone(true);
  };

  return (
    <>
      <SEO
        title="Join the Waitlist — Early Access"
        description="Join 1,200+ founders on the yAtIverse waitlist. Get early access to yAtI OS, AI agents, and wearable hardware before public launch."
        path="/waitlist"
      />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />

        <section className="relative pt-36 pb-20 px-4 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 50% -10%, rgba(96,92,255,.18), transparent 60%)",
            }}
          />
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start relative z-10">
            {/* Left */}
            <div>
              <motion.span {...fadeUp(0)} className="kicker mb-6 inline-block">
                Early access
              </motion.span>
              <motion.h1
                {...fadeUp(0.07)}
                className="font-display font-bold tracking-[-0.04em] leading-[0.97] mb-5 text-white"
                style={{ fontSize: "clamp(38px,5.5vw,68px)" }}
              >
                Start up right
                <br />
                inside the
                <br />
                <span className="text-gradient">yAtI-Verse.</span>
              </motion.h1>
              <motion.p
                {...fadeUp(0.13)}
                className="font-body text-base text-white/55 leading-relaxed mb-7"
              >
                Join the waitlist for yAtI OS, AI-1 agents, wearable hardware,
                and a community of builders who don't build alone.
              </motion.p>

              {/* Social proof */}
              <motion.div
                {...fadeUp(0.17)}
                className="flex items-center gap-3 mb-8"
              >
                <div className="flex">
                  {AVATARS.map((s, i) => (
                    <img
                      key={i}
                      src={s}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover border-2 border-brand-bg -ml-2 first:ml-0"
                    />
                  ))}
                </div>
                <p className="text-sm font-body text-white/48">
                  <span className="text-white/75 font-semibold">
                    1,200+ founders
                  </span>{" "}
                  already on the list
                </p>
              </motion.div>

              {/* Perks */}
              <motion.div {...fadeUp(0.2)} className="flex flex-col gap-3">
                {PERKS.map((p) => (
                  <div
                    key={p.title}
                    className="flex gap-3 items-start glass rounded-xl p-4"
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {p.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold font-body text-white mb-0.5">
                        {p.title}
                      </p>
                      <p className="text-xs font-body text-white/48 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Form card */}
            <motion.div {...fadeRight(0.1)}>
              <div className="glass rounded-3xl p-9 sticky top-24">
                {done ? (
                  <div className="text-center py-6">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{
                        background: "linear-gradient(135deg,#605CFF,#C86DD7)",
                      }}
                    >
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-display font-bold text-2xl text-white mb-2">
                      You're in.
                    </p>
                    <p className="font-body text-sm text-white/52 leading-relaxed">
                      Welcome to yAtIverse, {form.name.split(" ")[0]}.<br />
                      Check your inbox — we'll be in touch.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="font-display font-bold text-2xl text-white mb-1">
                      Claim your spot
                    </p>
                    <p className="font-body text-sm text-white/42 mb-7">
                      No credit card. No commitments.
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setStatus("loading");
                        joinWaitlist({ ...form, source: "waitlist-page", landing: window.location.pathname, ...getAttribution() })
                          .then(() => {
                            setStatus("success");
                            setForm({ name: "", email: "", role: "" });
                          })
                          .catch(() => setStatus("error"));
                      }}
                      className="space-y-4"
                    >
                      {[
                        {
                          id: "name",
                          label: "Your name",
                          type: "text",
                          placeholder: "Arjun Sharma",
                        },
                        {
                          id: "email",
                          label: "Email address",
                          type: "email",
                          placeholder: "you@example.com",
                        },
                      ].map((f) => (
                        <div key={f.id}>
                          <label
                            htmlFor={f.id}
                            className="block text-[11px] font-mono uppercase tracking-[0.08em] text-white/42 mb-1.5"
                          >
                            {f.label}
                          </label>
                          <input
                            id={f.id}
                            name={f.id}
                            type={f.type}
                            placeholder={f.placeholder}
                            value={form[f.id]}
                            onChange={change}
                            required
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/24 outline-none focus:border-brand-purple/50 transition-colors font-body"
                          />
                        </div>
                      ))}

                      <div>
                        <label
                          htmlFor="role"
                          className="block text-[11px] font-mono uppercase tracking-[0.08em] text-white/42 mb-1.5"
                        >
                          I am a...
                        </label>
                        <select
                          id="role"
                          name="role"
                          value={form.role}
                          onChange={change}
                          className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-purple/50 transition-colors font-body appearance-none cursor-pointer"
                        >
                          <option value="">Select your stage</option>
                          <option value="aspiring">Aspiring founder</option>
                          <option value="building">Currently building</option>
                          <option value="operator">
                            Operator / freelancer
                          </option>
                          <option value="creator">
                            Creator / personal brand
                          </option>
                          <option value="student">
                            Student with big ideas
                          </option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="btn-primary w-full justify-center !py-4 !text-sm mt-2 disabled:opacity-50"
                      >
                        {status === "loading"
                          ? "Submitting..."
                          : "Join the yAtI-Verse"}
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {status === "success" && (
                        <p className="text-[12px] text-green-400 text-center font-body">
                          Thank you — you're officially in the yAtIverse. We will be in touch soon for the next updates.
                        </p>
                      )}

                      {status === "error" && (
                        <p className="text-[12px] text-red-400 text-center font-body">
                          Something went wrong. Please try again.
                        </p>
                      )}

                      <p className="text-[11px] font-body text-white/26 text-center">
                        No spam. Unsubscribe anytime.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 border-t border-white/[0.06]">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <motion.span {...fadeUp(0)} className="kicker mb-4 inline-block">
                Questions
              </motion.span>
              <motion.h2
                {...fadeUp(0.07)}
                className="font-display font-bold tracking-tight text-white"
                style={{ fontSize: "clamp(28px,3.5vw,44px)" }}
              >
                Everything you need{" "}
                <span className="text-gradient">to know.</span>
              </motion.h2>
            </div>
            <div className="flex flex-col gap-2.5">
              {FAQS.map((f, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.06)}
                  className="glass rounded-2xl overflow-hidden"
                >
                  <button
                    className="w-full flex justify-between items-center px-5 py-4 text-left"
                    onClick={() => setFaq(faq === i ? null : i)}
                  >
                    <span className="text-sm font-medium font-body text-white">
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-white/40 flex-shrink-0 ml-4 transition-transform duration-200 ${faq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {faq === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="px-5 pb-4 text-sm font-body text-white/52 leading-relaxed"
                    >
                      {f.a}
                    </motion.p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
