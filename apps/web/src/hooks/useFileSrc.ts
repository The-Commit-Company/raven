import { useEffect, useState } from "react"
import { isPrivateFile, siteFetch, siteOrigin, siteUrl } from "@lib/site"

// Object URLs for private files fetched with the token, keyed by the file's site URL.
// Insertion order is the eviction order; blobs stay in memory until revoked.
type Entry = { pending: Promise<string>; bytes: number }
const cache = new Map<string, Entry>()
const BUDGET_BYTES = 50 * 1024 * 1024
let cachedBytes = 0

export const _resetFileSrcCache = () => { cache.clear(); cachedBytes = 0 }
export const _cachedBytes = () => cachedBytes

const evict = (key: string, entry: Entry) => {
    cache.delete(key)
    cachedBytes -= entry.bytes
    entry.pending.then((url) => { if (url.startsWith("blob:")) URL.revokeObjectURL(url) })
}

const enforceBudget = (keep: string) => {
    for (const [key, entry] of cache) {
        if (cachedBytes <= BUDGET_BYTES) return
        // Pending entries hold no bytes yet; the entry being resolved must reach its caller alive.
        if (entry.bytes === 0 || key === keep) continue
        evict(key, entry)
    }
}

// In the browser the site is the page's own origin, and an <img> carries the session itself.
const direct = (url: string) => siteOrigin() === window.location.origin || !isPrivateFile(url)

/** Site file path → something an <img>, <video>, or <audio> can load. */
export const resolveFileSrc = (url: string): Promise<string> => {
    if (direct(url)) return Promise.resolve(siteUrl(url))
    const key = siteUrl(url)
    let entry = cache.get(key)
    if (!entry) {
        const fresh: Entry = { pending: Promise.resolve(""), bytes: 0 }
        // no-store: the bytes live only in this cache, never in the WebView's disk cache.
        fresh.pending = siteFetch(url, { cache: "no-store" })
            .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
            .then((blob) => {
                fresh.bytes = blob.size
                cachedBytes += blob.size
                enforceBudget(key)
                return URL.createObjectURL(blob)
            })
            .catch(() => {
                // Not kept: a failure (offline, stale token) retries on the next mount.
                cache.delete(key)
                return siteUrl(url)
            })
        cache.set(key, fresh)
        entry = fresh
    }
    return entry.pending
}

/** Resolved source for a site file; undefined until a private file has been fetched. */
export const useFileSrc = (url?: string): string | undefined => {
    const immediate = url && direct(url) ? siteUrl(url) : undefined
    const [resolved, setResolved] = useState<string | undefined>(immediate)
    useEffect(() => {
        if (!url || immediate) { setResolved(immediate); return }
        let live = true
        resolveFileSrc(url).then((src) => { if (live) setResolved(src) })
        return () => { live = false }
    }, [url, immediate])
    return resolved
}
