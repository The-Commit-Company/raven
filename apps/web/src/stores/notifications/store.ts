import {
    NotificationListState,
    NotificationObject,
    NotificationTab,
    applyInitialPage,
    beginPagination,
    endPagination,
    initialNotificationListState,
    markError,
    markLoading,
    mergePage,
    patchAllRead,
    patchRead,
} from "./reducers"

type Listener = () => void

/**
 * Single writer for the notifications feed — ONE merged window (all mentions +
 * reactions, newest-first). The `all | mention | reaction` tabs are derived by
 * client-side filtering this window in the selector (mention/reaction are subsets
 * of all), so switching tabs costs zero API calls. A single-window store (no
 * per-key fan-out); no-op reducers return the same reference so duplicate
 * events cause zero re-renders.
 *
 * `getState` / `subscribe` are arrow fields so they pass directly to
 * useSyncExternalStore without binding.
 */
class NotificationListStore {
    private state: NotificationListState = initialNotificationListState
    private listeners = new Set<Listener>()

    getState = (): NotificationListState => this.state

    subscribe = (listener: Listener): (() => void) => {
        this.listeners.add(listener)
        return () => {
            this.listeners.delete(listener)
        }
    }

    isLoaded(): boolean {
        return this.state.status !== "idle"
    }

    /** ----- Fetch lifecycle ----- */

    startLoading() {
        this.update(markLoading(this.state))
    }

    failLoading(error: string) {
        this.update(markError(this.state, error))
    }

    setInitialPage(rows: NotificationObject[], hasMore: boolean) {
        this.update(applyInitialPage(this.state, rows, hasMore))
    }

    appendPage(rows: NotificationObject[], hasMore: boolean) {
        this.update(mergePage(this.state, rows, hasMore))
    }

    /** Upsert page 0 after a live event — keep hasMore. */
    reconcilePage(rows: NotificationObject[]) {
        this.update(mergePage(this.state, rows, this.state.hasMore))
    }

    beginLoadMore(): boolean {
        const s = this.state
        if (s.status !== "ready" || s.loadingMore || !s.hasMore) return false
        this.update(beginPagination(s))
        return true
    }

    endLoadMore() {
        this.update(endPagination(this.state))
    }

    /** ----- Read-state actions (optimistic + realtime echo) ----- */

    markMessageRead(messageId: string) {
        this.update(patchRead(this.state, messageId))
    }

    markAllRead() {
        this.update(patchAllRead(this.state))
    }

    /** ----- Internals ----- */

    private update(next: NotificationListState) {
        if (this.state === next) return
        this.state = next
        this.listeners.forEach((listener) => listener())
    }
}

export const notificationListStore = new NotificationListStore()
export type { NotificationListState, NotificationObject, NotificationTab }
