import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, Truck, RotateCcw, ShieldCheck, Lock, ShoppingBag } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { fadeUp, fadeLeft, fadeRight } from '../lib/motion'
import { useCart } from '../lib/cart'

const GOLD   = '#C9A84C'
const GOLD2  = '#F5D27A'
const BLUE   = '#605CFF'

const RING_IMAGES = ['ring1.jpeg', 'ring2.jpeg', 'ring3.jpeg', 'ring4.jpeg']
const COLORS = [
  { name: 'Titanium Gold', hex: '#C9A84C' },
  { name: 'Cosmic Black',  hex: '#1C1C1E' },
  { name: 'Lunar Silver',  hex: '#C0C0C0' },
]
const SIZES = ['5', '6', '7', '8', '9', '10', '11', '12']
const UNIT_PRICE_CENTS = 14900

const RING_PRODUCT = {
  sku: 'signal-ring',
  name: 'Signal Ring',
  unitPriceCents: UNIT_PRICE_CENTS,
}

const POLICY_FAQS = [
  {
    icon: Truck,
    q: 'Shipping',
    a: 'We ship to US addresses only for now. A free sizing kit ships first so you can confirm your size before the ring itself goes out — this avoids most size-exchange returns. Once your Signal Ring ships, standard delivery runs 3–5 business days via USPS or UPS; expedited options will be offered at checkout when payment goes live.',
  },
  {
    icon: RotateCcw,
    q: 'Returns & exchanges',
    a: '30-day return window from the delivery date, unworn and in original packaging, for a full refund to your original payment method. Size exchanges are free within that window. To start a return, email support@yativerse.ai with your order ID.',
  },
  {
    icon: ShieldCheck,
    q: 'Warranty',
    a: 'Every Signal Ring includes a 1-year limited warranty against manufacturing defects. Accidental damage isn\'t covered, but reach out — we handle these case by case.',
  },
]

function Stepper({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-display font-bold"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>–</button>
      <span className="font-display font-semibold text-white w-6 text-center">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(10, value + 1))}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-display font-bold"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>+</button>
    </div>
  )
}

