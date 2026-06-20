import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { StreamBlock } from "@stores/messages/types"
import type { Message } from "@raven/types/common/Message"
import { useUserCookieData } from "@hooks/useUserCookieData"

/** How close to the bottom (px) still counts as "at the bottom". */
const AT_BOTTOM_SLOP = 40
/** Distance from either content edge (px) at which the next page starts loading. */
const LOAD_MORE_THRESHOLD = 400

/** Owner of the newest actual message in the stream (skips date dividers, unwraps batches). */
const ownerOfNewestMessage = (blocks: StreamBlock[]): string | undefined => {
    const last = blocks[blocks.length - 1]
    if (!last) return undefined
    if (last.message_type === "batch") return last.messages[last.messages.length - 1]?.owner
    if (last.message_type === "date") return undefined
    return (last as Message).owner
}

type StreamScrollOptions = {
    channelID: string
    blocks: StreamBlock[]
    loadOlder: () => void
    loadNewer: () => void
    hasOlderMessages: boolean
    /** True when the window is detached from the live edge. */
    hasNewerMessages: boolean
    /** Message id the view should navigate to (reply click / deep link), or null. */
    targetMessageID: string | null
    /** Called once the target is centered in the viewport. */
    onTargetSettled: (messageID: string) => void
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
 * - Navigate to a target message: suspend pinning, center the target once its
 *   block is in the DOM (directly for in-window targets; after the around-fetch
 *   replaces the window for out-of-window ones).
 */
export const useStreamScroll = ({
    channelID,
    blocks,
    loadOlder,
    loadNewer,
    hasOlderMessages,
    hasNewerMessages,
    targetMessageID,
    onTargetSettled,
}: StreamScrollOptions) => {
    const { name: currentUser } = useUserCookieData()
    const containerRef = useRef<HTMLDivElement>(null)
    /** True while the view should follow the newest message. */
    const pinnedRef = useRef(true)
    /** Last seen metrics, updated on every scroll — used for prepend compensation. */
    const metricsRef = useRef({ scrollTop: 0, scrollHeight: 0 })
    const edgeIdsRef = useRef<{ first: string | null; last: string | null }>({ first: null, last: null })
    /** True while a smooth glide animates — pauses load-older so a prepend can't fight the animation. */
    const smoothScrollingRef = useRef(false)

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
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
        const atBottom = distanceFromBottom <= AT_BOTTOM_SLOP
        // Pinning only means something at the LIVE edge — the bottom of a detached
        // window is just more history, and pinning there would skip past it.
        pinnedRef.current = atBottom && !hasNewerMessages
        setIsAtBottom(atBottom)
        if (atBottom && !hasNewerMessages) setHasUnseenMessages(false)
        // A prepend during a smooth glide would shift the animation's destination
        // out from under it — hold the prefetch until the animation settles.
        if (!smoothScrollingRef.current && container.scrollTop < LOAD_MORE_THRESHOLD) loadOlder()
        // Appends never move existing content, so no glide guard is needed downward.
        if (distanceFromBottom < LOAD_MORE_THRESHOLD) loadNewer()
    }, [loadOlder, loadNewer, hasNewerMessages])

    // A channel switch resets the engine: start pinned, nothing unseen.
    useLayoutEffect(() => {
        pinnedRef.current = true
        edgeIdsRef.current = { first: null, last: null }
        setIsAtBottom(true)
        setHasUnseenMessages(false)
    }, [channelID])

    // Navigating to a message suspends pinning immediately, so neither the pin
    // effect nor the ResizeObserver fights the positioning while it loads.
    useLayoutEffect(() => {
        if (targetMessageID) pinnedRef.current = false
    }, [targetMessageID])

    // React to content changes — runs before paint so corrections are invisible.
    useLayoutEffect(() => {
        const container = containerRef.current
        if (!container || blocks.length === 0) return

        const first = blocks[0].name
        const last = blocks[blocks.length - 1].name
        const previous = edgeIdsRef.current
        edgeIdsRef.current = { first, last }

        if (targetMessageID) {
            // Position the target if its block is in the DOM; otherwise hold
            // still — the around-fetch is replacing the window and this effect
            // re-runs when the new blocks land.
            const block = container.querySelector(`[data-message-id="${CSS.escape(targetMessageID)}"]`)
            if (block) {
                // Smooth gliding only means something when the target was already in
                // the loaded window. If this commit replaced the window (deep link,
                // around-fetch), the old scroll position is meaningless — jump.
                const windowReplaced =
                    previous.first === null || (first !== previous.first && last !== previous.last)
                const usedSmooth = centerInContainer(container, block, !windowReplaced)
                if (usedSmooth) {
                    smoothScrollingRef.current = true
                    const release = () => (smoothScrollingRef.current = false)
                    // scrollend where supported; timeout fallback for older Safari
                    container.addEventListener("scrollend", release, { once: true })
                    setTimeout(release, 1000)
                }
                onTargetSettled(targetMessageID)
            }
        } else if (pinnedRef.current) {
            container.scrollTop = container.scrollHeight
        } else if (previous.first !== null && first !== previous.first) {
            // Older messages prepended above the viewport — hold position steady.
            const delta = container.scrollHeight - metricsRef.current.scrollHeight
            if (delta > 0) container.scrollTop = metricsRef.current.scrollTop + delta
        } else if (previous.last !== null && last !== previous.last) {
            // New message at the bottom while scrolled up: jump to it if it's our
            // own send (you should always land on your message), else just surface
            // the "new messages" pill.
            if (ownerOfNewestMessage(blocks) === currentUser) {
                container.scrollTop = container.scrollHeight
                pinnedRef.current = true
            } else {
                setHasUnseenMessages(true)
            }
        }
        metricsRef.current = { scrollTop: container.scrollTop, scrollHeight: container.scrollHeight }

        // A short first page may not fill the viewport — no scrollbar means no
        // scroll events, so trigger the next page directly.
        if (container.scrollHeight <= container.clientHeight) {
            if (hasOlderMessages) loadOlder()
            if (hasNewerMessages) loadNewer()
        }
    }, [blocks, targetMessageID])

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

/** Smooth scrolling only makes sense over short hops — beyond this it's a disorienting blur. */
const SMOOTH_SCROLL_RANGE_VIEWPORTS = 1.5

/**
 * Scrolls `element` to the vertical center of `container` without touching
 * ancestor scroll positions. Nearby targets scroll smoothly (spatial
 * continuity: "it's just up there"); distant ones jump instantly and let the
 * highlight mark the arrival. Reduced-motion users always jump.
 *
 * Returns whether a smooth animation was started, so the caller can guard
 * against concurrent scroll mutations until it settles.
 */
const centerInContainer = (container: HTMLElement, element: Element, allowSmooth: boolean): boolean => {
    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const top = Math.max(
        0,
        elementRect.top - containerRect.top + container.scrollTop - (container.clientHeight - elementRect.height) / 2,
    )
    const distance = Math.abs(top - container.scrollTop)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const useSmooth =
        allowSmooth && !prefersReducedMotion && distance <= container.clientHeight * SMOOTH_SCROLL_RANGE_VIEWPORTS

    container.scrollTo({ top, behavior: useSmooth ? "smooth" : "auto" })
    return useSmooth
}
