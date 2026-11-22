// Single place for legal details the owner must confirm before the policy pages are published.
// Anything left as "" renders as a highlighted "OWNER TO CONFIRM" marker on /privacy-policy and
// /cookie-policy, and the pages show a DRAFT banner. Fill the values, then run: npm run check:legal
export const LEGAL = {
  brand: "yAtIverse",
  // Registered legal name of the company that operates yativerse.ai (do not guess).
  entityName: "",
  // Postal address. Also required in marketing emails under CAN-SPAM.
  mailingAddress: "",
  // support@yativerse.ai already appears across the site. Set to a dedicated privacy@ address if you create one.
  privacyEmail: "support@yativerse.ai",
  // Flip to true once the owner confirms that address should receive privacy and deletion requests.
  privacyEmailConfirmed: false,
  // How long waitlist / lead records are kept after the early-access program ends, e.g. "12 months".
  waitlistRetention: "",
  // Date the final policy goes live, e.g. "December 1, 2026".
  effectiveDate: "",
};

export function pendingItems(c = LEGAL) {
  const out = [];
  if (!c.entityName) out.push("Legal company name (entityName)");
  if (!c.mailingAddress) out.push("Mailing address (mailingAddress)");
  if (!c.privacyEmail || !c.privacyEmailConfirmed) out.push("Privacy contact email confirmed (privacyEmail, privacyEmailConfirmed)");
  if (!c.waitlistRetention) out.push("Waitlist retention period (waitlistRetention)");
  if (!c.effectiveDate) out.push("Effective date (effectiveDate)");
  return out;
}
