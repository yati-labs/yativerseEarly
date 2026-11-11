import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Calendar, Zap, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import { useAuth } from "../../lib/auth";
import { getEntitlements } from "../../lib/api";
import { listDeals, syncHubspot, coachDeal } from "../../lib/foundersApi";

const SAMPLE_DEALS = [
  { id: "1", name: "Priority Logistics — Enterprise", stage: "Proposal Sent",  health: "green",  close_date: "2026-11-15", amount: 24000 },
  { id: "2", name: "FleetTrack Pro — Growth",         stage: "Discovery",      health: "yellow", close_date: "2026-12-01", amount: 12000 },
  { id: "3", name: "ShipEasy — Starter",              stage: "Closed Won",     health: "green",  close_date: "2026-10-01", amount: 6000  },
  { id: "4", name: "LogiSync — Scale",                stage: "Negotiation",    health: "red",    close_date: "2026-10-20", amount: 36000 },
];

const HEALTH_STYLES = {
  green:  { dot: "bg-emerald-400", label: "Healthy",  badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" },
  yellow: { dot: "bg-amber-400",   label: "At risk",  badge: "border-amber-400/25   bg-amber-400/10   text-amber-300"   },
  red:    { dot: "bg-rose-400",    label: "Critical", badge: "border-rose-400/25    bg-rose-400/10    text-rose-300"    },
};

const STAGE_STYLES = {
  "Closed Won":  "text-emerald-300",
  "Closed Lost": "text-white/30",
};

function formatAmount(n) {
  if (!n) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(str) {
  if (!str) return null;
  return new Date(str).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function DealsPage() {
  const { demo, logout } = useAuth();
  const [deals, setDeals]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [coaching, setCoaching]     = useState({});
  const [toast, setToast]           = useState(null);
  const [entitlements, setEntitlements] = useState(null);
  const [syncing, setSyncing]       = useState(false);
  const [hubspot, setHubspot]       = useState(null); // null | { connected: false } | { syncedAt }

  const loadDeals = useCallback(async () => {
    const data = await listDeals();
    setDeals(Array.isArray(data) ? data : data.deals ?? []);
  }, []);

  /** Copies the latest from the user's HubSpot. `auto` (opening the page) is quiet and at most every 10 min. */
  const sync = useCallback(async (auto) => {
    if (!auto) setSyncing(true);
    try {
      const res = await syncHubspot(auto);
      setHubspot({ connected: true, syncedAt: res.synced_at });
      if (res.synced) await loadDeals();
      if (!auto) showToast(`HubSpot synced · ${res.deals} deal${res.deals === 1 ? "" : "s"}`, "success");
    } catch (err) {
      if (/connect hubspot/i.test(err.message || "")) setHubspot({ connected: false });
      else if (!auto) showToast(err.message || "Couldn't sync HubSpot", "error");
    } finally {
      if (!auto) setSyncing(false);
    }
  }, [loadDeals]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (demo) {
        if (!cancelled) { setDeals(SAMPLE_DEALS); setLoading(false); }
        return;
      }
      try {
        await loadDeals();
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
      if (!cancelled) sync(true);
    }
    load();
    return () => { cancelled = true; };
  }, [demo, loadDeals, sync]);

  useEffect(() => {
    if (demo) { setEntitlements({ planName: "Founder", status: "trial" }); return; }
    getEntitlements().then(setEntitlements).catch(() => setEntitlements(null));
  }, [demo]);

  async function handleDealCoach(dealId) {
    if (demo) { showToast("Sign in to run Deal Coach", "error"); return; }
    setCoaching((c) => ({ ...c, [dealId]: true }));
    try {
      const res = await coachDeal(dealId);
      if (res.skipped) throw new Error(res.reason || "Deal Coach skipped this deal");
      await loadDeals();
      showToast(`Deal Coach done · follow-up draft saved in Drafts`, "success");
    } catch (err) {
      showToast(err.message || "Failed to start Deal Coach", "error");
    } finally {
      setCoaching((c) => ({ ...c, [dealId]: false }));
    }
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="flex min-h-screen bg-brand-bg font-body text-white">
      <Sidebar onLogout={logout} planLabel={entitlements?.planName} planStatus={entitlements?.status} />

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Deals</h1>
            <p className="mt-1 text-sm text-white/40">
              {loading ? "Loading…" : `${deals.length} deal${deals.length !== 1 ? "s" : ""}`}
              {demo && " · sample data"}
              {hubspot?.syncedAt && ` · from your HubSpot, synced ${new Date(hubspot.syncedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`}
            </p>
          </div>
          {!demo && hubspot?.connected !== false && (
            <button
              onClick={() => sync(false)}
              disabled={syncing}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:text-white disabled:opacity-50"
            >
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing…" : "Sync HubSpot"}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-3 text-sm text-brand-gold2">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            Couldn't load your deals: {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-6 py-16 text-center">
            <TrendingUp size={28} className="text-white/20" />
            {hubspot?.connected === false ? (
              <>
                <p className="text-sm text-white/40">Connect your HubSpot to see your pipeline here.</p>
                <Link
                  to="/dashboard/settings"
                  className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                >
                  Connect HubSpot in Settings
                </Link>
              </>
            ) : (
              <p className="text-sm text-white/30">No open deals in your HubSpot yet.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {deals.map((d) => {
              const health = HEALTH_STYLES[(d.health || "").toLowerCase()];
              return (
                <div key={d.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3">
                    <p className={`font-semibold ${STAGE_STYLES[d.stage] || "text-white"}`}>{d.name}</p>
                    {health ? (
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${health.badge}`}>
                        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${health.dot}`} />
                        {health.label}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-white/35">Not coached yet</span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/40">
                    <span className="font-medium text-white/60">{d.stage}</span>
                    {d.amount && <span>{formatAmount(d.amount)}</span>}
                    {d.close_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(d.close_date)}
                      </span>
                    )}
                  </div>

                  {/* Deal coach output */}
                  {d.coach_summary && (
                    <p className="mt-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs leading-relaxed text-white/50">
                      {d.coach_summary}
                    </p>
                  )}

                  {/* Actions */}
                  {d.stage !== "Closed Won" && d.stage !== "Closed Lost" && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleDealCoach(d.id)}
                        disabled={coaching[d.id]}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/50 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Zap size={12} />
                        {coaching[d.id] ? "Running…" : "Run Deal Coach"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
          toast.type === "success"
            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
            : "border-brand-rose/25 bg-brand-rose/10 text-brand-rose"
        }`}>
          {toast.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
