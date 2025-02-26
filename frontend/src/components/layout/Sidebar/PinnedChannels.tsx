import { ChannelListContext, ChannelListContextType, UnreadCountData } from '@/utils/channel/ChannelListProvider'
import { useContext, useMemo } from 'react'
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList } from './SidebarComp'
import { Box } from '@radix-ui/themes'
import { ChannelItemElement } from '@/components/feature/channels/ChannelList'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'
import { __ } from '@/utils/translations'
import { useParams } from 'react-router-dom'

const PinnedChannels = ({ unread_count }: { unread_count?: UnreadCountData }) => {

    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const { workspaceID } = useParams()

    const { myProfile } = useCurrentRavenUser()

    const pinnedChannels = useMemo(() => {
        if (myProfile) {
            const pinnedChannelIDs = myProfile.pinned_channels?.map(pin => pin.channel_id)

            return channels.filter(channel => pinnedChannelIDs?.includes(channel.name) && channel.is_archived === 0 && channel.workspace === workspaceID)
                .map(channel => {
                    const count = unread_count?.find((unread) => unread.name === channel.name)?.unread_count || 0
                    return {
                        ...channel,
                        unread_count: count
                    }
                })
                .filter(channel => channel.unread_count === 0)  // Exclude channels with unread messages
        } else {
            return []
        }
    }, [channels, myProfile, unread_count, workspaceID])

    if (pinnedChannels.length === 0) {
        return null
    }


    return (
        <Box>
            <SidebarGroup>
                <SidebarGroupItem className={'gap-1 pl-1'}>
                    <SidebarGroupLabel className='cal-sans'>{__("Pinned")}</SidebarGroupLabel>
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