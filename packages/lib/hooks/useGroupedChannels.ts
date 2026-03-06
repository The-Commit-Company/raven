import { useMemo } from 'react'
import { ChannelListItem } from '@raven/types/common/ChannelListItem'
import { RavenUser } from '@raven/types/Raven/RavenUser'

export interface ChannelSidebarData {
    groupedChannels: [string, ChannelListItem[]][]
    ungroupedChannels: ChannelListItem[]
}

export const useGroupedChannels = (
    channels: ChannelListItem[],
    myProfile?: RavenUser
): ChannelSidebarData => {
    return useMemo(() => {
        if (!myProfile || !channels.length) {
            return { groupedChannels: [], ungroupedChannels: [] }
        }

        const groups = new Map<string, ChannelListItem[]>()
        const remainingChannels = new Set(channels)

        const pinnedChannelIds = new Set(myProfile.pinned_channels?.map(pin => pin.channel_id) || [])
        const groupedChannelMap = new Map(
            myProfile.grouped_channels?.map(gc => [gc.channel_id, gc.channel_group]) || []
        )

        if (pinnedChannelIds.size > 0) {
            groups.set('⭐️ Favorites', [])
        }
        if (myProfile?.channel_groups && myProfile.channel_groups.length > 0) {
            myProfile.channel_groups.forEach(group => {
                groups.set(group.group_name, [])
            })
        }

        channels.forEach(ch => {
            if (pinnedChannelIds.has(ch.name)) {
                groups.get('⭐️ Favorites')?.push(ch)
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

        const groupedChannels = Array.from(groups)
        const ungroupedChannels = Array.from(remainingChannels)

        return { groupedChannels, ungroupedChannels }
    }, [channels, myProfile?.channel_groups, myProfile?.pinned_channels, myProfile?.grouped_channels])
}