import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { Lock } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { getStripe } from '../lib/stripe'
import { getStoredEmail } from '../lib/api'
import { createOrderCheckout } from '../lib/orderApi'
import { loadSelection } from '../lib/orderFlow'
import { track } from '../lib/tracking'
import { FLAGS, computeQuote, usd } from '../lib/catalog'

const GOLD = '#C9A84C'
const GOLD2 = '#F5D27A'

function phaseLabel(p, i, all) {
  const next = all[i + 1]
  if (!next) return p.fromMonth === 1 ? 'Every month' : `Month ${p.fromMonth} onward`
  return p.fromMonth === next.fromMonth - 1 ? `Month ${p.fromMonth}` : `Months ${p.fromMonth}–${next.fromMonth - 1}`
}

/** Normalizes the server quote (or the local preview) into what the summary shows. */
function view(q) {
  return {
    deviceName: q.deviceName || q.device?.name,
    deviceStandalone: q.deviceStandalone,
    deviceNow: q.deviceNow,
    commitSaving: q.commitSaving,
    bundleSavingDevice: q.bundleSavingDevice ?? q.bundleSavingHardware ?? 0,
    bundleSavingPlans: q.bundleSavingPlans ?? q.bundleSavingServices ?? 0,
    firstCharge: q.firstCharge,
    firstServices: q.firstServices,
    phases: (q.phases || []).map((p) => ({ fromMonth: p.fromMonth ?? p.from, net: p.net })),
    termMonths: q.termMonths,
    termTotal: q.termTotal,
    committed: q.committed ?? q.commitSaving > 0,
    hasPlan: q.hasPlan ?? (q.phases || []).some((p) => (p.net ?? 0) > 0),
    early: q.early,
    bundle: q.bundle,
  }
}

