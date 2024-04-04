import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarItem } from "../../layout/Sidebar"
import { SidebarBadge, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"
import { CreateChannelButton } from "./CreateChannelModal"
import { useContext, useMemo, useState } from "react"
import { ChannelListContext, ChannelListContextType, ChannelListItem, UnreadCountData } from "../../../utils/channel/ChannelListProvider"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { Box, Flex, Text } from "@radix-ui/themes"
import { useLocation, useParams } from "react-router-dom"

export const ChannelList = ({ unread_count }: { unread_count?: UnreadCountData }) => {

    const { channels, mutate } = useContext(ChannelListContext) as ChannelListContextType

    const [showData, setShowData] = useState(true)

    const toggle = () => setShowData(d => !d)

    const filteredChannels = useMemo(() => channels.filter((channel) => channel.is_archived == 0), [channels])

    return (
        <SidebarGroup>
            <SidebarGroupItem gap='2' className={'pl-1.5'}>
                <SidebarViewMoreButton onClick={toggle} />
                <Flex width='100%' justify='between' align='center' gap='2'>
                    <Flex gap='2' align='center'>
                        <SidebarGroupLabel className='cal-sans'>Channels</SidebarGroupLabel>
                        <CreateChannelButton updateChannelList={mutate} />
                    </Flex>
                    {!showData && unread_count && unread_count.total_unread_count_in_channels > 0 &&
                        <Box pr='2'>
                            <SidebarBadge>{unread_count.total_unread_count_in_channels}</SidebarBadge>
                        </Box>}
                </Flex>
            </SidebarGroupItem>
            <SidebarGroup>
                <SidebarGroupList>
                    {showData && filteredChannels.map((channel) => <ChannelItem
                        channel={channel}
                        unreadCount={unread_count?.channels ?? []}
                        key={channel.name} />)}
                </SidebarGroupList>
            </SidebarGroup>
        </SidebarGroup>
    )
}

const ChannelItem = ({ channel, unreadCount }: { channel: ChannelListItem, unreadCount: UnreadCountData['channels'] }) => {

    const unreadCountForChannel = useMemo(() => unreadCount.find((unread) => unread.name == channel.name)?.unread_count, [channel.name, unreadCount])

    return <ChannelItemElement channel={channel} unreadCount={unreadCountForChannel} />

}

export const ChannelItemElement = ({ channel, unreadCount }: { channel: ChannelListItem, unreadCount?: number }) => {

    const { channelID } = useParams()

    const { state } = useLocation()

    /**
     * Show the unread count if it exists and either the channel is not the current channel,
     * or if it is the current channel, the user is viewing a base message
     */
    const showUnread = unreadCount && (channelID !== channel.name || state?.baseMessage)

    return (
        <SidebarItem to={channel.name} className={'py-1.5'}>
            <ChannelIcon type={channel.type} size='18' />
            <Flex justify='between' align={'center'} width='100%'>
                <Text size='2' className="text-ellipsis line-clamp-1" as='span' weight={showUnread ? 'bold' : 'regular'}>{channel.channel_name}</Text>
                {showUnread ? <SidebarBadge>{unreadCount}</SidebarBadge> : null}
            </Flex>
        </SidebarItem>
    )
}