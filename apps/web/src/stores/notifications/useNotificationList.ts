import { useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react"
import { FrappeConfig, FrappeContext, useSWRConfig } from "frappe-react-sdk"
import { UNREAD_COUNT_KEY } from "@hooks/useNotifications"
import { notificationListStore, type NotificationTab } from "./store"
import { selectNotificationRows } from "./selectors"
import {
    loadInitialNotifications,
    loadMoreNotifications,
    reconcileFirstPage,
    type NotificationCall,
} from "./loaders"

type CountResult = { message: number }

/**
 * Reads the single merged notifications window and applies the `type` tab filter
 * (all/mention/reaction) + the unread toggle client-side. Seeds the window once;
 * tab/filter changes never refetch. `loadMore` paginates the merged feed lazily.
 */
export const useNotificationList = (type: NotificationTab, { unreadOnly }: { unreadOnly: boolean }) => {
    const { call } = useContext(FrappeContext) as FrappeConfig
    const client = call as NotificationCall
    const { mutate: globalMutate } = useSWRConfig()

    const state = useSyncExternalStore(notificationListStore.subscribe, notificationListStore.getState)

    useEffect(() => {
        loadInitialNotifications(client)
    }, [client])

    const rows = useMemo(() => selectNotificationRows(state, { type, unreadOnly }), [state, type, unreadOnly])

    const loadMore = useCallback(() => {
        loadMoreNotifications(client)
    }, [client])

    // Optimistic update + POST only. The server fires message_notifications_read /
    // all_notifications_read back to us (user-scoped), and useNotificationsRealtime
    // revalidates the count on that echo — so we don't revalidate again here on success
    // (that was a redundant second GET). On failure there's no echo, so we reconcile + revalidate.
    const markMessageRead = useCallback(
        (messageId: string) => {
            notificationListStore.markMessageRead(messageId) // optimistic
            globalMutate(
                UNREAD_COUNT_KEY,
                (c: CountResult | undefined) => ({ message: Math.max(0, (c?.message ?? 0) - 1) }),
                { revalidate: false },
            )
            client
                .post("raven.api.notifications.mark_message_notifications_read", { message_id: messageId })
                .catch(() => {
                    reconcileFirstPage(client)
                    globalMutate(UNREAD_COUNT_KEY)
                })
        },
        [client, globalMutate],
    )

    const markAllRead = useCallback(() => {
        notificationListStore.markAllRead() // optimistic
        globalMutate(UNREAD_COUNT_KEY, { message: 0 }, { revalidate: false })
        client
            .post("raven.api.notifications.mark_all_notifications_read")
            .catch(() => globalMutate(UNREAD_COUNT_KEY))
    }, [client, globalMutate])

    return {
        rows,
        isLoading: state.status === "idle" || state.status === "loading",
        error: state.status === "error" ? state.error : null,
        hasMore: state.hasMore,
        loadMore,
        markMessageRead,
        markAllRead,
    }
}
