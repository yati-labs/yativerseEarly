import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LEGAL } from "./legalConfig";

export function PrivacyEmail() {
  return <a className="font-semibold text-brand-gold underline underline-offset-2 break-words" href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>;
}

export function H2({ id, children }) {
  return <h2 id={id} className="mt-12 scroll-mt-24 font-display text-2xl font-semibold text-white">{children}</h2>;
}
export function H3({ children }) {
  return <h3 className="mt-6 text-lg font-semibold text-white">{children}</h3>;
}
export function UL({ children }) {
  return <ul className="list-disc space-y-2 pl-5 marker:text-white/40">{children}</ul>;
}
export function A({ href, children }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-gold underline underline-offset-2 break-words">{children}</a>;
}

export default function LegalLayout({ title, intro, toc = [], children }) {
  return (
    <div className="min-h-screen bg-[#02030A] text-white">
      <Navbar />
      <main className="px-5 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">{title}</h1>
          <p className="mt-4 text-sm text-white/65">Last updated: {LEGAL.effectiveDate}</p>
          <p className="mt-6 text-base leading-7 text-white/85">{intro}</p>

          {toc.length > 0 && (
            <nav aria-label="On this page" className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">On this page</p>
              <ol className="mt-3 grid gap-x-6 gap-y-2 text-sm text-white/80 sm:grid-cols-2">
                {toc.map(([id, label], i) => (
                  <li key={id}><a href={`#${id}`} className="hover:text-white">{i + 1}. {label}</a></li>
                ))}
              </ol>
            </nav>
          )}

          <div className="mt-2 space-y-4 text-base leading-7 text-white/85">{children}</div>

          <p className="mt-12 border-t border-white/10 pt-6 text-sm text-white/65">
            Related: <Link className="underline underline-offset-2 hover:text-white" to="/privacy-policy">Privacy Policy</Link> ·{" "}
            <Link className="underline underline-offset-2 hover:text-white" to="/cookie-policy">Cookie Policy</Link> ·{" "}
            <Link className="underline underline-offset-2 hover:text-white" to="/">Home</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
