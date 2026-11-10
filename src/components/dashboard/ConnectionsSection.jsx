import { useCallback, useEffect, useState } from 'react'
import { Mail, CalendarDays, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { listConnections, connectApp, disconnectApp } from '../../lib/foundersApi'

const APPS = {
  gmail: {
    name: 'Gmail',
    icon: Mail,
    use: 'Approved drafts are sent from this Gmail account, so they appear in your Sent folder.',
  },
  calendar: {
    name: 'Google Calendar',
    icon: CalendarDays,
    use: 'Lets your agents see your schedule (coming soon).',
  },
}

/**
 * Settings → Connected accounts: the user's own Gmail and Google Calendar, signed in
 * through Google (via Composio). Connecting leaves the page for Google's consent screen
 * and comes back here with ?connected=<app>.
 */
export default function ConnectionsSection({ demo, showToast }) {
  const [rows, setRows] = useState(null)       // null = loading
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')         // app currently connecting / disconnecting

  const load = useCallback(async () => {
    try {
      const data = await listConnections()
      setRows(data.connections || [])
      setError('')
    } catch (err) {
      setRows([])
      setError(err.message || "Couldn't load your connected accounts")
    }
  }, [])

  useEffect(() => {
    if (demo) { setRows([]); return }
    load()
  }, [demo, load])

  // Back from Google's consent screen: say what happened, then tidy the address bar.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const app = params.get('connected')
    if (!app || !APPS[app]) return
    const failed = ['failed', 'error'].includes((params.get('status') || '').toLowerCase())
    showToast(failed ? `${APPS[app].name} wasn't connected. Try again.` : `${APPS[app].name} connected`,
              failed ? 'error' : 'success')
    window.history.replaceState(null, '', window.location.pathname)
  }, [showToast])

  async function connect(app) {
    setBusy(app)
    try {
      const { redirect_url: url } = await connectApp(app)
      window.location.assign(url)   // Google sign-in; returns to this page
    } catch (err) {
      showToast(err.message || `Couldn't start connecting ${APPS[app].name}`, 'error')
      setBusy('')
    }
  }

  async function disconnect(app) {
    if (!window.confirm(`Disconnect ${APPS[app].name}? Approved drafts will no longer be sent from it.`)) return
    setBusy(app)
    try {
      await disconnectApp(app)
      showToast(`${APPS[app].name} disconnected`, 'success')
      await load()
    } catch (err) {
      showToast(err.message || `Couldn't disconnect ${APPS[app].name}`, 'error')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="p-6">
      <h2 className="font-display text-base font-semibold text-white">Connected Accounts</h2>
      <p className="mt-0.5 text-xs text-white/40">
        Connect your own Google account. You sign in with Google directly; we never see your password.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {rows === null && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Loader2 size={13} className="animate-spin" /> Loading…
          </div>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}

        {rows?.filter((r) => APPS[r.app]).map((r) => {
          const { name, icon: Icon, use } = APPS[r.app]
          const needsReconnect = !r.connected && r.status   // connected once, no longer working
          return (
            <div key={r.app} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/70">
                <Icon size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{name}</p>
                {r.connected ? (
                  <p className="flex items-center gap-1.5 truncate text-xs text-emerald-400">
                    <CheckCircle size={12} className="shrink-0" />
                    <span className="truncate">Connected{r.account ? ` as ${r.account}` : ''}</span>
                  </p>
                ) : needsReconnect ? (
                  <p className="flex items-center gap-1.5 text-xs text-amber-400">
                    <AlertCircle size={12} className="shrink-0" /> Needs reconnecting
                  </p>
                ) : (
                  <p className="text-xs text-white/40">{r.available ? 'Not connected' : 'Not available yet'}</p>
                )}
                <p className="mt-1 text-[11px] leading-4 text-white/30">{use}</p>
              </div>
              {r.available && (
                r.connected ? (
                  <button
                    onClick={() => disconnect(r.app)}
                    disabled={busy === r.app}
                    className="shrink-0 rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-40"
                  >
                    {busy === r.app ? <Loader2 size={13} className="animate-spin" /> : 'Disconnect'}
                  </button>
                ) : (
                  <button
                    onClick={() => connect(r.app)}
                    disabled={busy === r.app || demo}
                    className="shrink-0 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-40"
                  >
                    {busy === r.app ? <Loader2 size={13} className="animate-spin" /> : needsReconnect ? 'Reconnect' : 'Connect'}
                  </button>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
