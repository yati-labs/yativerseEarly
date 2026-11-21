import { useState, useRef } from 'react'
import { Link }              from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Check, Star, Zap, Users, Shield, Gift, ChevronDown } from 'lucide-react'
import SEO from '../components/SEO'
import { fadeUp, fadeLeft, fadeRight, scaleIn, heroEntrance } from '../lib/motion'

const GOLD   = '#C9A84C'
const GOLD2  = '#F5D27A'
const BLUE   = '#605CFF'
const PURPLE = '#C86DD7'
const TEAL   = '#4ECDC4'

const TIERS = [
  {
    name:       'Pioneer',
    badge:      '🔥 Most popular',
    badgeColor: GOLD,
    price:      '$49',
    period:     'one-time deposit',
    desc:       'Lock in your ring, first-day shipping, and full founder pricing.',
    features:   ['Signal Ring at founder price','First-wave shipping priority','Free sizing kit','1 year yAtIverse OS access','Private Discord — Pioneer channel'],
    cta:        'Claim Pioneer Spot',
    highlight:  true,
    color:      GOLD,
  },
  {
    name:       'Explorer',
    badge:      'Great value',
    badgeColor: BLUE,
    price:      '$0',
    period:     'free waitlist',
    desc:       'Hold your spot and get notified when doors open.',
    features:   ['Waitlist priority access','Launch-day notification','Community Discord access','Early product updates'],
    cta:        'Join Free Waitlist',
    highlight:  false,
    color:      BLUE,
  },
  {
    name:       'Ecosystem',
    badge:      '🚀 Full stack',
    badgeColor: PURPLE,
    price:      '$149',
    period:     'full reservation',
    desc:       'Reserve the ring + get full platform access from day one.',
    features:   ['Everything in Pioneer','yAtI Flow Thread pre-order slot','Full AI agent suite — 6 months free','1:1 onboarding call','Founding member badge'],
    cta:        'Reserve Full Stack',
    highlight:  false,
    color:      PURPLE,
  },
]

const TRUST_SIGNALS = [
  { icon:Shield, text:'Fully refundable deposit' },
  { icon:Users,  text:'1,200+ founders reserved' },
  { icon:Star,   text:'4.9 / 5 from beta testers' },
  { icon:Zap,    text:'Ships Q4 2026' },
]

