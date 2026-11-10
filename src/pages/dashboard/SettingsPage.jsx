import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Save, Loader2, CheckCircle, AlertCircle, X, Globe, Send, LogOut, ChevronDown,
} from 'lucide-react'
import Sidebar from '../../components/dashboard/Sidebar'
import ConnectionsSection from '../../components/dashboard/ConnectionsSection'
import { useAuth } from '../../lib/auth'
import { getEntitlements } from '../../lib/api'
import {
  getIcpSettings, updateIcpSettings,
  getProductSettings, updateProductSettings, scrapeProductUrl,
  getSmtpSettings, updateSmtpSettings, testSmtp,
} from '../../lib/foundersApi'

const COMPANY_SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

// ---------------------------------------------------------------------------
// Tag input — press Enter or comma to add, × to remove
// ---------------------------------------------------------------------------
function TagInput({ tags, onChange, placeholder }) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  function add(value) {
    const v = value.trim().toLowerCase()
    if (v && !tags.includes(v)) onChange([...tags, v])
    setDraft('')
  }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div
      className="flex min-h-[42px] flex-wrap gap-1.5 cursor-text rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 focus-within:border-white/20"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((t) => (
        <span key={t} className="flex items-center gap-1 rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-xs text-white/70">
          {t}
          <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))}>
            <X size={10} className="text-white/40 hover:text-white" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => draft && add(draft)}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="min-w-[120px] flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared input class
// ---------------------------------------------------------------------------
const inputCls = 'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20'

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40">{label}</label>
      {hint && <p className="mb-1.5 text-[11px] text-white/30">{hint}</p>}
      {children}
    </div>
  )
}

