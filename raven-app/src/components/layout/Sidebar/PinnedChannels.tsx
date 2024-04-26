import { ChannelListContext, ChannelListContextType, UnreadCountData } from '@/utils/channel/ChannelListProvider'
import { useContext, useMemo } from 'react'
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList } from './SidebarComp'
import { Box, Flex } from '@radix-ui/themes'
import { ChannelItemElement } from '@/components/feature/channels/ChannelList'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'
import { RiPushpinFill } from 'react-icons/ri'

const PinnedChannels = ({ unread_count }: { unread_count?: UnreadCountData }) => {

    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const { myProfile } = useCurrentRavenUser()

    const pinnedChannels = useMemo(() => {
        if (myProfile) {
            const pinnedChannelIDs = myProfile.pinned_channels?.map(pin => pin.channel_id)

            return channels.filter(channel => pinnedChannelIDs?.includes(channel.name) && channel.is_archived === 0)
                .map(channel => {
                    const count = unread_count?.channels.find((unread) => unread.name === channel.name)?.unread_count
                    return {
                        ...channel,
                        unread_count: count || 0
                    }

                })
        } else {
            return []
        }
    }, [channels, myProfile, unread_count])

    if (pinnedChannels.length === 0) {
        return null
    }


    return (
        <Box>
            <SidebarGroup pt='1'>
                <SidebarGroupItem gap='2' className={'pl-0.5'}>
                    <RiPushpinFill className='mt-0.5 text-gray-12 dark:text-gray-300' size='16' />
                    <Flex width='100%' justify='between' align='center' gap='2'>
                        <SidebarGroupLabel className='cal-sans text-gray-12 dark:text-gray-11'>Pinned</SidebarGroupLabel>
                    </Flex>
                </SidebarGroupItem>
                <SidebarGroup>
                    <SidebarGroupList>
                        {pinnedChannels.map((channel) => <ChannelItemElement
                            channel={channel}
                            key={channel.name} />)}
                    </SidebarGroupList>
                </SidebarGroup>
            </SidebarGroup>
        </Box>
    )
}

export default PinnedChannels