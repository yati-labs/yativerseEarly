import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { CONSENT_CHANGED_EVENT, getConsent, setConsent } from '../../lib/foundersApi'

// Consent before third-party AI processing (App Store 5.1.2, launch board APP-03).
// The wording comes from the server (GET /api/v1/consent), so it matches the iPhone
// app and changes without a release. The server only asks when AI_CONSENT_REQUIRED is on.

const DISMISSED_KEY = 'yati_ai_consent_dismissed'

function useConsent(enabled) {
  const [status, setStatus] = useState(null)
  useEffect(() => {
    if (!enabled) return undefined
    let live = true
    const load = () => getConsent().then((s) => live && setStatus(s)).catch(() => {})
    load()
    window.addEventListener(CONSENT_CHANGED_EVENT, load)
    return () => { live = false; window.removeEventListener(CONSENT_CHANGED_EVENT, load) }
  }, [enabled])
  return [status, setStatus]
}

async function choose(accepted, setStatus) {
  const next = await setConsent(accepted)
  setStatus(next)
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT))
  return next
}

function Points({ text }) {
  return (
    <>
      <p className="text-sm leading-6 text-white/70">{text.body}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-white/75">
        {text.points.map((p) => (
          <li key={p} className="flex gap-2"><span className="text-brand-gold">•</span><span>{p}</span></li>
        ))}
      </ul>
    </>
  )
}

/** Asks once, on any dashboard page, while the server says to ask. "Not now" hides it for this visit. */
export function AiConsentPrompt() {
  const { demo } = useAuth()
  const [status, setStatus] = useConsent(!demo)
  const [hidden, setHidden] = useState(() => {
    try { return sessionStorage.getItem(DISMISSED_KEY) === '1' } catch { return false }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  if (demo || hidden || !status?.ask) return null
  const t = status.text

  async function allow() {
    setSaving(true)
    setError(null)
    try {
      await choose(true, setStatus)
    } catch (err) {
      setError(err.message || "Couldn't save your choice. Try again.")
    } finally {
      setSaving(false)
    }
  }

  function notNow() {
    try { sessionStorage.setItem(DISMISSED_KEY, '1') } catch { /* storage unavailable */ }
    setHidden(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" role="dialog" aria-modal="true" aria-labelledby="ai-consent-title">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-brand-bg2 p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple"><Sparkles size={18} /></span>
          <h2 id="ai-consent-title" className="font-display text-lg font-semibold text-white">{t.title}</h2>
        </div>
        <Points text={t} />
        {t.reminder && <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60">{t.reminder}</p>}
        <p className="mt-3 text-xs text-white/40">
          Details in our <Link to="/privacy-policy" className="underline hover:text-white/70">privacy policy</Link>. You can change this any time in Settings.
        </p>
        {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button onClick={notNow} className="rounded-lg px-4 py-2 text-sm font-semibold text-white/60 hover:text-white">{t.decline}</button>
          <button onClick={allow} disabled={saving} className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
            {saving ? 'Saving…' : t.allow}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Settings: see and change the choice. Shown only while the server asks for consent. */
export function AiConsentSwitch({ demo, showToast }) {
  const [status, setStatus] = useConsent(!demo)
  const [saving, setSaving] = useState(false)
  if (demo || !status?.required) return null
  const on = !!status.accepted_version && !status.ask

  async function toggle() {
    if (on && !window.confirm('Turn off AI processing? New recordings will wait, and AI features stop until you turn it back on.')) return
    setSaving(true)
    try {
      await choose(!on, setStatus)
      try { sessionStorage.removeItem(DISMISSED_KEY) } catch { /* storage unavailable */ }
      showToast(on ? 'AI processing turned off' : 'AI processing turned on', 'success')
    } catch (err) {
      showToast(err.message || "Couldn't change AI processing", 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-semibold text-white">AI processing</h2>
          <p className="mt-1 text-xs text-white/45">
            {on
              ? `On since ${new Date(status.accepted_at).toLocaleDateString()}.`
              : 'Off. Recordings wait and AI features are paused until you turn it on.'}
          </p>
        </div>
        <button
          role="switch"
          aria-checked={on}
          aria-label="AI processing"
          onClick={toggle}
          disabled={saving}
          className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${on ? 'bg-brand-purple' : 'bg-white/15'}`}
        >
          <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-all ${on ? 'left-[23px]' : 'left-[3px]'}`} />
        </button>
      </div>
      <div className="mt-4"><Points text={status.text} /></div>
    </div>
  )
}