const TESTIMONIALS = [
  { q:'I reserved in the first 10 minutes. The OS demo alone sold me — this is what I\'ve been waiting for as a solo founder.', name:'Neha P.',   role:'Co-founder, Studio Arc', av:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=80&q=80' },
  { q:'The ring + agents combo is absurd value. I\'m replacing 3 tools and a VA with this.', name:'Marcus L.', role:'Indie Founder', av:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80' },
  { q:'Reserved for myself and two teammates. The ecosystem pricing is a steal for what you get.', name:'Priya S.',  role:'Solo Operator', av:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80' },
]

const FAQS = [
  { q:'When does the Signal Ring ship?',         a:'We\'re targeting Q4 2026 for Pioneer and Ecosystem tier. Explorer waitlist gets notified at launch.' },
  { q:'Is my deposit refundable?',               a:'Yes — fully refundable, no questions asked, any time before shipping confirmation.' },
  { q:'What\'s included in yAtIverse OS access?', a:'Full access to yAtI OS, all 4 AI agents, workflow templates, and the founder community.' },
  { q:'Can I upgrade my tier later?',            a:'Yes. You can upgrade from Explorer to Pioneer or Ecosystem at any time before shipping.' },
  { q:'Do I need a smartphone?',                 a:'The ring pairs with iOS and Android. The companion app is where your dashboard lives.' },
]

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=60&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=60&q=80',
]

function TierCard({ tier, index }) {
  const [email, setEmail] = useState('')
  const [done,  setDone]  = useState(false)

  return (
    <motion.div
      {...fadeUp(index * 0.1)}
      className={`relative rounded-3xl p-7 flex flex-col transition-all duration-300 ${tier.highlight ? 'scale-[1.03]' : ''}`}
      style={{
        background: tier.highlight ? `linear-gradient(135deg, ${tier.color}18, rgba(255,255,255,0.04))` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${tier.highlight ? tier.color + '50' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: tier.highlight ? `0 0 60px ${tier.color}20` : 'none',
      }}>

      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-wider uppercase mb-5 w-fit"
        style={{ background:`${tier.badgeColor}18`, color:tier.badgeColor, border:`1px solid ${tier.badgeColor}30` }}>
        {tier.badge}
      </div>

      <p className="font-display font-bold text-xl text-white mb-1">{tier.name}</p>
      <p className="font-body text-xs text-white/42 mb-4 leading-relaxed">{tier.desc}</p>

      <div className="mb-5">
        <span className="font-display font-bold text-white" style={{ fontSize:'clamp(2rem,4vw,2.8rem)' }}>{tier.price}</span>
        <span className="font-body text-xs text-white/38 ml-2">{tier.period}</span>
      </div>

      <div className="flex flex-col gap-2.5 mb-7 flex-1">
        {tier.features.map(f => (
          <div key={f} className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background:`${tier.color}25`, border:`1px solid ${tier.color}40` }}>
              <Check className="w-2.5 h-2.5" style={{ color:tier.color }} />
            </div>
            <span className="font-body text-xs text-white/65 leading-relaxed">{f}</span>
          </div>
        ))}
      </div>

      {done ? (
        <div className="flex items-center gap-2 py-3.5 rounded-full justify-center"
          style={{ background:`${tier.color}20`, border:`1px solid ${tier.color}40` }}>
          <Check className="w-4 h-4" style={{ color:tier.color }} />
          <span className="font-display font-semibold text-sm" style={{ color:tier.color }}>You're in!</span>
        </div>
      ) : tier.price === '$0' ? (
        <form onSubmit={e => { e.preventDefault(); if (email) setDone(true) }} className="flex gap-2">
          <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required
            className="flex-1 min-w-0 bg-white/[0.05] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/25 outline-none focus:border-brand-purple/50 transition-colors font-body" />
          <button type="submit" className="flex-shrink-0 px-4 py-2.5 rounded-full font-display font-bold text-xs text-white transition-all hover:scale-105"
            style={{ background:`linear-gradient(135deg,${tier.color},${PURPLE})` }}>
            Join
          </button>
        </form>
      ) : (
        <Link to="/waitlist"
          className="inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-display font-bold text-sm text-black transition-all duration-300 hover:scale-[1.02]"
          style={{ background: tier.highlight ? `linear-gradient(135deg,${GOLD},${GOLD2})` : `linear-gradient(135deg,${tier.color},${PURPLE})`, color: tier.highlight ? '#000' : '#fff', boxShadow: tier.highlight ? `0 0 30px ${tier.color}30` : 'none' }}>
          {tier.cta} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </motion.div>
  )
}

export default function EarlyAccess() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target:heroRef, offset:['start start','end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0,0.6], [1,0])
  const heroY       = useTransform(scrollYProgress, [0,1], ['0%','15%'])
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
      <SEO
        title="Early Access — Reserve Your Signal Ring"
        description="Join 1,200+ founders reserving the yAtIverse Signal Ring. Three access tiers. Fully refundable deposit. Ships Q4 2026."
        path="/early-access"
        image="https://yAtIverse.com/og-early-access.png"
      />

      {/* JSON-LD Offer Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context":"https://schema.org",
        "@type":"Offer",
        "name":"yAtIverse Signal Ring — Early Access",
        "description":"Reserve your yAtIverse Signal Ring at founder pricing. Fully refundable. Ships Q4 2026.",
        "url":"https://yAtIverse.com/early-access",
        "priceCurrency":"USD",
        "price":"49",
        "availability":"https://schema.org/PreOrder",
        "validFrom":"2026-01-01",
        "seller":{ "@type":"Organization", "name":"yAtIverse" }
      })}} />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen min-h-[680px] overflow-hidden bg-black">
        <motion.div className="absolute inset-0" style={{ y:heroY }}>
          <img src="ring4.jpeg"
            alt="Signal Ring early access" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0" style={{ background:'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.75) 80%, #000 100%)' }} />
        </motion.div>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:`radial-gradient(ellipse 55% 40% at 50% 55%, rgba(96,92,255,0.10), transparent 70%)` }} />

        <motion.div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto"
          style={{ opacity:heroOpacity }}>

          {/* Live badge */}
          <motion.div {...heroEntrance(0.3)} className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium tracking-widest uppercase"
              style={{ border:`1px solid ${TEAL}40`, color:TEAL, background:`${TEAL}12` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:TEAL }} />
              Early Access — Now Open
            </div>
          </motion.div>

          <motion.h1 {...heroEntrance(0.42)} className="font-display font-bold leading-[0.95] tracking-[-0.04em] mb-5 text-white"
            style={{ fontSize:'clamp(3rem,9vw,7.5rem)' }}>
            Be first.<br />
            <span style={{ background:`linear-gradient(135deg,${GOLD},${GOLD2},${GOLD})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', backgroundSize:'200% auto' }}>
              Start up right.
            </span>
          </motion.h1>

          <motion.p {...heroEntrance(0.55)} className="font-body text-lg sm:text-xl text-white/62 max-w-xl mb-8 leading-relaxed">
            Reserve your Signal Ring, lock in founder pricing, and get full yAtIverse ecosystem access from day one.
          </motion.p>

          {/* Social proof */}
          <motion.div {...heroEntrance(0.65)} className="flex items-center gap-3 mb-8">
            <div className="flex">
              {AVATARS.map((s,i) => <img key={i} src={s} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-black -ml-2 first:ml-0" loading="lazy" />)}
            </div>
            <span className="font-body text-sm text-white/48">
              <span className="text-white/80 font-semibold">1,200+ founders</span> already reserved
            </span>
          </motion.div>

          <motion.div {...heroEntrance(0.75)} className="flex flex-col sm:flex-row gap-3">
            <a href="#tiers"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-display font-bold text-sm text-black transition-all duration-300 hover:scale-105"
              style={{ background:`linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow:`0 0 40px rgba(201,168,76,0.40)` }}>
              See Access Tiers <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/signal-ring"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-display font-semibold text-sm text-white/80 hover:text-white transition-all duration-300"
              style={{ border:'1px solid rgba(255,255,255,0.18)' }}>
              Explore the Ring
            </Link>
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }} style={{ opacity:heroOpacity }}>
          <span className="font-mono text-[10px] tracking-widest text-white/32">SCROLL</span>
          <motion.div animate={{ y:[0,6,0] }} transition={{ duration:1.5, repeat:Infinity }}>
            <ChevronDown className="w-4 h-4 text-white/32" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="bg-black border-y border-white/[0.06] py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8">
          {TRUST_SIGNALS.map(({ icon:Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 text-white/35" strokeWidth={1.5} />
              <span className="font-mono text-xs text-white/42">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TIERS ── */}
      <section id="tiers" className="py-24 bg-black relative overflow-hidden px-4">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:`radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.05), transparent 70%)` }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <motion.span {...fadeUp(0)} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-5"
              style={{ border:`1px solid ${GOLD}35`, color:GOLD, background:`${GOLD}08` }}>
              <Gift className="w-3.5 h-3.5" /> Access Tiers
            </motion.span>
            <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white"
              style={{ fontSize:'clamp(2rem,4.5vw,3.5rem)' }}>
              Choose your{' '}
              <span style={{ color:GOLD, textShadow:`0 0 30px rgba(201,168,76,0.4)` }}>entry point.</span>
            </motion.h2>
            <motion.p {...fadeUp(0.12)} className="font-body text-base text-white/50 max-w-md mx-auto mt-4 leading-relaxed">
              Every tier gets you into the ecosystem. Pioneer and Ecosystem lock in the ring.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {TIERS.map((tier, i) => <TierCard key={tier.name} tier={tier} index={i} />)}
          </div>

          <motion.p {...fadeUp(0.3)} className="text-center mt-8 font-body text-xs text-white/30">
            All deposits are fully refundable · Secure checkout · No hidden fees
          </motion.p>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-[#0A0900] px-4 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.span {...fadeUp(0)} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-5"
              style={{ border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)' }}>
              Early reservations
            </motion.span>
            <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white"
              style={{ fontSize:'clamp(1.9rem,3.5vw,3rem)' }}>
              Why founders
              <span style={{ background:`linear-gradient(135deg,${GOLD},${GOLD2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}> reserved early.</span>
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} {...fadeUp(i * 0.09)}
                className="rounded-2xl p-6 transition-all duration-300"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_,j) => <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color:GOLD }} />)}
                </div>
                <p className="font-body text-sm text-white/68 leading-relaxed italic mb-5">"{t.q}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.av} alt={t.name} className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                  <div>
                    <p className="text-xs font-semibold font-body text-white leading-none">{t.name}</p>
                    <p className="text-[10px] text-white/38 mt-0.5 font-body">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-black px-4 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <motion.span {...fadeUp(0)} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-4"
              style={{ border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)' }}>FAQ</motion.span>
            <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white"
              style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)' }}>
              Questions answered.
            </motion.h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {FAQS.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}
                className="rounded-2xl overflow-hidden"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <button className="w-full flex justify-between items-center px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-sm font-medium font-body text-white">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-white/38 flex-shrink-0 ml-4 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-4 text-sm font-body text-white/50 leading-relaxed">{f.a}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-28 overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:`radial-gradient(ellipse 55% 45% at 50% 50%, rgba(201,168,76,0.08), transparent 70%)` }} />
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background:`linear-gradient(to right, transparent, ${GOLD}40, transparent)` }} />

        <div className="relative z-10 max-w-xl mx-auto px-4 text-center">
          <motion.div {...fadeUp(0)} className="space-y-4 mb-10">
            <p className="font-mono text-[10px] tracking-widest uppercase text-white/32">Limited spots</p>
            <h2 className="font-display font-bold leading-[1.0] tracking-tight text-white"
              style={{ fontSize:'clamp(2.2rem,5vw,4rem)' }}>
              The future is wearable.<br />
              <span style={{ color:GOLD, textShadow:`0 0 40px rgba(201,168,76,0.45)` }}>Your impact is limitless.</span>
            </h2>
            <p className="font-body text-base text-white/52 max-w-md mx-auto leading-relaxed">
              Start with a ring. Build with tools. Scale with AI. Your spot is waiting.
            </p>
          </motion.div>
          <motion.div {...fadeUp(0.12)} className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#tiers"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-display font-bold text-sm text-black transition-all duration-300 hover:scale-105"
              style={{ background:`linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow:`0 0 36px rgba(201,168,76,0.35)`, fontSize:'1rem' }}>
              Reserve My Spot <ArrowRight className="w-5 h-5" />
            </a>
            <Link to="/signal-ring"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-display font-semibold text-sm text-white/70 hover:text-white transition-all duration-300"
              style={{ border:'1px solid rgba(255,255,255,0.15)' }}>
              Learn More First
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
