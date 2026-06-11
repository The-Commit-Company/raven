import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { StreamBlock } from "@stores/messages/types"

/** How close to the bottom (px) still counts as "at the bottom". */
const AT_BOTTOM_SLOP = 40
/** Distance from the top (px) at which older messages start loading. */
const LOAD_OLDER_THRESHOLD = 400

type StreamScrollOptions = {
    channelID: string
    blocks: StreamBlock[]
    loadOlder: () => void
    hasOlderMessages: boolean
}

/**
 * The chat stream's scroll engine. Scroll position is explicit state, not a
 * side effect: the stream is either *pinned* (follow the newest message) or
 * *free* (the user scrolled up and owns the viewport).
 *
 * Responsibilities:
 * - Pin to the bottom on first load, on channel switch, and while pinned —
 *   including when the container resizes (input grows, keyboard opens).
 * - Keep the viewport anchored when older messages prepend. Done manually
 *   with scrollHeight deltas because Safari does not support CSS
 *   `overflow-anchor` (the container also sets `overflow-anchor: none` so
 *   Chrome's native anchoring cannot fight the manual correction).
 * - Trigger `loadOlder` near the top; re-entry is guarded by the store.
 * - Surface "new messages arrived while scrolled up" for the jump pill.
 */
export const useStreamScroll = ({ channelID, blocks, loadOlder, hasOlderMessages }: StreamScrollOptions) => {
    const containerRef = useRef<HTMLDivElement>(null)
    /** True while the view should follow the newest message. */
    const pinnedRef = useRef(true)
    /** Last seen metrics, updated on every scroll — used for prepend compensation. */
    const metricsRef = useRef({ scrollTop: 0, scrollHeight: 0 })
    const edgeIdsRef = useRef<{ first: string | null; last: string | null }>({ first: null, last: null })

    const [isAtBottom, setIsAtBottom] = useState(true)
    const [hasUnseenMessages, setHasUnseenMessages] = useState(false)

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
        const container = containerRef.current
        if (!container) return
        pinnedRef.current = true
        setHasUnseenMessages(false)
        container.scrollTo({ top: container.scrollHeight, behavior })
    }, [])

    const onScroll = useCallback(() => {
        const container = containerRef.current
        if (!container) return
        metricsRef.current = { scrollTop: container.scrollTop, scrollHeight: container.scrollHeight }
        const atBottom =
            container.scrollTop + container.clientHeight >= container.scrollHeight - AT_BOTTOM_SLOP
        pinnedRef.current = atBottom
        setIsAtBottom(atBottom)
        if (atBottom) setHasUnseenMessages(false)
        if (container.scrollTop < LOAD_OLDER_THRESHOLD) loadOlder()
    }, [loadOlder])

    // A channel switch resets the engine: start pinned, nothing unseen.
    useLayoutEffect(() => {
        pinnedRef.current = true
        edgeIdsRef.current = { first: null, last: null }
        setIsAtBottom(true)
        setHasUnseenMessages(false)
    }, [channelID])

    // React to content changes — runs before paint so corrections are invisible.
    useLayoutEffect(() => {
        const container = containerRef.current
        if (!container || blocks.length === 0) return

        const first = blocks[0].name
        const last = blocks[blocks.length - 1].name
        const previous = edgeIdsRef.current
        edgeIdsRef.current = { first, last }

        if (pinnedRef.current) {
            container.scrollTop = container.scrollHeight
        } else if (previous.first !== null && first !== previous.first) {
            // Older messages prepended above the viewport — hold position steady.
            const delta = container.scrollHeight - metricsRef.current.scrollHeight
            if (delta > 0) container.scrollTop = metricsRef.current.scrollTop + delta
        } else if (previous.last !== null && last !== previous.last) {
            setHasUnseenMessages(true)
        }
        metricsRef.current = { scrollTop: container.scrollTop, scrollHeight: container.scrollHeight }

        // A short first page may not fill the viewport — no scrollbar means no
        // scroll events, so trigger the next page directly.
        if (hasOlderMessages && container.scrollHeight <= container.clientHeight) {
            loadOlder()
        }
    }, [blocks])

    // While pinned, stay pinned through any resize: the input growing as the
    // user types, the mobile keyboard opening, media settling into place.
    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const observer = new ResizeObserver(() => {
            if (pinnedRef.current && container) {
                container.scrollTop = container.scrollHeight
            }
        })
        observer.observe(container)
        if (container.firstElementChild) observer.observe(container.firstElementChild)
        return () => observer.disconnect()
    }, [])

    return { containerRef, onScroll, isAtBottom, hasUnseenMessages, scrollToBottom }
}
