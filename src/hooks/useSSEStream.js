import { useState, useRef, useCallback } from 'react'

/**
 * Custom hook for POST-based SSE streams (fetch + ReadableStream).
 * EventSource only supports GET — this hook handles POST endpoints like
 * /api/v1/prospecting/stream that return text/event-stream.
 *
 * State machine:
 *   idle → connecting → streaming → pending_approval
 *                                 → pending_company_selection
 *                                 → done
 *                                 → error
 */
export function useSSEStream() {
  const [state, setState] = useState('idle')
  const [events, setEvents] = useState([])
  const [hitlData, setHitlData] = useState(null)   // pending_approval or pending_company_selection payload
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const startStream = useCallback(async (url, body, token) => {
    // Cancel any in-flight stream
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState('connecting')
    setEvents([])
    setHitlData(null)
    setError(null)

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text()
        let message = `${res.status}: ${text}`
        try {
          const data = JSON.parse(text)
          message = data.detail || data.error || message   // e.g. the daily AI limit
        } catch { /* not JSON: keep the raw text */ }
        throw new Error(message)
      }

      setState('streaming')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // SSE format: lines starting with "data: ", events separated by \n\n
        const parts = buffer.split('\n\n')
        buffer = parts.pop() // keep incomplete last chunk

        for (const part of parts) {
          for (const line of part.split('\n')) {
            if (!line.startsWith('data: ')) continue
            let parsed
            try { parsed = JSON.parse(line.slice(6)) } catch { continue }

            setEvents((prev) => [...prev, parsed])

            if (parsed.type === 'pending_approval') {
              setHitlData({ type: 'approval', ...parsed })
              setState('pending_approval')
              return
            }
            if (parsed.type === 'pending_company_selection') {
              setHitlData({ type: 'company_selection', ...parsed })
              setState('pending_company_selection')
              return
            }
            if (parsed.type === 'done') {
              setState('done')
              return
            }
            if (parsed.type === 'error') {
              setError(parsed.detail || 'Stream error')
              setState('error')
              return
            }
          }
        }
      }

      setState('done')
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
      setState('error')
    }
  }, [])

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    setState('idle')
    setEvents([])
    setHitlData(null)
    setError(null)
  }, [])

  return { state, events, hitlData, error, startStream, reset }
}