function PolicyRow({ item, open, onToggle }) {
  const Icon = item.icon
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}30` }}>
            <Icon className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.5} />
          </span>
          <span className="font-display font-semibold text-sm text-white">{item.q}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="font-body text-sm text-white/58 leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function Order() {
  const { addItem } = useCart()

  const [activeImg, setActiveImg] = useState(0)
  const [color, setColor] = useState(0)
  const [size, setSize] = useState('9')
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  const handleAddToCart = () => {
    addItem(RING_PRODUCT, {
      colorName: COLORS[color].name,
      colorHex: COLORS[color].hex,
      size,
      qty,
      image: RING_IMAGES[0],
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2200)
  }

  return (
    <>
      <SEO
        title="Shop Signal Ring — yAtIverse"
        description="Choose your finish and size, add your Signal Ring to cart, and check out securely with Stripe."
        path="/order"
      />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'yAtIverse Signal Ring',
        description: 'Smart ring with sleep, activity, and Balance scores, HR/SpO2/HRV history, VitalAge, and daily AI-generated insights.',
        brand: { '@type': 'Brand', name: 'yAtIverse' },
        offers: { '@type': 'Offer', price: (UNIT_PRICE_CENTS / 100).toFixed(2), priceCurrency: 'USD', availability: 'https://schema.org/PreOrder', url: 'https://yativerse.ai/order' },
        image: `https://yativerse.ai/${RING_IMAGES[0]}`,
        category: 'Smart Ring / Wearable Technology',
      }) }} />

      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />

        <section className="relative pt-32 pb-16 px-4">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.08), transparent 70%)` }} />

          <div className="relative max-w-6xl mx-auto">
            <motion.div {...fadeUp(0)} className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase mb-5"
                style={{ border: `1px solid ${GOLD}40`, color: GOLD, background: `${GOLD}0D` }}>
                Shop yAtIverse
              </div>
              <h1 className="font-display font-bold tracking-tight text-white" style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)' }}>
                Wear the <span style={{ color: GOLD }}>Signal.</span>
              </h1>
            </motion.div>

            {/* ── PRODUCT: gallery + configurator ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
              {/* Gallery */}
              <motion.div {...fadeLeft(0.05)}>
                <div className="rounded-3xl overflow-hidden aspect-square mb-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImg}
                      src={RING_IMAGES[activeImg]}
                      alt={`Signal Ring — view ${activeImg + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {RING_IMAGES.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className="rounded-xl overflow-hidden aspect-square transition-all"
                      style={{ border: activeImg === i ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.10)', opacity: activeImg === i ? 1 : 0.6 }}
                    >
                      <img src={src} alt={`Signal Ring thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Configurator */}
              <motion.div {...fadeRight(0.1)} className="flex flex-col">
                <p className="font-mono text-[11px] tracking-widest uppercase text-white/38 mb-2">Signal Ring</p>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="font-display font-bold text-3xl text-white">${(UNIT_PRICE_CENTS / 100).toFixed(0)}</span>
                  <span className="font-body text-sm text-white/40">Founder pricing — order now</span>
                </div>

                <div className="rounded-3xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">
                    Finish — {COLORS[color].name}
                  </p>
                  <div className="flex gap-3 mb-6">
                    {COLORS.map((c, i) => (
                      <button key={c.name} type="button" onClick={() => setColor(i)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-body transition-all"
                        style={{
                          background: color === i ? `${GOLD}18` : 'rgba(255,255,255,0.04)',
                          border: color === i ? `1px solid ${GOLD}60` : '1px solid rgba(255,255,255,0.10)',
                          color: color === i ? GOLD : 'rgba(255,255,255,0.6)',
                        }}>
                        <span className="w-4 h-4 rounded-full" style={{ background: c.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                        {c.name}
                      </button>
                    ))}
                  </div>

                  <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">Size — not sure? Free sizing kit ships first.</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {SIZES.map((s) => (
                      <button key={s} type="button" onClick={() => setSize(s)}
                        className="w-10 h-10 rounded-xl font-mono text-sm font-semibold transition-all"
                        style={{
                          background: size === s ? `${GOLD}18` : 'rgba(255,255,255,0.05)',
                          border: size === s ? `1px solid ${GOLD}60` : '1px solid rgba(255,255,255,0.10)',
                          color: size === s ? GOLD : '#fff',
                        }}>{s}</button>
                    ))}
                  </div>

                  <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">Quantity</p>
                  <Stepper value={qty} onChange={setQty} />
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-full font-display font-bold text-sm text-black transition-all duration-300 hover:scale-[1.01]"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: `0 0 30px rgba(201,168,76,0.3)` }}
                >
                  {justAdded ? (
                    <>Added to cart <Check className="w-4 h-4" /></>
                  ) : (
                    <>Add to cart <ShoppingBag className="w-4 h-4" /></>
                  )}
                </button>
                <AnimatePresence>
                  {justAdded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 rounded-xl px-4 py-2.5 text-xs font-body text-center" style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}30`, color: GOLD }}>
                        Added — <Link to="/checkout" className="underline">go to checkout</Link> when you're ready.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6 rounded-2xl px-5 py-4 flex items-start gap-3" style={{ background: `${BLUE}0D`, border: `1px solid ${BLUE}25` }}>
                  <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: BLUE }} />
                  <p className="font-body text-xs text-white/55 leading-relaxed">
                    Secure checkout, powered by Stripe. You'll enter shipping and payment details on the next step — right here on yativerse.ai, no redirect.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ── MORE FROM yAtIverse (locked yAtI Flow) ── */}
            <motion.div {...fadeUp(0.05)} className="mb-16">
              <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">More from <span className="normal-case">yAtIverse</span></p>
              <div className="rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="relative w-full sm:w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src="/flow/thread-max.jpg" alt="yAtI Flow Thread Max" className="w-full h-full object-cover grayscale opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <Lock className="w-4 h-4 text-white/70" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display font-bold text-white text-lg">yAtI Flow</h3>
                    <span className="text-[10px] font-mono px-2 py-1 rounded-full uppercase tracking-widest" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Coming soon
                    </span>
                  </div>
                  <p className="font-body text-sm text-white/50 max-w-md">
                    Thread One and Thread Max turn your conversations into follow-ups. Not orderable yet. Join the waitlist.
                  </p>
                </div>
                <button type="button" disabled
                  className="font-display font-semibold text-xs px-5 py-2.5 rounded-full text-white/30 flex-shrink-0 cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Coming soon
                </button>
              </div>
            </motion.div>

            {/* ── POLICY FAQ ── */}
            <motion.div {...fadeUp(0.05)} className="max-w-2xl">
              <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">Shipping, returns & warranty</p>
              <div className="space-y-3">
                {POLICY_FAQS.map((item, i) => (
                  <PolicyRow key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
