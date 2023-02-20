import { Avatar } from "@chakra-ui/react"
import { useFrappeGetCall } from "frappe-react-sdk"
import { ChannelData, DirectMessage } from "../../../types/Channel/Channel"
import { User } from "../../../types/User/User"
import { AlertBanner } from "../../layout/AlertBanner"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItem, SidebarItemLabel } from "../../layout/Sidebar"

export const DirectMessageList = (userData: { userData: User | null }) => {

    const { data: directMessageData, error: directMessageError } = useFrappeGetCall<{ message: DirectMessage[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_direct_message_list")
    const { data: channelData, error: channelError } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")

    if (directMessageError) {
        <AlertBanner status="error" heading={directMessageError.message}>{directMessageError.httpStatus} - {directMessageError.httpStatusText}</AlertBanner>
    }
    if (channelError) {
        <AlertBanner status="error" heading={channelError.message}>{channelError.httpStatus} - {channelError.httpStatusText}</AlertBanner>
    }

    console.log(channelData)

    return (
        <SidebarGroup>
            <SidebarGroupItem>
                <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
            </SidebarGroupItem>
            <SidebarGroupList>
                {channelData?.message.filter((channel) => channel.is_self_message === 1).map((channel) => (
                    <SidebarItem to={channel.name} key={channel.name}>
                        <SidebarIcon><Avatar name={userData.userData?.full_name} src={userData.userData?.user_image} borderRadius={'md'} boxSize='20px' /></SidebarIcon>
                        <SidebarItemLabel>{userData.userData?.full_name} (You)</SidebarItemLabel>
                    </SidebarItem>
                ))}
                {directMessageData?.message.map((direct_message) =>
                    <SidebarItem to={direct_message.channel_id} key={direct_message.channel_id}>
                        <SidebarIcon><Avatar name={direct_message.full_name} src={direct_message.user_image} borderRadius={'md'} boxSize='20px' /></SidebarIcon>
                        <SidebarItemLabel>{direct_message.full_name}</SidebarItemLabel>
                    </SidebarItem>
                )}
            </SidebarGroupList>
        </SidebarGroup>
    )
}