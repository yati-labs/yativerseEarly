import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Eye, Minus, Lock, ShieldCheck, Truck, ChevronDown, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import WaitlistForm from '../components/WaitlistForm'
import ExitIntent from '../components/ExitIntent'
import { fadeUp } from '../lib/motion'
import { track } from '../lib/tracking'
import { getOfferStatus } from '../lib/offers'
import { ctaMode, startCheckout } from '../lib/orderFlow'
import { ACCESS_ROWS, CAPTURE, DEVICES, FLAGS, FOUNDER_OS_VALUE, LAUNCH_LABEL, POLICY, SHIPPING_STANDARD, SPARK, computeQuote, usd } from '../lib/catalog'

const GOLD = '#C9A84C'
const GOLD2 = '#F5D27A'
const card = (sel) => ({ background: sel ? `${GOLD}12` : 'rgba(255,255,255,0.03)', border: sel ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.10)' })
const goldBtn = { background: `linear-gradient(135deg,${GOLD},${GOLD2})` }

const WHY = [
  { t: 'Capture without typing', d: 'Thread records and transcribes the conversations that matter, so you stay in them instead of taking notes.' },
  { t: 'Know what happens next', d: 'Capture turns audio into usable notes. Spark helps find the next opportunity. Founder OS connects the work.' },
  { t: 'You stay in control', d: 'Nothing is sent until you approve it. Connects with Gmail, Google Calendar, Slack and HubSpot.' },
]

function Price({ now, was, suffix = '' }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      {was != null && was !== now && <s className="text-sm text-white/50" aria-label={`was ${usd(was)}`}>{usd(was)}</s>}
      <span className="font-display text-2xl font-bold text-white">{usd(now)}{suffix}</span>
    </span>
  )
}
const Badge = ({ children }) => <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-black" style={{ background: GOLD2 }}>{children}</span>

function Cell({ v }) {
  if (v === true) return <><Check className="mx-auto h-5 w-5" style={{ color: GOLD }} aria-hidden="true" /><span className="sr-only">Included</span></>
  if (v === 'preview') return <><Eye className="mx-auto h-5 w-5 text-white/55" aria-hidden="true" /><span className="sr-only">Preview only</span></>
  return <><Minus className="mx-auto h-5 w-5 text-white/25" aria-hidden="true" /><span className="sr-only">Not included</span></>
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-display text-sm font-semibold text-white">{q}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-white/55 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && <p className="px-5 pb-5 font-body text-sm leading-6 text-white/70">{a}</p>}
    </div>
  )
}

function Step({ n, title, hint, children }) {
  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-bold">{n}. {title}</h2>
      {hint && <p className="mb-4 font-body text-sm text-white/65">{hint}</p>}
      {!hint && <div className="mb-4" />}
      {children}
    </div>
  )
}

