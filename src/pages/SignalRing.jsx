import { useRef, useState } from 'react'
import { Link }              from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown, Moon, Activity, Scale, TrendingUp, Droplet, Sparkles, ShieldCheck, History, PlayCircle } from 'lucide-react'
import SEO from '../components/SEO'
import { fadeUp, fadeLeft, fadeRight, scaleIn, heroEntrance } from '../lib/motion'

/* ── tokens ── */
const GOLD   = '#C9A84C'
const GOLD2  = '#F5D27A'
const BLUE   = '#605CFF'
const PURPLE = '#C86DD7'
const PINK   = '#FF6B8A'
const TEAL   = '#4ECDC4'

/* ── data ── */
const COLORS = [
  { name:'Titanium Gold',  hex:'#C9A84C', glow:'rgba(201,168,76,0.55)'  },
  { name:'Cosmic Black',   hex:'#1C1C1E', glow:'rgba(120,120,140,0.45)' },
  { name:'Lunar Silver',   hex:'#C0C0C0', glow:'rgba(192,192,192,0.45)' },
]

/* Home-screen elements, shown as pills under the hero */
const HOME_SIGNALS = [
  { icon:Moon,       label:'Sleep Score',    color:PURPLE },
  { icon:Activity,   label:'Activity Score', color:TEAL   },
  { icon:Scale,      label:'Balance Score',  color:GOLD   },
  { icon:TrendingUp, label:'HR Trend',       color:PINK   },
  { icon:Droplet,    label:'SpO2 Trend',     color:BLUE   },
  { icon:Sparkles,   label:'Daily Insights', color:'#FF6B6B' },
]

const FEATURES = [
  {
    tag:'Home',
    title:'Every morning,\nthe full picture.',
    body:'Sleep score with a full hypnogram and time/HR/SpO2 breakdown. Activity score with a clear grade. A Balance score blending stress reaction and recovery. HR and SpO2 trend graphs, plus an AI-generated daily insight that tells you what actually matters — no dashboard-reading required.',
    img:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85', accent:PURPLE, align:'left'
  },
  {
    tag:'Health',
    title:'Deeper metrics,\nwhen you want them.',
    body:'Steps, calories, and distance. VitalAge — a transparent fitness-age estimate, not a medical claim. Strain & Recovery, Metabolism Management, and full sleep detail. HR, SpO2, and HRV with day / week / month history. Stress score, VO2max estimate, and a temperature UI that’s ready for when sensor data is wired in.',
    img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=85', accent:TEAL, align:'right'
  },
  {
    tag:'Honest By Design',
    title:'No fabricated\nnumbers. Ever.',
    body:'If a reading isn’t in yet, Signal Ring shows “––” instead of guessing. The same philosophy runs through women’s health: a manual calendar for logging period days — logged, not predicted, not guessed.',
    img:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85', accent:GOLD,   align:'left'
  },
  {
    tag:'Account',
    title:'Yours, wherever\nyou sign in.',
    body:'Real login and signup with email, cloud backup and sync across devices, and password reset by email. Want to look around first? Try demo mode — explore the full app before you ever pair a ring.',
    img:'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=85', accent:BLUE,   align:'right'
  },
]

const SPECS = [
  { label:'Sensors',      value:'Optical HR · SpO2 · Accelerometer · Temp-ready' },
  { label:'Battery',      value:'72 hrs continuous wear' },
  { label:'Insights',     value:'Daily AI-generated summary' },
  { label:'Connectivity', value:'Bluetooth 5.3 LE' },
  { label:'Materials',    value:'Grade 5 Titanium' },
  { label:'Sizes',        value:'5 · 6 · 7 · 8 · 9 · 10 · 11 · 12' },
  { label:'Water',        value:'IP68 — 100m rated' },
  { label:'App',          value:'Cloud sync · Demo mode' },
]

const TRUST_CARDS = [
  { icon:ShieldCheck, title:'No fabricated numbers',     body:'If a metric isn’t measured yet, the app shows “––.” We’d rather show nothing than guess.' },
  { icon:History,     title:'Full history, not just today', body:'HR, SpO2, and HRV tracked across day, week, and month views — so trends are visible, not just snapshots.' },
  { icon:PlayCircle,  title:'Try before you pair',         body:'Demo mode lets you explore the entire yAtI app — Home, Health, everything — before your ring even arrives.' },
]

