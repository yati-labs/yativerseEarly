import { useEffect, useState } from "react";
import {
  BarChart3,
  ListChecks,
  ShieldCheck,
  Cpu,
  Info,
} from "lucide-react";
import SEO from "../components/SEO";
import Sidebar from "../components/dashboard/Sidebar";
import TopBar from "../components/dashboard/TopBar";
import StepsCard from "../components/dashboard/StepsCard";
import WorkoutsCard from "../components/dashboard/WorkoutsCard";
import ComingSoonCard from "../components/dashboard/ComingSoonCard";
import AgentsLaunchCard from "../components/dashboard/AgentsLaunchCard";
import { useAuth } from "../lib/auth";
import { fetchRingData, getEntitlements } from "../lib/api";
import { SAMPLE_RING_DATA, SAMPLE_ENTITLEMENTS } from "../lib/sampleRingData";

const COMING_SOON = [
  {
    icon: ListChecks,
    title: "Today's Priorities",
    phase: "Phase 2",
    description: "Founder OS Lite turns your Ring recovery + calendar into one daily brief.",
  },
  {
    icon: BarChart3,
    title: "Venture Pulse",
    phase: "Phase 4+",
    description: "MRR, runway, and growth — once a financial data source is connected.",
  },
  {
    icon: Cpu,
    title: "Systems & Devices",
    phase: "Phase 4+",
    description: "yAtI Flow Thread devices and multi-device health, as they launch.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & Trust",
    phase: "Phase 5",
    description: "A single control center for data exposure, access, and encryption status.",
  },
];

export default function Dashboard() {
  const { email, demo, logout } = useAuth();
  const [ringData, setRingData] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entitlements, setEntitlements] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (demo) {
        if (!cancelled) {
          setRingData(SAMPLE_RING_DATA);
          setIsLive(false);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchRingData();
        if (!cancelled) {
          setRingData(data);
          setIsLive(true);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setRingData(SAMPLE_RING_DATA);
          setIsLive(false);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [demo]);

  // Separate effect, independent of ring data: a slow or failed
  // entitlements check should never block the Steps/Workouts cards from
  // showing. Fails closed on error — never claims agent access we
  // couldn't actually confirm (see AgentsLaunchCard's `locked` prop).
  useEffect(() => {
    let cancelled = false;

    async function loadEntitlements() {
      if (demo) {
        if (!cancelled) setEntitlements(SAMPLE_ENTITLEMENTS);
        return;
      }
      try {
        const data = await getEntitlements();
        if (!cancelled) setEntitlements(data);
      } catch {
        if (!cancelled) {
          setEntitlements({ planName: null, agents: { hasAnyAccess: false } });
        }
      }
    }

    loadEntitlements();
    return () => {
      cancelled = true;
    };
  }, [demo]);

  return (
    <div className="flex min-h-screen bg-brand-bg font-body text-white">
      <SEO title="Dashboard — yAtIverse" description="Your Founder Command Center." />
      <Sidebar onLogout={logout} planLabel={entitlements?.planName} planStatus={entitlements?.status} />

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <TopBar email={email} live={isLive} />

        {!loading && !isLive && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-3 text-sm text-brand-gold2">
            <Info size={16} className="mt-0.5 shrink-0" />
            <span>
              {error
                ? `Couldn't reach yati-api (${error}) — showing sample data shaped like your real sync payload.`
                : "Sample data — this is demo mode. Log in with a real account to see your actual steps and workouts."}
            </span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <StepsCard history={ringData.history} stepGoal={ringData.stepGoal} />
              <WorkoutsCard workouts={ringData.workouts} device={ringData.device} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {entitlements ? (
                <AgentsLaunchCard
                  locked={!entitlements.agents?.hasAnyAccess}
                  planName={entitlements.planName}
                />
              ) : (
                <div className="h-48 animate-pulse rounded-2xl bg-white/[0.03]" />
              )}
            </div>

            <div className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-white/25">
              Coming in later phases
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {COMING_SOON.map((c) => (
                <ComingSoonCard key={c.title} {...c} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
