/**
 * Single source of truth for what /order shows. Mirrors the founder's pricing review of 27 Nov 2026
 * (project doc: pricing-revision-4-founder-2026-11-27.md). Prices are whole dollars, USD, before tax and shipping.
 * The server (yati-api) must hold the same catalog and is the only thing that decides what a customer is charged.
 */

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {}

// Feature flags. All default off, so /order stays parked until each is switched on in the host's env settings.
export const FLAGS = {
  ordersEnabled: env.VITE_ORDERS_ENABLED === 'true', // the /order route renders (otherwise it redirects)
  ordersOpen: env.VITE_ORDERS_OPEN === 'true',       // buyers can start checkout (Dec 25)
  planCheckout: env.VITE_PLAN_CHECKOUT === 'true',   // device + plan orders can be bought (needs the subscription backend)
  policyApproved: env.VITE_POLICY_APPROVED === 'true', // returns and cancellation terms approved: removes the draft banner, allows indexing
}

export const LAUNCH_LABEL = 'Dec 25'

// Optional policy text. Shown only when set, so nothing is invented. Fill before orders open.
export const POLICY = {
  returns: '',          // device returns and defects
  warranty: '',
  deliveryEstimate: '', // e.g. "Ships within X business days"
  cancellation: '',     // Capture commitment cancellation / early termination / renewal
  basicLimitNote: '',   // fair-use limit on device-only transcription (open item)
}

// What standard US shipping would cost a customer. Shown struck through beside "Free shipping"; no shipping is ever charged.
// Keep this equal to what shipping genuinely costs us, and remove the strike-through when the free-shipping offer ends.
export const SHIPPING_STANDARD = 7.45

export const FOUNDER_OS_VALUE = 60 // estimated $/month benefit value, never a former selling price

export const DEVICES = [
  { id: 'thread-one', name: 'Thread One', form: 'Slim aluminum card', blurb: 'Slides in with your cards and notes. Always with you, never in the way.', image: '/flow/thread-one.jpg', w: 225, h: 495, standalone: 149, committed: 119 },
  { id: 'thread-max', name: 'Thread Max', form: 'Wearable capsule', blurb: 'Clips on and stays on. Built for the founder who is in conversations all day.', image: '/flow/thread-max.jpg', w: 230, h: 405, standalone: 179, committed: 149 },
]

export const CAPTURE = [
  { id: 'capture-starter', name: 'Capture Starter', price: 19, minutes: 300, storage: '2 GB', intro: 10, feedback: 14 },
  { id: 'capture-plus', name: 'Capture Plus', price: 29, minutes: 900, storage: '5 GB', intro: 15, feedback: 21 },
  { id: 'capture-pro', name: 'Capture Pro', price: 49, minutes: 1800, storage: '15 GB', intro: 25, feedback: 35 },
]

export const SPARK = [
  { id: 'spark-starter', name: 'Spark Starter', price: 199, prospects: 25, actions: 100, users: '1', storage: '2 GB', intro: 100, feedback: 140 },
  { id: 'spark-growth', name: 'Spark Growth', price: 399, prospects: 100, actions: 300, users: '1', storage: '10 GB', intro: 200, feedback: 280 },
  { id: 'spark-team', name: 'Spark Team', price: 699, prospects: 300, actions: 900, users: 'Up to 5', storage: '30 GB', intro: 350, feedback: 490 },
]

// What each access level unlocks (confirmed with the team 27 Nov 2026).
export const ACCESS_ROWS = [
  { label: 'Record and transcribe with Thread', basic: true, full: true, spark: true },
  { label: 'Connect Gmail, Calendar, Slack and HubSpot', basic: true, full: true, spark: true },
  { label: 'Founder OS insights from your Gmail', basic: 'preview', full: true, spark: true },
  { label: 'Meeting prep from your Calendar', basic: 'preview', full: true, spark: true },
  { label: 'Spark sales agent: prospect research, outreach drafts, CRM updates', basic: false, full: false, spark: true },
]

export const usd = (n) => (Number.isInteger(n) ? `$${n.toLocaleString('en-US')}` : `$${n.toFixed(2)}`)

