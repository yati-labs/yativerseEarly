import { Link }   from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Navbar  from '../components/Navbar'
import Footer  from '../components/Footer'
import SEO     from '../components/SEO'
import { ROUTE_SEO } from '../seo/routes'
import { fadeUp, fadeLeft, fadeRight } from '../lib/motion'

const T = { purple:'#605CFF', pink:'#C86DD7', teal:'#4ECDC4', rose:'#FF6B8A' }

const STEPS = [
  { n:'01', title:'Claim your yAtI',  sub:'Identity is the foundation.',      color:T.purple, img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80', desc:'Before tools, before tactics — you need clarity on who you are and what you\'re building. Your yAtI identity layer captures your goals, builder context, brand signal, and vision. Everything else connects to this.', outcomes:['Personal brand clarity','Goal architecture','Agent context set','Founder fingerprint'] },
  { n:'02', title:'Open the OS',      sub:'Turn chaos into one daily rhythm.',  color:T.pink,   img:'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1000&q=80', desc:'yAtI OS becomes your command center. Instead of switching between 12 tools, you have one place for priorities, launches, meetings, and progress. Every agent feeds into it. Every wearable connects through it.',         outcomes:['Single command center','Daily workflow rhythm','Progress visibility','Agent integration'] },
  { n:'03', title:'Activate agents',  sub:'Build without a full team.',         color:T.teal,   img:'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1000&q=80', desc:'Launch Agent validates your idea. Network Agent maps your people. Focus Agent guards your time. Brand Agent builds your presence. They collaborate — so you can focus on the work only you can do.',                   outcomes:['AI-powered execution','Workflow automation','Strategic guidance','Compounding momentum'] },
  { n:'04', title:'Start up right',   sub:'Build a system that compounds.',     color:T.rose,   img:'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1000&q=80', desc:'The yAtIverse isn\'t just about moving fast — it\'s about building right. Consistent shipping, trust-building, brand growth, and execution discipline compound week over week into something unstoppable.',              outcomes:['Consistent shipping','Compounding brand growth','Scalable execution','Founder resilience'] },
]

const TIMELINE = [
  { p:'Week 1–2', t:'Identity layer',   d:'Set up yAtI profile, define goals, configure agents.' },
  { p:'Week 3–4', t:'First workflow',   d:'OS daily rhythm live. Launch agent validates your idea.' },
  { p:'Month 2',  t:'Agent activation', d:'All 4 agents running. First content, first outreach.' },
  { p:'Month 3+', t:'Ecosystem build',  d:'Compounding. Wearables integrated. Brand growing.' },
]

export default function Journey() {
  return (
    <>
      <SEO path="/journey" {...ROUTE_SEO["/journey"]} />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-40 pb-20 text-center overflow-hidden px-4">
          <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(96,92,255,.13), transparent 65%)' }} />
          <motion.span {...fadeUp(0)} className="kicker mb-6 inline-block">The path</motion.span>
          <motion.h1 {...fadeUp(0.07)} className="font-display font-bold tracking-[-0.04em] leading-[0.96] mb-6 text-white" style={{ fontSize:'clamp(44px,7vw,88px)' }}>
            From idea<br />to a <span className="text-gradient">connected ecosystem.</span>
          </motion.h1>
          <motion.p {...fadeUp(0.13)} className="font-body text-lg text-white/55 max-w-lg mx-auto leading-relaxed">
            Four steps. One connected ecosystem. A rhythm that compounds every single week.
          </motion.p>
        </section>

        {/* Steps */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {STEPS.map((s, i) => {
            const even = i % 2 !== 0
            return (
              <motion.div key={s.n} {...fadeUp(0.05)}
                className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-28 last:mb-0">
                {/* Image */}
                <div className={`relative rounded-3xl overflow-hidden aspect-[3/2] ${even ? 'md:order-2' : ''}`}>
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0" style={{ background:'linear-gradient(135deg, rgba(5,8,20,.35), transparent)' }} />
                  <span className="absolute top-0 right-0 font-display font-bold text-[100px] leading-none tracking-[-0.05em] opacity-[0.05] pointer-events-none select-none">{s.n}</span>
                </div>
                {/* Copy */}
                <div className={even ? 'md:order-1' : ''}>
                  <p className="text-[11px] font-semibold font-mono tracking-[0.14em] uppercase mb-3" style={{ color:s.color }}>{s.n} / 04</p>
                  <h2 className="font-display font-bold tracking-tight leading-none mb-2 text-white" style={{ fontSize:'clamp(30px,3.5vw,50px)' }}>{s.title}</h2>
                  <p className="font-body text-base text-white/65 mb-4">{s.sub}</p>
                  <p className="font-body text-sm text-white/58 leading-relaxed mb-6 max-w-md">{s.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.outcomes.map(o => (
                      <span key={o} className="text-xs font-body px-3 py-1.5 rounded-full bg-white/[0.04] border text-white/58"
                        style={{ borderColor:`${s.color}28` }}>✓ {o}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </section>

        {/* Timeline */}
        <section className="py-20 px-4 border-t border-white/[0.06]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <motion.span {...fadeUp(0)} className="kicker mb-4 inline-block">What to expect</motion.span>
              <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
                Your first <span className="text-gradient">90 days.</span>
              </motion.h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-white/65">A sample onboarding path. Timing depends on which products you have access to as they roll out.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 relative">
              <div className="absolute top-5 left-[10%] right-[10%] h-px hidden lg:block"
                style={{ background:'linear-gradient(to right, #605CFF, #C86DD7, #FF6B8A)', opacity:0.30 }} />
              {TIMELINE.map((t, i) => (
                <motion.div key={t.p} {...fadeUp(i * 0.08)} className="flex flex-col items-center px-3 text-center">
                  <div className="w-3 h-3 rounded-full mb-4 relative z-10"
                    style={{ background:'linear-gradient(135deg,#605CFF,#C86DD7)', boxShadow:'0 0 12px rgba(96,92,255,.5)' }} />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/65 mb-1">{t.p}</p>
                  <p className="text-sm font-semibold font-display text-white mb-1">{t.t}</p>
                  <p className="text-xs font-body text-white/65 leading-relaxed">{t.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 text-center px-4">
          <motion.h2 {...fadeUp(0)} className="font-display font-bold tracking-tight text-white mb-4" style={{ fontSize:'clamp(32px,4vw,56px)' }}>
            Ready to<br /><span className="text-gradient">start up right?</span>
          </motion.h2>
          <motion.p {...fadeUp(0.08)} className="font-body text-white/52 mb-8 text-lg">Join the waitlist. Be first into the ecosystem.</motion.p>
          <motion.div {...fadeUp(0.14)}>
            <Link to="/waitlist" className="btn-primary">Begin your journey <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  )
}
