// Clearly-labeled sample data, shaped exactly like yati-api's real UserData.dataJson
// ({ device, stepGoal, history, workouts }) — used only when the dashboard can't reach
// a real yati-api instance (not configured, unreachable, or demo mode). Never shown
// without the "Sample data" banner in the UI — see Dashboard.jsx.

const today = () => new Date();

function daysAgoISO(n) {
  const d = new Date(today());
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const SAMPLE_RING_DATA = {
  device: {
    name: "Signal Ring",
    connected: true,
    batteryPercent: 71,
    lastSyncedAt: new Date().toISOString(),
  },
  stepGoal: 8000,
  history: [
    { date: daysAgoISO(6), steps: 6210 },
    { date: daysAgoISO(5), steps: 8430 },
    { date: daysAgoISO(4), steps: 5120 },
    { date: daysAgoISO(3), steps: 9040 },
    { date: daysAgoISO(2), steps: 7600 },
    { date: daysAgoISO(1), steps: 8890 },
    { date: daysAgoISO(0), steps: 4310 },
  ],
  workouts: [
    { id: "w1", type: "Walk", date: daysAgoISO(0), durationMin: 22, calories: 96 },
    { id: "w2", type: "Strength", date: daysAgoISO(1), durationMin: 40, calories: 210 },
    { id: "w3", type: "Run", date: daysAgoISO(3), durationMin: 28, calories: 260 },
  ],
};

// Shaped like GET /api/entitlements's real response (see entitlements.js /
// plans.js in yati-api) — used only in demo mode, same rule as
// SAMPLE_RING_DATA above. hasAnyAccess: true so demo visitors see the real
// AgentsLaunchCard rather than a locked state that has nothing to do with
// whether the site itself works.
export const SAMPLE_ENTITLEMENTS = {
  planId: "founder",
  planName: "yAtI Founder (sample)",
  status: "trial",
  agents: {
    family: ["ai_cmo", "ai_cro", "ai_cfo", "ai_coo"],
    includedSlots: 2,
    extraSlots: 0,
    totalSlots: 2,
    selected: ["ai_cmo", "ai_cro"],
    hasAnyAccess: true,
  },
};
