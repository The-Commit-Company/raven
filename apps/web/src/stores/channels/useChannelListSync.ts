import { useEffect } from "react"
import { useFrappeGetCall } from "frappe-react-sdk"
import type { ChannelList } from "@raven/types/common/ChannelListItem"
import { channelStore } from "./store"

/**
 * Owns the channel-list fetch and seeds/reconciles the store. Mounted once at the
 * app shell — the single source of the `'channel_list'` request now (consumers read
 * the store, not SWR). Revalidates on focus (throttled to once a minute so alt-tabbing
 * doesn't spam) / reconnect / stale, each time reconciling the store against the server's
 * authoritative list — this is what recovers DM teasers/ordering missed while backgrounded.
 */
export const useChannelListSync = () => {
    const { data } = useFrappeGetCall<{ message: ChannelList }>(
        "raven.api.raven_channel.get_all_channels",
        { hide_archived: false },
        "channel_list",
        {
            revalidateOnFocus: true,
            focusThrottleInterval: 60_000,
            revalidateIfStale: true,
            revalidateOnReconnect: true,
        },
    )

    useEffect(() => {
        if (!data?.message) return
        channelStore.reconcile(data.message.channels ?? [], data.message.dm_channels ?? [])
    }, [data])
}
