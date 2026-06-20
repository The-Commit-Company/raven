import { useFrappeEventListener } from "frappe-react-sdk"
import { useUserCookieData } from "@hooks/useUserCookieData"
import { channelUnreadStore } from "./store"
import { channelStore } from "@stores/channels/store"

type UnreadChannelEvent = {
    channel_id: string
    sent_by: string
    last_message_timestamp?: string
    /** JSON string of the new last message — present on DM message events. */
    last_message_details?: string
    is_dm_channel?: boolean
    is_thread?: boolean
    play_sound?: boolean
}

/**
 * Single handler for the channel-activity signal. The event carries no count —
 * it's a "something changed in channel X" ping — and drives two independent
 * updates off the one subscription:
 *
 *  1. Unread counts (store). Someone else posted -> increment (the store applies
 *     the timestamp guard and exempts the channel being actively read). Our own
 *     post, or a read echoed from another device -> advance the watermark so this
 *     session agrees and later bumps below it are ignored. No per-event refetch
 *     (v2's slow path, which raced reads).
 *
 *  2. DM list preview (channelStore). DM message events carry the new
 *     last_message_details + timestamp, so the sidebar's preview text and date
 *     update live — patched straight into the channel store (single writer; the
 *     sidebar re-sorts by timestamp). Only events that actually carry details patch
 *     the channel — that excludes read-echoes (track_visit) and plain non-DM channel
 *     pings, neither of which should rewrite a channel's last-message fields.
 *
 * Thread activity rides a separate `thread_reply` event and its own unread count
 * (threads are excluded from get_unread_count_for_channels), so it isn't here.
 */
export const useUnreadRealtime = () => {
    const { name: currentUser } = useUserCookieData()

    useFrappeEventListener("raven:unread_channel_count_updated", (event: UnreadChannelEvent) => {
        if (!event?.channel_id) return

        // 1. Unread counts
        if (event.sent_by === currentUser) {
            if (event.last_message_timestamp) {
                channelUnreadStore.markRead(event.channel_id, event.last_message_timestamp, false)
            }
        } else {
            channelUnreadStore.increment(event.channel_id, event.last_message_timestamp)
        }

        // 2. DM list preview — only events that carry the new message details
        if (event.last_message_details !== undefined) {
            channelStore.patchChannel(event.channel_id, {
                last_message_details: event.last_message_details,
                ...(event.last_message_timestamp
                    ? { last_message_timestamp: event.last_message_timestamp }
                    : {}),
            })
        }
    })
}
