import { useMemo } from 'react'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { RavenUser } from '@raven/types/Raven/RavenUser'
import dayjs from "dayjs"
export interface ChannelSidebarData {
    groupedChannels: [string, ChannelListItem[]][]
    ungroupedChannels: ChannelListItem[]
}

export const useGroupedChannels = (
    channels: ChannelListItem[],
    myProfile?: RavenUser,
    workspaceID?: string,
): ChannelSidebarData => {
    return useMemo(() => {

        const showMyChannelsOnly = myProfile?.filter_joined_channels === 1
        const showRecentActivityOnly = myProfile?.filter_recent_activity === 1

        const thirty_days_ago = dayjs().subtract(30, 'days').format('YYYY-MM-DD')
        const workspaceChannels = channels.filter((ch) => {
            if (ch.workspace !== workspaceID) return false
            if (ch.is_archived) return false
            if (showMyChannelsOnly && !ch.member_id) return false
            if (showRecentActivityOnly && dayjs(ch.last_message_timestamp).isBefore(thirty_days_ago)) return false
            return true
        })
        if (!myProfile || !workspaceChannels.length) {
            return { groupedChannels: [], ungroupedChannels: [] }
        }

        const groups = new Map<string, ChannelListItem[]>()
        const remainingChannels = new Set(workspaceChannels)

        const pinnedChannelIds = new Set(myProfile.pinned_channels?.map(pin => pin.channel_id) || [])
        const groupedChannelMap = new Map(
            myProfile.grouped_channels?.map(gc => [gc.channel_id, gc.channel_group]) || []
        )

        if (pinnedChannelIds.size > 0) {
            groups.set('Favorites', [])
        }
        if (myProfile?.channel_groups && myProfile.channel_groups.length > 0) {
            myProfile.channel_groups.forEach(group => {
                groups.set(group.group_name, [])
            })
        }

        workspaceChannels.forEach(ch => {
            if (pinnedChannelIds.has(ch.name)) {
                groups.get('Favorites')?.push(ch)
                remainingChannels.delete(ch)
                return
            }
            const channelGroup = groupedChannelMap.get(ch.name)
            if (channelGroup) {
                const group = groups.get(channelGroup)
                if (group) {
                    group.push(ch)
                    remainingChannels.delete(ch)
                }
                return
            }
        })

        // channels currently keep get_all_channels' arbitrary
        // order within each group. Channels are curated "places" (unlike DMs, which
        // are a recency inbox), so we deliberately do NOT bubble them on new
        // messages. Planned: sort alphabetically by channel_name within each group
        // as the default, behind a per-user "Sort sidebar by" preference
        // (Alphabetical / Recent activity / Unread first) — only "Recent activity"
        // would consume last_message_timestamp. Unread stays bold + badge in place.
        const groupedChannels = Array.from(groups).filter(([, channels]) => channels.length > 0)
        const ungroupedChannels = Array.from(remainingChannels).sort((a, b) => {
            if (myProfile?.sort_channels_by === "Alphabetical Order") {
                return a.channel_name.localeCompare(b.channel_name)
            }

            // TODO: Implement unread first
            const ta = a.last_message_timestamp ?? ""
            const tb = b.last_message_timestamp ?? ""
            return ta < tb ? 1 : ta > tb ? -1 : 0

        })

        return { groupedChannels, ungroupedChannels }
    }, [channels, workspaceID, myProfile?.channel_groups, myProfile?.pinned_channels, myProfile?.grouped_channels, myProfile?.sort_channels_by, myProfile?.filter_recent_activity, myProfile?.filter_joined_channels])
}