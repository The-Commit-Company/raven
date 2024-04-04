import { ChannelListContext, ChannelListContextType, UnreadCountData } from '@/utils/channel/ChannelListProvider'
import { useContext, useMemo } from 'react'
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList } from './SidebarComp'
import { Flex } from '@radix-ui/themes'
import { MdOutlineMarkChatUnread } from 'react-icons/md'
import { ChannelItemElement } from '@/components/feature/channels/ChannelList'
import { DirectMessageItemElement } from '@/components/feature/direct-messages/DirectMessageList'

type Props = {}

const UnreadChannels = ({ unread_count }: { unread_count?: UnreadCountData }) => {

    const { channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType

    const { unread_channels, unread_dm_channels } = useMemo(() => {
        // Only show channels with unread messages
        const activeChannels = channels.filter(channel => channel.is_archived === 0)

        const channelsWithUnread = []
        const dmsWithUnread = []
        for (const channel of activeChannels) {
            const count = unread_count?.channels.find((unread) => unread.name === channel.name)?.unread_count
            if (count) {
                channelsWithUnread.push({
                    ...channel,
                    unread_count: count
                })
            }
        }

        for (const channel of dm_channels) {
            const count = unread_count?.channels.find((unread) => unread.name === channel.name)?.unread_count
            if (count) {
                dmsWithUnread.push({
                    ...channel,
                    unread_count: count
                })
            }
        }

        return {
            unread_channels: channelsWithUnread,
            unread_dm_channels: dmsWithUnread
        }

    }, [channels, dm_channels, unread_count])

    if (unread_channels.length === 0 && unread_dm_channels.length === 0) {
        return null
    }


    return (
        <SidebarGroup>
            <SidebarGroupItem gap='2' className={'pl-1.5'}>
                <MdOutlineMarkChatUnread className='text-slate-12 mt-0.5' size='14' />
                <Flex width='100%' justify='between' align='center' gap='2'>
                    <SidebarGroupLabel className='cal-sans'>Unread</SidebarGroupLabel>
                </Flex>
            </SidebarGroupItem>
            <SidebarGroup>
                <SidebarGroupList>
                    {unread_channels.map((channel) => <ChannelItemElement
                        channel={channel}
                        unreadCount={channel.unread_count}
                        key={channel.name} />)}

                    {unread_dm_channels.map((channel) => <DirectMessageItemElement
                        channel={channel}
                        unreadCount={channel.unread_count}
                        key={channel.name} />)}

                    {/* {filteredChannels.map((channel) => <ChannelItem
                        channel={channel}
                        unreadCount={unread_count?.channels ?? []}
                        key={channel.name} />)} */}
                </SidebarGroupList>
            </SidebarGroup>
        </SidebarGroup>
    )
}

export default UnreadChannels