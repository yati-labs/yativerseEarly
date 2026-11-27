import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { getOrderStatus } from '../lib/orderApi'
import { track } from '../lib/tracking'

const GOLD = '#C9A84C'
const money = (cents) => `$${(cents / 100).toFixed(2)}`
const TRIES = 15 // about 30 seconds: the payment confirmation can arrive a moment after the redirect

export default function OrderConfirmed() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const [state, setState] = useState(sessionId ? 'checking' : 'missing') // checking | paid | pending | error | missing
  const [orderId, setOrderId] = useState('')
  const [amounts, setAmounts] = useState(null)
  const tracked = useRef(false)

  useEffect(() => {
    if (!sessionId) return undefined
    let cancelled = false
    let tries = 0
    async function poll() {
      try {
        const res = await getOrderStatus(sessionId)
        if (cancelled) return
        setOrderId(res.orderId || '')
        if (res.amounts) setAmounts(res.amounts)
        if (res.paid) {
          setState('paid')
          const key = `yati_purchase_${sessionId}`
          if (!tracked.current && !sessionStorage.getItem(key)) {
            tracked.current = true
            try { sessionStorage.setItem(key, '1') } catch { /* ignore */ }
            track('purchase', { order_id: res.orderId })
          }
          return
        }
        tries += 1
        if (tries >= TRIES) setState('pending')
        else setTimeout(poll, 2000)
      } catch {
        if (!cancelled) setState('error')
      }
    }
    poll()
    return () => { cancelled = true }
  }, [sessionId])

  return (
    <>
      <SEO title="Order confirmation" description="Your yAtIverse order." path="/order/confirmed" noindex />
      <div className="min-h-screen bg-brand-bg text-white">
        <Navbar />
        <main className="px-4 pb-20 pt-36">
          <div className="mx-auto max-w-xl text-center">
            {state === 'checking' && (
              <>
                <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin" style={{ color: GOLD }} aria-hidden="true" />
                <h1 className="font-display text-3xl font-bold">Confirming your payment…</h1>
                <p className="mt-3 font-body text-white/70">This usually takes a few seconds. Please keep this page open.</p>
              </>
            )}
            {state === 'paid' && (
              <>
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12" style={{ color: GOLD }} aria-hidden="true" />
                <h1 className="font-display text-3xl font-bold">Thank you. Your order is confirmed.</h1>
                {orderId && <p className="mt-3 font-body text-white/70">Order number: <span className="font-mono text-white">{orderId}</span></p>}
                {amounts && (
                  <dl className="mx-auto mt-6 max-w-xs rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left font-body text-sm">
                    <div className="flex justify-between py-1"><dt className="text-white/70">Subtotal</dt><dd>{money(amounts.subtotal)}</dd></div>
                    <div className="flex justify-between py-1"><dt className="text-white/70">Shipping</dt><dd>Free</dd></div>
                    <div className="flex justify-between py-1"><dt className="text-white/70">Sales tax</dt><dd>{money(amounts.tax)}</dd></div>
                    <div className="mt-1 flex justify-between border-t border-white/10 pt-2 font-semibold"><dt>Charged today</dt><dd>{money(amounts.total)}</dd></div>
                  </dl>
                )}
                <ul className="mx-auto mt-8 max-w-md space-y-3 text-left font-body text-sm leading-6 text-white/80">
                  <li><strong className="text-white">Check your email.</strong> We sent your order details, your monthly price schedule and how to cancel.</li>
                  <li><strong className="text-white">Sign in with the same email</strong> to open your dashboard and finish setting up your workspace.</li>
                  <li><strong className="text-white">Shipping.</strong> We email you when your device ships. We ship within the United States.</li>
                  <li>Returns and cancellation terms are on the <Link to="/returns" className="underline">Returns page</Link>.</li>
                </ul>
                <Link to="/login" className="mt-8 inline-flex rounded-full px-8 py-3 font-display text-sm font-bold text-black" style={{ background: `linear-gradient(135deg,${GOLD},#F5D27A)` }}>Sign in to your dashboard</Link>
              </>
            )}
            {state === 'pending' && (
              <>
                <h1 className="font-display text-3xl font-bold">We are still confirming your payment</h1>
                <p className="mt-3 font-body text-white/70">If your card was charged, you will get a confirmation email shortly. If you do not receive one within an hour, contact <a className="underline" href="mailto:support@yativerse.ai">support@yativerse.ai</a> and include your order number{orderId ? ` (${orderId})` : ''}.</p>
              </>
            )}
            {(state === 'error' || state === 'missing') && (
              <>
                <h1 className="font-display text-3xl font-bold">{state === 'missing' ? 'We could not find an order here' : 'We could not check your order'}</h1>
                <p className="mt-3 font-body text-white/70">If you just paid, check your email for a confirmation, or contact <a className="underline" href="mailto:support@yativerse.ai">support@yativerse.ai</a>. Otherwise you can <Link to="/order" className="underline">start an order</Link>.</p>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