export default function Order() {
  const navigate = useNavigate()
  const [deviceId, setDeviceId] = useState('thread-one')
  const [commitment, setCommitment] = useState('none') // none | 6 | 12
  const [captureId, setCaptureId] = useState(null)
  const [sparkId, setSparkId] = useState(null)
  const [offer, setOffer] = useState({ active: false })
  const [showNotify, setShowNotify] = useState(false)
  const summaryRef = useRef(null)

  useEffect(() => { track('order_view'); getOfferStatus().then(setOffer) }, [])

  const sel = { deviceId, commitment, captureId, sparkId }
  const q = useMemo(() => computeQuote(sel, offer.active), [deviceId, commitment, captureId, sparkId, offer.active]) // eslint-disable-line react-hooks/exhaustive-deps
  const mode = ctaMode(q.hasPlan)
  const d = q.device

  function touch(next) { setShowNotify(false); track('order_select', next) }
  function pickCapture(id) {
    setCaptureId(id)
    if (!id) setCommitment('none')
    else if (commitment === 'none') setCommitment('6')
    else if (commitment === '12' && id !== 'capture-starter') setCommitment('6')
    touch({ device: deviceId, capture: id || '' })
  }
  function pickCommitment(c) { setCommitment(c); touch({ device: deviceId, commitment: c }) }
  function pickSpark(id) { setSparkId(id); touch({ device: deviceId, spark: id || '' }) }

  function onCta() {
    if (mode === 'checkout') startCheckout(q.selection, navigate)
    else { setShowNotify(true); summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
  }

  const ctaLabel = mode === 'checkout'
    ? `Continue · ${usd(q.firstCharge)} today`
    : (FLAGS.ordersOpen ? 'Get notified when plans open' : 'Notify me when orders open')
  const levelLabel = !q.hasPlan ? 'Basic: record, transcribe, connect your tools' : q.spark ? 'Full, plus the Spark sales agent' : 'Full: insights and meeting prep'

  return (
    <>
      <SEO title="Order Thread One and Thread Max" description="Choose Thread One or Thread Max, add Capture and Spark if you want them. Ships within the US. Prices in USD before tax." path="/order" noindex={!FLAGS.ordersOpen} />
      <div className="min-h-screen bg-brand-bg pb-24 text-white lg:pb-0">
        <Navbar />

        <section className="relative px-4 pb-10 pt-32">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.10), transparent 70%)' }} />
          <div className="relative mx-auto max-w-6xl">
            <motion.div {...fadeUp(0)}>
              <span className="mb-5 inline-flex rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest" style={{ border: `1px solid ${GOLD}40`, color: GOLD, background: `${GOLD}0D` }}>
                {FLAGS.ordersOpen ? 'Orders are open' : `Orders open ${LAUNCH_LABEL}`}
              </span>
              <h1 className="font-display font-bold tracking-tight" style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}>
                Start with what you need. <span style={{ color: GOLD }}>Grow into what&rsquo;s next.</span>
              </h1>
              <p className="mt-4 max-w-2xl font-body text-lg leading-relaxed text-white/70">
                Thread captures the conversation. Capture turns audio into usable notes. Spark helps find the next opportunity. Founder OS connects the work, and it is included.
              </p>
              <div className="mt-6 max-w-2xl rounded-2xl p-4 font-body text-sm leading-6 text-white/80" style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
                <span className="font-display text-base font-bold text-white">Founder OS is included. +$0/mo.</span>{' '}
                Your workspace for captured conversations, insights and connected agent workflows. Estimated value ${FOUNDER_OS_VALUE}/month, included at no extra charge while an eligible paid plan is active. This is an estimated benefit value, not a former selling price.
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-body text-sm text-white/65">
                <li className="inline-flex items-center gap-2"><Truck className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" /> Ships within the US</li>
                <li className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" /> You approve before anything is sent</li>
                <li className="inline-flex items-center gap-2"><Lock className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" /> Prices in USD, tax shown before you pay</li>
              </ul>
              {!FLAGS.ordersOpen && (
                <p className="mt-5 max-w-2xl rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-body text-sm text-white/75">
                  Checkout opens {LAUNCH_LABEL}. Build your setup now and we will email you the moment you can order.
                </p>
              )}
            </motion.div>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_400px]">
            <div className="space-y-12">
              <Step n={1} title="Pick your Thread">
                <div role="radiogroup" aria-label="Device" className="grid gap-4 sm:grid-cols-2">
                  {DEVICES.map((x) => {
                    const on = x.id === deviceId
                    const c = computeQuote({ ...sel, deviceId: x.id }, offer.active)
                    return (
                      <button key={x.id} type="button" role="radio" aria-checked={on} onClick={() => { setDeviceId(x.id); touch({ device: x.id }) }} className="rounded-3xl p-5 text-left transition-all" style={card(on)}>
                        <div className="mb-4 flex h-44 items-center justify-center rounded-2xl bg-black/30">
                          <img src={x.image} alt={`${x.name}, ${x.form.toLowerCase()}`} width={x.w} height={x.h} loading="lazy" className="h-full w-auto object-contain" />
                        </div>
                        <p className="font-display text-lg font-bold">{x.name}</p>
                        <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-white/55">{x.form}</p>
                        <p className="mb-4 font-body text-sm leading-6 text-white/70">{x.blurb}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Price now={c.deviceNow} was={c.deviceNow !== x.standalone ? x.standalone : null} />
                          {c.commitSaving > 0 && <Badge>Save {usd(x.standalone - c.deviceNow)}</Badge>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Step>

              <Step n={2} title="Add Capture for transcription" hint={`Capture turns your Thread recordings into usable notes. Commit to Capture and the device costs ${usd(d.standalone - d.committed)} less. Skip it and you still get Basic Founder OS with the device.`}>
                <div role="radiogroup" aria-label="Capture plan" className="grid gap-4 sm:grid-cols-4">
                  <button type="button" role="radio" aria-checked={!captureId} onClick={() => pickCapture(null)} className="rounded-3xl p-5 text-left transition-all" style={card(!captureId)}>
                    <p className="font-display text-base font-bold">No Capture</p>
                    <p className="mt-2 font-body text-xs leading-5 text-white/70">Device only. You can add Capture from your dashboard later at the regular device price.</p>
                  </button>
                  {CAPTURE.map((c) => {
                    const on = captureId === c.id
                    const showEarly = offer.active
                    return (
                      <button key={c.id} type="button" role="radio" aria-checked={on} onClick={() => pickCapture(c.id)} className="rounded-3xl p-5 text-left transition-all" style={card(on)}>
                        <p className="font-display text-base font-bold">{c.name}</p>
                        <div className="my-2">{showEarly ? <Price now={c.intro} was={c.price} suffix="/mo" /> : <Price now={c.price} suffix="/mo" />}</div>
                        <ul className="font-body text-xs leading-5 text-white/70">
                          <li>{c.minutes.toLocaleString('en-US')} minutes a month</li>
                          <li>1 user, {c.storage} storage</li>
                        </ul>
                      </button>
                    )
                  })}
                </div>

                {captureId && (
                  <div className="mt-5">
                    <p className="mb-2 font-display text-sm font-semibold">Capture commitment</p>
                    <div role="radiogroup" aria-label="Capture commitment" className="grid gap-3 sm:grid-cols-3">
                      {[
                        { id: 'none', title: 'No commitment', text: `Monthly. Device at ${usd(d.standalone)}.` },
                        { id: '6', title: '6 months', text: `Device ${usd(d.committed)}. Capture billed monthly.` },
                        { id: '12', title: '12 months, Starter only', text: `Device ${usd(d.committed)}. Capture Starter free for months 1 to 3, then ${usd(19)}/mo. Minimum 9 paid months.`, only: 'capture-starter' },
                      ].map((o) => {
                        const off = o.only && captureId !== o.only
                        const on = commitment === o.id
                        return (
                          <button key={o.id} type="button" role="radio" aria-checked={on} aria-disabled={off} disabled={off} onClick={() => pickCommitment(o.id)} className="rounded-2xl p-4 text-left transition-all disabled:opacity-40" style={card(on)}>
                            <p className="font-display text-sm font-bold">{o.title}</p>
                            <p className="mt-1 font-body text-xs leading-5 text-white/70">{o.text}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Step>

              <Step n={3} title="Add Spark to find your next customers" hint="Spark researches companies and contacts from your goals or conversations, drafts outreach and prepares CRM updates, and you approve each step. No guarantee of contact availability, meetings or sales. Spark is billed monthly and can be cancelled monthly.">
                <div role="radiogroup" aria-label="Spark plan" className="grid gap-4 sm:grid-cols-4">
                  <button type="button" role="radio" aria-checked={!sparkId} onClick={() => pickSpark(null)} className="rounded-3xl p-5 text-left transition-all" style={card(!sparkId)}>
                    <p className="font-display text-base font-bold">No Spark</p>
                    <p className="mt-2 font-body text-xs leading-5 text-white/70">Add the sales agent any time from your dashboard.</p>
                  </button>
                  {SPARK.map((s) => {
                    const on = sparkId === s.id
                    return (
                      <button key={s.id} type="button" role="radio" aria-checked={on} onClick={() => pickSpark(s.id)} className="rounded-3xl p-5 text-left transition-all" style={card(on)}>
                        <p className="font-display text-base font-bold">{s.name}</p>
                        <div className="my-2">{offer.active ? <Price now={s.intro} was={s.price} suffix="/mo" /> : <Price now={s.price} suffix="/mo" />}</div>
                        <ul className="font-body text-xs leading-5 text-white/70">
                          <li>{s.prospects} researched prospects a month</li>
                          <li>{s.actions} agent actions a month</li>
                          <li>{s.users === '1' ? '1 user' : `${s.users} users`}, {s.storage} storage</li>
                        </ul>
                      </button>
                    )
                  })}
                </div>
                {q.spark && !q.capture && <p className="mt-3 font-body text-sm text-white/65">Spark does not include transcription. Add Capture in step 2 if you want Thread recordings transcribed.</p>}
                {q.committed && !q.spark && q.capture && <p className="mt-3 font-body text-sm" style={{ color: GOLD }}>Add Spark and get an extra 10% off your device and your monthly plans, rounded up to whole dollars.</p>}
                {q.spark && q.capture && !q.committed && <p className="mt-3 font-body text-sm" style={{ color: GOLD }}>Choose a 6 or 12 month Capture commitment to unlock the full-bundle 10% saving.</p>}
                {offer.active && (
                  <div className="mt-4 rounded-2xl p-4 font-body text-sm leading-6 text-white/80" style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}40` }}>
                    <p className="font-semibold text-white">First 100 early signups: introductory plan prices</p>
                    <p>Introductory price for months 1 to 3. Honest private feedback by day 75 unlocks the feedback price for months 4 to 6; without it, regular pricing resumes in month 4. Everyone moves to regular pricing in month 7. Applies to plans only, not the device, and stacks with the full-bundle saving.
                      {offer.remaining != null && <> Places left: {offer.remaining}.</>}
                      {offer.endsAt && <> Offer ends {new Date(offer.endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</>}</p>
                  </div>
                )}
                <p className="mt-3 font-body text-sm text-white/60">Want software only, with no device? <Link to="/waitlist" className="underline">Hear when plans open</Link>.</p>
              </Step>

              <div>
                <h2 className="mb-1 font-display text-xl font-bold">What each level includes</h2>
                <p className="mb-4 font-body text-sm text-white/65">Founder OS is never an extra charge. Every device includes Basic. Any paid plan makes it full.</p>
                <div className="overflow-x-auto rounded-3xl border border-white/10">
                  <table className="w-full min-w-[560px] text-left font-body text-sm">
                    <thead>
                      <tr className="bg-white/[0.05] text-white">
                        <th scope="col" className="px-4 py-3 font-display font-semibold">Feature</th>
                        <th scope="col" className="px-3 py-3 text-center font-display font-semibold">Device only<br /><span className="text-xs font-normal text-white/60">Basic</span></th>
                        <th scope="col" className="px-3 py-3 text-center font-display font-semibold">With Capture<br /><span className="text-xs font-normal text-white/60">Full</span></th>
                        <th scope="col" className="px-3 py-3 text-center font-display font-semibold">With Spark<br /><span className="text-xs font-normal text-white/60">Full + Spark</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ACCESS_ROWS.map((r) => (
                        <tr key={r.label} className="border-t border-white/10">
                          <th scope="row" className="px-4 py-3 font-normal text-white/85">{r.label}</th>
                          <td className="px-3 py-3"><Cell v={r.basic} /></td>
                          <td className="px-3 py-3"><Cell v={r.full} /></td>
                          <td className="px-3 py-3"><Cell v={r.spark} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {POLICY.basicLimitNote && <p className="mt-2 font-body text-xs text-white/60">{POLICY.basicLimitNote}</p>}

                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="mb-1 font-display text-sm font-semibold">What you unlock with a plan</p>
                  <p className="mb-4 font-body text-xs text-white/60">Illustrative demo data, not a real account.</p>
                  <div className="relative">
                    <div aria-hidden="true" className="grid gap-3 sm:grid-cols-2" style={{ filter: 'blur(3px)' }}>
                      <div className="rounded-2xl bg-black/30 p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-white/55">Insight</p><p className="mt-1 font-body text-sm">3 follow-ups are waiting on a reply from last week.</p></div>
                      <div className="rounded-2xl bg-black/30 p-4"><p className="font-mono text-[10px] uppercase tracking-widest text-white/55">Meeting prep, 2:00 pm</p><p className="mt-1 font-body text-sm">Last conversation, open items and suggested questions.</p></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="inline-flex items-center gap-2 rounded-full bg-black/75 px-4 py-2 font-body text-sm text-white"><Lock className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" /> Included with any paid plan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside ref={summaryRef} className="lg:sticky lg:top-28 lg:self-start" aria-label="Your order">
              <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: q.bundle ? `1px solid ${GOLD}80` : '1px solid rgba(255,255,255,0.10)' }}>
                {q.bundle && <p className="mb-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: GOLD }}>Full bundle · 10% applied, prices rounded up</p>}
                <h2 className="mb-4 font-display text-lg font-bold">Your setup</h2>

                <dl className="font-body text-sm">
                  <Row label={`${d.name} · device-only price`} value={usd(d.standalone)} />
                  {q.commitSaving > 0 && <Row green label="Capture commitment device saving" value={`−${usd(q.commitSaving)}`} />}
                  {q.bundleSavingHardware > 0 && <Row green label="Bundle saving after rounding · device" value={`−${usd(q.bundleSavingHardware)}`} />}
                  {q.capture && <Row label={`${q.capture.name} · first month`} value={usd(q.free12 ? 0 : q.early ? q.capture.intro : q.capture.price)} />}
                  {q.spark && <Row label={`${q.spark.name} · first month`} value={usd(q.early ? q.spark.intro : q.spark.price)} />}
                  <Row label="Founder OS · included" value="$0" />
                  <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-2">
                    <dt className="text-white/75">Shipping (US)</dt>
                    <dd className="font-semibold"><s className="mr-2 text-white/50"><span className="sr-only">Was </span>{usd(SHIPPING_STANDARD)}</s><span style={{ color: '#86efac' }}>Free shipping</span></dd>
                  </div>
                  {q.bundleSavingServices > 0 && <Row green label="Bundle saving after rounding · plans" value={`−${usd(q.bundleSavingServices)}`} />}
                </dl>

                <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
                  <span className="font-display text-lg font-bold">First charge*</span>
                  <span className="font-display text-3xl font-bold">{usd(q.firstCharge)}</span>
                </div>
                <p className="mt-1 font-body text-xs text-white/60">*Before sales tax, which is calculated from your shipping address at payment. One-time device plus first month of service, if charged together. Device payment and monthly plans are separate.</p>

                {q.hasPlan && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="mb-2 font-display text-sm font-semibold">Monthly after that</p>
                    <dl className="font-body text-sm">
                      {q.phases.map((p) => <Row key={p.label} label={p.label} value={`${usd(p.net)}/mo`} />)}
                    </dl>
                    {q.early && <p className="mt-2 font-body text-xs leading-5 text-white/65">Months 4 to 6 assume honest feedback by day 75. Without it, regular pricing resumes in month 4.</p>}
                    {q.capture && q.committed && (
                      <p className="mt-2 font-body text-xs leading-5 text-white/65">
                        Capture commitment: {q.termMonths} months, billed monthly. Illustrative {q.termMonths}-month total{q.spark ? ' if both plans stay active' : ''}: {usd(q.termTotal)}.
                        {q.spark && ' Spark stays monthly. If Spark ends, Capture loses the 10% reward from the next month.'}
                      </p>
                    )}
                  </div>
                )}

                <p className="mt-4 font-body text-sm text-white/80"><span className="text-white/60">Founder OS level:</span> {levelLabel}</p>
                <p className="mt-4 border-t border-white/10 pt-4 font-body text-xs leading-5 text-white/60">
                  Prices are in USD and exclude sales tax and shipping. Any tax is worked out from your shipping address and shown before you pay. We ship within the United States.
                </p>

                <button type="button" onClick={onCta} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full py-4 font-display text-sm font-bold text-black transition-transform hover:scale-[1.01]" style={goldBtn}>
                  {ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                {showNotify && (
                  <div className="mt-5">
                    <WaitlistForm where="order-notify" source="order-page" model={d.name} cta="Notify me"
                      note={`We will email you when ${FLAGS.ordersOpen ? 'plans' : 'orders'} open.`}
                      successText={FLAGS.ordersOpen ? 'Done. We will email you when plans open.' : 'Done. We will email you the moment orders open.'} />
                  </div>
                )}
                {mode === 'checkout' && <p className="mt-3 text-center font-body text-xs text-white/55">Secure payment by Stripe.</p>}
              </div>
            </aside>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 font-display text-2xl font-bold">Why founders pick Thread</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {WHY.map((w) => (
                <div key={w.t} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <p className="mb-2 font-display text-base font-bold">{w.t}</p>
                  <p className="font-body text-sm leading-6 text-white/70">{w.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 font-display text-2xl font-bold">Before you buy</h2>
            <div className="space-y-3">
              <Faq q="What do I get with a device only?" a="Basic Founder OS: record and transcribe your conversations, and connect Gmail, Calendar, Slack and HubSpot. Insights and meeting prep show as previews until you add a plan." />
              <Faq q="Is Founder OS an extra cost?" a={`No. Founder OS is included, with an estimated value of $${FOUNDER_OS_VALUE} a month. A device alone gives you Basic. Any paid plan makes it full, with insights and meeting prep.`} />
              <Faq q="What is the full bundle?" a="A Thread device with a 6 or 12 month Capture commitment and a Spark plan. You get an extra 10% off the device and your combined monthly plans, each rounded up to the next whole dollar, so the real saving is slightly under 10%. Excludes tax, shipping and top-ups." />
              <Faq q="What does the Capture commitment mean?" a={`The lower device price (${usd(DEVICES[0].standalone - DEVICES[0].committed)} less) comes with a 6 or 12 month paid Capture commitment, billed monthly. The 12 month option is Capture Starter only: free for months 1 to 3, then ${usd(19)} a month, with at least 9 paid months.${POLICY.cancellation ? ' ' + POLICY.cancellation : ' Full terms are shown before you pay.'}`} />
              <Faq q="Can I add a plan later?" a="Yes, any time from your dashboard. The committed device price and the bundle saving apply only to what you choose when you order. There is no retroactive hardware refund." />
              <Faq q="Do Capture minutes carry over?" a="Capture minutes are pooled across supported audio inputs in your workspace. Buying a second device does not add another free minute allowance." />
              <Faq q="What does Spark do?" a="Spark researches companies and contacts from your business goals or conversations, prepares personalized outreach and approved HubSpot updates, and you approve each step. We cannot guarantee contact availability, meetings or sales." />
              <Faq q="Shipping, tax and prices" a={`We ship within the United States only. Prices are in USD and exclude sales tax and shipping; tax is calculated from your shipping address and shown before you pay.${POLICY.deliveryEstimate ? ' ' + POLICY.deliveryEstimate : ' Delivery estimates are confirmed at checkout.'}`} />
              <Faq q="Recording and consent" a="Laws on recording conversations vary by place. Tell people before you record and get their consent where the law requires it." />
              <Faq q="What happens to my data?" a={<>See how we collect, use and protect information in our <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.</>} />
              <Faq q="Returns, warranty and cancellation" a={<>Read the <Link to="/returns" className="underline">Returns, Warranty and Cancellation terms</Link> before you buy.</>} />
              {POLICY.returns && <Faq q="Returns" a={POLICY.returns} />}
              {POLICY.warranty && <Faq q="Warranty" a={POLICY.warranty} />}
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-white/10 bg-brand-bg/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0">
          <p className="truncate font-body text-xs text-white/60">{d.name}{q.capture ? ` + ${q.capture.name}` : ''}{q.spark ? ` + ${q.spark.name}` : ''}</p>
          <span className="font-display text-xl font-bold">{usd(q.firstCharge)} <span className="text-xs font-normal text-white/60">first charge</span></span>
        </div>
        <button type="button" onClick={onCta} className="flex-shrink-0 rounded-full px-5 py-3 font-display text-sm font-bold text-black" style={goldBtn}>
          {mode === 'checkout' ? 'Continue' : 'Notify me'}
        </button>
      </div>

      <ExitIntent blocked={showNotify} />
    </>
  )
}

function Row({ label, value, green }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-2" style={green ? { color: '#86efac' } : undefined}>
      <dt className={green ? '' : 'text-white/75'}>{label}</dt>
      <dd className={green ? 'font-semibold' : 'font-semibold text-white'}>{value}</dd>
    </div>
  )
}
