import { ChannelListItem, DMChannelListItem, UnreadCountData } from '@/utils/channel/ChannelListProvider';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { showOnlyMyChannelsAtom } from './SidebarBody';

export interface UseGetChannelUnreadCountProps {
    channels: ChannelListItem[]
    dm_channels: DMChannelListItem[]
    unread_count: UnreadCountData | undefined
}

export interface ChannelWithUnreadCount extends ChannelListItem {
    unread_count: number
}

export interface DMChannelWithUnreadCount extends DMChannelListItem {
    unread_count: number
}

export const useGetChannelUnreadCounts = ({ channels, dm_channels, unread_count }: UseGetChannelUnreadCountProps) => {

    const showOnlyMyChannels = useAtomValue(showOnlyMyChannelsAtom)

    const { unreadChannels, readChannels, unreadDMs, readDMs } = useMemo(() => {

        const unreadCounts: Record<string, number> = {}

        // Create a mapping of channel names to unread counts
        unread_count?.forEach(item => {
            unreadCounts[item.name] = item.unread_count || 0
        })

        const unreadChannels: ChannelWithUnreadCount[] = []
        const readChannels: ChannelWithUnreadCount[] = []
        const unreadDMs: DMChannelWithUnreadCount[] = []
        const readDMs: DMChannelWithUnreadCount[] = []

        const allChannels: (ChannelListItem | DMChannelListItem)[] = [...channels, ...dm_channels]

        // Process all channels and DMs to separate unread and read
        allChannels.forEach(channel => {

            if (channel.is_archived) {
                // If the channel is archived, do not add to array
                return
            }
            const unreadCount = unreadCounts[channel.name] || 0
            const channelWithUnread = { ...channel, unread_count: unreadCount }

            if (unreadCount > 0) {
                // If the channel has unread messages
                if ('is_direct_message' in channel && channel.is_direct_message) {
                    // If it is a DM channel, add to unreadDMs
                    unreadDMs.push(channelWithUnread as DMChannelWithUnreadCount)
                } else {
                    // Else it's a regular channel
                    // For channels that are public but the user is not a member, do not add to unread channel array
                    if (channel.type === "Public" && !channel.member_id) {
                        if (!showOnlyMyChannels) {
                            // Instead add to readChannels if showOnlyMyChannels is false
                            readChannels.push(channelWithUnread as ChannelWithUnreadCount)
                        }
                    } else {
                        unreadChannels.push(channelWithUnread as ChannelWithUnreadCount)
                    }

                }
            } else {
                if ('is_direct_message' in channel && channel.is_direct_message) {
                    readDMs.push(channelWithUnread as DMChannelWithUnreadCount)
                } else {
                    let shouldAddToReadChannels = true

                    if (showOnlyMyChannels && !channel.member_id) {
                        shouldAddToReadChannels = false
                    }
                    if (shouldAddToReadChannels) {
                        readChannels.push(channelWithUnread as ChannelWithUnreadCount)
                    }
                }
            }
        });

        return { unreadChannels, readChannels, unreadDMs, readDMs }

    }, [channels, dm_channels, unread_count, showOnlyMyChannels])

    return { unreadChannels, readChannels, unreadDMs, readDMs }
}