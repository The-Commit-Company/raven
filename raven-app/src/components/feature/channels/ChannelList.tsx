import { useDisclosure } from "@chakra-ui/react"
import { useFrappeGetCall } from "frappe-react-sdk"
import { BiHash } from "react-icons/bi"
import { BiLockAlt } from "react-icons/bi"
import { IoAdd } from "react-icons/io5"
import { AlertBanner } from "../../layout/AlertBanner"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItem, SidebarItemLabel } from "../../layout/Sidebar"
import { SidebarButtonItem } from "../../layout/Sidebar/SidebarComp"
import { CreateChannelModal } from "./CreateChannelModal"

type ChannelListForUser = {
    name: string,
    channel_name: string,
    type: string,
    is_direct_message: boolean
}

export const ChannelList = () => {

    const { data, error, mutate } = useFrappeGetCall<{ message: ChannelListForUser[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")

    const handleClose = (refresh?: boolean) => {
        if (refresh) {
            mutate()
            onClose()
        } else {
            onClose()
        }
    }

    const { isOpen, onOpen, onClose } = useDisclosure()

    if (error) {
        <AlertBanner status="error" heading={error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner>
    }

    return (
        <>
            <SidebarGroup>
                <SidebarGroupItem>
                    <SidebarGroupLabel>Channels</SidebarGroupLabel>
                </SidebarGroupItem>
                <SidebarGroupList>
                    {data?.message.map((channel) => (
                        <SidebarItem to={channel.name} key={channel.name}>
                            <SidebarIcon>{channel.type === "Private" ? <BiLockAlt /> : <BiHash />}</SidebarIcon>
                            <SidebarItemLabel>{channel.channel_name}</SidebarItemLabel>
                        </SidebarItem>
                    ))}
                    <SidebarButtonItem key={'create-channel'} onClick={onOpen}>
                        <SidebarIcon><IoAdd /></SidebarIcon>
                        <SidebarItemLabel>Add channel</SidebarItemLabel>
                    </SidebarButtonItem>
                </SidebarGroupList>
            </SidebarGroup>
            <CreateChannelModal isOpen={isOpen} onClose={handleClose} />
        </>
    )
}