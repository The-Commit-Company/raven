import { useDisclosure } from "@chakra-ui/react"
import { useFrappeGetCall } from "frappe-react-sdk"
import { BiGlobe, BiHash } from "react-icons/bi"
import { BiLockAlt } from "react-icons/bi"
import { IoAdd } from "react-icons/io5"
import { useFrappeEventListener } from "../../../hooks/useFrappeEventListener"
import { ChannelData } from "../../../types/Channel/Channel"
import { AlertBanner } from "../../layout/AlertBanner"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItem, SidebarItemLabel } from "../../layout/Sidebar"
import { SidebarButtonItem, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"
import { CreateChannelModal } from "./CreateChannelModal"
import { useState } from "react"


export const ChannelList = () => {

    const { data, error, mutate } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list", {
        hide_archived: true
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
                    <SidebarGroupLabel>Channels</SidebarGroupLabel>
                </SidebarGroupItem>
                <SidebarGroup>
                    <SidebarGroupList>
                        <SidebarGroupList maxH={'28vh'} overflowY={'scroll'}>
                            {showData && data?.message.filter((channel) => channel.is_direct_message === 0).map((channel) => (
                                <SidebarItem to={channel.name} key={channel.name}>
                                    <SidebarIcon>{channel.type === "Private" && <BiLockAlt /> || channel.type === "Public" && <BiHash /> || channel.type === "Open" && <BiGlobe />}</SidebarIcon>
                                    <SidebarItemLabel>{channel.channel_name}</SidebarItemLabel>
                                </SidebarItem>
                            ))}
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