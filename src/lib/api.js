/**
 * Client for yati-api — the same backend the yAtI mobile app talks to.
 * Using the same /register and /login endpoints here is what makes login
 * shared between the storefront and the app: one account, one password,
 * one Users table, two clients.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'https://yati-api-7421.azurewebsites.net'

const TOKEN_KEY = 'yati_token'
const EMAIL_KEY = 'yati_email'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredEmail() {
  return localStorage.getItem(EMAIL_KEY)
}

export function setSession(token, email) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EMAIL_KEY, email)
}

/**
 * The token to send with an API call. Firebase tokens expire after about an
 * hour, so for Firebase users this asks the SDK for a current one every time
 * (the SDK refreshes it when needed). Falls back to the stored token for
 * people still on the old password login.
 */
export async function getFreshToken() {
  if (localStorage.getItem('yati_auth_provider') === 'firebase') {
    try {
      const { getFirebaseIdToken } = await import('./firebaseSession')
      const fresh = await getFirebaseIdToken()
      if (fresh) return fresh
    } catch {
      // Firebase couldn't load; fall back to whatever token is stored.
    }
  }
  return getToken()
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
  localStorage.removeItem('yati_auth_provider')
  localStorage.removeItem('yati_session_only')
}

/**
 * "Remember me" unchecked means: stay signed in only while this browser tab
 * session lasts. sessionStorage disappears when the tab closes, so if the
 * session-only flag is set but the per-tab marker is gone, the person closed
 * the browser: drop our copy of the login.
 */
export function enforceSessionOnly() {
  try {
    if (localStorage.getItem('yati_session_only') === '1' && !sessionStorage.getItem('yati_session_alive')) {
      clearSession()
    }
  } catch {
    // storage unavailable: nothing to enforce
  }
}

async function parseJson(res) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

/** Creates a guest order — no account required. */
export async function createOrder(order) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Something went wrong placing your order.')
  return data
}

/**
 * Emails a 6-digit code to the logged-in account's address. Order history
 * stays locked (403 EMAIL_NOT_VERIFIED) until confirmEmailVerification()
 * succeeds — see yati-api emailVerificationCore.js for why.
 */
export async function requestEmailVerification() {
  const token = await getFreshToken()
  if (!token) throw new Error('Not logged in.')
  const res = await fetch(`${API_BASE}/api/verify-email/request`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not send a verification code.')
  return data // { alreadyVerified, message }
}

/** Confirms the emailed 6-digit code. */
export async function confirmEmailVerification(code) {
  const token = await getFreshToken()
  if (!token) throw new Error('Not logged in.')
  const res = await fetch(`${API_BASE}/api/verify-email/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ code }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'That code did not work.')
  return data
}

/**
 * Requests a password-reset code be emailed to this address — same
 * endpoint the yAtI app uses (see PasswordResets table in
 * yati-api-table-storage-reference.md: a 6-digit code, 15-minute expiry,
 * one active code per email). Deliberately does not distinguish "no such
 * account" from "code sent" in the UI layer — that's for the backend to
 * decide; this client just surfaces whatever it returns.
 */
export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE}/api/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not send a reset code. Please try again.')
  return data
}

/** Completes a password reset using the code emailed by forgotPassword(). */
export async function resetPassword(email, code, newPassword) {
  const res = await fetch(`${API_BASE}/api/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not reset your password. Check the code and try again.')
  return data
}

/** Lists orders for the logged-in account. */
export async function listOrders() {
  const token = await getFreshToken()
  if (!token) throw new Error('Not logged in.')
  const res = await fetch(`${API_BASE}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await parseJson(res)
  if (!res.ok) {
    // err.code === 'EMAIL_NOT_VERIFIED' means: show the verify-email prompt.
    const err = new Error(data.error || 'Could not load orders.')
    err.code = data.code
    throw err
  }
  return data.orders || []
}

/** Whether a token is currently stored — used to gate the /dashboard route. */
export function isAuthenticated() {
  return Boolean(getToken())
}

/**
 * Creates a Stripe PaymentIntent covering every order in orderIds (one
 * Stripe payment can cover several Orders rows — the Orders table has no
 * multi-item concept, see yativerse-order-data-flow.md). The backend
 * recomputes the charged amount itself from the stored order totals, so
 * nothing client-side is trusted for the actual amount charged.
 * Returns { clientSecret, totalCents, currency } — clientSecret is what
 * Stripe Elements needs to mount the embedded Payment Element.
 */
export async function createPaymentIntent({ email, orderIds }) {
  const res = await fetch(`${API_BASE}/api/create-payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, orderIds }),
  })
  const data = await parseJson(res)
  if (!res.ok) {
    const err = new Error(data.error || 'Could not start payment.')
    err.code = data.code // e.g. 'ORDER_EXPIRED' (410) when the reservation window passed
    throw err
  }
  return data
}

/**
 * The yAtI mobile app stores daily history as a date-keyed object —
 * { "2026-09-10": { steps, sleepMin, restHr, ... }, "2026-09-11": {...} } —
 * see Map<String,dynamic> _history in ring_controller.dart. That's exactly
 * what gets synced to Azure and exactly what /api/data hands back: a real
 * object, never an array. StepsCard/WorkoutsCard expect an array ordered
 * oldest-to-newest (see SAMPLE_RING_DATA), so this turns the real shape
 * into that shape instead of discarding it.
 *
 * Root cause of the "dashboard shows no data despite a successful sync"
 * bug (confirmed Sept 2026): fetchRingData() used to do
 * `Array.isArray(payload?.history) ? payload.history : []`, which is false
 * for every real synced account (since history is always an object here),
 * so it silently returned [] even when Azure had the real data. Nothing
 * wrong with the sync, the token, or the account — just this parsing step.
 */