// 10% off, then round UP to the next whole dollar. The 1e-9 guards against float noise (e.g. 90.00000000000001).
export const bundleRound = (n) => Math.ceil(n * 0.9 - 1e-9)

export const getDevice = (id) => DEVICES.find((d) => d.id === id) || DEVICES[0]
export const getCapture = (id) => CAPTURE.find((c) => c.id === id) || null
export const getSpark = (id) => SPARK.find((s) => s.id === id) || null

/**
 * Builds every number the page shows from one selection.
 * sel: { deviceId, commitment: 'none'|'6'|'12', captureId|null, sparkId|null }
 * earlyActive: server says the first-100 offer is live (feedback prices shown for months 4-6 assume honest feedback by day 75).
 *
 * Rules (founder page): committed device price needs a paid Capture commitment; 12 months is Starter only with the first
 * three Capture months free. A "full bundle" is a committed device + Capture + Spark: 10% off the device and the combined
 * monthly subtotal, each rounded up separately. First-100 prices apply to the plans only and stack with the bundle reward.
 */
export function computeQuote(sel, earlyActive = false) {
  const device = getDevice(sel.deviceId)
  const capture = getCapture(sel.captureId)
  const spark = getSpark(sel.sparkId)
  let commitment = capture ? sel.commitment : 'none'
  if (commitment === '12' && capture && capture.id !== 'capture-starter') commitment = '6'
  const committed = commitment !== 'none'
  const free12 = commitment === '12'
  const bundle = Boolean(committed && capture && spark)
  const early = Boolean(earlyActive && (capture || spark))

  const deviceBase = committed ? device.committed : device.standalone
  const deviceNow = bundle ? bundleRound(deviceBase) : deviceBase

  // Monthly price of each plan in a given billing month (1-based).
  const capPrice = (m) => {
    if (!capture) return 0
    if (free12 && m <= 3) return 0
    if (early && !(free12 && m <= 3)) return m <= 3 ? capture.intro : m <= 6 ? capture.feedback : capture.price
    return capture.price
  }
  const sparkPrice = (m) => {
    if (!spark) return 0
    if (early) return m <= 3 ? spark.intro : m <= 6 ? spark.feedback : spark.price
    return spark.price
  }
  const phaseAt = (m) => {
    const raw = capPrice(m) + sparkPrice(m)
    return { m, raw, net: bundle ? bundleRound(raw) : raw, cap: capPrice(m), spark: sparkPrice(m) }
  }
  const probes = [phaseAt(1), phaseAt(4), phaseAt(7)]
  const phases = []
  probes.forEach((p, i) => {
    const prev = phases[phases.length - 1]
    if (prev && prev.net === p.net) return
    phases.push({ ...p, from: p.m })
  })
  phases.forEach((p, i) => {
    const next = phases[i + 1]
    p.label = next ? (p.from === next.from - 1 ? `Month ${p.from}` : `Months ${p.from}–${next.from - 1}`) : (p.from === 1 ? 'Every month' : `Month ${p.from} onward`)
  })

  const first = phases[0]
  const regularMonthly = (capture ? capture.price : 0) + (spark ? spark.price : 0)
  const termMonths = commitment === '12' ? 12 : 6
  // Illustrative term total if both plans stay active for the commitment term (Spark itself stays monthly).
  let termTotal = deviceNow
  if (capture || spark) for (let m = 1; m <= termMonths; m++) termTotal += phaseAt(m).net

  return {
    device, capture, spark, commitment, committed, free12, bundle, early, phases,
    hasPlan: Boolean(capture || spark),
    deviceStandalone: device.standalone,
    deviceNow,
    commitSaving: committed ? device.standalone - device.committed : 0,
    bundleSavingHardware: bundle ? device.committed - deviceNow : 0,
    bundleSavingServices: bundle ? first.raw - first.net : 0,
    firstServices: first ? first.net : 0,
    firstCharge: deviceNow + (first ? first.net : 0),
    regularMonthly,
    termMonths,
    termTotal,
    // Server needs this exact shape to re-price the order.
    selection: { deviceId: device.id, commitment, captureId: capture ? capture.id : null, sparkId: spark ? spark.id : null },
  }
}
