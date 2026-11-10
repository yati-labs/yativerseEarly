import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Inbox, RefreshCw, Sparkles, AlertCircle, CheckCircle, ExternalLink, ChevronDown, CalendarDays, Lock, Loader2,
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import { useAuth } from "../../lib/auth";
import { getEntitlements } from "../../lib/api";
import { getInboxAssistant, setInboxAssistant, getInboxToday, draftInboxReply } from "../../lib/foundersApi";

const SAMPLE = {
  summary: [
    "Priya Mehta (Acme Logistics) wants a demo next week and asked about pricing for 20 seats.",
    "Rahul Verma needs the signed NDA back by Friday before the pilot can start.",
    "Stripe: a payment failed because the card expired.",
  ],
  counts: { emails: 23, needs_reply: 3, from_contacts: 2, meetings: 2 },
  meetings: [{ title: "Demo with Northwind", start: new Date().toISOString(), attendees: [] }],
  needs_reply: [
    { id: "s1", thread_id: "s1", from: "Priya Mehta <priya@acme.example>", subject: "Re: Cutting dispatch time at Acme",
      why: "Wants a demo next week and pricing for 20 seats.", is_contact: true, urgent: false, received_at: new Date().toISOString() },
    { id: "s2", thread_id: "s2", from: "Rahul Verma <rahul@pilot.example>", subject: "NDA for the pilot",
      why: "Needs the signed NDA back by Friday.", is_contact: false, urgent: true, received_at: new Date().toISOString() },
  ],
  fyi: [{ id: "s3", from: "Substack <news@substack.example>", subject: "Your weekly digest" }],
};

function senderName(from) {
  const name = (from || "").split("<")[0].trim().replace(/^"|"$/g, "");
  return name || from || "Unknown";
}

