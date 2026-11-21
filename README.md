# yAtIverse Website

**Start Up Right. Every tool a founder needs, in one place.**

---

## Quick Start

```bash
# 1. Extract
tar -xzf yAtIverse.tar.gz
cd yAtIverse

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev
# Opens at http://localhost:5173

# 4. Build for production
npm run build
# Output in /dist — deploy this folder
```

---

## Adding Your Logo (Required)

You need to add your logo image to the `/public` folder.
The site references `/logo.jpeg` in both the Navbar and Footer.

**Files to add to `/public/`:**

| File | Size | Purpose |
|------|------|---------|
| `logo.jpeg` | Any (square recommended) | Navbar + Footer logo mark (displayed at 36×36px) |
| `favicon-32.png` | 32×32px | Browser tab icon |
| `favicon-16.png` | 16×16px | Small browser tab icon |
| `apple-touch-icon.png` | 180×180px | iOS home screen icon |
| `og-image.png` | 1200×630px | Social share preview image |

**How to generate favicon files from your logo:**
1. Go to https://favicon.io or https://realfavicongenerator.net
2. Upload your logo PNG
3. Download the generated package
4. Copy `favicon-32x32.png` → `/public/favicon-32.png`
5. Copy `favicon-16x16.png` → `/public/favicon-16.png`
6. Copy `apple-touch-icon.png` → `/public/apple-touch-icon.png`

**OG Image (`og-image.png`):**
Create a 1200×630px image with your logo, brand name, and tagline
on your dark background (#050814). This appears when someone shares
your link on X, LinkedIn, WhatsApp etc.

---

## File Structure

```
yAtIverse/
├── public/
│   ├── logo.jpeg              ← ADD THIS (your logo)
│   ├── favicon-32.png        ← ADD THIS
│   ├── favicon-16.png        ← ADD THIS
│   ├── apple-touch-icon.png  ← ADD THIS
│   ├── og-image.png          ← ADD THIS
│   └── site.webmanifest      ✓ included
├── src/
│   ├── components/
│   │   ├── Navbar.jsx        ✓ uses /logo.jpeg
│   │   └── Footer.jsx        ✓ uses /logo.jpeg
│   ├── pages/
│   │   ├── Homepage.jsx
│   │   ├── Wearables.jsx
│   │   ├── Agents.jsx
│   │   ├── Journey.jsx
│   │   ├── Community.jsx
│   │   └── Waitlist.jsx
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── index.html                ✓ full SEO + OG tags
├── vite.config.js
└── package.json
```

---

## SEO — What's Already Set Up

- ✅ Title tag with brand + taglines
- ✅ Meta description (160 chars)
- ✅ Meta keywords
- ✅ Canonical URL → update to your real domain
- ✅ Open Graph tags (Facebook, LinkedIn, WhatsApp)
- ✅ Twitter/X card tags
- ✅ JSON-LD structured data (Organization schema)
- ✅ Web app manifest (PWA ready)
- ✅ Theme color (#050814)
- ✅ Apple touch icon

**Before going live, update in `index.html`:**
- `https://yAtIverse.com` → your actual domain
- `@yAtIverse` → your actual Twitter/X handle

---

## Fonts

Using [Fontshare](https://fontshare.com) CDN — no API key needed.
- **Clash Display** (700) — headlines
- **DM Sans** (400, 500, 600) — body text

For self-hosted fonts (faster, offline-safe):
1. Download from fontshare.com
2. Add to `/public/fonts/`
3. Replace the `<link>` in `index.html` with `@font-face` rules in `globals.css`

---

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | Homepage.jsx | Hero, journey, products, testimonials, CTA |
| `/wearables` | Wearables.jsx | Signal Ring, yAtI Flow Thread One and Thread Max, AI Earbuds |
| `/agents` | Agents.jsx | 4 AI agents with tabbed detail |
| `/journey` | Journey.jsx | 4-step founder path + 90-day timeline |
| `/community` | Community.jsx | Testimonials, Discord, stats, trust |
| `/waitlist` | Waitlist.jsx | Conversion form + FAQ accordion |

---

## Deploy

**Vercel (recommended):**
```bash
npm i -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# Drag /dist folder to netlify.com/drop
```

**Any static host:**
```bash
npm run build
# Upload contents of /dist
```