function normalizeHistory(history) {
  if (Array.isArray(history)) return history
  if (history && typeof history === 'object') {
    return Object.entries(history)
      .map(([date, entry]) => ({ date, ...(entry && typeof entry === 'object' ? entry : {}) }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  }
  return []
}

/**
 * Fetches the logged-in founder's Ring sync data.
 *
 * The real /api/data response (confirmed Sept 2026 from a live Network tab
 * capture, matching getDataHandler in dataCore.js) is wrapped one level
 * deep: { data: { device, stepGoal, history, workouts } }. This function
 * used to only unwrap a *different*, hypothetical shape — a raw Table
 * Storage entity with a JSON-encoded `dataJson` string field — and never
 * checked for this actual `{ data: {...} }` wrapper. So `payload` stayed
 * as the outer object, `payload.history` etc. were always undefined, and
 * every field silently fell back to its empty default — regardless of how
 * much real data was sitting in Azure. Handles all three shapes now: the
 * real wrapped one, the legacy raw-entity one, and an already-flat one.
 *
 * `history`'s own shape is normalized separately via normalizeHistory()
 * above, so callers can always trust `history`/`workouts` are arrays and
 * never crash on `.length`/`.map` — see StepsCard/WorkoutsCard for the
 * matching empty-state UI when there's genuinely no data yet.
 */
export async function fetchRingData() {
  const token = await getFreshToken()
  if (!token) throw new Error('Not logged in.')
  const res = await fetch(`${API_BASE}/api/data`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const parsed = await parseJson(res)
  if (!res.ok) throw new Error(parsed.error || 'Could not load Ring data.')

  let payload = parsed
  if (typeof parsed?.dataJson === 'string') {
    // Legacy shape: a raw Table Storage entity, sync payload still JSON-encoded.
    try {
      payload = JSON.parse(parsed.dataJson)
    } catch {
      payload = {}
    }
  } else if (parsed && typeof parsed === 'object' && parsed.data && typeof parsed.data === 'object') {
    // Real shape: getDataHandler's { data: { device, stepGoal, history, workouts } }.
    payload = parsed.data
  }

  return {
    device: payload?.device ?? null,
    stepGoal: typeof payload?.stepGoal === 'number' ? payload.stepGoal : null,
    history: normalizeHistory(payload?.history),
    workouts: Array.isArray(payload?.workouts) ? payload.workouts : [],
  }
}

/**
 * Fetches the logged-in founder's plan/permissions — see entitlements.js
 * and plans.js in yati-api. Returns the raw shape GET /api/entitlements
 * sends: { planId, planName, agents: { includedSlots, extraSlots, selected,
 * hasAnyAccess, family }, storage: {...}, aiCapacity: {...}, ... }.
 * Dashboard.jsx uses agents.hasAnyAccess to decide whether to show the
 * live AgentsLaunchCard or its locked/upgrade variant.
 */
export async function getEntitlements() {
  const token = await getFreshToken()
  if (!token) throw new Error('Not logged in.')
  const res = await fetch(`${API_BASE}/api/entitlements`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not load your plan.')
  return data
}

/**
 * Public plan/bundle/add-on catalog (see plansCore.js) — no login required.
 * Returns { plans, bundles, addOns, agentFamily }, same shape as plans.js
 * in yati-api. Powers the "Your Plan" comparison page.
 */
export async function getPlans() {
  const res = await fetch(`${API_BASE}/api/plans`)
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not load plans.')
  return data
}

/**
 * Sets which agents (from agentFamily) fill the account's included+extra
 * slots. Owner-only — yati-api rejects it otherwise. Mirrors listOrders()'s
 * pattern for an authenticated POST.
 */
export async function selectAgents(agentIds) {
  const token = await getFreshToken()
  if (!token) throw new Error('Not logged in.')
  const res = await fetch(`${API_BASE}/api/entitlements/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ agentIds }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not update your agent selection.')
  return data
}

/**
 * Starts a real Stripe Checkout session to move the account onto a paid
 * plan (one of the four core plans — signal/founder/startup/scale; see
 * subscriptionCheckoutCore.js in yati-api). Owner-only, same rule as
 * selectAgents(). Returns { url } — the caller redirects the browser
 * there (window.location.href = url); this is a real Stripe-hosted
 * checkout page, not something built in this app. The plan doesn't
 * actually change until Stripe confirms payment via webhook, so nothing
 * here updates local state optimistically.
 */
export async function createSubscriptionCheckout(planId) {
  const token = await getFreshToken()
  if (!token) throw new Error('Not logged in.')
  const res = await fetch(`${API_BASE}/api/checkout/subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ planId }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.error || 'Could not start checkout.')
  return data
}

// Public waitlist signup (stored in the Waitlist table in yati-api).
export async function joinWaitlist(payload) {
  const res = await fetch(`${API_BASE}/api/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Could not join the waitlist')
  }
  return res.json()
}
