/**
 * Single source of truth for what /order shows: devices, plans, early-signup prices and access levels.
 * Mirrors "Pricing revision 3" (26 Nov 2026) in the project doc pricing-and-offers-handoff-2026-11-26.md.
 * The backend catalog (Shekhar, yati-api) must match this; the server, not this file, decides what a customer is charged.
 * Prices are in cents, USD, before tax.
 */

// Feature flags. All default off, so /order stays parked until each is switched on in the host's env settings.
export const FLAGS = {
  ordersEnabled: import.meta.env.VITE_ORDERS_ENABLED === 'true', // the /order route renders (otherwise it redirects)
  ordersOpen: import.meta.env.VITE_ORDERS_OPEN === 'true',       // buyers can start checkout (Dec 25)
  planCheckout: import.meta.env.VITE_PLAN_CHECKOUT === 'true',   // device + plan bundles can be bought (needs the subscription backend)
}

export const LAUNCH_LABEL = 'Dec 25'

// Optional policy text. Shown only when set, so nothing is invented. Fill these before orders open.
export const POLICY = {
  returns: '',          // e.g. return window and refund method
  warranty: '',         // e.g. warranty terms
  deliveryEstimate: '', // e.g. "Ships within X business days"
  basicLimitNote: '',   // e.g. fair-use limit on device-only transcription (open item)
}

export const DEVICES = [
  {
    id: 'thread-one',
    name: 'Thread One',
    form: 'Slim aluminum card',
    blurb: 'Slides in with your cards and notes. Always with you, never in the way.',
    image: '/flow/thread-one.jpg',
    w: 225, h: 495,
    standaloneCents: 14900,
    bundleCents: 11900,
  },
  {
    id: 'thread-max',
    name: 'Thread Max',
    form: 'Wearable capsule',
    blurb: 'Clips on and stays on. Built for the founder who is in conversations all day.',
    image: '/flow/thread-max.jpg',
    w: 230, h: 405,
    standaloneCents: 17900,
    bundleCents: 14900,
  },
]

// Plan tiers. intro = months 1-3 for the first 100 verified early signups; feedback = months 4-6 after honest feedback by day 75.
export const PLANS = {
  capture: {
    id: 'capture',
    name: 'Capture',
    tagline: 'Transcription plus full Founder OS: insights and meeting prep.',
    includesSpark: false,
    tiers: [
      { id: 'capture', name: 'Capture', monthlyCents: 1900, minutes: 300, users: '1', introCents: 1000, feedbackCents: 1400 },
      { id: 'capture-plus', name: 'Capture Plus', monthlyCents: 2900, minutes: 900, users: '1', introCents: 1500, feedbackCents: 2100 },
      { id: 'capture-pro', name: 'Capture Pro', monthlyCents: 4900, minutes: 1800, users: '1', introCents: 2500, feedbackCents: 3500 },
    ],
  },
  spark: {
    id: 'spark',
    name: 'Spark',
    tagline: 'Everything in Capture, plus the sales agent: prospect research, outreach drafts and CRM updates you approve.',
    includesSpark: true,
    tiers: [
      { id: 'spark-starter', name: 'Spark Starter', monthlyCents: 19900, minutes: 300, prospects: 25, actions: 100, users: '1', introCents: 10000, feedbackCents: 14000 },
      { id: 'spark-growth', name: 'Spark Growth', monthlyCents: 39900, minutes: 900, prospects: 100, actions: 300, users: '1', introCents: 20000, feedbackCents: 28000 },
      { id: 'spark-team', name: 'Spark Team', monthlyCents: 69900, minutes: 1800, prospects: 300, actions: 900, users: 'Up to 5', introCents: 35000, feedbackCents: 49000 },
    ],
  },
}

// What each access level unlocks (confirmed 27 Nov 2026). Used by the comparison table.
export const ACCESS_ROWS = [
  { label: 'Record and transcribe with Thread', basic: true, full: true, spark: true },
  { label: 'Connect Gmail, Calendar, Slack and HubSpot', basic: true, full: true, spark: true },
  { label: 'Founder OS insights from your Gmail', basic: 'preview', full: true, spark: true },
  { label: 'Meeting prep from your Calendar', basic: 'preview', full: true, spark: true },
  { label: 'Spark sales agent: prospect research, outreach drafts, CRM updates', basic: false, full: false, spark: true },
]

export const usd = (cents) => {
  const d = cents / 100
  return Number.isInteger(d) ? `$${d}` : `$${d.toFixed(2)}`
}

export function getDevice(id) {
  return DEVICES.find((d) => d.id === id) || DEVICES[0]
}

/**
 * Builds every number the page displays from one selection, so the summary, the buttons and the
 * struck-through prices cannot disagree. purchase: 'device' | 'capture' | 'spark'.
 */
export function buildQuote({ deviceId, purchase, tierId, earlyActive }) {
  const device = getDevice(deviceId)
  const bundle = purchase !== 'device'
  const family = bundle ? PLANS[purchase] : null
  const tier = family ? (family.tiers.find((t) => t.id === tierId) || family.tiers[0]) : null
  return {
    device,
    bundle,
    family,
    tier,
    deviceNowCents: bundle ? device.bundleCents : device.standaloneCents,
    deviceWasCents: bundle ? device.standaloneCents : null,
    deviceSaveCents: bundle ? device.standaloneCents - device.bundleCents : 0,
    earlyActive: Boolean(bundle && earlyActive),
  }
}