/* ── Feature row ── */
function FeatureRow({ feature }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target:ref, offset:['start end','end start'] })
  const imgScale = useTransform(scrollYProgress, [0,1], [1.06,1])
  const isLeft   = feature.align === 'left'

  return (
    <motion.div ref={ref}
      className="grid grid-cols-1 md:grid-cols-2 min-h-[560px] border-t border-white/[0.05]"
      initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true, amount:0.1 }} transition={{ duration:0.5 }}>

      {/* Image */}
      <div className={`relative overflow-hidden min-h-[320px] md:min-h-0 ${isLeft ? 'md:order-1' : 'md:order-2'}`}>
        <motion.img src={feature.img} alt={feature.tag} className="absolute inset-0 w-full h-full object-cover" style={{ scale:imgScale }} />
        <div className="absolute inset-0" style={{ background: isLeft
          ? 'linear-gradient(to left, rgba(0,0,0,0.55) 0%, transparent 50%)'
          : 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:`radial-gradient(ellipse 50% 50% at ${isLeft?'80%':'20%'} 50%, ${feature.accent}18, transparent 70%)` }} />
      </div>

      {/* Copy */}
      <div className={`relative flex items-center bg-black ${isLeft ? 'md:order-2' : 'md:order-1'}`}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:`radial-gradient(ellipse 60% 60% at ${isLeft?'20%':'80%'} 50%, ${feature.accent}07, transparent 70%)` }} />
        <div className="relative z-10 px-8 py-14 lg:px-16 space-y-5 max-w-xl">
          <motion.div initial={{ opacity:0, x: isLeft?24:-24 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.65 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase mb-5"
              style={{ border:`1px solid ${feature.accent}40`, color:feature.accent, background:`${feature.accent}0D` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background:feature.accent }} />{feature.tag}
            </div>
            <h2 className="font-display font-bold leading-[1.05] tracking-tight whitespace-pre-line mb-4 text-white"
              style={{ fontSize:'clamp(2rem,3.2vw,2.8rem)' }}>{feature.title}</h2>
            <p className="font-body text-base leading-relaxed text-white/58 max-w-sm">{feature.body}</p>
          </motion.div>
          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.2 }}>
            <a href="#reserve" className="inline-flex items-center gap-2 font-display font-semibold text-sm transition-all duration-200 hover:gap-3"
              style={{ color:feature.accent }}>Reserve yours <ArrowRight className="w-4 h-4" /></a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════ */
