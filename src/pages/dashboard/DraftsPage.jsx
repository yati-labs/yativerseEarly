import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Mail, CheckCircle, XCircle, AlertCircle, RefreshCw, Pencil, Sparkles, X, Plus, Reply, Eye, Loader2,
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import { REAUTHED_EVENT } from "../../components/SessionExpiredDialog";
import { useAuth } from "../../lib/auth";
import { getEntitlements } from "../../lib/api";
import {
  listApprovals, getApproval, editApproval, rewriteApproval, approveApproval,
  rejectApproval, createDraft, generateForContact, listContacts, unlockContactEmail, addContact,
  checkReplies, listSentEmails, getConversation,
} from "../../lib/foundersApi";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const SAMPLE_APPROVALS = [
  {
    id: "1",
    contact_name: "Iqbal Khan",
    company: "Priority Logistics",
    subject: "CEO and COO at the same time",
    body: "Hi Iqbal,\n\nMost logistics founders I talk to hit the same wall around 20 people — the CEO job and the COO job stop fitting in one calendar. Hiring for one means the other slips.\n\nWe built yAtI specifically for that moment. It handles the founder OS layer — pipeline health, outreach, deal coaching — so you're not personally running every thread.\n\nWorth a 15-minute call to see if it fits where Priority Logistics is right now?",
  },
  {
    id: "2",
    contact_name: "Sarah Chen",
    company: "FleetTrack Pro",
    subject: "Scaling ops at FleetTrack",
    body: "Hi Sarah,\n\nVP Ops at a fleet software company is a tough seat — you're accountable for uptime and customer outcomes while the sales team keeps adding new accounts.\n\nWe help ops leaders at companies like FleetTrack stay on top of the full pipeline without the manual overhead — automated outreach, deal health signals, and a single dashboard to action everything.\n\nOpen to a quick call this week if the timing works?",
  },
];

const POLL_INTERVAL = 30_000;
const NO_REWRITE = { open: false, instruction: "", busy: false, suggestion: null, error: null };

// The API identifies drafts by draft_id and names the contact context_name.
function normalizeApproval(a) {
  return { ...a, id: a.draft_id ?? a.id, contact_name: a.context_name ?? a.contact_name };
}

