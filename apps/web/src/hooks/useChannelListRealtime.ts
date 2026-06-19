import { useFrappeEventListener, useSWRConfig } from "frappe-react-sdk"

type ChannelEvent = { channel_id: string }

/**
 * Keeps the channel list and per-channel member lists fresh from realtime.
 *
 *  - channel_list_updated: a channel was created / archived / deleted, or the
 *    current user joined or left one. The payload carries only channel_id (not
 *    the channel data), so we revalidate the whole list rather than patch — and
 *    get_all_channels already filters to the user's channels.
 *  - channel_members_updated: a channel's membership changed — revalidate that
 *    channel's member list (key ["channel_members", channelID], see useChannelMembers).
 *
 * Both the channel list and the member caches are shared app-wide, so this is
 * mounted once at the shell. SWR dedupes concurrent revalidations, so bursts
 * (e.g. several channels created at once) collapse to a single refetch.
 */
export const useChannelListRealtime = () => {
    const { mutate } = useSWRConfig()

    // TODO: Add debouncing

    useFrappeEventListener("channel_list_updated", () => {
        mutate("channel_list")
    })

    useFrappeEventListener("channel_members_updated", (event: ChannelEvent) => {
        if (!event?.channel_id) return
        mutate(["channel_members", event.channel_id])
    })
}
