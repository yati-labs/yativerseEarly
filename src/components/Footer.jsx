import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp } from "../lib/motion";

const COLS = [
  {
    title: "Products",
    links: [
      { l: "Signal Ring (coming later)", h: "/signal-ring" },
      { l: "YATI Flow",       h: "/yati-flow" },
      { l: "Founder OS",      h: "/os"        },
      { l: "Digital C-Suite", h: "/agents"    },
    ],
  },
  {
    title: "Digital C-Suite",
    links: [
      { l: "AI CMO", h: "/agents" },
      { l: "AI CRO", h: "/agents" },
      { l: "AI CFO", h: "/agents" },
      { l: "AI COO", h: "/agents" },
    ],
  },
  {
    title: "Company",
    links: [
      { l: "yAtI — Your Story", h: "/yAtI"    },
      { l: "Journey",           h: "/journey" },
    ],
  },
];

const SOCIAL = [
  { s: "𝕏",  h: "https://x.com"         },
  { s: "IG", h: "https://instagram.com"  },
  { s: "YT", h: "https://youtube.com"    },
  { s: "in", h: "https://linkedin.com"   },
];

export default function Footer() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  return (
    <footer className="relative bg-[#020510] border-t border-white/[0.06] pt-20 pb-10 overflow-hidden">
      {/* Bottom glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] rounded-full pointer-events-none"
        style={{ background:"radial-gradient(ellipse, rgba(96,92,255,0.06), transparent 70%)" }}
      />

      {/* Ghost vision text */}
      <motion.div {...fadeUp(0)} className="text-center mb-16 px-4">
        <p
          className="font-display font-bold leading-[1.05] tracking-tight select-none"
          style={{
            fontSize: "clamp(22px, 4vw, 52px)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.22))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          The AI-native ecosystem
          <br />
          for the next generation of founders.
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Top grid */}
        <div className="grid grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)] gap-10 mb-14">

          {/* Brand + newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <img src="/logo.jpeg" alt="yAtIverse" className="w-12 h-12 object-contain" />
            </Link>
            <p className="text-sm text-white/38 leading-relaxed max-w-[210px] mb-5 font-body">
              Wear your future. Build what matters. Scale with AI.
            </p>

            <p className="text-[11px] font-mono tracking-[0.13em] uppercase text-white/30 mb-2">
              Stay in the loop
            </p>

            {status === "success" ? (
              <p className="text-sm text-brand-teal font-body py-2">✓ You're on the list.</p>
            ) : (
              <>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStatus("loading");
                    fetch("https://formspree.io/f/mykankad", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    })
                      .then((res) => {
                        if (res.ok) { setStatus("success"); setEmail(""); }
                        else setStatus("error");
                      })
                      .catch(() => setStatus("error"));
                  }}
                >
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 min-w-0 bg-white/[0.05] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-brand-purple/50 transition-colors font-body"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="btn-primary !py-2 !px-4 !text-xs flex-shrink-0 disabled:opacity-50"
                  >
                    {status === "loading" ? "Sending..." : "Subscribe"}
                  </button>
                </form>
                {status === "error" && (
                  <p className="text-[12px] text-red-400 mt-2 font-body">Something went wrong. Try again.</p>
                )}
              </>
            )}

            <div className="flex gap-2.5 mt-5">
              {SOCIAL.map((s) => (
                <a
                  key={s.s}
                  href={s.h}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-[9px] bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[11px] font-semibold text-white/45 hover:bg-brand-purple/15 hover:border-brand-purple/30 hover:text-white transition-all duration-200 font-body"
                >
                  {s.s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold font-mono tracking-[0.13em] uppercase text-white/32 mb-3.5">
                {col.title}
              </p>
              <div className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <Link
                    key={link.l}
                    to={link.h}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-150 font-body"
                  >
                    {link.l}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="hr-brand mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/24 font-body">© 2026 yAtIverse. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-xs text-white/24 hover:text-white/55 transition-colors font-body">Privacy Policy</Link>
            <Link to="/terms"          className="text-xs text-white/24 hover:text-white/55 transition-colors font-body">Terms</Link>
            <Link to="/cookie-policy"  className="text-xs text-white/24 hover:text-white/55 transition-colors font-body">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}