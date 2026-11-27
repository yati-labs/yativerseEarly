import { FLAGS } from './catalog'
import { track } from './tracking'

const KEY = 'yati_order_selection'

/** Remembers what the buyer picked so the checkout page can read it. The server re-prices everything; this is only a hint. */
export function saveSelection(sel) {
  try { sessionStorage.setItem(KEY, JSON.stringify(sel)) } catch { /* storage blocked */ }
}
export function loadSelection() {
  try { return JSON.parse(sessionStorage.getItem(KEY)) } catch { return null }
}

/** What the main button should do for this selection, given the flags. */
export function ctaMode(hasPlan) {
  if (!FLAGS.ordersOpen) return 'notify'
  if (hasPlan && !FLAGS.planCheckout) return 'notify'
  return 'checkout'
}

export function startCheckout(sel, navigate) {
  saveSelection(sel)
  track('order_checkout_start', { device: sel.deviceId, commitment: sel.commitment, capture: sel.captureId || '', spark: sel.sparkId || '' })
  navigate('/checkout')
}
