import { HStack, useBoolean, useDisclosure } from "@chakra-ui/react"
import { BiGlobe, BiHash } from "react-icons/bi"
import { BiLockAlt } from "react-icons/bi"
import { IoAdd } from "react-icons/io5"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItem, SidebarItemLabel } from "../../layout/Sidebar"
import { SidebarBadge, SidebarButtonItem, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"
import { CreateChannelModal } from "./CreateChannelModal"
import { useContext } from "react"
import { ChannelListContext, ChannelListContextType, UnreadCountData } from "../../../utils/channel/ChannelListProvider"
import { RavenChannel } from "../../../types/RavenChannelManagement/RavenChannel"

export const ChannelList = ({ unread_count }: { unread_count?: UnreadCountData }) => {

    const { channels, mutate } = useContext(ChannelListContext) as ChannelListContextType

    const { isOpen, onOpen, onClose } = useDisclosure()
    const handleClose = (refresh?: boolean) => {
        if (refresh) {
            mutate()
            onClose()
        } else {
            onClose()
        }
    }

    const [showData, {
        toggle
    }] = useBoolean(true)

    return (
        <>
            <SidebarGroup spacing={1}>
                <SidebarGroupItem ml='2'>
                    <SidebarViewMoreButton onClick={toggle} />
                    <HStack w='71%' justifyContent='space-between'>
                        <SidebarGroupLabel>Channels</SidebarGroupLabel>
                        {!showData && unread_count && unread_count.total_unread_count_in_channels > 0 && <SidebarBadge>{unread_count.total_unread_count_in_channels}</SidebarBadge>}
                    </HStack>
                </SidebarGroupItem>
                <SidebarGroup>
                    <SidebarGroupList>
                        <SidebarGroupList>
                            {showData && channels.map((channel) => <ChannelItem channel={channel} unreadCount={unread_count?.channels ?? []} key={channel.name} />)}
                        </SidebarGroupList>
                        <SidebarButtonItem key={'create-channel'} onClick={onOpen}>
                            <SidebarIcon><IoAdd /></SidebarIcon>
                            <SidebarItemLabel>Add channel</SidebarItemLabel>
                        </SidebarButtonItem>
                    </SidebarGroupList>
                </SidebarGroup>
            </SidebarGroup>
            <CreateChannelModal isOpen={isOpen} onClose={handleClose} />
        </>
    )
}

const ChannelItem = ({ channel, unreadCount }: { channel: RavenChannel, unreadCount: UnreadCountData['channels'] }) => {

    const unreadCountForChannel = unreadCount.find((unread) => unread.name == channel.name)?.unread_count
    return (
        <SidebarItem to={channel.name}>
            <SidebarIcon>{channel.type === "Private" && <BiLockAlt /> || channel.type === "Public" && <BiHash /> || channel.type === "Open" && <BiGlobe />}</SidebarIcon>
            <HStack justifyContent='space-between' w='100%'>
                <SidebarItemLabel fontWeight={unreadCountForChannel ? 'bold' : 'normal'}>{channel.channel_name}</SidebarItemLabel>
                <SidebarBadge hidden={!unreadCountForChannel}>{unreadCountForChannel}</SidebarBadge>
            </HStack>
        </SidebarItem>
    )

}