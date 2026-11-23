import { useState } from "react";
import { getAttribution, track } from "../lib/tracking";
import { joinWaitlist } from "../lib/api";

const field = "w-full rounded-lg border border-white/15 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-brand-gold";

// Shared waitlist form. `source` tags each signup by campaign.
// Optional: askPhone (device select), model + onModelChange (model select), askConsent (marketing checkbox).
export default function WaitlistForm({ where, source, askPhone = false, model, onModelChange, askConsent = false, stacked = false, cta = "Join the waitlist", onStart, onSuccess }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // hidden; only bots fill it
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    try {
      await joinWaitlist({
        email, phone, model, marketing_consent: consent, company: honeypot, source,
        form_location: where, landing: window.location.pathname, ...getAttribution(),
      });
      setStatus("success");
      try { localStorage.setItem("yati_wl_joined", "1"); } catch { /* ignore */ }
      track("waitlist_join", { location: where, phone, model });
      onSuccess?.(where, model);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="rounded-xl border border-brand-teal/30 bg-brand-teal/10 p-4 text-white">
        You are on the list. We will email you when orders open.
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      onFocus={() => { if (!sessionStorage.getItem("yati_wl_started")) { sessionStorage.setItem("yati_wl_started", "1"); track("waitlist_start", { location: where }); onStart?.(where); } }}
      className="w-full max-w-lg"
    >
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className={stacked ? "flex flex-col gap-4" : "flex flex-col gap-3 sm:flex-row"}>
        <div className={stacked ? "" : "min-w-0 flex-1"}>
          <label className={stacked ? "mb-1.5 block text-sm" : "sr-only"} htmlFor={`email-${where}`}>Email address</label>
          <input id={`email-${where}`} type="email" required autoComplete="email" placeholder="you@company.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className={stacked ? field : "w-full rounded-full border border-white/15 bg-white/[0.06] px-5 py-3.5 text-white placeholder-white/35 outline-none focus:border-brand-purple"} />
        </div>
        {onModelChange && (
          <div>
            <label className="mb-1.5 block text-sm" htmlFor={`model-${where}`}>Which model interests you?</label>
            <select id={`model-${where}`} value={model} onChange={(e) => onModelChange(e.target.value)} className={field}>
              {["Not sure yet", "Thread Max", "Thread One", "Both"].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        )}
        {askPhone && (
          <div>
            <label className="mb-1.5 block text-sm" htmlFor={`phone-${where}`}>Your device <span className="text-white/45">(optional)</span></label>
            <select id={`phone-${where}`} value={phone} onChange={(e) => setPhone(e.target.value)} className={field}>
              <option value="">Prefer not to say</option>
              <option>iPhone</option><option>Mac</option><option value="Android">Android (planned)</option>
            </select>
          </div>
        )}
        {askConsent && (
          <label className="flex items-start gap-3 text-sm text-white/65">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[#C9A84C]" />
            <span>Email me product and launch updates (optional). See our <a href="/privacy-policy" className="underline">Privacy Policy</a>.</span>
          </label>
        )}
        <button type="submit" disabled={status === "loading"} className="btn-primary justify-center disabled:opacity-50">
          {status === "loading" ? "Joining…" : cta}
        </button>
      </div>
      {!askConsent && (
        <p className="mt-3 text-xs leading-5 text-white/65">
          We will email you about launch timing and availability. Unsubscribe anytime. See our <a href="/privacy-policy" className="underline">Privacy Policy</a>.
        </p>
      )}
      {status === "error" && <p role="alert" className="mt-3 text-sm text-brand-rose">We could not save that. Check your email address and try again.</p>}
    </form>
  );
}