function initials(name) {
  return (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const FIELD = "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/25";
const LABEL = "mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wider text-white/35";

export default function DraftsPage() {
  const { demo, logout } = useAuth();
  const [approvals, setApprovals]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [usingSamples, setUsingSamples] = useState(false);
  const [entitlements, setEntitlements] = useState(null);
  const [toast, setToast]               = useState(null);
  const [composeOpen, setComposeOpen]   = useState(false);
  const [tab, setTab]                   = useState("pending"); // "pending" | "sent"
  const [sent, setSent]                 = useState(null);      // null = not loaded
  const [checking, setChecking]         = useState(false);
  const [checkedAt, setCheckedAt]       = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail]         = useState(null); // { loading } | { error } | { data }
  const [subject, setSubject]       = useState("");
  const [editing, setEditing]       = useState(false);
  const [editBody, setEditBody]     = useState("");
  const [rewrite, setRewrite]       = useState(NO_REWRITE);
  const [original, setOriginal]     = useState(null); // subject + body as first loaded, for "Restore original"
  const [busy, setBusy]             = useState(null); // "save" | "approve" | "reject"

  const loadedOnce = useRef(false);
  const latestSelection = useRef(null);
  const offline = demo || usingSamples;

  const load = useCallback(async () => {
    if (demo) { setApprovals(SAMPLE_APPROVALS); setLoading(false); return; }
    try {
      const data = await listApprovals();
      setApprovals((Array.isArray(data) ? data : data.approvals ?? []).map(normalizeApproval));
      loadedOnce.current = true;
      setUsingSamples(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      // Only fall back to samples if we never got a real list.
      if (!loadedOnce.current) { setApprovals(SAMPLE_APPROVALS); setUsingSamples(true); }
    } finally {
      setLoading(false);
    }
  }, [demo]);

  useEffect(() => {
    load();
    if (demo) return;
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [load, demo]);

  // After the session-expired dialog signs the user back in, refresh in place.
  useEffect(() => {
    function onReauthed(e) { e.preventDefault(); load(); }
    window.addEventListener(REAUTHED_EVENT, onReauthed);
    return () => window.removeEventListener(REAUTHED_EVENT, onReauthed);
  }, [load]);

  useEffect(() => {
    if (demo) { setEntitlements({ planName: "Founder", status: "trial" }); return; }
    getEntitlements().then(setEntitlements).catch(() => setEntitlements(null));
  }, [demo]);

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }

  const loadSent = useCallback(async () => {
    if (demo) { setSent([]); return; }
    try {
      setSent((await listSentEmails()).sent ?? []);
    } catch {
      setSent((prev) => prev ?? []);
    }
  }, [demo]);

  /** Looks in Gmail for replies. `auto` (opening the page) is quiet and at most every 5 minutes. */
  const runCheck = useCallback(async (auto) => {
    if (demo) return;
    if (!auto) setChecking(true);
    try {
      const res = await checkReplies(auto);
      if (res.checked_at) setCheckedAt(res.checked_at);
      if (res.checked) await loadSent();
      const n = res.new?.length ?? 0;
      if (n) showToast(`${n} new repl${n === 1 ? "y" : "ies"} · ${res.new.map((r) => r.contact_name || r.from_email).join(", ")}`, "success");
      else if (!auto) showToast("No new replies", "success");
    } catch (err) {
      if (!auto) showToast(err.message || "Couldn't check for replies", "error");
    } finally {
      if (!auto) setChecking(false);
    }
  }, [demo, loadSent]);

  useEffect(() => {
    loadSent();
    runCheck(true);
  }, [loadSent, runCheck]);

  /** Blocks actions that need the real API while showing sample data. */
  function requireLive(what) {
    if (!offline) return true;
    showToast(demo ? `Sign in to ${what}` : "Can't reach the server right now", "error");
    return false;
  }

  function clearSelection() {
    latestSelection.current = null;
    setSelectedId(null);
    setDetail(null);
    setEditing(false);
    setRewrite(NO_REWRITE);
  }

  async function selectDraft(id) {
    latestSelection.current = id;
    setSelectedId(id);
    setEditing(false);
    setRewrite(NO_REWRITE);

    if (offline) {
      const sample = approvals.find((a) => a.id === id);
      setDetail({ data: { draft_id: id, subject: sample?.subject, body: sample?.body, version: 1, contact_email: null } });
      setSubject(sample?.subject ?? "");
      setOriginal({ subject: sample?.subject ?? "", body: sample?.body ?? "" });
      return;
    }
    setDetail({ loading: true });
    setOriginal(null);
    try {
      const full = await getApproval(id);
      if (latestSelection.current !== id) return;
      setDetail({ data: full });
      setSubject(full.subject ?? "");
      setOriginal({ subject: full.subject ?? "", body: full.body ?? "" });
    } catch (err) {
      if (latestSelection.current === id) setDetail({ error: err.message || "Couldn't load this draft" });
    }
  }

  /** Saves the subject and body in place; the draft keeps its id and gets a new version. */
  async function saveDraft(body) {
    const res = await editApproval(selectedId, {
      newBody: body,
      newSubject: subject,
      version: detail.data.version,
    });
    setDetail({ data: { ...detail.data, subject, body, version: res.version } });
    setApprovals((prev) => prev.map((a) => (a.id === selectedId ? { ...a, subject } : a)));
  }

  function startEdit() {
    if (!requireLive("edit drafts")) return;
    setEditBody(detail.data.body ?? "");
    setEditing(true);
  }

  /** Puts the text from when this draft was opened back into the editor (not saved until you save). */
  function restoreOriginal() {
    setEditBody(original.body);
    setSubject(original.subject);
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!editBody.trim()) { showToast("The email body can't be empty", "error"); return; }
    setBusy("save");
    try {
      await saveDraft(editBody);
      setEditing(false);
      showToast("Changes saved", "success");
    } catch (err) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setBusy(null);
    }
  }

  function toggleRewrite() {
    if (!rewrite.open && !requireLive("use AI rewrite")) return;
    setRewrite((r) => ({ ...r, open: !r.open }));
  }

  async function handleRewrite() {
    setRewrite((r) => ({ ...r, busy: true, error: null, suggestion: null }));
    try {
      const res = await rewriteApproval(selectedId, rewrite.instruction.trim());
      setRewrite((r) => ({ ...r, busy: false, suggestion: res.suggested_body }));
    } catch (err) {
      setRewrite((r) => ({ ...r, busy: false, error: err.message || "Rewrite failed" }));
    }
  }

  function applySuggestion() {
    setEditBody(rewrite.suggestion);
    setEditing(true);
    setRewrite(NO_REWRITE);
  }

  async function handleApprove() {
    if (!requireLive("approve drafts")) return;
    const d = detail.data;
    setBusy("approve");
    try {
      if (!d.contact_email) {
        const ok = window.confirm(
          "This contact has no email address.\n\nTry to unlock it via Apollo and then send?"
        );
        if (!ok) return;
        const unlocked = await unlockContactEmail(d.object_id);
        if (!unlocked.unlocked) {
          showToast(unlocked.message || "Email not available via Apollo. Add it in the Contacts tab.", "error");
          return;
        }
      }
      // A different subject was picked, so save it before approving.
      const id = selectedId;
      if (subject && subject !== d.subject) await saveDraft(d.body);

      const res = await approveApproval(id);
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      clearSelection();
      if (res.sent) showToast(`Approved and sent to ${res.sent_to}`, "success");
      else showToast(`Approved, but not sent: ${res.send_error || "unknown reason"}`, "error");
    } catch (err) {
      showToast(err.message || "Failed to approve", "error");
    } finally {
      setBusy(null);
    }
  }

  async function handleReject() {
    if (!requireLive("reject drafts")) return;
    setBusy("reject");
    try {
      await rejectApproval(selectedId);
      setApprovals((prev) => prev.filter((a) => a.id !== selectedId));
      clearSelection();
      showToast("Draft rejected", "success");
    } catch (err) {
      showToast(err.message || "Failed to reject", "error");
    } finally {
      setBusy(null);
    }
  }

  async function handleComposeSaved(draftId) {
    setComposeOpen(false);
    await load();
    selectDraft(draftId);
    showToast("Draft saved", "success");
  }

  // Opened from a link such as /dashboard/drafts?draft=42 (e.g. a reply drafted in Inbox).
  useEffect(() => {
    const wanted = Number(searchParams.get("draft"));
    if (!wanted || loading) return;
    setTab("pending");
    selectDraft(wanted);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading]);

  const unreadReplies = (sent ?? []).reduce((n, e) => n + (e.unread_replies || 0), 0);
  const selected = approvals.find((a) => a.id === selectedId);
  const d = detail?.data;
  const subjectOptions = d ? [...new Set([...(d.subject_line_options ?? []), d.subject].filter(Boolean))] : [];
  const canRestore = !!original && !!d && (
    editing ? editBody !== original.body || subject !== original.subject
            : d.body !== original.body || d.subject !== original.subject
  );

  return (
    <div className="flex min-h-screen bg-brand-bg font-body text-white">
      <Sidebar onLogout={logout} planLabel={entitlements?.planName} planStatus={entitlements?.status} />

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Drafts</h1>
            <p className="mt-1 text-sm text-white/40">
              {loading ? "Loading…" : `${approvals.length} pending approval${approvals.length !== 1 ? "s" : ""}`}
              {demo && " · sample data"}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!demo && (
              <button
                onClick={() => runCheck(false)}
                disabled={checking}
                title={checkedAt ? `Last checked ${new Date(checkedAt).toLocaleString()}` : "Look in Gmail for replies to emails you sent"}
                className="flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-50"
              >
                {checking ? <Loader2 size={13} className="animate-spin" /> : <Reply size={13} />}
                {checking ? "Checking…" : "Check for replies"}
              </button>
            )}
            <button
              onClick={() => { if (requireLive("compose emails")) setComposeOpen(true); }}
              className="flex items-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-300 transition hover:bg-sky-400/20"
            >
              <Plus size={13} />
              Compose
            </button>
            {!demo && (
              <button
                onClick={load}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:text-white"
              >
                <RefreshCw size={13} />
                Refresh
              </button>
            )}
          </div>
        </div>

        <div className="mb-5 flex gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-1 text-xs font-semibold sm:inline-flex">
          {[["pending", `Pending · ${approvals.length}`], ["sent", "Sent"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 transition sm:flex-none ${
                tab === key ? "bg-white/10 text-white" : "text-white/45 hover:text-white/75"
              }`}
            >
              {label}
              {key === "sent" && unreadReplies > 0 && (
                <span className="rounded-full bg-brand-rose px-1.5 text-[10.5px] leading-[1.15rem] text-white">{unreadReplies}</span>
              )}
            </button>
          ))}
        </div>

        {tab === "sent" ? (
          <SentView sent={sent} demo={demo} onOpened={loadSent} />
        ) : (<>
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-3 text-sm text-brand-gold2">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {usingSamples
              ? "Couldn't reach founder-agents-api — showing sample drafts."
              : `Couldn't refresh drafts: ${error}`}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        ) : approvals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-16 text-center">
            <Mail size={28} className="text-white/20" />
            <p className="text-sm text-white/30">No pending drafts — all caught up.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
            {/* List */}
            <div className="flex flex-col gap-2">
              {approvals.map((a) => (
                <button
                  key={a.id}
                  onClick={() => selectDraft(a.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    a.id === selectedId
                      ? "border-white/20 bg-white/[0.07]"
                      : "border-white/5 bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                >
                  <p className="truncate text-sm font-semibold text-white">{a.contact_name || "Unknown contact"}</p>
                  <p className="mt-0.5 truncate text-xs text-white/50">{a.subject || "No subject"}</p>
                  <div className="mt-2 flex items-center gap-2 text-[10.5px] text-white/30">
                    {a.company && <span>{a.company}</span>}
                    {a.agent && <span className="rounded bg-white/5 px-1.5 py-0.5">{a.agent}</span>}
                    {a.created_at && (
                      <span className="ml-auto">
                        {new Date(a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Detail */}
            <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              {!detail ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                  <Mail size={26} className="text-white/20" />
                  <p className="text-sm text-white/30">Select a draft to review</p>
                </div>
              ) : detail.loading ? (
                <div className="h-64 animate-pulse rounded-xl bg-white/[0.03]" />
              ) : detail.error ? (
                <div className="flex items-start gap-2 text-sm text-brand-rose">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  {detail.error}
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="font-semibold text-white">{selected?.contact_name || "Draft"}</p>
                    <p className="mt-0.5 text-xs text-white/40">
                      {d.contact_email ? `To: ${d.contact_email}` : "To: no email on file"}
                      {selected?.agent && ` · ${selected.agent} agent`}
                      {` · v${d.version ?? 1}`}
                    </p>
                    {d.is_thread_reply && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300">
                        <Reply size={12} /> Sent as a reply in the same Gmail thread
                      </p>
                    )}
                  </div>

                  {!d.contact_email && !offline && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-3 text-xs text-brand-gold2">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      This contact has no email address. Approving will try to unlock it through Apollo first.
                    </div>
                  )}

                  {/* Subject */}
                  <label className={LABEL}>Subject</label>
                  {editing ? (
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`${FIELD} mb-4`}
                    />
                  ) : (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {subjectOptions.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSubject(s)}
                          className={`rounded-lg border px-3 py-1.5 text-left text-xs transition ${
                            s === subject
                              ? "border-sky-400/40 bg-sky-400/10 text-sky-200"
                              : "border-white/10 text-white/50 hover:text-white/80"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Body */}
                  <label className={LABEL}>Email body</label>
                  {editing ? (
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={14}
                      className={`${FIELD} resize-y leading-relaxed`}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap rounded-xl border border-white/5 bg-black/20 p-4 font-body text-sm leading-relaxed text-white/70">
                      {d.body}
                    </pre>
                  )}

                  {/* AI rewrite */}
                  {rewrite.open && !editing && (
                    <div className="mt-4 rounded-xl border border-violet-400/20 bg-violet-400/5 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          value={rewrite.instruction}
                          onChange={(e) => setRewrite((r) => ({ ...r, instruction: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter" && !rewrite.busy) handleRewrite(); }}
                          placeholder="Optional: 'make it shorter', 'more casual', 'focus on ROI'…"
                          className={FIELD}
                        />
                        <button
                          onClick={handleRewrite}
                          disabled={rewrite.busy}
                          className="shrink-0 rounded-xl border border-violet-400/30 bg-violet-400/15 px-4 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-400/25 disabled:opacity-40"
                        >
                          {rewrite.busy ? "Writing…" : "Generate"}
                        </button>
                      </div>
                      {rewrite.error && (
                        <p className="mt-3 text-xs text-brand-rose">{rewrite.error}</p>
                      )}
                      {rewrite.suggestion && (
                        <>
                          <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-white/5 bg-black/20 p-4 font-body text-sm leading-relaxed text-white/70">
                            {rewrite.suggestion}
                          </pre>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={applySuggestion}
                              className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20"
                            >
                              Use this
                            </button>
                            <button
                              onClick={() => setRewrite((r) => ({ ...r, suggestion: null }))}
                              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/40 transition hover:text-white/70"
                            >
                              Discard
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {editing ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          disabled={!!busy}
                          className="flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <CheckCircle size={13} />
                          {busy === "save" ? "Saving…" : "Save changes"}
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          disabled={!!busy}
                          className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/40 transition hover:text-white/70 disabled:opacity-40"
                        >
                          Cancel
                        </button>
                        {canRestore && (
                          <button
                            onClick={restoreOriginal}
                            disabled={!!busy}
                            className="text-xs text-white/35 underline transition hover:text-white/70 disabled:opacity-40"
                          >
                            Restore original
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleApprove}
                          disabled={!!busy}
                          className="flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <CheckCircle size={13} />
                          {busy === "approve" ? "Sending…" : "Approve & Send"}
                        </button>
                        <button
                          onClick={startEdit}
                          disabled={!!busy}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 transition hover:text-white disabled:opacity-40"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          onClick={toggleRewrite}
                          disabled={!!busy}
                          className="flex items-center gap-1.5 rounded-lg border border-violet-400/25 bg-violet-400/10 px-4 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-400/20 disabled:opacity-40"
                        >
                          <Sparkles size={13} />
                          Rewrite with AI
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={!!busy}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/40 transition hover:border-white/20 hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <XCircle size={13} />
                          {busy === "reject" ? "Rejecting…" : "Reject"}
                        </button>
                        {canRestore && (
                          <button
                            onClick={restoreOriginal}
                            disabled={!!busy}
                            className="text-xs text-white/35 underline transition hover:text-white/70 disabled:opacity-40"
                          >
                            Restore original
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        </>)}
      </main>

      {composeOpen && (
        <ComposeModal onClose={() => setComposeOpen(false)} onSaved={handleComposeSaved} />
      )}

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

function sentBadge(e) {
  if (e.replies > 0) return { label: e.unread_replies ? "● New reply" : "Replied", cls: "bg-emerald-400/15 text-emerald-300" };
  if (e.auto_reply) return { label: "Out of office", cls: "bg-white/5 text-white/40" };
  if (e.opens > 0) return { label: `Opened ${e.opens}×`, cls: "bg-sky-400/10 text-sky-300" };
  return { label: "Not opened", cls: "bg-white/5 text-white/40" };
}

/** Emails sent in the last 30 days and what happened after; opening one shows the conversation. */
function SentView({ sent, demo, onOpened }) {
  const [selected, setSelected] = useState(null);  // draft_id
  const [conv, setConv] = useState(null);          // { loading } | { error } | { data }

  async function open(e) {
    setSelected(e.draft_id);
    if (!e.contact_id) { setConv({ error: "This email has no contact." }); return; }
    setConv({ loading: true });
    try {
      setConv({ data: await getConversation(e.contact_id) });
      if (e.unread_replies) onOpened();
    } catch (err) {
      setConv({ error: err.message || "Couldn't load the conversation" });
    }
  }

  if (sent === null) {
    return <div className="h-40 animate-pulse rounded-2xl bg-white/[0.03]" />;
  }
  if (sent.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-16 text-center">
        <Mail size={28} className="text-white/20" />
        <p className="text-sm text-white/30">
          {demo ? "Sign in to see emails you've sent." : "Nothing sent in the last 30 days."}
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-2">
        {sent.map((e) => {
          const badge = sentBadge(e);
          return (
            <button
              key={e.draft_id}
              onClick={() => open(e)}
              className={`rounded-2xl border p-4 text-left transition ${
                e.draft_id === selected ? "border-white/20 bg-white/[0.07]" : "border-white/5 bg-white/[0.03] hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{e.contact_name || e.contact_email || "Unknown contact"}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${badge.cls}`}>{badge.label}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-white/50">{e.subject || "No subject"}</p>
              <p className="mt-2 text-[10.5px] text-white/30">
                Sent {e.sent_at ? new Date(e.sent_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
                {!e.via_gmail && " · via SMTP, replies not tracked"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        {!conv ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <Reply size={26} className="text-white/20" />
            <p className="text-sm text-white/30">Select an email to see the conversation</p>
          </div>
        ) : conv.loading ? (
          <div className="h-64 animate-pulse rounded-xl bg-white/[0.03]" />
        ) : conv.error ? (
          <div className="flex items-start gap-2 text-sm text-brand-rose">
            <AlertCircle size={15} className="mt-0.5 shrink-0" /> {conv.error}
          </div>
        ) : (
          <>
            <p className="font-semibold text-white">Conversation with {conv.data.contact.name || conv.data.contact.email}</p>
            <p className="mt-0.5 text-xs text-white/40">{conv.data.contact.email}</p>
            <div className="mt-4 flex flex-col gap-3">
              {conv.data.messages.map((m) => (
                <div
                  key={`${m.direction}-${m.id}`}
                  className={`rounded-xl border p-3.5 text-sm ${
                    m.direction === "outbound"
                      ? "mr-8 border-white/10 bg-white/[0.04]"
                      : m.is_auto_reply
                        ? "ml-8 border-white/5 bg-white/[0.02] text-white/45"
                        : "ml-8 border-emerald-400/30 bg-emerald-400/[0.07]"
                  }`}
                >
                  <p className="mb-1 flex flex-wrap items-center gap-x-2 text-[11px] text-white/40">
                    <span>{m.direction === "outbound" ? "You" : (m.from_email || "Them")}</span>
                    {m.timestamp && <span>· {new Date(m.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>}
                    {m.direction === "outbound" && m.opens > 0 && <span className="flex items-center gap-1">· <Eye size={11} /> opened {m.opens}×</span>}
                    {m.is_auto_reply && <span>· automatic reply</span>}
                  </p>
                  {m.subject && <p className="mb-1 text-xs font-semibold text-white/60">{m.subject}</p>}
                  <p className="whitespace-pre-wrap leading-relaxed text-white/75">{m.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-white/30">Replies show their first 500 characters. Open Gmail for the full email.</p>
          </>
        )}
      </div>
    </div>
  );
}

/** Write a new email: pick a contact, then type it or have the AI write it. */
function ComposeModal({ onClose, onSaved }) {
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState(null); // null = no search yet
  const [contact, setContact]       = useState(null);
  const [subject, setSubject]       = useState("");
  const [body, setBody]             = useState("");
  const [instruction, setInstruction] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [status, setStatus]         = useState(null); // { message, type }
  const [adding, setAdding]         = useState(false);

  // A typed address that isn't one of the matches can be added as a new contact.
  const typedEmail = query.trim().toLowerCase();
  const canAddTyped = EMAIL_RE.test(typedEmail)
    && !(results ?? []).some((c) => (c.email || "").toLowerCase() === typedEmail);

  async function addTyped() {
    setAdding(true);
    setStatus(null);
    try {
      pickContact(await addContact(typedEmail));
    } catch (err) {
      setStatus({ message: err.message || "Couldn't add that address", type: "error" });
    } finally {
      setAdding(false);
    }
  }

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const q = query.trim();
    if (contact || q.length < 2) { setResults(null); return undefined; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const data = await listContacts({ limit: 20, search: q });
        const list = Array.isArray(data) ? data : data.contacts ?? [];
        if (!cancelled) setResults(list.filter((c) => c.email));
      } catch (err) {
        if (!cancelled) setStatus({ message: err.message, type: "error" });
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, contact]);

  function pickContact(c) {
    setContact(c);
    setQuery("");
    setResults(null);
    setStatus(null);
  }

  async function handleGenerate() {
    if (!contact) { setStatus({ message: "Select a recipient first.", type: "error" }); return; }
    setGenerating(true);
    setStatus(null);
    try {
      const res = await generateForContact(contact.id, instruction.trim());
      setSubject(res.subject || "");
      setBody(res.body || "");
      setStatus({ message: "Email generated. Review it, then save.", type: "success" });
    } catch (err) {
      setStatus({ message: err.message || "Generation failed", type: "error" });
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!contact) { setStatus({ message: "Select a recipient first.", type: "error" }); return; }
    if (!subject.trim() || !body.trim()) {
      setStatus({ message: "Subject and body are required.", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await createDraft({ contactId: contact.id, subject: subject.trim(), body: body.trim() });
      onSaved(res.draft_id);
    } catch (err) {
      setStatus({ message: err.message || "Failed to save draft", type: "error" });
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-title"
        className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-brand-bg shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
          <Mail size={16} className="text-white/50" />
          <h2 id="compose-title" className="flex-1 text-sm font-semibold">Compose email</h2>
          <button onClick={onClose} aria-label="Close" className="text-white/30 transition hover:text-white/70">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          {/* To */}
          <div>
            <label className={LABEL}>To</label>
            {contact ? (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-[11px] font-bold text-sky-300">
                  {initials(contact.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{contact.name}</p>
                  <p className="truncate text-xs text-white/40">{contact.email}</p>
                </div>
                <button
                  onClick={() => setContact(null)}
                  aria-label="Change recipient"
                  className="text-white/30 transition hover:text-white/70"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && canAddTyped && !adding) { e.preventDefault(); addTyped(); } }}
                  placeholder="Search contacts, or type an email address…"
                  autoFocus
                  className={FIELD}
                />
                {results && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-brand-bg shadow-xl">
                    {canAddTyped && (
                      <button
                        onClick={addTyped}
                        disabled={adding}
                        className="flex w-full items-center gap-3 border-b border-white/5 px-3.5 py-2.5 text-left last:border-b-0 hover:bg-white/[0.05] disabled:opacity-50"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                          <Plus size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{adding ? "Adding…" : `Send to ${typedEmail}`}</p>
                          <p className="truncate text-xs text-white/40">New contact</p>
                        </div>
                      </button>
                    )}
                    {results.length === 0 ? (
                      !canAddTyped && <p className="px-3.5 py-3 text-xs text-white/40">No contacts found. Type a full email address to write to someone new.</p>
                    ) : (
                      results.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => pickContact(c)}
                          className="flex w-full items-center gap-3 border-b border-white/5 px-3.5 py-2.5 text-left last:border-b-0 hover:bg-white/[0.05]"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-400/15 text-[11px] font-bold text-sky-300">
                            {initials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{c.name || "—"}</p>
                            <p className="truncate text-xs text-white/40">{c.email}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className={LABEL}>Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line…"
              className={FIELD}
            />
          </div>

          {/* AI */}
          <div className="flex flex-col gap-2 rounded-xl border border-violet-400/20 bg-violet-400/5 p-3 sm:flex-row sm:items-center">
            <input
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !generating) handleGenerate(); }}
              placeholder="Optional: e.g. 'focus on ROI', 'keep it under 5 sentences'…"
              className={FIELD}
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-400/15 px-4 py-2.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-400/25 disabled:opacity-40"
            >
              <Sparkles size={13} />
              {generating ? "Generating…" : "Generate with AI"}
            </button>
          </div>

          {/* Body */}
          <div>
            <label className={LABEL}>Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Write your email here, or click Generate with AI above…"
              className={`${FIELD} resize-y leading-relaxed`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 px-6 py-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/50 transition hover:text-white/80 disabled:opacity-40"
          >
            Discard
          </button>
          {status && (
            <span className={`text-xs ${status.type === "success" ? "text-emerald-300" : "text-brand-rose"}`}>
              {status.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
