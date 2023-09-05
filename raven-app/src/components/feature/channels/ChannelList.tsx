import { HStack, Icon, useBoolean } from "@chakra-ui/react"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarItem, SidebarItemLabel } from "../../layout/Sidebar"
import { SidebarBadge, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"
import { CreateChannelButton } from "./CreateChannelModal"
import { useContext, useMemo } from "react"
import { ChannelListContext, ChannelListContextType, ChannelListItem, UnreadCountData } from "../../../utils/channel/ChannelListProvider"
import { getChannelIcon } from "@/utils/layout/channelIcon"

export const ChannelList = ({ unread_count }: { unread_count?: UnreadCountData }) => {

    const { channels, mutate } = useContext(ChannelListContext) as ChannelListContextType

    const [showData, { toggle }] = useBoolean(true)

    return (
        <>
            <SidebarGroup spacing={1}>
                <SidebarGroupItem px='2'>
                    <SidebarViewMoreButton onClick={toggle} />
                    <HStack w='full' justifyContent='space-between'>
                        <SidebarGroupLabel>Channels</SidebarGroupLabel>
                        {!showData && unread_count && unread_count.total_unread_count_in_channels > 0 && <SidebarBadge>{unread_count.total_unread_count_in_channels}</SidebarBadge>}
                    </HStack>
                </SidebarGroupItem>
                <SidebarGroup>
                    <SidebarGroupList>
                        <SidebarGroupList>
                            {showData && channels.filter((channel) => channel.is_archived == 0).map((channel) => <ChannelItem
                                channel={channel}
                                unreadCount={unread_count?.channels ?? []}
                                key={channel.name} />)}
                        </SidebarGroupList>
                        <CreateChannelButton updateChannelList={mutate} />
                    </SidebarGroupList>
                </SidebarGroup>
            </SidebarGroup>
        </>
    )
}

const ChannelItem = ({ channel, unreadCount }: { channel: ChannelListItem, unreadCount: UnreadCountData['channels'] }) => {

    const unreadCountForChannel = useMemo(() => unreadCount.find((unread) => unread.name == channel.name)?.unread_count, [channel.name, unreadCount])

    const icon = useMemo(() => getChannelIcon(channel.type), [channel.type])

    return (
        <SidebarItem to={channel.name}>
            <Icon fontSize={'md'} as={icon} />
            <HStack justifyContent='space-between' w='100%'>
                <SidebarItemLabel fontWeight={unreadCountForChannel ? 'bold' : 'normal'}>{channel.channel_name}</SidebarItemLabel>
                <SidebarBadge hidden={!unreadCountForChannel}>{unreadCountForChannel}</SidebarBadge>
            </HStack>
        </SidebarItem>
    )

}