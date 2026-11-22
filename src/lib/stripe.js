import { loadStripe } from '@stripe/stripe-js/pure'

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

let stripePromise

/**
 * Lazily loads Stripe.js once and reuses the same promise on every call —
 * loadStripe() itself is meant to be called exactly once per page per Stripe
 * docs, not once per component render.
 *
 * Returns null (rather than throwing) when the publishable key isn't
 * configured, so the checkout page can show a clear "payment isn't set up
 * yet" state instead of a blank crash if VITE_STRIPE_PUBLISHABLE_KEY is
 * ever missing from the deploy environment.
 */
export function getStripe() {
  if (!PUBLISHABLE_KEY) {
    console.error('VITE_STRIPE_PUBLISHABLE_KEY is not set — payment cannot load.')
    return null
  }
  if (!stripePromise) {
    // loadStripe() rejects (rather than resolving null) if the js.stripe.com
    // script itself fails to load — e.g. no network, an ad/privacy blocker,
    // or a restrictive CSP. Left unhandled, that becomes an uncaught
    // promise rejection since <Elements stripe={...}> doesn't catch it
    // either. Swallow it here and resolve to null instead, so callers can
    // treat "Stripe.js failed to load" the same way as "no publishable
    // key" — one code path, one friendly message, instead of a console
    // error and an Elements form stuck loading forever.
    stripePromise = loadStripe(PUBLISHABLE_KEY).catch((err) => {
      console.error('Stripe.js failed to load:', err)
      return null
    })
  }
  return stripePromise
}
