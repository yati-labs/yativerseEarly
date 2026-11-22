import { LEGAL, pendingItems } from "./legalConfig";

// Highlighted marker for any detail the owner has not confirmed yet.
export function Pending({ label }) {
  return (
    <mark className="rounded bg-amber-300 px-1.5 py-0.5 text-[0.9em] font-medium text-black">
      [OWNER TO CONFIRM: {label}]
    </mark>
  );
}

export function Entity() {
  return LEGAL.entityName ? <>{LEGAL.entityName}</> : <Pending label="legal company name" />;
}

export function PrivacyEmail() {
  return (
    <>
      <a className="font-semibold text-brand-gold underline underline-offset-2" href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>
      {!LEGAL.privacyEmailConfirmed && <> <Pending label="confirm this address should receive privacy requests, or provide a dedicated one" /></>}
    </>
  );
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
  const pending = pendingItems();
  return (
    <div className="min-h-screen bg-[#02030A] px-5 py-20 text-white sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        {pending.length > 0 && (
          <div role="note" className="mb-8 rounded-xl border border-amber-300/60 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            <p className="font-semibold">DRAFT. Not for publication.</p>
            <p className="mt-1">The owner must confirm these details in <code>src/legal/legalConfig.js</code> before this page goes live:</p>
            <ul className="mt-2 list-disc pl-5">{pending.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        )}

        <h1 className="font-display text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-white/55">
          Last updated: {LEGAL.effectiveDate || <Pending label="effective date" />}
        </p>
        <p className="mt-6 text-base leading-7 text-white/80">{intro}</p>

        {toc.length > 0 && (
          <nav aria-label="On this page" className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">On this page</p>
            <ol className="mt-3 grid gap-x-6 gap-y-2 text-sm text-white/75 sm:grid-cols-2">
              {toc.map(([id, label], i) => (
                <li key={id}><a href={`#${id}`} className="hover:text-white">{i + 1}. {label}</a></li>
              ))}
            </ol>
          </nav>
        )}

        <div className="mt-2 space-y-4 text-base leading-7 text-white/80">{children}</div>
      </div>
    </div>
  );
}
