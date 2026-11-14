import { useEffect, useState, useCallback, useRef } from "react";
import {
  Mic, AlertCircle, RefreshCw, Trash2, RotateCcw, Loader2, CheckSquare, Lightbulb,
  HelpCircle, Quote, Users, ListChecks, Search, X, Pencil,
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import { REAUTHED_EVENT } from "../../components/SessionExpiredDialog";
import { useAuth } from "../../lib/auth";
import { getEntitlements } from "../../lib/api";
import { listMeetings, getMeeting, retryMeeting, deleteMeeting, searchMeetings, nameSpeakers } from "../../lib/foundersApi";

const SAMPLE_MEETINGS = [
  {
    id: "sample-1",
    status: "done",
    title: "Pilot scope with Priority Logistics",
    kind: "meeting",
    recorded_at: "2026-10-30T10:00:00Z",
    duration_seconds: 1860,
    summary: {
      summary: "Iqbal agreed to a four-week pilot covering dispatch and pipeline reporting. Pricing stays at the founder plan during the pilot, and success is measured by hours saved per week.",
      key_points: [
        { text: "Dispatch coordination takes Iqbal about 10 hours a week.", start_seconds: 95 },
        { text: "The ops lead will own the pilot day to day.", start_seconds: 612 },
      ],
      decisions: [{ text: "Run a four-week pilot starting next Monday.", start_seconds: 1420 }],
      action_items: [
        { task: "Send the pilot agreement", owner: "You", due: "Friday", start_seconds: 1495 },
        { task: "Share last quarter's dispatch numbers", owner: "Iqbal", due: null, start_seconds: 1530 },
      ],
      open_questions: ["Does the pilot include the second warehouse?"],
      highlights: [{ quote: "If this saves me even five hours a week, it pays for itself.", speaker: "speaker_2", start_seconds: 1012, why: "Clear value threshold for the pilot." }],
      speakers: [{ label: "speaker_1", name: null, role: "founder" }, { label: "speaker_2", name: "Iqbal", role: "client" }],
    },
    transcript: [
      { start: 95, end: 101, speaker: "speaker_2", text: "Honestly, dispatch eats about ten hours of my week." },
      { start: 1420, end: 1426, speaker: "speaker_1", text: "So let's run a four-week pilot starting Monday." },
    ],
    audio_url: null,
  },
];

const POLL_IDLE = 30_000;
const POLL_PROCESSING = 8_000;
const PROCESSING = new Set(["awaiting_upload", "queued", "transcribing", "summarizing"]);

const STATUS_LABEL = {
  awaiting_upload: "Uploading",
  queued: "Queued",
  transcribing: "Transcribing",
  summarizing: "Summarising",
  done: "Ready",
  failed: "Failed",
};

const STATUS_STYLE = {
  done: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  failed: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  default: "border-sky-400/25 bg-sky-400/10 text-sky-300",
};

function clock(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
}

/** label -> display name: the server's names, else the summary's, else "Speaker N". */
function speakerNames(d) {
  if (d?.speaker_names && Object.keys(d.speaker_names).length) return d.speaker_names;
  const names = {};
  for (const t of d?.transcript ?? []) if (t.speaker) names[t.speaker] ??= null;
  for (const sp of d?.summary?.speakers ?? []) if (sp.label) names[sp.label] = sp.name ?? names[sp.label] ?? null;
  for (const label of Object.keys(names)) names[label] ??= label.replace(/^(?:c\d+\.)?speaker_(\d+)$/, "Speaker $1");
  return names;
}

const MATCH_FIELD = {
  title: "Title", speaker: "Speaker", summary: "Summary", action_item: "Action item", decision: "Decision",
  key_point: "Key point", open_question: "Open question", highlight: "Highlight", transcript: "Transcript",
};

/** Search for sample meetings (demo mode), shaped like the API's results. */
function searchSamples(query) {
  const q = query.toLowerCase();
  return SAMPLE_MEETINGS.flatMap((m) => {
    const names = speakerNames(m);
    if (m.title.toLowerCase().includes(q)) return [{ ...m, match: { field: "title", text: m.title } }];
    const t = m.transcript.find((line) => line.text.toLowerCase().includes(q));
    if (t) return [{ ...m, match: { field: "transcript", text: t.text, start: t.start, speaker: names[t.speaker] } }];
    if (m.summary.summary.toLowerCase().includes(q)) return [{ ...m, match: { field: "summary", text: m.summary.summary } }];
    return [];
  });
}

/** `text` with the first case-insensitive `query` in bold. */
function Highlighted({ text, query }) {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-semibold text-white">{text.slice(at, at + query.length)}</strong>
      {text.slice(at + query.length)}
    </>
  );
}

