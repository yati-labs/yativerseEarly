import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import WaitlistModal from "./WaitlistModal";

// Feature prompts as the visitor scrolls: a full-page overlay at 20%, then two light cards at 50% and 75%.
// Each shows once per visit. Dismissing the overlay silences it for 7 days; dismissing a card silences cards for 7 days.
// Never on load, never after signup, never over another modal or while typing.
const STAGES = [
  { at: 20, kind: "overlay", title: "Your conversations can do more.", body: "Record, transcribe, summarize, and turn every important conversation into your next action." },
  { at: 50, kind: "card", title: "Never lose an action item.", body: "Next steps are pulled from every conversation, ready for you to edit." },
  { at: 75, kind: "card", title: "Connected to the tools you use.", body: "Gmail, Google Calendar, Slack and HubSpot." },
];
const UNTIL = { overlay: "yati_overlay_until", card: "yati_card_until" };
const SESSION = "yati_prompts_shown";
const DAY = 864e5;

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const shownSet = () => { try { return JSON.parse(sessionStorage.getItem(SESSION)) || []; } catch { return []; } };

export default function ScrollPopup({ source, blocked, model, onModelChange, onEvent, formEvents, onOpenSignup }) {
  const [stage, setStage] = useState(null);
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;
  const openRef = useRef(null);
  openRef.current = stage;

  useEffect(() => {
    const onScroll = () => {
      if (openRef.current || blockedRef.current || ["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      const pct = (window.scrollY / h) * 100;
      if (localStorage.getItem("yati_wl_joined")) return;
      const done = shownSet();
      const s = STAGES.find((x) => pct >= x.at && !done.includes(x.at) && Date.now() >= read(UNTIL[x.kind], 0));
      if (!s) return;
      sessionStorage.setItem(SESSION, JSON.stringify([...done, s.at]));
      setStage(s);
      onEvent("thread_popup_impression", { stage: s.at, kind: s.kind });
    };
    const safe = () => { try { onScroll(); } catch { /* storage blocked */ } };
    window.addEventListener("scroll", safe, { passive: true });
    return () => window.removeEventListener("scroll", safe);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function dismiss() {
    try { localStorage.setItem(UNTIL[stage.kind], String(Date.now() + 7 * DAY)); } catch { /* ignore */ }
    onEvent("thread_popup_dismiss", { stage: stage.at, kind: stage.kind });
    setStage(null);
  }
  useEffect(() => {
    if (!stage || stage.kind !== "card") return;
    const k = (e) => e.key === "Escape" && dismiss();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!stage) return null;
  if (stage.kind === "overlay") {
    return <WaitlistModal open onClose={dismiss} source={source} where="scroll_overlay" compact trackDismiss={false}
      model={model} onModelChange={onModelChange} cta="Get early access" {...formEvents}
      onCta={() => onEvent("thread_popup_cta_click", { stage: stage.at, kind: "overlay" })} title={stage.title} body={stage.body} />;
  }
  return (
    <div role="dialog" aria-label={stage.title} className="fixed inset-x-3 bottom-20 z-40 rounded-2xl border border-brand-gold/30 bg-brand-bg2 p-5 text-white shadow-2xl shadow-black/50 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[360px]">
      <button onClick={dismiss} aria-label="Close" className="absolute right-3 top-3 rounded p-1 text-white/60 hover:text-white"><X size={18} /></button>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">yAtI Flow</p>
      <h2 className="mt-2 pr-6 text-lg font-semibold tracking-tight">{stage.title}</h2>
      <p className="mb-4 mt-1 text-sm text-white/65">{stage.body}</p>
      <button className="btn-primary w-full justify-center !py-2.5" onClick={() => { onEvent("thread_popup_cta_click", { stage: stage.at, kind: "card" }); setStage(null); onOpenSignup("scroll_card_" + stage.at); }}>Get early access</button>
    </div>
  );
}
