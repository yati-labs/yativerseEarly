// Paid-campaign tracking. GTM (GTM-N8SK7JFV) and GA4 already load in index.html,
// so this file only sends events and keeps attribution. It adds no scripts,
// except the Meta Pixel, and only when VITE_META_PIXEL_ID is set.
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "li_fat_id"];
const STORE = "yati_attribution";

export function captureAttribution() {
  try {
    const q = new URLSearchParams(window.location.search);
    const fresh = {};
    KEYS.forEach((k) => q.get(k) && (fresh[k] = q.get(k)));
    if (Object.keys(fresh).length) localStorage.setItem(STORE, JSON.stringify({ ...fresh, landing: window.location.pathname }));
  } catch { /* storage blocked: attribution is best-effort */ }
}

export function getAttribution() {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; }
}

// Adds saved UTMs/click ids to an internal URL so they survive into signup.
export function withAttribution(path) {
  const { landing, ...a } = getAttribution();
  const [base, qs = ""] = path.split("?");
  const p = new URLSearchParams(qs);
  Object.entries(a).forEach(([k, v]) => p.set(k, v));
  return `${base}?${p.toString()}`;
}

export function track(name, params = {}) {
  const payload = { ...params, ...getAttribution(), page_path: window.location.pathname };
  try {
    if (typeof window.gtag === "function") window.gtag("event", name, payload);
    (window.dataLayer = window.dataLayer || []).push({ event: `yati_${name}`, ...payload });
    if (typeof window.fbq === "function") {
      const std = { sign_up: "CompleteRegistration", signup_start: "InitiateCheckout", cta_click: "Lead" }[name];
      if (std) window.fbq("track", std);
      else window.fbq("trackCustom", name, payload);
    }
  } catch { /* never let analytics break the page */ }
}

export function initMetaPixel() {
  const id = import.meta.env.VITE_META_PIXEL_ID;
  if (!id || window.fbq) return;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq("init", id);
  window.fbq("track", "PageView");
}