function when(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function StatusPill({ status }) {
  const busy = PROCESSING.has(status);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_STYLE[status] || STATUS_STYLE.default}`}>
      {busy && <Loader2 size={10} className="animate-spin" />}
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
        <Icon size={13} />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Timestamp({ seconds, onSeek }) {
  return (
    <button
      onClick={() => onSeek(seconds)}
      title="Play from here"
      className="shrink-0 rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10.5px] text-white/45 transition hover:border-white/25 hover:text-white"
    >
      {clock(seconds)}
    </button>
  );
}

export default function MeetingsPage() {
  const { demo, logout } = useAuth();
  const [meetings, setMeetings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [usingSamples, setUsingSamples] = useState(false);
  const [entitlements, setEntitlements] = useState(null);
  const [toast, setToast]               = useState(null);
  const [selectedId, setSelectedId]     = useState(null);
  const [detail, setDetail]             = useState(null); // { loading } | { error } | { data }
  const [showTranscript, setShowTranscript] = useState(false);
  const [busy, setBusy]                 = useState(null);  // "retry" | "delete" | "speakers"
  const [query, setQuery]               = useState("");
  const [search, setSearch]             = useState(null);  // null | { loading } | { error } | { results }
  const [renaming, setRenaming]         = useState(null);  // null | { label: name }

  const loadedOnce = useRef(false);
  const latestSelection = useRef(null);
  const audioRef = useRef(null);
  const offline = demo || usingSamples;

  const load = useCallback(async () => {
    if (demo) { setMeetings(SAMPLE_MEETINGS); setLoading(false); return; }
    try {
      const data = await listMeetings();
      setMeetings(data.meetings ?? []);
      loadedOnce.current = true;
      setUsingSamples(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      if (!loadedOnce.current) { setMeetings(SAMPLE_MEETINGS); setUsingSamples(true); }
    } finally {
      setLoading(false);
    }
  }, [demo]);

  const selectMeeting = useCallback(async (id, { quiet = false } = {}) => {
    latestSelection.current = id;
    setSelectedId(id);
    if (!quiet) { setDetail({ loading: true }); setShowTranscript(false); setRenaming(null); }
    const sample = SAMPLE_MEETINGS.find((m) => m.id === id);
    if (offline && sample) { setDetail({ data: sample }); return; }
    try {
      const data = await getMeeting(id);
      if (latestSelection.current === id) setDetail({ data });
    } catch (err) {
      if (latestSelection.current === id && !quiet) setDetail({ error: err.message });
    }
  }, [offline]);

  // Poll faster while any recording is still being processed.
  const anyProcessing = meetings.some((m) => PROCESSING.has(m.status));
  useEffect(() => {
    load();
    if (demo) return;
    const interval = setInterval(load, anyProcessing ? POLL_PROCESSING : POLL_IDLE);
    return () => clearInterval(interval);
  }, [load, demo, anyProcessing]);

  // When the open meeting finishes processing, refresh its detail.
  const selectedStatus = meetings.find((m) => m.id === selectedId)?.status;
  useEffect(() => {
    if (selectedId && detail?.data && detail.data.status !== selectedStatus) {
      selectMeeting(selectedId, { quiet: true });
    }
  }, [selectedId, selectedStatus, detail, selectMeeting]);

  // Search 300 ms after typing stops; under 2 characters shows the full list.
  const q = query.trim();
  useEffect(() => {
    if (q.length < 2) { setSearch(null); return; }
    let live = true;
    const timer = setTimeout(async () => {
      if (offline) { setSearch({ results: searchSamples(q) }); return; }
      setSearch((prev) => ({ ...prev, loading: true }));
      try {
        const data = await searchMeetings(q);
        if (live) setSearch({ results: data.meetings ?? [] });
      } catch (err) {
        if (live) setSearch({ error: err.message });
      }
    }, 300);
    return () => { live = false; clearTimeout(timer); };
  }, [q, offline]);

  async function saveSpeakers() {
    const d = detail?.data;
    const current = speakerNames(d);
    const changed = Object.fromEntries(
      Object.entries(renaming).map(([l, n]) => [l, n.trim()]).filter(([l, n]) => n !== current[l]),
    );
    if (!Object.keys(changed).length) { setRenaming(null); return; }
    if (offline) {
      const names = { ...current };
      for (const [l, n] of Object.entries(changed)) names[l] = n || l.replace(/^(?:c\d+\.)?speaker_(\d+)$/, "Speaker $1");
      setDetail({ data: { ...d, speaker_names: names } });
      setRenaming(null);
      return;
    }
    setBusy("speakers");
    try {
      const res = await nameSpeakers(d.id, changed);
      setDetail({ data: { ...d, speaker_names: res.speaker_names } });
      setRenaming(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusy(null);
    }
  }

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

  function seek(seconds) {
    const audio = audioRef.current;
    if (!audio) { showToast("Audio isn't available for this recording", "error"); return; }
    audio.currentTime = seconds;
    audio.play().catch(() => {});
  }

  async function onRetry(id) {
    if (offline) { showToast(demo ? "Sign in to retry" : "Can't reach the server right now", "error"); return; }
    setBusy("retry");
    try {
      await retryMeeting(id);
      await load();
      selectMeeting(id, { quiet: true });
      showToast("Processing again", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function onDelete(id) {
    if (offline) { showToast(demo ? "Sign in to delete recordings" : "Can't reach the server right now", "error"); return; }
    if (!window.confirm("Delete this recording, its transcript and its summary? This can't be undone.")) return;
    setBusy("delete");
    try {
      await deleteMeeting(id);
      latestSelection.current = null;
      setSelectedId(null);
      setDetail(null);
      await load();
      showToast("Recording deleted", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusy(null);
    }
  }

  const d = detail?.data;
  const s = d?.summary;
  const names = speakerNames(d);
  const who = (label) => names[label] ?? label;
  const searching = q.length >= 2;
  const shown = searching ? (search?.results ?? []) : meetings;

  return (
    <div className="flex min-h-screen bg-brand-bg font-body text-white">
      <Sidebar onLogout={logout} planLabel={entitlements?.planName} planStatus={entitlements?.status} />

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Meetings</h1>
            <p className="mt-1 text-sm text-white/40">
              {loading ? "Loading…" : `${meetings.length} recording${meetings.length !== 1 ? "s" : ""} from your pen`}
              {demo && " · sample data"}
            </p>
          </div>
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

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-3 text-sm text-brand-gold2">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {usingSamples
              ? "Couldn't reach founder-agents-api — showing a sample meeting."
              : `Couldn't refresh meetings: ${error}`}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.03]" />)}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-16 text-center">
            <Mic size={28} className="text-white/20" />
            <p className="text-sm text-white/40">No recordings yet.</p>
            <p className="max-w-sm text-xs text-white/25">
              Record with your pen, then open the yAtI app. New recordings upload automatically and appear here with a summary.
            </p>
          </div>
        ) : (
          <>
          <div className="relative mb-4">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search meetings, people and transcripts"
              className="w-full rounded-xl border border-white/5 bg-white/[0.03] py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/35 focus:border-white/20 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                title="Clear"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
            {/* List */}
            <div className="flex flex-col gap-2">
              {searching && search?.error && (
                <p className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm text-rose-300">{search.error}</p>
              )}
              {searching && search?.results && shown.length === 0 && (
                <p className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm text-white/40">
                  No meetings mention “{q}”.
                </p>
              )}
              {searching && !search?.results && !search?.error && (
                <div className="flex items-center gap-2 p-4 text-sm text-white/40"><Loader2 size={14} className="animate-spin" /> Searching…</div>
              )}
              {shown.map((m) => (
                <button
                  key={m.id}
                  onClick={() => selectMeeting(m.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    m.id === selectedId ? "border-white/20 bg-white/[0.07]" : "border-white/5 bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-white">{m.title || "Untitled recording"}</p>
                    <StatusPill status={m.status} />
                  </div>
                  <p className="mt-1 text-xs text-white/35">
                    {when(m.recorded_at || m.created_at)}
                    {m.duration_seconds ? ` · ${clock(m.duration_seconds)}` : ""}
                    {m.kind ? ` · ${m.kind.replace("_", " ")}` : ""}
                  </p>
                  {m.match && m.match.field !== "title" && (
                    <div className="mt-2">
                      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-white/35">
                        {[MATCH_FIELD[m.match.field] ?? m.match.field, m.match.speaker, m.match.start != null ? clock(m.match.start) : null]
                          .filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-0.5 line-clamp-3 text-[12.5px] leading-snug text-white/60">
                        <Highlighted text={m.match.text} query={q} />
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Detail */}
            <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6">
              {!selectedId ? (
                <p className="py-16 text-center text-sm text-white/30">Select a recording to see its summary.</p>
              ) : detail?.loading ? (
                <div className="flex items-center gap-2 py-16 text-sm text-white/40"><Loader2 size={15} className="animate-spin" /> Loading…</div>
              ) : detail?.error ? (
                <div className="flex items-start gap-2 text-sm text-rose-300"><AlertCircle size={15} className="mt-0.5" /> {detail.error}</div>
              ) : d && (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-xl font-bold text-white">{d.title || "Untitled recording"}</h2>
                      <p className="mt-1 text-xs text-white/35">
                        {when(d.recorded_at || d.created_at)}
                        {d.duration_seconds ? ` · ${clock(d.duration_seconds)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={d.status} />
                      {d.status === "failed" && (
                        <button
                          onClick={() => onRetry(d.id)}
                          disabled={busy === "retry"}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/60 transition hover:text-white disabled:opacity-40"
                        >
                          <RotateCcw size={12} /> Retry
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(d.id)}
                        disabled={busy === "delete"}
                        title="Delete recording"
                        className="rounded-lg border border-white/10 p-1.5 text-white/40 transition hover:border-rose-400/30 hover:text-rose-300 disabled:opacity-40"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {d.audio_url ? (
                    <audio ref={audioRef} controls preload="none" src={d.audio_url} className="mt-4 w-full" />
                  ) : d.status === "done" && d.audio_deleted_at ? (
                    <p className="mt-3 text-xs text-white/30">The audio was deleted after the retention period; the transcript and summary remain.</p>
                  ) : null}

                  {d.status === "failed" && d.error && (
                    <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/5 px-3.5 py-2.5 text-xs text-rose-200">{d.error}</div>
                  )}

                  {PROCESSING.has(d.status) && (
                    <p className="mt-6 flex items-center gap-2 text-sm text-white/45">
                      <Loader2 size={14} className="animate-spin" />
                      {STATUS_LABEL[d.status]}… this page updates on its own.
                    </p>
                  )}

                  {s && (
                    <>
                      <p className="mt-5 text-sm leading-relaxed text-white/80">{s.summary}</p>

                      {s.action_items?.length > 0 && (
                        <Section icon={CheckSquare} title="Action items">
                          <ul className="flex flex-col gap-2">
                            {s.action_items.map((a, i) => (
                              <li key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5 text-sm">
                                <span className="flex-1 text-white/85">
                                  {a.task}
                                  {(a.owner || a.due) && (
                                    <span className="text-white/40">
                                      {a.owner ? ` · ${who(a.owner)}` : ""}{a.due ? ` · due ${a.due}` : ""}
                                    </span>
                                  )}
                                </span>
                                <Timestamp seconds={a.start_seconds} onSeek={seek} />
                              </li>
                            ))}
                          </ul>
                        </Section>
                      )}

                      {s.decisions?.length > 0 && (
                        <Section icon={ListChecks} title="Decisions">
                          <ul className="flex flex-col gap-1.5">
                            {s.decisions.map((p, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-white/75">
                                <span className="flex-1">{p.text}</span>
                                <Timestamp seconds={p.start_seconds} onSeek={seek} />
                              </li>
                            ))}
                          </ul>
                        </Section>
                      )}

                      {s.key_points?.length > 0 && (
                        <Section icon={Lightbulb} title="Key points">
                          <ul className="flex flex-col gap-1.5">
                            {s.key_points.map((p, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-white/75">
                                <span className="flex-1">{p.text}</span>
                                <Timestamp seconds={p.start_seconds} onSeek={seek} />
                              </li>
                            ))}
                          </ul>
                        </Section>
                      )}

                      {s.open_questions?.length > 0 && (
                        <Section icon={HelpCircle} title="Open questions">
                          <ul className="list-disc pl-5 text-sm text-white/75">
                            {s.open_questions.map((q, i) => <li key={i} className="mb-1">{q}</li>)}
                          </ul>
                        </Section>
                      )}

                      {s.highlights?.length > 0 && (
                        <Section icon={Quote} title="Highlights">
                          <div className="flex flex-col gap-3">
                            {s.highlights.map((h, i) => (
                              <figure key={i} className="border-l-2 border-brand-gold/40 pl-3.5">
                                <blockquote className="text-sm italic text-white/80">“{h.quote}”</blockquote>
                                {h.translation && (
                                  <p className="mt-1 text-sm text-white/60">{h.translation}</p>
                                )}
                                <figcaption className="mt-1 flex items-center gap-2 text-xs text-white/40">
                                  {h.why}
                                  <Timestamp seconds={h.start_seconds} onSeek={seek} />
                                </figcaption>
                              </figure>
                            ))}
                          </div>
                        </Section>
                      )}

                      {Object.keys(names).length > 0 && (
                        <Section icon={Users} title="Speakers">
                          {renaming ? (
                            <div className="flex flex-col gap-3">
                              {Object.keys(names).map((label) => {
                                const first = d.transcript?.find((t) => t.speaker === label)?.text;
                                return (
                                  <label key={label} className="block">
                                    <input
                                      value={renaming[label] ?? ""}
                                      maxLength={60}
                                      onChange={(e) => setRenaming((r) => ({ ...r, [label]: e.target.value }))}
                                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
                                    />
                                    {first && <span className="mt-1 block truncate text-xs text-white/35">First said: “{first}”</span>}
                                  </label>
                                );
                              })}
                              <div className="flex gap-2">
                                <button
                                  onClick={saveSpeakers}
                                  disabled={busy === "speakers"}
                                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-40"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setRenaming(null)}
                                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm text-white/60">
                                {Object.keys(names).map((label) => {
                                  const role = s.speakers?.find((sp) => sp.label === label)?.role;
                                  return role ? `${who(label)} (${role})` : who(label);
                                }).join(" · ")}
                              </p>
                              <button
                                onClick={() => setRenaming({ ...names })}
                                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/60 transition hover:text-white"
                              >
                                <Pencil size={11} /> Rename
                              </button>
                            </div>
                          )}
                        </Section>
                      )}
                    </>
                  )}

                  {d.transcript?.length > 0 && (
                    <div className="mt-7 border-t border-white/5 pt-4">
                      <button
                        onClick={() => setShowTranscript((v) => !v)}
                        className="text-xs font-semibold text-white/50 transition hover:text-white"
                      >
                        {showTranscript ? "Hide transcript" : `Show transcript (${d.transcript.length} lines)`}
                      </button>
                      {showTranscript && (
                        <ol className="mt-3 flex flex-col gap-2">
                          {d.transcript.map((t, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                              <Timestamp seconds={t.start} onSeek={seek} />
                              <span className="text-white/75">
                                {t.speaker && <span className="mr-1.5 text-xs font-semibold text-white/35">{who(t.speaker)}</span>}
                                {t.text}
                              </span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          </>
        )}

        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm shadow-xl ${
            toast.type === "success" ? "border-emerald-400/25 bg-emerald-950/90 text-emerald-200" : "border-rose-400/25 bg-rose-950/90 text-rose-200"
          }`}>
            {toast.message}
          </div>
        )}
      </main>
    </div>
  );
}
