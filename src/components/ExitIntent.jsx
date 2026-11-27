import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import WaitlistForm from "./WaitlistForm";
import { track } from "../lib/tracking";

// Shown once per visit when someone looks like they are leaving the order page:
//  - desktop: the pointer leaves through the top of the window
//  - touch: a fast scroll back up after reading well down the page
// It offers a plain email summary. No countdowns, no invented scarcity.
// Never on load, never after signup, never while checkout has started or the visitor is typing.
const SESSION = "yati_exit_shown";
const UNTIL = "yati_exit_until";
const DAY = 864e5;
const MIN_DWELL_MS = 10000;

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

export default function ExitIntent({ blocked = false, source = "order-exit-intent" }) {
  const [open, setOpen] = useState(false);
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;
  const openRef = useRef(false);
  openRef.current = open;
  const lastFocus = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const start = Date.now();
    const eligible = () => {
      try {
        if (openRef.current || blockedRef.current) return false;
        if (Date.now() - start < MIN_DWELL_MS) return false;
        if (sessionStorage.getItem(SESSION)) return false;
        if (localStorage.getItem("yati_wl_joined")) return false;
        if (Date.now() < read(UNTIL, 0)) return false;
        if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return false;
        return true;
      } catch { return false; }
    };
    const fire = () => {
      if (!eligible()) return;
      try { sessionStorage.setItem(SESSION, "1"); } catch { /* ignore */ }
      lastFocus.current = document.activeElement;
      setOpen(true);
      track("order_exit_impression");
    };

    const onMouseOut = (e) => { if (!e.relatedTarget && e.clientY <= 0) fire(); };
    document.addEventListener("mouseout", onMouseOut);

    // Touch devices have no cursor to track: a quick scroll back up after reading at least 40% of the page.
    let lastY = window.scrollY, lastT = Date.now();
    const onScroll = () => {
      const y = window.scrollY, t = Date.now();
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const up = lastY - y;
      if (window.matchMedia("(pointer: coarse)").matches && h > 0 && lastY / h > 0.4 && up > window.innerHeight * 0.35 && t - lastT < 600) fire();
      lastY = y; lastT = t;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { document.removeEventListener("mouseout", onMouseOut); window.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    el?.querySelector("input[type=email]")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && el) {
        const f = el.querySelectorAll("button, input, a[href]");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function close() {
    try { localStorage.setItem(UNTIL, String(Date.now() + 7 * DAY)); } catch { /* ignore */ }
    track("order_exit_dismiss");
    setOpen(false);
    lastFocus.current?.focus?.();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="exit-title" className="relative w-full max-w-md rounded-3xl border border-white/10 bg-brand-bg2 p-7 shadow-2xl">
        <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 rounded-full p-2 text-white/60 hover:text-white"><X className="h-5 w-5" /></button>
        <h2 id="exit-title" className="pr-8 font-display text-2xl font-bold text-white">Not ready to order yet?</h2>
        <p className="mb-5 mt-3 font-body text-sm leading-6 text-white/70">
          Get one email with what comes with Thread One and Thread Max, what Basic and full Founder OS include, current pricing and shipping details. No account needed.
        </p>
        <WaitlistForm where="order-exit" source={source} cta="Email me the details" note="We will send the order summary and occasional launch updates." successText="Done. Check your inbox for the order summary." onSuccess={() => setTimeout(() => setOpen(false), 2200)} />
        <button type="button" onClick={close} className="mt-4 text-sm text-white/60 underline hover:text-white">No thanks, keep browsing</button>
      </div>
    </div>
  );
}