export default function Checkout() {
  const selection = useMemo(() => loadSelection(), [])
  const [email, setEmail] = useState(getStoredEmail() || '')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null) // { clientSecret, quote }
  const stripePromise = useMemo(() => getStripe(), [])

  const local = useMemo(() => (selection ? computeQuote(selection, false) : null), [selection])
  const hasPlan = Boolean(local && local.hasPlan)
  const allowed = FLAGS.ordersOpen && (!hasPlan || FLAGS.planCheckout)

  useEffect(() => { if (selection && allowed) track('order_checkout_view') }, [selection, allowed])

  if (!selection || !local || !allowed) return <Navigate to="/order" replace />

  const q = view(session ? session.quote : local)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  async function start(e) {
    e.preventDefault()
    setError('')
    if (!emailOk) { setError('Please enter a valid email address.'); return }
    if (hasPlan && !consent) { setError('Please confirm the plan terms to continue.'); return }
    if (!stripePromise) { setError('Payment is not available right now. Please try again later or email support@yativerse.ai.'); return }
    setBusy(true)
    try {
      const res = await createOrderCheckout({ email: email.trim(), selection, consent })
      track('order_payment_started', { device: selection.deviceId })
      setSession(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEO title="Checkout" description="Secure checkout for your Thread device." path="/checkout" noindex />
      <div className="min-h-screen bg-brand-bg text-white">
        <Navbar />
        <main className="px-4 pb-20 pt-32">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_380px]">
            <section aria-labelledby="pay-title">
              <h1 id="pay-title" className="mb-2 font-display text-3xl font-bold">{session ? 'Payment' : 'Checkout'}</h1>
              <p className="mb-6 font-body text-sm text-white/65">
                <Link to="/order" className="underline">Change your setup</Link>
              </p>

              {!session && (
                <form onSubmit={start} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="co-email" className="mb-1 block font-body text-sm text-white/80">Email for your order and account</label>
                    <input id="co-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 font-body text-white placeholder-white/40 focus:border-brand-gold focus:outline-none"
                      placeholder="you@company.com" aria-invalid={Boolean(error) && !emailOk} />
                    <p className="mt-1 font-body text-xs text-white/55">Use the same email when you sign in so your plan and device are linked to your account. Shipping address and card are on the next step.</p>
                  </div>

                  {hasPlan && (
                    <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-body text-sm leading-6 text-white/80">
                      <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 flex-shrink-0 accent-yellow-500" />
                      <span>
                        I agree to pay {usd(q.deviceNow)} today for my {q.deviceName} and {usd(q.firstServices)} for my first month of service.
                        {q.committed ? ` My Capture commitment is ${q.termMonths} months, billed monthly, and it then continues month to month until I cancel.` : ' My plan is billed monthly until I cancel.'}
                        {' '}Prices change on the dates shown in the order summary. I can cancel online any time in my dashboard. Cancelling Capture before my commitment ends leaves the remaining committed months payable. I have read the{' '}
                        <Link to="/returns" className="underline" target="_blank">Returns and Cancellation terms</Link>.
                      </span>
                    </label>
                  )}
                  {!hasPlan && (
                    <p className="font-body text-sm text-white/70">Returns are accepted within the window on the <Link to="/returns" className="underline" target="_blank">Returns and Cancellation page</Link>.</p>
                  )}

                  {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-body text-sm text-red-200">{error}</p>}
                  <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full py-4 font-display text-sm font-bold text-black disabled:opacity-60" style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                    <Lock className="h-4 w-4" aria-hidden="true" /> {busy ? 'Preparing secure payment…' : 'Continue to payment'}
                  </button>
                </form>
              )}

              {session && (
                <div>
                  <p className="mb-4 font-body text-sm text-white/70">Ordering as <strong className="text-white">{email.trim()}</strong>. Tax is calculated from your shipping address below.</p>
                  <div className="overflow-hidden rounded-2xl bg-white">
                    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret: async () => session.clientSecret }}>
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                </div>
              )}
            </section>

            <aside aria-label="Order summary" className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 font-body text-sm">
                <h2 className="mb-3 font-display text-lg font-bold">Order summary</h2>
                <Row label={`${q.deviceName} · device-only price`} value={usd(q.deviceStandalone)} />
                {q.commitSaving > 0 && <Row green label="Capture commitment device saving" value={`−${usd(q.commitSaving)}`} />}
                {q.bundleSavingDevice > 0 && <Row green label="Bundle saving after rounding · device" value={`−${usd(q.bundleSavingDevice)}`} />}
                {q.hasPlan && <Row label="First month of plans" value={usd(q.firstServices)} />}
                {q.bundleSavingPlans > 0 && <Row green label="Bundle saving after rounding · plans" value={`−${usd(q.bundleSavingPlans)}`} />}
                <Row label="Founder OS · included" value="$0" />
                <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
                  <span className="font-display text-base font-bold">First charge*</span>
                  <span className="font-display text-2xl font-bold">{usd(q.firstCharge)}</span>
                </div>
                <p className="mt-1 text-xs text-white/60">*Before sales tax. One-time device plus first month of service.</p>
                {q.hasPlan && q.phases?.length > 0 && (
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <p className="mb-1 font-display text-sm font-semibold">Monthly after that</p>
                    {q.phases.map((p, i, all) => <Row key={i} label={phaseLabel(p, i, all)} value={`${usd(p.net)}/mo`} />)}
                    {q.early && <p className="mt-2 text-xs leading-5 text-white/65">First-100 prices included. Months 4 to 6 use the regular price unless you send honest feedback within 75 days.</p>}
                  </div>
                )}
                <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-white/60">Prices in USD. We ship within the United States. Secure payment by Stripe.</p>
              </div>
            </aside>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

function Row({ label, value, green }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-2" style={green ? { color: '#86efac' } : undefined}>
      <span className={green ? '' : 'text-white/75'}>{label}</span>
      <span className={green ? 'font-semibold' : 'font-semibold text-white'}>{value}</span>
    </div>
  )
}