function Divider() {
  return <hr className="border-white/5" />
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const { email, demo, logout } = useAuth()
  const [entitlements, setEntitlements] = useState(null)
  const [toast, setToast] = useState(null)

  // ---- Your Company ----
  const [product, setProduct] = useState({ company_name: '', product_url: '', product_description: '' })
  const [productSaving, setProductSaving] = useState(false)
  const [productSaved, setProductSaved] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [scrapeStatus, setScrapeStatus] = useState('')

  // ---- ICP ----
  const [icp, setIcp] = useState({ target_industries: [], target_company_sizes: [], pain_keywords: [] })
  const [icpSaving, setIcpSaving] = useState(false)
  const [icpSaved, setIcpSaved] = useState(false)

  // ---- SMTP ----
  const [smtp, setSmtp] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_tls: true,
    tracking_base_url: '',
  })
  const [smtpSaving, setSmtpSaving] = useState(false)
  const [smtpSaved, setSmtpSaved] = useState(false)
  const [smtpTesting, setSmtpTesting] = useState(false)
  // SMTP is the fallback for non-Gmail providers: folded away unless already set up.
  const [smtpOpen, setSmtpOpen] = useState(false)

  useEffect(() => {
    if (demo) { setEntitlements({ planName: 'Founder', status: 'trial' }); return }
    getEntitlements().then(setEntitlements).catch(() => setEntitlements(null))
    getProductSettings().then(setProduct).catch(() => {})
    getIcpSettings().then(setIcp).catch(() => {})
    getSmtpSettings().then((data) => {
      setSmtp((s) => ({ ...s, ...data }))
      if (data?.smtp_host && data?.smtp_from_email && data?.smtp_password) setSmtpOpen(true)
    }).catch(() => {})
  }, [demo])

  const showToast = useCallback((message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  function flashSaved(setter) {
    setter(true)
    setTimeout(() => setter(false), 2500)
  }

  // Security dropdown → auto-update port + tls flag
  function handleSecurityChange(value) {
    if (value === 'starttls') {
      setSmtp((s) => ({ ...s, smtp_tls: true, smtp_port: 587 }))
    } else {
      setSmtp((s) => ({ ...s, smtp_tls: false, smtp_port: 465 }))
    }
  }

  // Auto-fill Gmail SMTP values
  function fillGmailSettings() {
    setSmtp((s) => ({
      ...s,
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_tls: true,
      smtp_from_email: s.smtp_from_email || s.smtp_user || '',
    }))
  }

  // ---- Your Company handlers ----
  async function handleScrape() {
    if (!product.product_url) { setScrapeStatus('Enter a URL first'); return }
    if (demo) { showToast('Sign in to use auto-fill', 'error'); return }
    setScraping(true)
    setScrapeStatus('')
    try {
      const res = await scrapeProductUrl(product.product_url)
      setProduct((p) => ({ ...p, product_description: res.description || p.product_description }))
      if (res.industries?.length && icp.target_industries.length === 0)
        setIcp((i) => ({ ...i, target_industries: res.industries }))
      if (res.pain_keywords?.length && icp.pain_keywords.length === 0)
        setIcp((i) => ({ ...i, pain_keywords: res.pain_keywords }))
      if (res.company_sizes?.length && icp.target_company_sizes.length === 0)
        setIcp((i) => ({ ...i, target_company_sizes: res.company_sizes }))
      setScrapeStatus('Description extracted — review and save')
    } catch (err) {
      setScrapeStatus(err.message || 'Fetch failed')
    } finally {
      setScraping(false)
    }
  }

  async function handleSaveProduct() {
    if (demo) { showToast('Sign in to save settings', 'error'); return }
    setProductSaving(true)
    try {
      await updateProductSettings(product)
      flashSaved(setProductSaved)
    } catch (err) {
      showToast(err.message || 'Save failed', 'error')
    } finally {
      setProductSaving(false)
    }
  }

  // ---- ICP handlers ----
  async function handleSaveIcp() {
    if (demo) { showToast('Sign in to save settings', 'error'); return }
    setIcpSaving(true)
    try {
      await updateIcpSettings(icp)
      flashSaved(setIcpSaved)
    } catch (err) {
      showToast(err.message || 'Save failed', 'error')
    } finally {
      setIcpSaving(false)
    }
  }

  // ---- SMTP handlers ----
  async function handleSaveSmtp() {
    if (demo) { showToast('Sign in to save settings', 'error'); return }
    setSmtpSaving(true)
    try {
      await updateSmtpSettings(smtp)
      flashSaved(setSmtpSaved)
    } catch (err) {
      showToast(err.message || 'Save failed', 'error')
    } finally {
      setSmtpSaving(false)
    }
  }

  async function handleTestSmtp() {
    if (demo) { showToast('Sign in to test SMTP', 'error'); return }
    setSmtpTesting(true)
    try {
      const res = await testSmtp(smtp)
      showToast(`Test email sent to ${res.sent_to}`, 'success')
    } catch (err) {
      showToast(err.message || 'SMTP test failed', 'error')
    } finally {
      setSmtpTesting(false)
    }
  }

  const securityValue = smtp.smtp_tls ? 'starttls' : 'ssl'

  return (
    <div className="flex min-h-screen bg-brand-bg font-body text-white">
      <Sidebar onLogout={logout} planLabel={entitlements?.planName} planStatus={entitlements?.status} />

      <main className="flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-white/40">
            Configure your company context, ICP, and email sending.
            {demo && ' · sample data — sign in to save'}
          </p>
        </div>

        <div className="flex max-w-2xl flex-col gap-0 rounded-2xl border border-white/5 bg-white/[0.02]">

          {/* ================================================================
              YOUR COMPANY
          ================================================================ */}
          <div className="p-6">
            <h2 className="font-display text-base font-semibold text-white">Your Company</h2>
            <p className="mt-0.5 text-xs text-white/40">
              Tell the AI about your product. This context is injected into every outreach and follow-up draft so emails sound like they come from a real founder.
            </p>

            <div className="mt-5 flex flex-col gap-4">
              <Field label="Company Name">
                <input
                  className={inputCls}
                  placeholder="e.g. Acme Inc."
                  value={product.company_name}
                  onChange={(e) => setProduct((p) => ({ ...p, company_name: e.target.value }))}
                />
              </Field>

              <Field label="Product URL" hint="optional — fetch to auto-fill description">
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    placeholder="https://yourproduct.com"
                    value={product.product_url}
                    onChange={(e) => setProduct((p) => ({ ...p, product_url: e.target.value }))}
                  />
                  <button
                    onClick={handleScrape}
                    disabled={scraping}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-white/50 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {scraping ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
                    {scraping ? 'Fetching…' : 'Fetch & Fill'}
                  </button>
                </div>
                {scrapeStatus && (
                  <p className="mt-1.5 text-[11px] text-white/40">{scrapeStatus}</p>
                )}
              </Field>

              <Field label="Product Description" hint="2-3 sentences: what it does, who it's for, and the core value proposition.">
                <textarea
                  className={`${inputCls} resize-none leading-relaxed`}
                  rows={4}
                  placeholder="e.g. Acme automates dispatch scheduling for logistics operators, cutting manual coordination time by 40%…"
                  value={product.product_description}
                  onChange={(e) => setProduct((p) => ({ ...p, product_description: e.target.value }))}
                />
              </Field>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-5">
              <button
                onClick={handleSaveProduct}
                disabled={productSaving}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-5 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {productSaving ? <Loader2 size={13} className="animate-spin" /> : productSaved ? <CheckCircle size={13} className="text-emerald-400" /> : <Save size={13} />}
                {productSaving ? 'Saving…' : productSaved ? 'Saved' : 'Save Company Info'}
              </button>
            </div>
          </div>

          <Divider />

          {/* ================================================================
              ICP SETTINGS
          ================================================================ */}
          <div className="p-6">
            <h2 className="font-display text-base font-semibold text-white">ICP Settings</h2>
            <p className="mt-0.5 text-xs text-white/40">
              Define your Ideal Customer Profile. These settings control how leads are scored and which contacts get prioritised for outreach.
            </p>

            <div className="mt-5 flex flex-col gap-4">
              <Field label="Target Industries" hint="Contacts in these industries score higher. Press Enter or comma to add.">
                <TagInput
                  tags={icp.target_industries}
                  onChange={(v) => setIcp((i) => ({ ...i, target_industries: v }))}
                  placeholder="Add industry…"
                />
              </Field>

              <Field label="Target Company Sizes" hint="Select all employee ranges that match your ICP.">
                <div className="flex flex-wrap gap-2 pt-1">
                  {COMPANY_SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const sizes = icp.target_company_sizes
                        setIcp((i) => ({
                          ...i,
                          target_company_sizes: sizes.includes(s)
                            ? sizes.filter((x) => x !== s)
                            : [...sizes, s],
                        }))
                      }}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        icp.target_company_sizes.includes(s)
                          ? 'border-blue-400/40 bg-blue-400/10 text-blue-300'
                          : 'border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70'
                      }`}
                    >
                      {s === '1000+' ? '1000+' : s.replace('-', '–')}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Pain Keywords" hint="Words in a contact's job title that indicate they experience the pain your product solves. Press Enter or comma to add.">
                <TagInput
                  tags={icp.pain_keywords}
                  onChange={(v) => setIcp((i) => ({ ...i, pain_keywords: v }))}
                  placeholder="Add keyword…"
                />
              </Field>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-5">
              <button
                onClick={handleSaveIcp}
                disabled={icpSaving}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-5 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {icpSaving ? <Loader2 size={13} className="animate-spin" /> : icpSaved ? <CheckCircle size={13} className="text-emerald-400" /> : <Save size={13} />}
                {icpSaving ? 'Saving…' : icpSaved ? 'Saved' : 'Save ICP'}
              </button>
            </div>
          </div>

          <Divider />

          {/* ================================================================
              CONNECTED ACCOUNTS (Gmail, Google Calendar)
          ================================================================ */}
          <ConnectionsSection demo={demo} showToast={showToast} />

          <Divider />

          {/* ================================================================
              EMAIL SENDING (SMTP) — for providers other than Gmail
          ================================================================ */}
          <div className="p-6">
            <button
              onClick={() => setSmtpOpen((o) => !o)}
              aria-expanded={smtpOpen}
              className="flex w-full items-center gap-2 text-left"
            >
              <div className="flex-1">
                <h2 className="font-display text-base font-semibold text-white">Other Email Provider (SMTP)</h2>
                <p className="mt-0.5 text-xs text-white/40">
                  Not on Gmail? Send approved drafts through your provider's SMTP server instead (Outlook, Zoho, your own domain). A connected Gmail is used first.
                </p>
              </div>
              <ChevronDown size={16} className={`shrink-0 text-white/40 transition ${smtpOpen ? 'rotate-180' : ''}`} />
            </button>

            {smtpOpen && (<>

            {/* Gmail tip */}
            <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-blue-400">Using Gmail?</p>
              <ol className="mb-3 list-decimal pl-4 text-xs leading-6 text-white/50 marker:text-white/30">
                <li>Go to <span className="text-white/70">myaccount.google.com → Security → 2-Step Verification</span> (must be enabled first)</li>
                <li>Scroll to <span className="text-white/70">App passwords</span> → create one, name it "yAtIverse"</li>
                <li>Copy the 16-character password and paste it in the Password field below</li>
              </ol>
              <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/40">
                <span><span className="text-white/60">Host:</span> smtp.gmail.com</span>
                <span><span className="text-white/60">Port:</span> 587</span>
                <span><span className="text-white/60">Security:</span> STARTTLS</span>
                <span><span className="text-white/60">Username:</span> your Gmail address</span>
              </div>
              <button
                onClick={fillGmailSettings}
                className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/15"
              >
                Auto-fill Gmail settings ↓
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <Field label="From Email">
                <input
                  className={inputCls}
                  placeholder="you@yourdomain.com"
                  value={smtp.smtp_from_email}
                  onChange={(e) => setSmtp((s) => ({ ...s, smtp_from_email: e.target.value }))}
                />
              </Field>

              <Field label="SMTP Host">
                <input
                  className={inputCls}
                  placeholder="smtp.gmail.com"
                  value={smtp.smtp_host}
                  onChange={(e) => setSmtp((s) => ({ ...s, smtp_host: e.target.value }))}
                />
              </Field>

              <Field label="Security">
                <select
                  className={`${inputCls} cursor-pointer`}
                  value={securityValue}
                  onChange={(e) => handleSecurityChange(e.target.value)}
                >
                  <option value="starttls">STARTTLS (port 587)</option>
                  <option value="ssl">SSL/TLS (port 465)</option>
                </select>
              </Field>

              <Field label="SMTP Username">
                <input
                  className={inputCls}
                  placeholder="your login / email"
                  value={smtp.smtp_user}
                  onChange={(e) => setSmtp((s) => ({ ...s, smtp_user: e.target.value }))}
                />
              </Field>

              <Field label="SMTP Password / App Password">
                <input
                  className={inputCls}
                  type="password"
                  placeholder="••••••••"
                  value={smtp.smtp_password === '••••••••' ? '' : smtp.smtp_password}
                  onChange={(e) => setSmtp((s) => ({ ...s, smtp_password: e.target.value }))}
                />
              </Field>

              <Field label="Tracking Base URL" hint="Public URL of this server for open/click tracking">
                <input
                  className={inputCls}
                  placeholder="https://founder-agents-api.onrender.com"
                  value={smtp.tracking_base_url || ''}
                  onChange={(e) => setSmtp((s) => ({ ...s, tracking_base_url: e.target.value }))}
                />
              </Field>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-5">
              <button
                onClick={handleSaveSmtp}
                disabled={smtpSaving}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-5 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {smtpSaving ? <Loader2 size={13} className="animate-spin" /> : smtpSaved ? <CheckCircle size={13} className="text-emerald-400" /> : <Save size={13} />}
                {smtpSaving ? 'Saving…' : smtpSaved ? 'Saved' : 'Save SMTP'}
              </button>
              <button
                onClick={handleTestSmtp}
                disabled={smtpTesting || demo}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-5 py-2 text-xs font-medium text-white/50 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {smtpTesting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                {smtpTesting ? 'Sending…' : 'Send Test Email'}
              </button>
            </div>
            </>)}
          </div>

          <Divider />

          {/* ================================================================
              ACCOUNT
          ================================================================ */}
          <div className="p-6">
            <h2 className="font-display text-base font-semibold text-white">Account</h2>
            <p className="mt-0.5 text-xs text-white/40">Your login details.</p>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/30">Signed in as</p>
                <p className="mt-0.5 text-sm font-medium text-white">{email || '—'}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-white/50 transition hover:border-white/20 hover:text-white"
              >
                <LogOut size={13} />
                Log out
              </button>
            </div>
          </div>

        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
          toast.type === 'success'
            ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
            : 'border-brand-rose/25 bg-brand-rose/10 text-brand-rose'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.message}
        </div>
      )}
    </div>
  )
}
