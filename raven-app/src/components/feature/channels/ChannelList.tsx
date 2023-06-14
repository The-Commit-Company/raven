import { HStack, useDisclosure } from "@chakra-ui/react"
import { useFrappeGetCall } from "frappe-react-sdk"
import { BiGlobe, BiHash } from "react-icons/bi"
import { BiLockAlt } from "react-icons/bi"
import { IoAdd } from "react-icons/io5"
import { useFrappeEventListener } from "../../../hooks/useFrappeEventListener"
import { ChannelData, UnreadCountData } from "../../../types/Channel/Channel"
import { AlertBanner } from "../../layout/AlertBanner"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItem, SidebarItemLabel } from "../../layout/Sidebar"
import { SidebarBadge, SidebarButtonItem, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"
import { CreateChannelModal } from "./CreateChannelModal"
import { useState } from "react"

export const ChannelList = () => {

    const { data, error, mutate } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list", {
        hide_archived: true
    }, undefined, {
        revalidateOnFocus: false
    })

    const [unreadCount, setUnreadCount] = useState<UnreadCountData>({
        total_unread_count: 0,
        channels: []
    })

    const handleClose = (refresh?: boolean) => {
        if (refresh) {
            mutate()
            onClose()
        } else {
            onClose()
        }
    }

    useFrappeEventListener('channel_list_updated', () => {
        mutate()
    })

    useFrappeEventListener('unread_channel_count_updated', (data: { unread_count: UnreadCountData }) => {
        setUnreadCount(data.unread_count)
    })

    const { isOpen, onOpen, onClose } = useDisclosure()

    if (error) {
        <AlertBanner status="error" heading={error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner>
    }

    const [showData, setShowData] = useState(true)

    return (
        <>
            <SidebarGroup spacing={1}>
                <SidebarGroupItem ml='2'>
                    <SidebarViewMoreButton onClick={() => setShowData(!showData)} />
                    <HStack w='71%' justifyContent='space-between'>
                        <SidebarGroupLabel>Channels</SidebarGroupLabel>
                        {!showData && unreadCount.total_unread_count > 0 && <SidebarBadge>{unreadCount.total_unread_count}</SidebarBadge>}
                    </HStack>
                </SidebarGroupItem>
                <SidebarGroup>
                        <SidebarGroupList>
                            {showData && data?.message.filter((channel: ChannelData) => channel.is_direct_message === 0).map((channel: ChannelData) => {
                                const unreadChannelCount = unreadCount.channels?.find((unread) => unread.name == channel.name)?.unread_count
                                return (
                                    <SidebarItem to={channel.name} key={channel.name}>
                                        <SidebarIcon>{channel.type === "Private" && <BiLockAlt /> || channel.type === "Public" && <BiHash /> || channel.type === "Open" && <BiGlobe />}</SidebarIcon>
                                        <HStack justifyContent='space-between' w='100%'>
                                            <SidebarItemLabel fontWeight={unreadChannelCount && unreadChannelCount > 0 ? 'bold' : 'normal'}>{channel.channel_name}</SidebarItemLabel>
                                            {unreadChannelCount && unreadChannelCount > 0 && <SidebarBadge>{unreadChannelCount}</SidebarBadge>}
                                        </HStack>
                                    </SidebarItem>
                                )
                            })}
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