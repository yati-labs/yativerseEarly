/**
 * Live status of the first-100 early signup offer. The server is the only source of truth for eligibility,
 * remaining places and the redemption deadline. If the call fails or the offer is not active, the page shows regular
 * pricing and no urgency. Contract (proposed): GET /api/offers/status -> { earlySignup: { active: boolean, remaining?: number, endsAt?: string } }
 */
const API_BASE = import.meta.env.VITE_API_BASE || 'https://yati-api-7421.azurewebsites.net'

export async function getOfferStatus() {
  const off = { active: false }
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 3500)
    const res = await fetch(`${API_BASE}/api/offers/status`, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return off
    const data = await res.json()
    const e = data && data.earlySignup
    if (!e || e.active !== true) return off
    return {
      active: true,
      remaining: Number.isFinite(e.remaining) ? e.remaining : null,
      endsAt: typeof e.endsAt === 'string' ? e.endsAt : null,
    }
  } catch {
    return off
  }
}
