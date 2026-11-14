import { useState } from "react";
import { getAttribution, track } from "../lib/tracking";

// Shared waitlist form for the campaign pages. `source` tags each submission by campaign.
const FORMSPREE = "https://formspree.io/f/mqeoyedd"; // same endpoint as /waitlist

export default function WaitlistForm({ where, source }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(FORMSPREE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, phone, source, form_location: where, ...getAttribution() }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("success");
      track("waitlist_join", { location: where, phone });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="rounded-xl border border-brand-teal/30 bg-brand-teal/10 p-4 text-white">
        You are on the list. We will email you when pendant orders open.
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      onFocus={() => { if (!sessionStorage.getItem("yati_wl_started")) { sessionStorage.setItem("yati_wl_started", "1"); track("waitlist_start", { location: where }); } }}
      className="w-full max-w-lg"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor={`email-${where}`}>Email</label>
        <input
          id={`email-${where}`} type="email" required autoComplete="email" placeholder="you@company.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3.5 text-white placeholder-white/35 outline-none focus:border-brand-purple"
        />
        <button type="submit" disabled={status === "loading"} className="btn-primary justify-center disabled:opacity-50">
          {status === "loading" ? "Joining…" : "Join the waitlist"}
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm text-white/55">
        <label htmlFor={`phone-${where}`}>My phone is</label>
        <select id={`phone-${where}`} value={phone} onChange={(e) => setPhone(e.target.value)}
          className="rounded-md border border-white/15 bg-brand-bg px-2 py-1 text-white/80">
          <option value="">Select (optional)</option>
          <option>iPhone</option>
          <option>Android</option>
        </select>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-3 text-sm text-brand-rose">We could not save that. Check your email address and try again.</p>
      )}
    </form>
  );
}

