// Legal details for the policy pages. Anything left empty is simply omitted or phrased generally,
// so nothing placeholder-like ever renders publicly. Fill these in when available.
export const LEGAL = {
  brand: "yAtIverse",
  // Registered legal name of the company that operates yativerse.ai. Left empty on purpose: do not guess.
  entityName: "",
  // Postal address. Also required in marketing emails under CAN-SPAM.
  mailingAddress: "",
  // Existing public support address (used across the site). Replace with a dedicated privacy@ address if you create one.
  privacyEmail: "support@yativerse.ai",
  // How long waitlist records are kept after the early-access program ends, e.g. "12 months". Empty = general wording.
  waitlistRetention: "",
  // Date the current version went live.
  effectiveDate: "November 22, 2026",
};

// Details still worth adding. Informational only: does not block publishing.
export function pendingItems(c = LEGAL) {
  const out = [];
  if (!c.entityName) out.push("Legal company name (entityName)");
  if (!c.mailingAddress) out.push("Mailing address (mailingAddress); needed in marketing emails (CAN-SPAM)");
  if (!c.waitlistRetention) out.push("Specific waitlist retention period (waitlistRetention)");
  return out;
}
