import { useCallback, useEffect, useState } from 'react'
import { Mail, CalendarDays, Loader2, CheckCircle, AlertCircle, TrendingUp, Hash } from 'lucide-react'
import {
  listConnections, connectApp, disconnectApp, getInboxAssistant, setInboxAssistant,
  listSlackChannels, getSlackDestination, setSlackDestination, sendSlackTest, sendSlackDigest,
} from '../../lib/foundersApi'

const APPS = {
  gmail: {
    name: 'Gmail',
    icon: Mail,
    use: 'Approved drafts are sent from this Gmail account, and replies from your leads are tracked.',
  },
  calendar: {
    name: 'Google Calendar',
    icon: CalendarDays,
    use: 'Lets your assistant suggest free times when drafting replies, and see your meetings.',
  },
  hubspot: {
    name: 'HubSpot',
    icon: TrendingUp,
    use: 'Your contacts and deals are copied from your own HubSpot, read-only. Nothing is changed in HubSpot.',
  },
  slack: {
    name: 'Slack',
    icon: Hash,
    use: 'Your morning digest of drafts and replies, and alerts for deals at risk, in your own Slack. yAtI only posts; it never reads your messages.',
  },
}

/**
 * Settings → Connected accounts: the user's own Gmail, Google Calendar and HubSpot, signed in
 * directly with Google or HubSpot (via Composio). Connecting leaves the page for the consent
 * screen and comes back here with ?connected=<app>.
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
        Connect your own accounts. You sign in with Google or HubSpot directly; we never see your password.
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
            <div key={r.app}>
            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
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
            {r.app === 'gmail' && r.connected && !demo && <InboxAssistantSwitch showToast={showToast} />}
            {r.app === 'slack' && r.connected && !demo && <SlackDestination showToast={showToast} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** "Let the assistant read my whole inbox": off by default, separate from connecting Gmail. */
function InboxAssistantSwitch({ showToast }) {
  const [enabled, setEnabled] = useState(null)   // null = loading
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getInboxAssistant().then((r) => setEnabled(!!r.enabled)).catch(() => setEnabled(false))
  }, [])

  async function toggle() {
    const next = !enabled
    setSaving(true)
    try {
      await setInboxAssistant(next)
      setEnabled(next)
      showToast(next ? 'Inbox assistant turned on' : 'Inbox assistant turned off', 'success')
    } catch (err) {
      showToast(err.message || "Couldn't change the inbox assistant", 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-2 rounded-xl border border-brand-purple/30 bg-brand-purple/5 p-4 sm:ml-[52px]">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-white">Let the assistant read my whole inbox</p>
          <p className="mt-0.5 text-xs leading-5 text-white/45">
            Turns on the Inbox page, daily summaries and "draft a reply" for any email. When off, the
            assistant only sees emails with your Founder OS contacts.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={!!enabled}
          aria-label="Inbox assistant"
          onClick={toggle}
          disabled={enabled === null || saving}
          className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${enabled ? 'bg-brand-purple' : 'bg-white/15'}`}
        >
          <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-all ${enabled ? 'left-[23px]' : 'left-[3px]'}`} />
        </button>
      </div>
      <ul className="mt-3 space-y-1 text-[11.5px] text-white/45">
        <li><span className="text-emerald-300">✓</span> Reads subject and preview to summarise; opens a full email only to draft a reply</li>
        <li><span className="text-emerald-300">✓</span> Writes drafts that wait for your approval</li>
        <li><span className="text-brand-rose">✕</span> Never sends, forwards or deletes on its own</li>
        <li><span className="text-brand-rose">✕</span> Emails aren't stored; only replies from people you emailed are kept (first 500 characters)</li>
      </ul>
    </div>
  )
}

/** Where yAtI posts in the user's own Slack: a DM to them, or one of their channels. */
function SlackDestination({ showToast }) {
  const [dest, setDest] = useState(null)        // { destination, name }
  const [channels, setChannels] = useState(null)
  const [busy, setBusy] = useState('')

  useEffect(() => {
    getSlackDestination().then(setDest).catch(() => setDest({ destination: 'dm', name: 'Direct message to you' }))
    listSlackChannels().then((r) => setChannels(r.channels || [])).catch(() => setChannels([]))
  }, [])

  async function choose(value) {
    setBusy('dest')
    try {
      const r = await setSlackDestination(value)
      setDest(r)
      showToast(value === 'dm' ? 'yAtI will message you directly' : `yAtI will post in ${r.name}`, 'success')
    } catch (err) {
      showToast(err.message || "Couldn't change where yAtI posts", 'error')
    } finally {
      setBusy('')
    }
  }

  async function run(kind) {
    setBusy(kind)
    try {
      if (kind === 'test') {
        await sendSlackTest()
        showToast('Test message sent. Check Slack', 'success')
      } else {
        const r = await sendSlackDigest()
        showToast(r.status === 'posted' ? 'Digest sent. Check Slack' : 'Nothing to send: no drafts or new replies', 'success')
      }
    } catch (err) {
      showToast(err.message || "Couldn't post to Slack", 'error')
    } finally {
      setBusy('')
    }
  }

  const value = dest?.destination ?? 'dm'
  return (
    <div className="mt-2 rounded-xl border border-brand-purple/30 bg-brand-purple/5 p-4 sm:ml-[52px]">
      <p className="text-[13px] font-semibold text-white">Where should yAtI post?</p>
      <select
        value={value}
        onChange={(e) => choose(e.target.value)}
        disabled={dest === null || busy === 'dest'}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25 disabled:opacity-50"
      >
        <option value="dm">A direct message to me (private)</option>
        {(channels || []).map((c) => (
          <option key={c.id} value={c.id}>#{c.name}{c.private ? ' (private)' : ''}</option>
        ))}
      </select>
      {value !== 'dm' && (
        <p className="mt-2 text-[11.5px] text-brand-gold2/90">Everyone in this channel will see your drafts and deal alerts.</p>
      )}
      <ul className="mt-3 space-y-1 text-[11.5px] text-white/45">
        <li><span className="text-emerald-300">✓</span> Morning digest of drafts to approve and new replies</li>
        <li><span className="text-emerald-300">✓</span> Alerts when one of your deals is at risk</li>
        <li><span className="text-brand-rose">✕</span> Never sends emails from Slack: buttons open yAtI to approve</li>
        <li><span className="text-brand-rose">✕</span> Never reads your Slack messages</li>
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => run('test')}
          disabled={!!busy}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:text-white disabled:opacity-40"
        >
          {busy === 'test' ? 'Sending…' : 'Send a test message'}
        </button>
        <button
          onClick={() => run('digest')}
          disabled={!!busy}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:text-white disabled:opacity-40"
        >
          {busy === 'digest' ? 'Sending…' : 'Send my digest now'}
        </button>
      </div>
    </div>
  )
}
