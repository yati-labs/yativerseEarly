// After `vite build`: write dist/yati-flow/index.html with route-specific <head> tags so
// crawlers that don't run JavaScript (Facebook, LinkedIn, X) see the right title and image.
import fs from "node:fs";
import { FLOW_SEO as S, SITE, FLOW_PATH } from "../src/seo/yatiFlow.js";
const dist = new URL("../dist/", import.meta.url);
let html = fs.readFileSync(new URL("index.html", dist), "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const meta = (h, attr, key, v) => h.replace(new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`), (_, a, b) => a + esc(v) + b);
const url = SITE + FLOW_PATH;
html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(S.title)}</title>`);
html = meta(html, "name", "description", S.description);
html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => a + url + b);
for (const [k, v] of [["og:url", url], ["og:title", S.title], ["og:description", S.description], ["og:image", S.image], ["og:image:alt", S.imageAlt], ["og:image:type", "image/jpeg"]]) html = meta(html, "property", k, v);
for (const [k, v] of [["twitter:title", S.title], ["twitter:description", S.description], ["twitter:image", S.image], ["twitter:image:alt", S.imageAlt]]) html = meta(html, "name", k, v);
fs.mkdirSync(new URL("yati-flow/", dist), { recursive: true });
fs.writeFileSync(new URL("yati-flow/index.html", dist), html);
console.log("route heads written: " + FLOW_PATH);
