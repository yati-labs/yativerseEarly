// After `vite build`: write dist/<route>/index.html with route-specific <head> tags so crawlers that
// do not run JavaScript (Googlebot's first pass, Facebook, LinkedIn, X) see the right title,
// description and canonical for every public page.
import fs from "node:fs";
import { FLOW_SEO, FLOW_PATH } from "../src/seo/yatiFlow.js";
import { ROUTE_SEO, SITE, DEFAULT_IMAGE, fullTitle } from "../src/seo/routes.js";

const dist = new URL("../dist/", import.meta.url);
const base = fs.readFileSync(new URL("index.html", dist), "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const meta = (h, attr, key, v) => h.replace(new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`), (_, a, b) => a + esc(v) + b);

function write(path, { title, description, image = DEFAULT_IMAGE, imageAlt, noindex = false }) {
  const url = SITE + path;
  let html = base;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = meta(html, "name", "description", description);
  if (noindex) html = meta(html, "name", "robots", "noindex, follow");
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => a + url + b);
  for (const [k, v] of [["og:url", url], ["og:title", title], ["og:description", description], ["og:image", image]]) html = meta(html, "property", k, v);
  if (imageAlt) for (const [k, v] of [["og:image:alt", imageAlt], ["og:image:type", "image/jpeg"]]) html = meta(html, "property", k, v);
  for (const [k, v] of [["twitter:title", title], ["twitter:description", description], ["twitter:image", image]]) html = meta(html, "name", k, v);
  if (imageAlt) html = meta(html, "name", "twitter:image:alt", imageAlt);
  const dir = new URL(path.slice(1) + "/", dist);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(new URL("index.html", dir), html);
}

write(FLOW_PATH, FLOW_SEO);
for (const [path, s] of Object.entries(ROUTE_SEO)) write(path, { ...s, title: fullTitle(s.title) });
console.log("route heads written: " + [FLOW_PATH, ...Object.keys(ROUTE_SEO)].join(", "));
