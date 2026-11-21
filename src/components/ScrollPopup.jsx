import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import WaitlistForm from "./WaitlistForm";

const KEY = "yati_scroll_popup_until"; // dismissed: stay hidden for 7 days
const SESSION = "yati_scroll_popup_shown"; // at most once per visit
const DAY = 864e5;

// Non-blocking signup card that appears once at ~20% scroll. Never on load, never again after
// a dismissal (7 days), never once per-visit twice, never after signup, never over a form or modal.
export default function ScrollPopup({ source, blocked, model, onEvent, formEvents }) {
  const [open, setOpen] = useState(false);
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;

  useEffect(() => {
    try {
      if (localStorage.getItem("yati_wl_joined") || sessionStorage.getItem(SESSION) || Date.now() < Number(localStorage.getItem(KEY))) return;
    } catch { return; }
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0 || window.scrollY / h < 0.2) return;
      if (blockedRef.current || ["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      try { sessionStorage.setItem(SESSION, "1"); } catch { /* ignore */ }
      window.removeEventListener("scroll", onScroll);
      setOpen(true);
      onEvent("thread_popup_impression");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (open && blocked) setOpen(false); }, [blocked, open]);

  function dismiss() {
    try { localStorage.setItem(KEY, String(Date.now() + 7 * DAY)); } catch { /* ignore */ }
    onEvent("thread_popup_dismiss");
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && dismiss();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  return (
    <div role="dialog" aria-labelledby="sp-title" aria-describedby="sp-desc"
      className="fixed inset-x-3 bottom-20 z-40 rounded-2xl border border-brand-gold/30 bg-brand-bg2 p-5 text-white shadow-2xl shadow-black/50 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px]"
      onClickCapture={(e) => e.target.closest?.('button[type="submit"]') && onEvent("thread_popup_cta_click")}>
      <button onClick={dismiss} aria-label="Close" className="absolute right-3 top-3 rounded p-1 text-white/60 hover:text-white"><X size={18} /></button>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">yAtI Flow · Early access</p>
      <h2 id="sp-title" className="mt-2 pr-6 text-xl font-semibold tracking-tight">Your conversations can do more.</h2>
      <p id="sp-desc" className="mb-4 mt-2 text-sm text-white/65">Record, transcribe, summarize, and turn every important conversation into your next action.</p>
      <WaitlistForm where="scroll_popup" source={source} stacked cta="Get early access" model={model} {...formEvents} />
    </div>
  );
}
