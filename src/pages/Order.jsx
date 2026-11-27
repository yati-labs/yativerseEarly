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
import { ACCESS_ROWS, DEVICES, FLAGS, LAUNCH_LABEL, PLANS, POLICY, buildQuote, usd } from '../lib/catalog'

const GOLD = '#C9A84C'
const GOLD2 = '#F5D27A'

const WHY = [
  { t: 'Capture without typing', d: 'Thread records and transcribes the conversations that matter, so you stay in them instead of taking notes.' },
  { t: 'Know what happens next', d: 'Next steps and follow-up drafts come out of every conversation, ready for you to edit.' },
  { t: 'You stay in control', d: 'Nothing is sent until you approve it. Connected to Gmail, Google Calendar, Slack and HubSpot.' },
]

function Price({ now, was, suffix = '' }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      {was != null && <s className="text-sm text-white/50" aria-label={`was ${usd(was)}`}>{usd(was)}</s>}
      <span className="font-display text-2xl font-bold text-white">{usd(now)}{suffix}</span>
    </span>
  )
}

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

export default function Order() {
  const navigate = useNavigate()
  const [deviceId, setDeviceId] = useState('thread-one')
  const [purchase, setPurchase] = useState('device') // device | capture | spark
  const [tierId, setTierId] = useState('capture')
  const [offer, setOffer] = useState({ active: false })
  const [showNotify, setShowNotify] = useState(false)
  const summaryRef = useRef(null)

  useEffect(() => { track('order_view'); getOfferStatus().then(setOffer) }, [])

  const q = useMemo(() => buildQuote({ deviceId, purchase, tierId, earlyActive: offer.active }), [deviceId, purchase, tierId, offer.active])
  const mode = ctaMode(q.bundle)

  function pickPurchase(p) {
    setPurchase(p)
    if (p !== 'device') setTierId(PLANS[p].tiers[0].id)
    setShowNotify(false)
    track('order_select', { device: deviceId, purchase: p })
  }
  function pickDevice(id) { setDeviceId(id); track('order_select', { device: id, purchase }) }

  function onCta() {
    if (mode === 'checkout') {
      startCheckout({ deviceId, purchase, tierId: q.bundle ? q.tier.id : null }, navigate)
    } else {
      setShowNotify(true)
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const ctaLabel = mode === 'checkout'
    ? (q.bundle ? `Continue with ${q.tier.name}` : `Order ${q.device.name} · ${usd(q.deviceNowCents)}`)
    : (FLAGS.ordersOpen ? 'Get notified when bundles open' : 'Notify me when orders open')

  const foundersOs = q.bundle ? 'Full: insights and meeting prep' : 'Basic: record, transcribe, connect your tools'

  return (
    <>
      <SEO
        title="Order Thread One and Thread Max"
        description="Choose Thread One or Thread Max, with or without a plan. Ships within the US. Prices in USD before tax."
        path="/order"
        noindex={!FLAGS.ordersOpen}
      />
      <div className="min-h-screen bg-brand-bg pb-24 text-white lg:pb-0">
        <Navbar />

        {/* HERO */}
        <section className="relative px-4 pb-10 pt-32">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.10), transparent 70%)' }} />
          <div className="relative mx-auto max-w-6xl">
            <motion.div {...fadeUp(0)}>
              <span className="mb-5 inline-flex rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest" style={{ border: `1px solid ${GOLD}40`, color: GOLD, background: `${GOLD}0D` }}>
                {FLAGS.ordersOpen ? 'Orders are open' : `Orders open ${LAUNCH_LABEL}`}
              </span>
              <h1 className="font-display font-bold tracking-tight" style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}>
                Every conversation, <span style={{ color: GOLD }}>put to work.</span>
              </h1>
              <p className="mt-4 max-w-2xl font-body text-lg leading-relaxed text-white/70">
                Thread captures the conversation. Founder OS helps you act on it. Pick your device, then choose how much help you want.
              </p>
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

        {/* CONFIGURATOR */}
        <section className="px-4 pb-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_390px]">
            <div className="space-y-12">
              {/* Step 1 */}
              <div>
                <h2 className="mb-4 font-display text-xl font-bold">1. Pick your Thread</h2>
                <div role="radiogroup" aria-label="Device" className="grid gap-4 sm:grid-cols-2">
                  {DEVICES.map((d) => {
                    const sel = d.id === deviceId
                    const bundle = purchase !== 'device'
                    return (
                      <button key={d.id} type="button" role="radio" aria-checked={sel} onClick={() => pickDevice(d.id)}
                        className="rounded-3xl p-5 text-left transition-all"
                        style={{ background: sel ? `${GOLD}12` : 'rgba(255,255,255,0.03)', border: sel ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.10)' }}>
                        <div className="mb-4 flex h-44 items-center justify-center rounded-2xl bg-black/30">
                          <img src={d.image} alt={`${d.name}, ${d.form.toLowerCase()}`} width={d.w} height={d.h} loading="lazy" className="h-full w-auto object-contain" />
                        </div>
                        <p className="font-display text-lg font-bold">{d.name}</p>
                        <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-white/55">{d.form}</p>
                        <p className="mb-4 font-body text-sm leading-6 text-white/70">{d.blurb}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Price now={bundle ? d.bundleCents : d.standaloneCents} was={bundle ? d.standaloneCents : null} />
                          {bundle && <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-black" style={{ background: GOLD2 }}>Save {usd(d.standaloneCents - d.bundleCents)}</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <h2 className="mb-1 font-display text-xl font-bold">2. Choose your setup</h2>
                <p className="mb-4 font-body text-sm text-white/65">Add a plan when you order and the device costs {usd(q.device.standaloneCents - q.device.bundleCents)} less. The lower device price needs a six-month plan chosen at purchase and cannot be added later.</p>
                <div role="radiogroup" aria-label="Setup" className="grid gap-4">
                  {[
                    { id: 'device', title: 'Device only', sub: `${usd(q.device.standaloneCents)} once`, text: 'Basic Founder OS: record and transcribe, and connect Gmail, Calendar, Slack and HubSpot. Insights and meeting prep show as previews until you add a plan.' },
                    { id: 'capture', title: 'Device + Capture plan', sub: `Device ${usd(q.device.bundleCents)}, plan from ${usd(PLANS.capture.tiers[0].monthlyCents)}/mo`, text: 'Full Founder OS: Gmail insights and meeting prep, plus monthly transcription minutes.', save: true },
                    { id: 'spark', title: 'Device + Spark plan', sub: `Device ${usd(q.device.bundleCents)}, plan from ${usd(PLANS.spark.tiers[0].monthlyCents)}/mo`, text: 'Everything in Capture, plus the Spark sales agent: prospect research, outreach drafts and CRM updates, all approved by you.', save: true },
                  ].map((o) => {
                    const sel = purchase === o.id
                    return (
                      <button key={o.id} type="button" role="radio" aria-checked={sel} onClick={() => pickPurchase(o.id)}
                        className="rounded-3xl p-5 text-left transition-all"
                        style={{ background: sel ? `${GOLD}12` : 'rgba(255,255,255,0.03)', border: sel ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.10)' }}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-display text-base font-bold">{o.title}</p>
                          {o.save && <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-black" style={{ background: GOLD2 }}>Save {usd(q.device.standaloneCents - q.device.bundleCents)} on device</span>}
                        </div>
                        <p className="mb-2 font-body text-sm" style={{ color: GOLD }}>{o.sub}</p>
                        <p className="font-body text-sm leading-6 text-white/70">{o.text}</p>
                      </button>
                    )
                  })}
                </div>
                <p className="mt-3 font-body text-sm text-white/60">Want software only, with no device? <Link to="/waitlist" className="underline">Hear when Spark plans open</Link>.</p>
              </div>

              {/* Step 3 */}
              {q.bundle && (
                <div>
                  <h2 className="mb-4 font-display text-xl font-bold">3. Choose your {q.family.name} plan</h2>
                  {offer.active && (
                    <div className="mb-4 rounded-2xl p-4 font-body text-sm leading-6 text-white/80" style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}40` }}>
                      <p className="font-semibold text-white">First 100 early signups: introductory pricing</p>
                      <p>Introductory price for your first three paid months. Honest private feedback by day 75 unlocks the feedback price for months 4 to 6. Regular price from month 7. Applies to the plan only, not the device.
                        {offer.remaining != null && <> Places left: {offer.remaining}.</>}
                        {offer.endsAt && <> Offer ends {new Date(offer.endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</>}</p>
                    </div>
                  )}
                  <div role="radiogroup" aria-label="Plan tier" className="grid gap-4 sm:grid-cols-3">
                    {q.family.tiers.map((t) => {
                      const sel = t.id === q.tier.id
                      return (
                        <button key={t.id} type="button" role="radio" aria-checked={sel} onClick={() => { setTierId(t.id); setShowNotify(false); track('order_select', { device: deviceId, purchase, tier: t.id }) }}
                          className="rounded-3xl p-5 text-left transition-all"
                          style={{ background: sel ? `${GOLD}12` : 'rgba(255,255,255,0.03)', border: sel ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.10)' }}>
                          <p className="font-display text-base font-bold">{t.name}</p>
                          <div className="my-2">
                            {offer.active
                              ? <Price now={t.introCents} was={t.monthlyCents} suffix="/mo" />
                              : <Price now={t.monthlyCents} suffix="/mo" />}
                          </div>
                          {offer.active && <p className="mb-2 font-body text-xs text-white/65">First 3 paid months. {usd(t.feedbackCents)}/mo in months 4 to 6 with feedback, {usd(t.monthlyCents)}/mo from month 7.</p>}
                          <ul className="font-body text-xs leading-5 text-white/70">
                            <li>{t.minutes.toLocaleString('en-US')} transcription minutes a month</li>
                            {t.prospects && <li>{t.prospects} prospects, {t.actions} Spark actions</li>}
                            <li>{t.users === '1' ? '1 user' : `${t.users} users, pooled usage`}</li>
                            <li>Founder OS included</li>
                          </ul>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* What you get */}
              <div>
                <h2 className="mb-1 font-display text-xl font-bold">What each level includes</h2>
                <p className="mb-4 font-body text-sm text-white/65">Founder OS is never an extra charge. Every device includes Basic. Any paid plan makes it full.</p>
                <div className="overflow-x-auto rounded-3xl border border-white/10">
                  <table className="w-full min-w-[560px] text-left font-body text-sm">
                    <thead>
                      <tr className="bg-white/[0.05] text-white">
                        <th scope="col" className="px-4 py-3 font-display font-semibold">Feature</th>
                        <th scope="col" className="px-3 py-3 text-center font-display font-semibold">Device only<br /><span className="text-xs font-normal text-white/60">Basic</span></th>
                        <th scope="col" className="px-3 py-3 text-center font-display font-semibold">Capture plan<br /><span className="text-xs font-normal text-white/60">Full</span></th>
                        <th scope="col" className="px-3 py-3 text-center font-display font-semibold">Spark plan<br /><span className="text-xs font-normal text-white/60">Full + Spark</span></th>
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
                      <span className="inline-flex items-center gap-2 rounded-full bg-black/75 px-4 py-2 font-body text-sm text-white"><Lock className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" /> Included with Capture and Spark plans</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SUMMARY */}
            <aside ref={summaryRef} className="lg:sticky lg:top-28 lg:self-start" aria-label="Your order">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <h2 className="mb-4 font-display text-lg font-bold">Your order</h2>
                <p className="font-display text-base font-semibold">{q.device.name}</p>
                <p className="mb-4 font-body text-sm text-white/60">{q.device.form}</p>

                <dl className="space-y-4 font-body text-sm">
                  <div>
                    <dt className="text-white/60">Device, one time</dt>
                    <dd className="mt-1 flex flex-wrap items-center gap-3"><Price now={q.deviceNowCents} was={q.deviceWasCents} />{q.bundle && <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-black" style={{ background: GOLD2 }}>You save {usd(q.deviceSaveCents)}</span>}</dd>
                  </div>
                  {q.bundle && (
                    <div>
                      <dt className="text-white/60">{q.tier.name} plan, monthly</dt>
                      <dd className="mt-1">
                        {q.earlyActive
                          ? <><Price now={q.tier.introCents} was={q.tier.monthlyCents} suffix="/mo" /><p className="mt-1 text-xs text-white/65">First 3 paid months, then {usd(q.tier.feedbackCents)}/mo in months 4 to 6 with honest feedback, {usd(q.tier.monthlyCents)}/mo from month 7.</p></>
                          : <Price now={q.tier.monthlyCents} suffix="/mo" />}
                        <p className="mt-1 text-xs text-white/65">{q.tier.minutes.toLocaleString('en-US')} minutes a month. Six-month plan minimum.</p>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-white/60">Founder OS</dt>
                    <dd className="mt-1 text-white">{foundersOs} <span className="text-white/60">(included)</span></dd>
                  </div>
                </dl>

                <p className="mt-5 border-t border-white/10 pt-4 font-body text-xs leading-5 text-white/60">
                  Prices are in USD and exclude sales tax. Any tax is worked out from your shipping address and shown before you pay. We ship within the United States.
                </p>

                <button type="button" onClick={onCta} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full py-4 font-display text-sm font-bold text-black transition-transform hover:scale-[1.01]"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                  {ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                {showNotify && (
                  <div className="mt-5">
                    <WaitlistForm where="order-notify" source="order-page" model={q.device.name} cta="Notify me"
                      note={`We will email you when ${FLAGS.ordersOpen ? 'bundles' : 'orders'} open.`}
                      successText={FLAGS.ordersOpen ? 'Done. We will email you when bundles open.' : 'Done. We will email you the moment orders open.'} />
                  </div>
                )}
                {mode === 'checkout' && <p className="mt-3 text-center font-body text-xs text-white/55">Secure payment by Stripe.</p>}
              </div>
            </aside>
          </div>
        </section>

        {/* WHY */}
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

        {/* KNOW BEFORE YOU BUY */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 font-display text-2xl font-bold">Before you buy</h2>
            <div className="space-y-3">
              <Faq q="What do I get with a device only?" a="Basic Founder OS: record and transcribe your conversations, and connect Gmail, Calendar, Slack and HubSpot. Insights and meeting prep show as previews until you add a plan." />
              <Faq q="Is Founder OS an extra cost?" a="No. Founder OS is included. A device alone gives you Basic. Any paid plan, Capture or Spark, makes it full, with insights and meeting prep." />
              <Faq q="Can I add a plan later?" a={`Yes, any time from your dashboard. The lower device price (${usd(DEVICES[0].standaloneCents - DEVICES[0].bundleCents)} less) only applies when you choose a six-month plan at the moment you order.`} />
              <Faq q="What does the six-month minimum mean?" a="The lower device price comes with a six-month paid commitment on your plan. The full terms are shown before you pay." />
              <Faq q="What does Spark do?" a="Spark is the sales agent. It researches prospects, drafts outreach and prepares CRM updates, and you approve each step before it happens." />
              <Faq q="Shipping, tax and prices" a={`We ship within the United States only. Prices are in USD and exclude sales tax; tax is calculated from your shipping address and shown before you pay.${POLICY.deliveryEstimate ? ' ' + POLICY.deliveryEstimate : ' Delivery estimates are confirmed at checkout.'}`} />
              <Faq q="Recording and consent" a="Laws on recording conversations vary by place. Tell people before you record and get their consent where the law requires it." />
              <Faq q="What happens to my data?" a={<>See how we collect, use and protect information in our <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.</>} />
              {POLICY.returns && <Faq q="Returns" a={POLICY.returns} />}
              {POLICY.warranty && <Faq q="Warranty" a={POLICY.warranty} />}
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-white/10 bg-brand-bg/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0">
          <p className="truncate font-body text-xs text-white/60">{q.device.name}{q.bundle ? ` + ${q.tier.name}` : ''}</p>
          <Price now={q.deviceNowCents} was={q.deviceWasCents} />
        </div>
        <button type="button" onClick={onCta} className="flex-shrink-0 rounded-full px-5 py-3 font-display text-sm font-bold text-black" style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
          {mode === 'checkout' ? 'Continue' : 'Notify me'}
        </button>
      </div>

      <ExitIntent blocked={showNotify} />
    </>
  )
}
