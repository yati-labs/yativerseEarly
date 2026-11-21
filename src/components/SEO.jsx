import { useEffect } from 'react'

const BASE_URL = 'https://yativerse.ai'
const DEFAULTS = {
  title:       'yAtIverse — Start Up Right. Every tool a founder needs, in one place.',
  description: 'AI-native ecosystem for ambitious founders. Wearables, AI agents, and Founder OS — every tool a founder needs, in one place.',
  image:       `${BASE_URL}/og-image.png`,
  type:        'website',
}

export default function SEO({ title, description, image, type = 'website', path = '', schema, raw = false }) {
  const t   = title       || DEFAULTS.title
  const d   = description || DEFAULTS.description
  const img = image       || DEFAULTS.image
  const url = `${BASE_URL}${path}`
  const fullTitle = raw || t.includes('yAtIverse') ? t : `${t} — yAtIverse`

  useEffect(() => {
    document.title = fullTitle

    const set = (sel, val) => {
      const el = document.querySelector(sel)
      if (el) el.setAttribute('content', val)
    }

    // Primary meta
    set('meta[name="description"]', d)
    set('link[rel="canonical"]',    url)

    // Open Graph
    set('meta[property="og:title"]',       fullTitle)
    set('meta[property="og:description"]', d)
    set('meta[property="og:image"]',       img)
    set('meta[property="og:url"]',         url)
    set('meta[property="og:type"]',        type)

    // Twitter
    set('meta[name="twitter:title"]',       fullTitle)
    set('meta[name="twitter:description"]', d)
    set('meta[name="twitter:image"]',       img)
  }, [fullTitle, d, img, url, type])

  return null
}