function initials(name) {
  return (name || "?").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function timeLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  return d.toDateString() === today.toDateString()
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * The inbox assistant: the last 24 hours of the user's Gmail, sorted and summarised by
 * the AI. Only runs when opened or refreshed. Replies it drafts wait in Drafts.
 */
export default function InboxPage() {
  const { demo, logout } = useAuth();
  const [entitlements, setEntitlements] = useState(null);
  const [state, setState] = useState({ loading: true });   // { loading } | { off } | { error } | { data }
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (demo) { setEntitlements({ planName: "Founder", status: "trial" }); return; }
    getEntitlements().then(setEntitlements).catch(() => setEntitlements(null));
  }, [demo]);

  const load = useCallback(async (refresh = false) => {
    if (demo) { setState({ data: SAMPLE }); return; }
    try {
      const { enabled } = await getInboxAssistant();
      if (!enabled) { setState({ off: true }); return; }
      setState((s) => (s.data ? s : { loading: true }));
      setState({ data: await getInboxToday(refresh) });
    } catch (err) {
      if (err.status === 403) setState({ off: true });
      else setState({ error: err.message || "Couldn't read your inbox", needsGmail: /connect gmail/i.test(err.message || "") });
    }
  }, [demo]);

  useEffect(() => { load(); }, [load]);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }

  async function refresh() {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }

  async function turnOn() {
    try {
      await setInboxAssistant(true);
      setState({ loading: true });
      await load();
    } catch (err) {
      showToast(err.message || "Couldn't turn it on", "error");
    }
  }

  const data = state.data;

  return (
    <div className="flex min-h-screen bg-brand-bg font-body text-white">
      <Sidebar onLogout={logout} planLabel={entitlements?.planName} planStatus={entitlements?.status} />

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Inbox</h1>
              <p className="mt-1 text-sm text-white/40">
                The last 24 hours of your Gmail, sorted by your assistant{demo && " · sample data"}
              </p>
            </div>
            {data && !demo && (
              <button
                onClick={refresh}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:text-white disabled:opacity-50"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Reading…" : "Refresh"}
              </button>
            )}
          </div>

          {state.loading && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Loader2 size={13} className="animate-spin" /> Reading today's emails…
              </div>
              <div className="h-48 animate-pulse rounded-2xl bg-white/[0.03]" />
              <div className="h-24 animate-pulse rounded-2xl bg-white/[0.03]" />
            </div>
          )}

          {state.off && <TurnOnCard onTurnOn={turnOn} />}

          {state.error && (
            <div className="flex items-start gap-3 rounded-2xl border border-brand-gold/20 bg-brand-gold/5 px-5 py-4 text-sm text-brand-gold2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p>{state.error}</p>
                {state.needsGmail && (
                  <Link to="/dashboard/settings" className="mt-2 inline-block text-xs font-semibold underline">
                    Connect Gmail in Settings
                  </Link>
                )}
              </div>
            </div>
          )}

          {data && (
            <>
              <SummaryCard data={data} />

              <SectionTitle dot="bg-brand-rose">Needs your reply · {data.needs_reply.length}</SectionTitle>
              {data.needs_reply.length === 0 ? (
                <p className="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-6 text-center text-sm text-white/35">
                  Nothing waiting on you. Nice.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {data.needs_reply.map((e) => (
                    <EmailRow key={e.id} email={e} demo={demo} onDrafted={showToast} />
                  ))}
                </div>
              )}

              <FyiList items={data.fyi} />

              <p className="mt-8 rounded-r-xl border-l-2 border-brand-gold/60 bg-brand-gold/5 px-4 py-3 text-xs leading-relaxed text-white/50">
                Your assistant reads subjects and previews only when you open this page or press Refresh.
                Nothing runs in the background and emails aren't stored. "Draft a reply" never sends:
                the reply waits in Drafts until you approve it.
              </p>
            </>
          )}
        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] flex max-w-sm items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
          toast.type === "success"
            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
            : "border-brand-rose/25 bg-brand-rose/10 text-brand-rose"
        }`}>
          {toast.type === "success" ? <CheckCircle size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children, dot }) {
  return (
    <div className="mb-2 mt-7 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {children}
    </div>
  );
}

function SummaryCard({ data }) {
  const stats = [
    { value: data.counts.emails, label: "emails, last 24h" },
    { value: data.counts.needs_reply, label: "need your reply", color: "text-brand-rose" },
    { value: data.counts.from_contacts, label: "from your contacts", color: "text-emerald-300" },
    { value: data.counts.meetings, label: "meetings next 24h" },
  ];
  return (
    <div className="rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold/10 via-brand-purple/5 to-transparent p-5">
      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-brand-gold2">
        <Sparkles size={12} /> Summary · written by your assistant
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-black/25 px-3 py-2.5">
            <p className={`font-display text-xl font-bold ${s.color || "text-white"}`}>{s.value}</p>
            <p className="text-[11px] text-white/45">{s.label}</p>
          </div>
        ))}
      </div>
      {data.summary.length > 0 ? (
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-white/75">
          {data.summary.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-white/40">No new email in the last 24 hours.</p>
      )}
      {data.meetings?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {data.meetings.map((m, i) => (
            <span key={i} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/60">
              <CalendarDays size={12} />
              {m.start && !/^\d{4}-\d{2}-\d{2}$/.test(m.start) && `${timeLabel(m.start)} · `}{m.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EmailRow({ email, demo, onDrafted }) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [drafted, setDrafted] = useState(null);
  const name = senderName(email.from);

  async function draft() {
    if (demo) { onDrafted("Sign in to draft replies", "error"); return; }
    setBusy(true);
    try {
      const res = await draftInboxReply(email.thread_id, instruction.trim());
      setDrafted(res);
      setOpen(false);
      onDrafted(`Reply to ${res.to_name || res.to} saved in Drafts`);
    } catch (err) {
      onDrafted(err.message || "Couldn't draft a reply", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
        email.is_contact ? "bg-teal-400/15 text-teal-300" : "bg-white/[0.06] text-white/60"
      }`}>
        {initials(name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-semibold">{name}</span>
          {email.is_contact && <span className="shrink-0 rounded-full bg-teal-400/15 px-2 py-0.5 text-[10px] font-semibold text-teal-300">Contact</span>}
          {email.urgent && <span className="shrink-0 rounded-full bg-brand-rose/15 px-2 py-0.5 text-[10px] font-semibold text-brand-rose">Urgent</span>}
          <span className="ml-auto shrink-0 text-[11px] text-white/30">{timeLabel(email.received_at)}</span>
        </div>
        <p className="truncate text-sm text-white/65">{email.subject}</p>
        {email.why && <p className="mt-1 text-xs text-white/45">{email.why}</p>}

        {drafted ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-emerald-300">
            <CheckCircle size={13} /> Reply drafted.
            <Link to={`/dashboard/drafts?draft=${drafted.draft_id}`} className="font-semibold underline">
              Review and approve in Drafts
            </Link>
          </div>
        ) : open ? (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !busy) draft(); }}
              placeholder="Optional: what should the reply say? e.g. 'offer Tuesday or Wednesday'"
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
            />
            <button
              onClick={draft}
              disabled={busy}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {busy ? "Writing…" : "Write draft"}
            </button>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-pink px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Sparkles size={12} /> Draft a reply
            </button>
            {email.gmail_url && (
              <a
                href={email.gmail_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/55 transition hover:text-white"
              >
                <ExternalLink size={12} /> Open in Gmail
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FyiList({ items }) {
  const [open, setOpen] = useState(false);
  if (!items?.length) return null;
  return (
    <>
      <SectionTitle>FYI · read later</SectionTitle>
      <div className="rounded-2xl border border-dashed border-white/10">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-white/50"
        >
          <span className="truncate">
            {items.length} newsletter{items.length === 1 ? "" : "s"}, receipts and notifications
            {" "}({[...new Set(items.slice(0, 4).map((i) => senderName(i.from)))].join(", ")}{items.length > 4 ? "…" : ""})
          </span>
          <ChevronDown size={15} className={`shrink-0 transition ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="border-t border-white/5">
            {items.map((e) => (
              <div key={e.id} className="flex items-center gap-3 border-b border-white/5 px-4 py-2.5 text-xs last:border-b-0">
                <span className="w-36 shrink-0 truncate text-white/55">{senderName(e.from)}</span>
                <span className="min-w-0 flex-1 truncate text-white/40">{e.subject}</span>
                {e.gmail_url && (
                  <a href={e.gmail_url} target="_blank" rel="noreferrer" className="shrink-0 text-white/30 hover:text-white" aria-label="Open in Gmail">
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function TurnOnCard({ onTurnOn }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="rounded-2xl border border-brand-purple/30 bg-brand-purple/5 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/20 text-violet-200">
          <Inbox size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold">Turn on the inbox assistant</h2>
          <p className="mt-1 text-sm text-white/50">
            Your assistant can summarise your day's email, spot what needs a reply, and draft replies for
            you to approve. It needs your permission to read your whole Gmail inbox.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-white/55">
            <li className="flex gap-2"><span className="text-emerald-300">✓</span>Reads subject and preview to summarise; opens a full email only to draft a reply</li>
            <li className="flex gap-2"><span className="text-emerald-300">✓</span>Writes drafts that wait for your approval</li>
            <li className="flex gap-2"><span className="text-brand-rose">✕</span>Never sends, forwards or deletes on its own</li>
            <li className="flex gap-2"><span className="text-brand-rose">✕</span>Emails aren't stored; only replies from people you emailed are kept (first 500 characters)</li>
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={async () => { setBusy(true); await onTurnOn(); setBusy(false); }}
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Turning on…" : "Turn on inbox assistant"}
            </button>
            <Link to="/dashboard/settings" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70">
              <Lock size={12} /> You can turn it off any time in Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
