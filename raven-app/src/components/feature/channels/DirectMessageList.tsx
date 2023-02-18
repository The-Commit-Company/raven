import { Avatar } from "@chakra-ui/react"
import { useFrappeGetCall } from "frappe-react-sdk"
import { useContext } from "react"
import { ChannelData } from "../../../types/Channel/Channel"
import { User } from "../../../types/User/User"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { AlertBanner } from "../../layout/AlertBanner"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItem, SidebarItemLabel } from "../../layout/Sidebar"

export const DirectMessageList = (userData: { userData: User | null }) => {

    const { data, error } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")
    console.log(data)

    if (error) {
        <AlertBanner status="error" heading={error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner>
    }

    return (
        <SidebarGroup>
            <SidebarGroupItem>
                <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
            </SidebarGroupItem>
            <SidebarGroupList>
                {data?.message.filter((channel) => channel.is_direct_message === 1).map((channel) => (
                    <SidebarItem to={channel.name} key={channel.name}>
                        <SidebarIcon><Avatar name={channel.full_name} src={channel.user_image} borderRadius={'md'} boxSize='20px' /></SidebarIcon>
                        <SidebarItemLabel>{channel.full_name}</SidebarItemLabel>
                    </SidebarItem>
                ))}
            </SidebarGroupList>
        </SidebarGroup>
    )
}