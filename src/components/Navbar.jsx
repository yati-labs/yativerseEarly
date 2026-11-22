import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShoppingBag } from "lucide-react";
import { useCart } from "../lib/cart";

const MEGA = {
  wearables: {
    eyebrow: "Hardware",
    headline: "Capture it. Act on it.",
    items: [
      { name: "Thread One", desc: "Slim card recorder. Every conversation, followed up.", tag: "Early access", color: "#C9A84C", img: "/flow/thread-one.jpg", href: "/yati-flow" },
      { name: "Thread Max", desc: "Wearable capsule. Capture on the move.", tag: "Early access", color: "#C9A84C", img: "/flow/thread-max.jpg", href: "/yati-flow" },
    ],
    cta: { label: "Explore yAtI Flow", href: "/yati-flow" },
  },
  agents: {
    eyebrow: "Your AI C-Suite",
    headline: "Your invisible executive team.",
    items: [
      {
        name: "AI CMO",
        desc: "Brand, content, campaigns, positioning.",
        color: "#605CFF",
        icon: "📣",
        href: "/agents",
      },
      {
        name: "AI CRO",
        desc: "Lead scoring, outreach, deal coaching.",
        color: "#C86DD7",
        icon: "📈",
        href: "/agents",
      },
      {
        name: "AI CFO",
        desc: "Runway, unit economics, investor updates.",
        color: "#4ECDC4",
        icon: "💰",
        href: "/agents",
      },
      {
        name: "AI COO",
        desc: "Workflows, routines, operating dashboards.",
        color: "#FF6B8A",
        icon: "⚙️",
        href: "/agents",
      },
    ],
    cta: { label: "Meet your C-Suite", href: "/agents" },
  },
};

const NAV_LINKS = [
  { label: "yAtI — Your Story", href: "/yAtI" },
  { label: "yAtI Flow", href: "/yati-flow", mega: "wearables" },
  { label: "Digital C-Suite", href: "/agents", mega: "agents" },
  { label: "Founder-OS", href: "/founder-os" },
];

function CartButton({ className = "" }) {
  const { count, openCart } = useCart();
  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart${count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
      className={`relative flex items-center justify-center w-9 h-9 rounded-full text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors ${className}`}
    >
      <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.75} />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-mono font-semibold text-black"
          style={{ background: "#C9A84C" }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openMega, setOpenMega] = useState(null);
  const [mobileOpen, setMobile] = useState(false);
  const navRef = useRef(null);
  const timer = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMobile(false);
    setOpenMega(null);
  }, [pathname]);

  useEffect(() => {
    const fn = (e) => {
      if (navRef.current && !navRef.current.contains(e.target))
        setOpenMega(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const enter = (k) => {
    clearTimeout(timer.current);
    setOpenMega(k);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpenMega(null), 160);
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-8 h-16 transition-all duration-300
          ${
            scrolled
              ? "bg-brand-bg/85 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_4px_32px_rgba(0,0,0,0.4)]"
              : "bg-transparent border-b border-transparent"
          }`}
      >
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img
            src="/logo.jpeg"
            alt="yAtIverse"
            className="w-12 h-12 object-contain"
          />
        </Link>

        {/* Center links — desktop */}
        <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((l) =>
            l.mega ? (
              <button
                key={l.label}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium font-body transition-all duration-200
                  ${
                    openMega === l.mega || pathname.startsWith(l.href)
                      ? "text-white bg-white/[0.08]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                  }`}
                onMouseEnter={() => enter(l.mega)}
                onMouseLeave={leave}
                onClick={() => setOpenMega(openMega === l.mega ? null : l.mega)}
              >
                {l.label}
                <ChevronDown
                  className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${openMega === l.mega ? "rotate-180 !opacity-90" : ""}`}
                  strokeWidth={2}
                />
              </button>
            ) : (
              <Link
                key={l.label}
                to={l.href}
                className={`
    px-3.5 py-2 rounded-full text-sm font-medium font-body transition-all duration-200
    ${
      l.highlight
        ? "bg-[#F5C542] text-black font-semibold shadow-[0_0_12px_rgba(245,197,66,0.45)]"
        : pathname === l.href
          ? "text-white bg-white/[0.08]"
          : "text-white/60 hover:text-white hover:bg-white/[0.06]"
    }
  `}
              >
                {l.label}
              </Link>
            ),
          )}
        </div>

        {/* Right */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Sign in / Dashboard links hidden for now. Routes /login and /dashboard still work by URL. */}
          {/* <CartButton /> hidden until checkout launches */}
          <Link to="/yati-flow" className="btn-primary !py-2.5 !px-5 !text-xs">
            Get early access →
          </Link>
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="flex lg:hidden items-center gap-1">
          {/* <CartButton /> hidden until checkout launches */}
          <button
            className="flex flex-col gap-[5px] p-2"
            onClick={() => setMobile(!mobileOpen)}
            aria-label="Menu"
          >
          <span
            className={`block w-5 h-0.5 bg-white/75 rounded transition-all duration-250 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-white/75 rounded transition-all duration-250 ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-5 h-0.5 bg-white/75 rounded transition-all duration-250 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
          />
          </button>
        </div>

        {/* Mega menus */}
        {Object.entries(MEGA).map(([key, data]) => (
          <AnimatePresence key={key}>
            {openMega === key && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-16 left-0 right-0 flex justify-center"
                onMouseEnter={() => enter(key)}
                onMouseLeave={leave}
              >
                <div
                  className="w-full max-w-lg mx-4 rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
                  style={{
                    background: "rgba(7,10,24,0.97)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(32px)",
                  }}
                >
                  <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-white/[0.06]">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/30">
                      {data.eyebrow}
                    </span>
                    <span className="text-sm font-display font-semibold text-white/70">
                      {data.headline}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {data.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors"
                      >
                        {item.img ? (
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                            style={{
                              background: `${item.color}15`,
                              border: `1px solid ${item.color}30`,
                            }}
                          >
                            {item.icon}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold font-body text-white leading-none">
                            {item.name}
                          </p>
                          <p className="text-xs text-white/40 mt-1 font-body">
                            {item.desc}
                          </p>
                        </div>
                        {item.tag && (
                          <span
                            className="text-[10px] font-medium px-2 py-1 rounded-full font-mono flex-shrink-0"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.35)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {item.tag}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={data.cta.href}
                    className="block mt-4 pt-4 border-t border-white/[0.06] text-sm font-medium font-body text-brand-purple hover:text-brand-pink transition-colors"
                  >
                    {data.cta.label} →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 top-16 z-40 bg-brand-bg/97 backdrop-blur-xl flex flex-col gap-2 p-8 overflow-y-auto lg:hidden"
          >
            {NAV_LINKS.map((item) => {
              const isHighlight = item.highlight;

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`
        text-sm font-body px-3 py-1.5 rounded-md transition-all duration-200
        ${
          isHighlight
            ? "bg-[#F5C542] text-black font-semibold shadow-[0_0_12px_rgba(245,197,66,0.45)]"
            : "text-white/50 hover:text-white"
        }
      `}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              to="/waitlist"
              className="btn-primary justify-center text-base !py-4 mt-2"
            >
              Join yAtIverse →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}