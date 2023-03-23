import { Avatar, AvatarBadge, HStack } from "@chakra-ui/react"
import { FrappeConfig, FrappeContext, useFrappeGetCall, useFrappeGetDocList, useFrappePostCall } from "frappe-react-sdk"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { User } from "../../../types/User/User"
import { AlertBanner } from "../../layout/AlertBanner"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItemLabel, SidebarButtonItem } from "../../layout/Sidebar"

export const DirectMessageList = (userData: { userData: User | null }) => {

    const { url } = useContext(FrappeContext) as FrappeConfig
    const { data: users, error: usersError } = useFrappeGetDocList<User>("User", {
        fields: ["full_name", "user_image", "name"],
        filters: [["name", "!=", "Guest"]]
    })
    const { call, error: channelError, loading, reset } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")
    const navigate = useNavigate()

    const gotoDMChannel = async (user: string) => {
        reset()
        const result = await call({ user_id: user })
        navigate(`/channel/${result?.message}`)
    }

    const { data, error } = useFrappeGetCall<{ message: string }>('raven.api.user_availability.get_active_users')

    if (usersError) {
        <AlertBanner status="error" heading={usersError.message}>{usersError.httpStatus} - {usersError.httpStatusText}</AlertBanner>
    }
    if (channelError) {
        <AlertBanner status="error" heading={channelError.message}>{channelError.httpStatus} - {channelError.httpStatusText}</AlertBanner>
    }

    return (
        <SidebarGroup>
            <SidebarGroupItem>
                <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
            </SidebarGroupItem>
            <SidebarGroupList>
                {users?.map((user) =>
                    <SidebarButtonItem onClick={() => gotoDMChannel(user.name)} isLoading={loading} key={user.name}>
                        <HStack>
                            <SidebarIcon><Avatar name={user.full_name} src={url + user.user_image} borderRadius={'md'} size="xs">
                                {data?.message.includes(user.name) && !!!error && <AvatarBadge boxSize='0.88em' bg='green.500' />}
                            </Avatar>
                            </SidebarIcon>
                            <SidebarItemLabel>{(user.name !== userData.userData?.name) ? user.full_name : user.full_name + ' (You)'}</SidebarItemLabel>
                        </HStack>
                    </SidebarButtonItem>
                )}
            </SidebarGroupList>
        </SidebarGroup>
    )
}