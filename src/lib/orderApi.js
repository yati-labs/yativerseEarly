// Calls to yati-api for the device + plan checkout. Prices always come from the server.
const API_BASE = import.meta.env.VITE_API_BASE || 'https://yati-api-7421.azurewebsites.net'

async function request(path, options) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, options)
  } catch {
    throw new Error('We could not reach the server. Check your connection and try again.')
  }
  let data = {}
  try { data = await res.json() } catch { /* empty body */ }
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}

/** Starts a checkout. selection = { deviceId, commitment, captureId, sparkId }. Returns { orderId, clientSecret, quote }. */
export function createOrderCheckout({ email, selection, consent }) {
  return request('/api/checkout/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, selection, consent }),
  })
}

/** Payment state for the confirmation page. Returns { orderId, status, paid }. */
export function getOrderStatus(sessionId) {
  return request(`/api/checkout/order-status?session_id=${encodeURIComponent(sessionId)}`)
}
