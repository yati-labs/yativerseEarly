// Single source of truth for page titles and descriptions. Used by each page's <SEO /> and by
// scripts/route-heads.mjs, which bakes the same tags into dist/<route>/index.html for crawlers
// that do not run JavaScript.
export const SITE = "https://yativerse.ai";
export const DEFAULT_IMAGE = `${SITE}/og-image.png`;
export const fullTitle = (t) => (t.includes("yAtIverse") ? t : `${t} — yAtIverse`);

export const ROUTE_SEO = {
  "/founder-os": {
    title: "Founder OS — Your Command Center | yAtIverse",
    description: "Founder OS connects what you capture and what your agents produce into a single daily view. One operating rhythm for goals, priorities, and decisions.",
  },
  "/agents": {
    title: "Digital C-Suite — AI Executive Agents | yAtIverse",
    description: "Role-based AI executives across marketing, revenue, finance, and operations. The Digital C-Suite drafts and recommends; you review and decide.",
  },
  "/yAtI": {
    title: "yAtI — Your Story",
    description: "yAtI is your story — the path you carve, the wilderness you walk, and the future only you can see.",
  },
  "/journey": {
    title: "The Journey — From Idea to a Connected Ecosystem",
    description: "Four steps. One connected ecosystem. Claim your yAtI, open the OS, activate agents, and start up right.",
  },
  "/community": {
    title: "Community — Build Together",
    description: "A community for founders, builders, and operators inside the yAtIverse ecosystem. Join the waitlist to hear when each community program opens.",
  },
  "/waitlist": {
    title: "Join the Waitlist — Early Access",
    description: "Join the yAtIverse waitlist for launch updates and early access to yAtI Flow, Founder OS, and the Digital C-Suite. No purchase required.",
  },
  "/privacy-policy": {
    title: "Privacy Policy",
    description: "How yAtIverse collects, uses, stores and shares information from our website, waitlist, early-access sign-ups and Meta lead forms, and how to opt out or request deletion.",
  },
  "/cookie-policy": {
    title: "Cookie Policy",
    description: "How yAtIverse uses cookies, local storage, Meta Pixel and Google Analytics, and how to control them.",
  },
  "/terms": {
    title: "Terms of Use",
    description: "yAtIverse Terms of Use are being finalized.",
    noindex: true,
  },
};
