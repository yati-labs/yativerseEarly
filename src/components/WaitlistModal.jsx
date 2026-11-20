import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import WaitlistForm from "./WaitlistForm";
import { track } from "../lib/tracking";

// Waitlist popup. Opens from buttons (and exit intent on desktop); closes on Esc, backdrop or the X.
export default function WaitlistModal({ open, onClose, source, model, onModelChange }) {
  const ref = useRef(null);

  function close() {
    let joined = false;
    try { joined = !!localStorage.getItem("yati_wl_joined"); } catch { /* ignore */ }
    if (!joined) track("modal_dismiss");
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector("input[type=email]")?.focus();
    function onKey(e) {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab") return;
      const f = ref.current.querySelectorAll("button, input, select, a[href]");
      const els = [...f].filter((el) => el.tabIndex >= 0 && el.offsetParent !== null);
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; prev?.focus?.(); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="wl-title"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-brand-bg2 p-7 text-white shadow-2xl">
        <button onClick={close} aria-label="Close" className="absolute right-4 top-4 text-white/60 hover:text-white"><X size={20} /></button>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">yAtI FLOW · Early access</p>
        <h2 id="wl-title" className="mt-2 text-2xl font-semibold tracking-tight">Be first when orders open.</h2>
        <p className="mb-5 mt-2 text-sm text-white/65">Free to join. No purchase required.</p>
        <WaitlistForm where="modal" source={source} askPhone askConsent stacked model={model} onModelChange={onModelChange} />
      </div>
    </div>
  );
}