export default function SignalRing() {
  const [activeColor, setActiveColor] = useState(0)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target:heroRef, offset:['start start','end start'] })
  const heroScale   = useTransform(scrollYProgress, [0,1], [1,1.08])
  const heroOpacity = useTransform(scrollYProgress, [0,0.7], [1,0])
  const heroY       = useTransform(scrollYProgress, [0,1], ['0%','20%'])

  return (
    <>
      <SEO
        title="Signal Ring — Wear the Signal"
        description="The smart ring that tracks sleep, activity, and balance with honest numbers — real hypnograms, HR/SpO2/HRV history, VitalAge, and daily AI insights. No fabricated data, ever."
        path="/signal-ring"
        image="https://yAtIverse.com/og-signal-ring.png"
      />

      {/* JSON-LD Product Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context":"https://schema.org",
        "@type":"Product",
        "name":"yAtIverse Signal Ring",
        "description":"Smart ring with sleep, activity, and Balance scores, HR/SpO2/HRV history, VitalAge, Strain & Recovery, and daily AI-generated insights — paired with the yAtI app. Grade 5 Titanium build.",
        "brand":{ "@type":"Brand", "name":"yAtIverse" },
        "offers":{ "@type":"Offer", "price":"149", "priceCurrency":"USD", "availability":"https://schema.org/PreOrder", "url":"https://yAtIverse.com/signal-ring" },
        "image":"https://yAtIverse.com/og-signal-ring.png",
        "category":"Smart Ring / Wearable Technology",
        "aggregateRating":{ "@type":"AggregateRating", "ratingValue":"4.9", "reviewCount":"1200" }
      })}} />

      {/* ── 1. CINEMATIC HERO ── */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] overflow-hidden bg-black">
        <motion.div className="absolute inset-0" style={{ scale:heroScale, y:heroY }}>
          <img src="ring1.jpeg"
            alt="Signal Ring hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background:'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.7) 85%, #000 100%)' }} />
        </motion.div>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:`radial-gradient(ellipse 60% 40% at 50% 60%, rgba(201,168,76,0.08), transparent 70%)` }} />

        <motion.div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4" style={{ opacity:heroOpacity }}>
          <motion.div {...heroEntrance(0.3)} className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium tracking-widest uppercase"
              style={{ border:`1px solid rgba(201,168,76,0.40)`, color:GOLD, background:'rgba(201,168,76,0.10)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:GOLD }} />
              yAtIverse Signal Ring
            </div>
          </motion.div>

          <motion.h1 {...heroEntrance(0.45)}
            className="font-display font-bold leading-[0.95] tracking-[-0.04em] mb-6 text-white"
            style={{ fontSize:'clamp(3.2rem,10vw,8rem)' }}>
            Wear the<br />
            <span style={{
              background:`linear-gradient(135deg, ${GOLD} 0%, #fff 50%, ${GOLD} 100%)`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', backgroundSize:'200% auto'
            }}>Signal.</span>
          </motion.h1>

          <motion.p {...heroEntrance(0.6)} className="font-body text-lg sm:text-xl max-w-xl mb-10 leading-relaxed text-white/65">
            Real sleep, activity, and Balance scores — with honest numbers and daily insights, not guesses.
          </motion.p>

          <p className="mb-4 font-body text-sm text-white/55">Coming later. The Signal Ring launches after Thread One and Thread Max. Reserve early access to be first in line.</p>
          <motion.div {...heroEntrance(0.75)} className="flex flex-col sm:flex-row gap-3 items-center">
            <a href="#reserve"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-display font-bold text-sm text-black transition-all duration-300 hover:scale-105"
              style={{ background:`linear-gradient(135deg,${GOLD},${GOLD2},${GOLD})`, backgroundSize:'200% auto', boxShadow:`0 0 40px rgba(201,168,76,0.40)` }}>
              Reserve Yours <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-display font-semibold text-sm transition-all duration-300 text-white/80 hover:text-white"
              style={{ border:'1px solid rgba(255,255,255,0.18)' }}>
              Explore Features
            </a>
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.6 }} style={{ opacity:heroOpacity }}>
          <span className="font-mono text-[10px] tracking-widest text-white/35">SCROLL</span>
          <motion.div animate={{ y:[0,6,0] }} transition={{ duration:1.5, repeat:Infinity }}>
            <ChevronDown className="w-4 h-4 text-white/35" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. HOME SIGNALS BREAK ── */}
      <section className="py-28 bg-black relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:`radial-gradient(ellipse 50% 60% at 50% 50%, rgba(201,168,76,0.05), transparent 70%)` }} />
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.h2 {...fadeUp(0)} className="font-display font-bold tracking-tight leading-[1.1] mb-12 text-white"
            style={{ fontSize:'clamp(2rem,5vw,4rem)' }}>
            Everything your body's telling you.{' '}
            <span style={{ color:GOLD, textShadow:`0 0 40px rgba(201,168,76,0.4)` }}>On one screen.</span>
            <br /><span className="text-white/40">Zero guessing.</span>
          </motion.h2>
          <motion.div {...fadeUp(0.12)} className="flex flex-wrap justify-center gap-3">
            {HOME_SIGNALS.map(({ icon:Icon, label, color }) => (
              <div key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono transition-all duration-300 hover:scale-105"
                style={{ border:`1px solid ${color}30`, color, background:`${color}0D` }}>
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />{label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 3. FEATURE SCROLL ── */}
      <section id="features" className="bg-black">
        {FEATURES.map(f => <FeatureRow key={f.tag} feature={f} />)}
      </section>

      {/* ── 4. HONEST BY DESIGN ── */}
      <section className="py-28 relative overflow-hidden bg-[#0A0900]">
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background:`linear-gradient(to right, transparent, ${GOLD}40, transparent)` }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-7">
            <motion.div {...fadeLeft(0)}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-5"
                style={{ border:`1px solid ${BLUE}40`, color:BLUE, background:`${BLUE}0D` }}>Design Ethos</div>
              <h2 className="font-display font-bold tracking-tight leading-[1.06] text-white mb-4"
                style={{ fontSize:'clamp(2rem,4vw,3.2rem)' }}>
                Real numbers.{' '}
                <span style={{ background:`linear-gradient(135deg,${BLUE},${PURPLE},${GOLD})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  Never fabricated.
                </span>
              </h2>
              <p className="font-body text-base leading-relaxed text-white/58">
                Every morning, the yAtI app turns your sleep, activity, and Balance data into a plain-language insight — no dashboard-reading required. And if a reading isn't in yet, it says so: you'll see "--" instead of a guessed number.
              </p>
            </motion.div>
            <motion.div {...fadeLeft(0.12)} className="space-y-3">
              {TRUST_CARDS.map(({ icon:Icon, title, body }) => (
                <div key={title} className="flex gap-4 p-4 rounded-2xl"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:`${BLUE}18`, border:`1px solid ${BLUE}30` }}>
                    <Icon className="w-4 h-4" style={{ color:BLUE }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-white mb-1">{title}</p>
                    <p className="font-body text-xs text-white/48 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div {...scaleIn(0.15)} className="relative rounded-3xl overflow-hidden aspect-[4/5]"
            style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80"
              alt="yAtI app dashboard" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0" style={{ background:'linear-gradient(to top, rgba(10,9,0,0.85) 0%, transparent 50%)' }} />
            <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl"
              style={{ background:'rgba(10,9,0,0.88)', border:`1px solid ${GOLD}22`, backdropFilter:'blur(12px)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px]" style={{ color:GOLD }}>Daily Insight</span>
                <span className="font-mono text-[10px] text-white/35">This morning</span>
              </div>
              <p className="font-display font-semibold text-sm text-white">Balance score: 82</p>
              <p className="font-body text-xs mt-0.5 text-white/48">Recovery outpaced yesterday's stress — good day for deep work</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 5. COLOR SELECTOR ── */}
      <section className="py-28 bg-black relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background:`linear-gradient(to right, transparent, ${GOLD}28, transparent)` }} />
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.span {...fadeUp(0)} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-5"
              style={{ border:`1px solid ${GOLD}35`, color:GOLD, background:`${GOLD}08` }}>Finishes</motion.span>
            <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white"
              style={{ fontSize:'clamp(2rem,4.5vw,3.5rem)' }}>
              Wear what{' '}
              <span style={{ color:GOLD, textShadow:`0 0 30px rgba(201,168,76,0.4)` }}>feels right.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Ring visual */}
            <motion.div {...fadeLeft(0.1)} className="flex items-center justify-center">
              <div className="relative w-72 h-72 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ background:COLORS[activeColor].glow, filter:'blur(60px)', transform:'scale(0.8)' }} />
                <AnimatePresence mode="wait">
                  <motion.div key={activeColor}
                    initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
                    transition={{ duration:0.35 }}
                    className="relative w-52 h-52 rounded-full"
                    style={{
                      background:`radial-gradient(circle at 35% 35%, ${COLORS[activeColor].hex}EE, ${COLORS[activeColor].hex}88 60%, ${COLORS[activeColor].hex}33 100%)`,
                      boxShadow:`0 0 0 12px ${COLORS[activeColor].hex}22, 0 0 60px ${COLORS[activeColor].glow}`,
                    }}>
                    <div className="absolute inset-8 rounded-full bg-black" />
                    <div className="absolute top-4 left-8 w-12 h-5 rounded-full opacity-40"
                      style={{ background:'rgba(255,255,255,0.6)', filter:'blur(6px)', transform:'rotate(-30deg)' }} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Options */}
            <motion.div {...fadeRight(0.15)} className="space-y-8">
              <div>
                <p className="font-mono text-[10px] tracking-widest uppercase mb-4 text-white/38">
                  Finish — {COLORS[activeColor].name}
                </p>
                <div className="flex gap-4">
                  {COLORS.map((c, i) => (
                    <button key={c.name} onClick={() => setActiveColor(i)}
                      className="relative w-10 h-10 rounded-full transition-all duration-300"
                      style={{
                        background:c.hex,
                        boxShadow: activeColor===i ? `0 0 0 3px rgba(255,255,255,0.15), 0 0 20px ${c.glow}` : 'none',
                        transform: activeColor===i ? 'scale(1.15)' : 'scale(1)',
                      }}>
                      {activeColor===i && <div className="absolute inset-0 rounded-full" style={{ boxShadow:'inset 0 0 0 2px rgba(255,255,255,0.3)' }} />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-widest uppercase mb-4 text-white/38">Ring Size</p>
                <div className="flex flex-wrap gap-2">
                  {['5','6','7','8','9','10','11','12'].map(s => (
                    <button key={s} className="w-10 h-10 rounded-xl font-mono text-sm font-semibold transition-all duration-200 hover:scale-105 text-white"
                      style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)' }}>{s}</button>
                  ))}
                </div>
                <p className="font-body text-xs mt-3 text-white/32">Not sure? Free sizing kit included →</p>
              </div>
              <a href="#reserve"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-display font-bold text-sm text-black transition-all duration-300 hover:scale-105"
                style={{ background:`linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow:`0 0 30px rgba(201,168,76,0.3)` }}>
                Reserve — Early Access <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 6. SPECS ── */}
      <section className="py-24 bg-[#0A0900] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background:`linear-gradient(to right, transparent, ${PURPLE}30, transparent)` }} />
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <motion.span {...fadeUp(0)} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-5"
              style={{ border:`1px solid ${PURPLE}30`, color:PURPLE, background:`${PURPLE}08` }}>Tech Specs</motion.span>
            <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white"
              style={{ fontSize:'clamp(2rem,4vw,3rem)' }}>
              Precision{' '}
              <span style={{ background:`linear-gradient(135deg,${PURPLE},${GOLD})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>engineered.</span>
            </motion.h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SPECS.map(({ label, value }, i) => (
              <motion.div key={label}
                initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.05 }}
                className="p-5 rounded-2xl transition-all duration-300 cursor-default group"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
                whileHover={{ borderColor:`${GOLD}40` }}>
                <p className="font-mono text-[10px] mb-2 text-white/32">{label}</p>
                <p className="font-display font-semibold text-sm leading-snug text-white">{value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. LIFESTYLE STRIP ── */}
      <section className="py-6 px-4 bg-black">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-3">
          {[
            'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=600&q=80',
          ].map((src, i) => (
            <motion.div key={i}
              initial={{ opacity:0, scale:0.97 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ duration:0.6, delay:i*0.1 }}
              className="rounded-2xl overflow-hidden aspect-[3/4]"
              style={{ border:'1px solid rgba(255,255,255,0.06)' }}>
              <img src={src} alt="Signal Ring lifestyle" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 8. RESERVE CTA ── */}
      <section id="reserve" className="relative py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:`radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.08), transparent 70%)` }} />
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background:`linear-gradient(to right, transparent, ${GOLD}50, transparent)` }} />

        <div className="relative z-10 max-w-xl mx-auto px-4 text-center space-y-7">
          <motion.div {...fadeUp(0)} className="space-y-4">
            <h2 className="font-display font-bold leading-tight tracking-tight text-white"
              style={{ fontSize:'clamp(2rem,5vw,3.5rem)' }}>
              Be first to{' '}
              <span style={{ color:GOLD, textShadow:`0 0 40px rgba(201,168,76,0.5)` }}>feel it.</span>
            </h2>
            <p className="font-body text-lg text-white/55">
              Signal Ring ships to early access members first. Reserve yours now and lock in founder pricing.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.12)}>
            <Link to="/order"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-display font-bold text-sm text-black transition-all duration-300 hover:scale-105"
              style={{ background:`linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow:`0 0 40px rgba(201,168,76,0.35)`, fontSize:'1rem' }}>
              Reserve Early Access <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.18)} className="flex flex-wrap justify-center gap-6">
            {['Free sizing kit included','Try demo mode first','Ships Q4 2026'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full" style={{ background:GOLD }} />
                <span className="font-mono text-xs text-white/38">{t}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
