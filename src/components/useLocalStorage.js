// useLocalStorage.js
import { useCallback, useEffect, useRef, useState } from "preact/hooks"

// Treat null/"undefined" as missing; pass through bare strings if present.
function safeParse(raw) {
  if (raw == null) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return raw // non-JSON string fallback
  }
}

function safeStringify(value) {
  try {
    return JSON.stringify(value)
  } catch {
    return undefined // e.g., circular refs
  }
}

const LOCAL_EVENT = "__useLocalStorage__"

export function useLocalStorage(key, initialValue) {
  const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  const initialResolved = useRef(false)

  const getInitial = useCallback(() => {
    if (!isBrowser) {
      return typeof initialValue === "function" ? initialValue() : initialValue
    }
    const existing = safeParse(window.localStorage.getItem(key))
    if (existing !== undefined) return existing
    return typeof initialValue === "function" ? initialValue() : initialValue
  }, [isBrowser, key, initialValue])

  const [state, setState] = useState(getInitial)

  // Persist + same-tab broadcast
  useEffect(() => {
    if (!isBrowser) return

    if (!initialResolved.current) {
      initialResolved.current = true
      const existing = window.localStorage.getItem(key)
      if (existing == null) {
        const str = safeStringify(state)
        if (str !== undefined) {
          try {
            window.localStorage.setItem(key, str)
          } catch {}
        }
      }
      return
    }

    const str = safeStringify(state)
    if (str === undefined) return

    try {
      window.localStorage.setItem(key, str)
    } catch {}

    if ("BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("useLocalStorage")
        bc.postMessage({ key, value: str })
        bc.close()
      } catch {}
    } else {
      window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: { key, value: str } }))
    }
  }, [isBrowser, key, state])

  // Cross-tab + same-tab listeners
  useEffect(() => {
    if (!isBrowser) return

    const toNext = nextRaw => {
      const next = safeParse(nextRaw)
      setState(prev => {
        const prevStr = safeStringify(prev)
        const nextStr = safeStringify(next)
        if (nextStr === prevStr) return prev
        if (next === undefined) {
          return typeof initialValue === "function" ? initialValue() : initialValue
        }
        return next
      })
    }

    const onStorage = e => {
      if (e.storageArea !== window.localStorage) return
      if (e.key !== key) return
      toNext(e.newValue)
    }

    const onBroadcast = e => {
      const d = e.data
      if (!d || d.key !== key) return
      toNext(d.value)
    }

    const onLocalEvent = e => {
      const d = e.detail
      if (!d || d.key !== key) return
      toNext(d.value)
    }

    window.addEventListener("storage", onStorage)
    let bc
    if ("BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("useLocalStorage")
        bc.addEventListener("message", onBroadcast)
      } catch {}
    } else {
      window.addEventListener(LOCAL_EVENT, onLocalEvent)
    }

    return () => {
      window.removeEventListener("storage", onStorage)
      if (bc) {
        bc.removeEventListener("message", onBroadcast)
        bc.close()
      } else {
        window.removeEventListener(LOCAL_EVENT, onLocalEvent)
      }
    }
  }, [isBrowser, key, initialValue])

  const set = useCallback(value => {
    setState(prev => (typeof value === "function" ? value(prev) : value))
  }, [])

  return [state, set]
}
