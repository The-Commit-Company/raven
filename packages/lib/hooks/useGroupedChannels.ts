import { useMemo } from 'react'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { RavenUser } from '@raven/types/Raven/RavenUser'

export interface ChannelSidebarData {
    groupedChannels: [string, ChannelListItem[]][]
    ungroupedChannels: ChannelListItem[]
}

export const useGroupedChannels = (
    channels: ChannelListItem[],
    myProfile?: RavenUser,
    workspaceID?: string,
    showMyChannelsOnly?: boolean
): ChannelSidebarData => {
    return useMemo(() => {
        const workspaceChannels = channels.filter((ch) => ch.workspace === workspaceID && (!showMyChannelsOnly || !!ch.member_id) && !ch.is_archived)
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

        // TODO(channel-sort): channels currently keep get_all_channels' arbitrary
        // order within each group. Channels are curated "places" (unlike DMs, which
        // are a recency inbox), so we deliberately do NOT bubble them on new
        // messages. Planned: sort alphabetically by channel_name within each group
        // as the default, behind a per-user "Sort sidebar by" preference
        // (Alphabetical / Recent activity / Unread first) — only "Recent activity"
        // would consume last_message_timestamp. Unread stays bold + badge in place.
        const groupedChannels = Array.from(groups).filter(([, channels]) => channels.length > 0)
        const ungroupedChannels = Array.from(remainingChannels)

        return { groupedChannels, ungroupedChannels }
    }, [channels, workspaceID, myProfile?.channel_groups, myProfile?.pinned_channels, myProfile?.grouped_channels, showMyChannelsOnly])
}