/**
 * API client for founder-agents-api (Render).
 * Mirrors the shape of api.js but points at the founder-agents backend.
 *
 * Auth: uses founders_token from localStorage (set by loginFoundersOS in api.js).
 * Swapped for Firebase ID token when Firebase migration lands — only this file changes.
 */

const FOUNDERS_API_BASE =
  import.meta.env.VITE_FOUNDERS_API_BASE ||
  'https://founder-agents-api.onrender.com'

const FOUNDERS_TOKEN_KEY = 'founders_token'

export function getFoundersToken() {
  return localStorage.getItem(FOUNDERS_TOKEN_KEY)
}

export function setFoundersToken(token) {
  localStorage.setItem(FOUNDERS_TOKEN_KEY, token)
}

export function clearFoundersToken() {
  localStorage.removeItem(FOUNDERS_TOKEN_KEY)
}

async function parseJson(res) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

export const AUTH_EXPIRED_EVENT = 'founders:auth-expired'

function signalAuthExpired() {
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
}

/** True when there is no token, or its exp claim has passed. Unreadable tokens count as valid. */
function isTokenExpired(token) {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()
  } catch {
    return false
  }
}

async function apiFetch(path, options = {}) {
  // Firebase users send their Firebase ID token (founder-agents-api verifies it
  // and checks access with yati-api). People still on the old password login
  // keep using the separate founders token until they move over.
  const { getFreshToken } = await import('./api')
  const token = localStorage.getItem('yati_auth_provider') === 'firebase'
    ? await getFreshToken()
    : getFoundersToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  let res
  try {
    res = await fetch(`${FOUNDERS_API_BASE}${path}`, { ...options, headers })
  } catch (err) {
    // The API's 401 responses carry no CORS headers, so the browser hides them
    // and fetch throws instead. An expired token is the usual cause.
    // Only when there WAS a token and it ran out. A visitor who was never
    // signed in must not get a "session expired" pop-up.
    if (token && isTokenExpired(token)) {
      signalAuthExpired()
      const expired = new Error('Your session expired. Please sign in again.')
      expired.status = 401
      throw expired
    }
    throw err
  }
  const data = await parseJson(res)
  if (res.status === 401 && token) signalAuthExpired()
  if (!res.ok) {
    const failure = new Error(data.detail || data.error || 'Request failed')
    failure.status = res.status
    throw failure
  }
  return data
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Called by loginFoundersOS in api.js — not used directly by components. */
export async function loginFounders(username, password) {
  const res = await fetch(`${FOUNDERS_API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.detail || 'Founders login failed')
  setFoundersToken(data.token)
  return data
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export async function listContacts(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/api/v1/contacts${qs ? `?${qs}` : ''}`)
}

/** Adds a contact by email (or returns the caller's existing one). Returns { id, name, email, created }. */
export async function addContact(email, name) {
  return apiFetch('/api/v1/contacts', {
    method: 'POST',
    body: JSON.stringify({ email, ...(name ? { name } : {}) }),
  })
}

export async function getContact(contactId) {
  return apiFetch(`/api/v1/contacts/${contactId}`)
}

export async function generateDraft(contactId) {
  return apiFetch(`/api/v1/contacts/${contactId}/draft-outreach`, { method: 'POST' })
}

// ---------------------------------------------------------------------------
// Approvals (Drafts)
// ---------------------------------------------------------------------------

export async function listApprovals() {
  return apiFetch('/api/v1/approvals')
}

export async function getApproval(draftId) {
  return apiFetch(`/api/v1/approvals/${draftId}`)
}

/** Saves an edit as a new revision. `version` must match the draft's current version. */
export async function editApproval(draftId, { newBody, newSubject, version }) {
  return apiFetch(`/api/v1/approvals/${draftId}/edit`, {
    method: 'POST',
    body: JSON.stringify({ new_body: newBody, new_subject: newSubject, version }),
  })
}

/** Asks the AI for a rewrite. Returns { suggested_body } and saves nothing. */
export async function rewriteApproval(draftId, instruction = '') {
  return apiFetch(`/api/v1/approvals/${draftId}/rewrite`, {
    method: 'POST',
    body: JSON.stringify({ instruction }),
  })
}

export async function createDraft({ contactId, subject, body }) {
  return apiFetch('/api/v1/approvals/create', {
    method: 'POST',
    body: JSON.stringify({ contact_id: contactId, subject, body }),
  })
}

/** AI-written subject + body for a contact. Returns { subject, body } and saves nothing. */
export async function generateForContact(contactId, instruction = '') {
  return apiFetch('/api/v1/approvals/generate-for-contact', {
    method: 'POST',
    body: JSON.stringify({ contact_id: contactId, instruction }),
  })
}

export async function unlockContactEmail(contactId) {
  return apiFetch(`/api/v1/contacts/${contactId}/unlock-email`, { method: 'POST' })
}

export async function approveApproval(approvalId) {
  return apiFetch(`/api/v1/approvals/${approvalId}/approve`, { method: 'POST' })
}

/** The API requires `notes` on reject. */
export async function rejectApproval(approvalId, notes = 'Rejected from dashboard') {
  return apiFetch(`/api/v1/approvals/${approvalId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
}

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------

export async function listDeals() {
  return apiFetch('/api/v1/deals')
}

// ---------------------------------------------------------------------------
// Sessions (Chat)
// ---------------------------------------------------------------------------

export async function listSessions() {
  return apiFetch('/api/v1/chat/sessions')
}

export async function getChatSession(sessionId) {
  return apiFetch(`/api/v1/chat/sessions/${sessionId}`)
}

export async function saveSession(sessionId, messages, pendingHitl = null) {
  return apiFetch('/api/v1/chat/sessions/save', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId || undefined,
      messages,
      pending_hitl: pendingHitl,
    }),
  })
}

export async function deleteSession(sessionId) {
  return apiFetch(`/api/v1/chat/sessions/${sessionId}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------------------
// Orchestrator (Chat send)
// ---------------------------------------------------------------------------

export async function sendMessage(message) {
  return apiFetch('/api/v1/orchestrator/run', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

// ---------------------------------------------------------------------------
// Prospecting approve
// ---------------------------------------------------------------------------

export async function approveProspecting(runId, approvedContactIds) {
  return apiFetch('/api/v1/prospecting/approve', {
    method: 'POST',
    body: JSON.stringify({ run_id: runId, approved_contact_ids: approvedContactIds }),
  })
}

// ---------------------------------------------------------------------------
// Settings — ICP
// ---------------------------------------------------------------------------

export async function getIcpSettings() {
  return apiFetch('/api/v1/settings/icp')
}

export async function updateIcpSettings(payload) {
  return apiFetch('/api/v1/settings/icp', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

// ---------------------------------------------------------------------------
// Settings — Product / Seller context
// ---------------------------------------------------------------------------

export async function getProductSettings() {
  return apiFetch('/api/v1/settings/product')
}

export async function updateProductSettings(payload) {
  return apiFetch('/api/v1/settings/product', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/** Scrape a URL and return AI-suggested description + ICP fields. */
export async function scrapeProductUrl(url) {
  return apiFetch('/api/v1/settings/product/scrape', {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

// ---------------------------------------------------------------------------
// Meetings (recorder pen) — open to every signed-in user, no Founder OS needed
// ---------------------------------------------------------------------------

export async function listMeetings() {
  return apiFetch('/api/v1/meetings')
}

/** Summary, transcript and a 1-hour audio_url (null once the audio is deleted). */
export async function getMeeting(meetingId) {
  return apiFetch(`/api/v1/meetings/${meetingId}`)
}

/** Meetings that contain `query` (2 to 100 characters), each with `match`: {field, text, start?, speaker?}. */
export async function searchMeetings(query) {
  return apiFetch(`/api/v1/meetings?q=${encodeURIComponent(query)}`)
}

/** Names speakers in one meeting ({label: name}; empty = default). Returns {speaker_names}. */
export async function nameSpeakers(meetingId, names) {
  return apiFetch(`/api/v1/meetings/${meetingId}/speakers`, {
    method: 'PUT',
    body: JSON.stringify({ names }),
  })
}

export async function retryMeeting(meetingId) {
  return apiFetch(`/api/v1/meetings/${meetingId}/retry`, { method: 'POST' })
}

export async function deleteMeeting(meetingId) {
  return apiFetch(`/api/v1/meetings/${meetingId}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------------------
// Settings — SMTP
// ---------------------------------------------------------------------------

export async function getSmtpSettings() {
  return apiFetch('/api/v1/settings/smtp')
}

export async function updateSmtpSettings(payload) {
  return apiFetch('/api/v1/settings/smtp', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function testSmtp(payload) {
  return apiFetch('/api/v1/settings/smtp/test', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
