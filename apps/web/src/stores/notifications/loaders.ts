import type { FrappeConfig } from "frappe-react-sdk"
import { notificationListStore, type NotificationObject } from "./store"

export type NotificationCall = FrappeConfig["call"]

export const PAGE_SIZE = 10

type NotificationsResponse = { message: NotificationObject[] }

const ENDPOINT = "raven.api.notifications.get_notifications"

/** Always fetch the merged feed (no notification_type) — tabs filter it client-side. */
const fetchPage = (call: NotificationCall, start: number): Promise<NotificationObject[]> =>
    call
        .get<NotificationsResponse>(ENDPOINT, { limit: PAGE_SIZE, start })
        .then((res) => res.message ?? [])

/** Initial load of the merged window. No-op if already warm. */
export const loadInitialNotifications = async (call: NotificationCall) => {
    if (notificationListStore.isLoaded()) return
    notificationListStore.startLoading()
    try {
        const rows = await fetchPage(call, 0)
        notificationListStore.setInitialPage(rows, rows.length === PAGE_SIZE)
    } catch (e) {
        notificationListStore.failLoading(e instanceof Error ? e.message : String(e))
    }
}

/** Append the next page (driven lazily by Virtuoso endReached). */
export const loadMoreNotifications = async (call: NotificationCall) => {
    if (!notificationListStore.beginLoadMore()) return
    try {
        const start = notificationListStore.getState().order.length
        const rows = await fetchPage(call, start)
        notificationListStore.appendPage(rows, rows.length === PAGE_SIZE)
    } catch {
        notificationListStore.endLoadMore()
    }
}

/** Refetch page 0 and merge it (live new-item backstop; the event carries no row data). */
export const reconcileFirstPage = async (call: NotificationCall) => {
    try {
        const rows = await fetchPage(call, 0)
        notificationListStore.reconcilePage(rows)
    } catch {
        /* best-effort backstop; ignore */
    }
}
