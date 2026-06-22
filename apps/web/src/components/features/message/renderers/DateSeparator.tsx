import { useEffect, useRef, useState } from "react";
import { Badge } from "@components/ui/badge";
import { Separator } from "@components/ui/separator";

/** Nearest scrolling ancestor, used as the IntersectionObserver root. */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
    let el = node?.parentElement ?? null
    while (el) {
        const overflowY = getComputedStyle(el).overflowY
        if (overflowY === "auto" || overflowY === "scroll") return el
        el = el.parentElement
    }
    return null
}

// One shared IntersectionObserver per distinct scroll root (in practice, the
// single ChatStream viewport) so N date separators don't spin up N observers.
// Reference-counted; the observer is torn down when its last sentinel unmounts.
const stuckCallbacks = new WeakMap<Element, (stuck: boolean) => void>()
const rootObservers = new Map<Element | null, { observer: IntersectionObserver; refs: number }>()

function observeSentinel(el: HTMLElement, onChange: (stuck: boolean) => void) {
    const root = getScrollParent(el)
    let entry = rootObservers.get(root)
    if (!entry) {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const e of entries) stuckCallbacks.get(e.target)?.(!e.isIntersecting)
            },
            { root, threshold: 0 },
        )
        entry = { observer, refs: 0 }
        rootObservers.set(root, entry)
    }
    const current = entry
    stuckCallbacks.set(el, onChange)
    current.observer.observe(el)
    current.refs++

    return () => {
        current.observer.unobserve(el)
        stuckCallbacks.delete(el)
        if (--current.refs === 0) {
            current.observer.disconnect()
            rootObservers.delete(root)
        }
    }
}

export default function DateSeparator({ label }: { label: string }) {
    // A zero-height marker rendered just above the sticky row. When it scrolls
    // out of the top of the scroll container, the row is pinned ("stuck"). We
    // observe the sentinel (not the row) because the row uses `-mx-8` and would
    // never report a full intersection ratio.
    const sentinelRef = useRef<HTMLDivElement>(null)
    const [stuck, setStuck] = useState(false)

    useEffect(() => {
        const el = sentinelRef.current
        if (!el) return
        return observeSentinel(el, setStuck)
    }, [])

    return (
        <>
            <div ref={sentinelRef} aria-hidden className="h-0" />
            {/* The page-coloured bar keeps newer dates cleanly covering older
                pinned ones and hides messages scrolling underneath. Only the
                flanking lines fade out once pinned, leaving just the badge. */}
            <div
                data-stuck={stuck}
                className="group/date sticky top-0 z-40 py-2 -mx-8 px-8 flex items-center bg-surface-base"
            >
                <Separator className="flex-1 bg-surface-gray-2 transition-opacity group-data-[stuck=true]/date:opacity-0" />
                <Badge variant="subtle" theme="gray" size='md'>{label}</Badge>
                <Separator className="flex-1 bg-surface-gray-2 transition-opacity group-data-[stuck=true]/date:opacity-0" />
            </div>
        </>
    )
}
