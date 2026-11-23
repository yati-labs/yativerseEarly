import { Link }   from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Navbar  from '../components/Navbar'
import Footer  from '../components/Footer'
import SEO     from '../components/SEO'
import { ROUTE_SEO } from '../seo/routes'
import { fadeUp } from '../lib/motion'

const T = { purple:'#605CFF', pink:'#C86DD7', teal:'#4ECDC4', rose:'#FF6B8A' }


const LAYERS = [
  { icon:'💬', title:'Discord',         desc:'A live community of builders, operators, and founders. Share progress and find your people.', cta:'Get notified',    color:T.purple },
  { icon:'📖', title:'Founder Stories', desc:'Real stories from people using yAtIverse to build. Honest, documented progress.',              cta:'Get notified',    color:T.pink   },
  { icon:'🌟', title:'Ambassadors',     desc:'Become a yAtIverse Ambassador. Share the ecosystem, earn perks, shape what gets built next.', cta:'Get notified',       color:T.teal   },
  { icon:'⚡', title:'Live Events',     desc:'Monthly founder sprints, agent workshops, and community builds. Online and in-person.',         cta:'Get notified',      color:T.rose   },
]


export default function Community() {
  return (
    <>
      <SEO path="/community" {...ROUTE_SEO["/community"]} />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-40 pb-20 text-center overflow-hidden px-4">
          <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(96,92,255,.13), transparent 65%)' }} />
          <motion.span {...fadeUp(0)} className="kicker mb-6 inline-block">Community</motion.span>
          <motion.h1 {...fadeUp(0.07)} className="font-display font-bold tracking-[-0.04em] leading-[0.96] mb-6 text-white" style={{ fontSize:'clamp(44px,7vw,88px)' }}>
            You are not<br /><span className="text-gradient">building alone.</span>
          </motion.h1>
          <motion.p {...fadeUp(0.13)} className="font-body text-lg text-white/55 max-w-lg mx-auto mb-10 leading-relaxed">
            A community for founders, builders, and operators, launching alongside the ecosystem.
          </motion.p>
          <motion.div {...fadeUp(0.18)}>
            <Link to="/waitlist" className="btn-primary">Join the waitlist <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </section>

        {/* Community layers */}
        <section className="py-20 px-4 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <motion.span {...fadeUp(0)} className="kicker mb-4 inline-block">Get involved</motion.span>
              <motion.h2 {...fadeUp(0.07)} className="font-display font-bold tracking-tight text-white" style={{ fontSize:'clamp(28px,3.5vw,48px)' }}>
                Four ways to <span className="text-gradient">connect.</span>
              </motion.h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LAYERS.map((l, i) => (
                <motion.div key={l.title} {...fadeUp(i * 0.07)}
                  className="glass rounded-2xl p-6 flex flex-col hover:border-white/14 transition-colors duration-300">
                  <div className="text-2xl mb-3">{l.icon}</div>
                  <p className="font-display font-bold text-base text-white mb-2">{l.title} <span className="ml-1 rounded-full border border-white/20 px-2 py-0.5 align-middle font-mono text-[10px] uppercase tracking-widest text-white/65">Coming soon</span></p>
                  <p className="font-body text-xs text-white/65 leading-relaxed mb-4 flex-1">{l.desc}</p>
                  <Link to="/waitlist" className="text-sm font-medium font-body transition-colors hover:opacity-75" style={{ color:l.color }}>{l.cta} →</Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* CTA */}
        <section className="py-24 text-center px-4">
          <motion.h2 {...fadeUp(0)} className="font-display font-bold tracking-tight text-white mb-4" style={{ fontSize:'clamp(32px,4vw,56px)' }}>
            Find your<br /><span className="text-gradient">people here.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.08)} className="font-body text-white/52 mb-8 text-lg">Join the waitlist to hear when each community program opens.</motion.p>
          <motion.div {...fadeUp(0.14)}>
            <Link to="/waitlist" className="btn-primary">Join yAtIverse <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  )
}
