import { useFrappeGetCall } from "frappe-react-sdk"
import { useIsMobile } from "./use-mobile"
import type { ChannelList } from "@raven/types/common/ChannelListItem"

const CHANNEL_LIST_KEY = "channel_list"

/**
 * Fetches all channels and DM channels for the current user.
 * Matches frontend: raven.api.raven_channel.get_all_channels
 * Response: { message: { channels: ChannelListItem[], dm_channels: DMChannelListItem[] } }
 *
 * Each DM has: name (channel id for routes), peer_user_id, channel_name,
 * last_message_timestamp, last_message_details (JSON with content, etc.), member_id, workspace.
 * Unread counts come from raven.api.raven_message.get_unread_count_for_channels (merge by channel name).
 */
export function useChannelList() {
    const isMobile = useIsMobile()

    const { data, mutate, isLoading, error } = useFrappeGetCall<{ message: ChannelList }>(
        "raven.api.raven_channel.get_all_channels",
        { hide_archived: false },
        CHANNEL_LIST_KEY,
        {
            revalidateOnFocus: isMobile,
        }
    )

    const channels = data?.message?.channels ?? []
    const dm_channels = data?.message?.dm_channels ?? []

    return {
        channels,
        dm_channels,
        mutate,
        isLoading,
        error,
    }
}
