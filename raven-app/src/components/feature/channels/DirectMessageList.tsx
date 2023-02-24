import { Avatar, Button, HStack, useColorMode } from "@chakra-ui/react"
import { useFrappeGetDocList, useFrappePostCall } from "frappe-react-sdk"
import { useNavigate } from "react-router-dom"
import { User } from "../../../types/User/User"
import { AlertBanner } from "../../layout/AlertBanner"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItemLabel } from "../../layout/Sidebar"

export const DirectMessageList = (userData: { userData: User | null }) => {

    const { data: users, error: usersError } = useFrappeGetDocList<User>("User", { fields: ["full_name", "user_image", "name"] })
    const { call, error: channelError, loading, reset } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")
    const navigate = useNavigate()

    const gotoDMChannel = async (user: string) => {
        reset()
        const result = await call({ user_id: user })
        navigate(`/channel/${result?.message}`)
    }

    const { colorMode } = useColorMode()


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
                    <Button justifyContent="left" variant="ghost" w="full" color={colorMode === "light" ? "gray.500" : "gray.200"} onClick={() => gotoDMChannel(user.name)} isLoading={loading} key={user.name}>
                        <HStack>
                            <SidebarIcon><Avatar name={user.full_name} src={user.user_image} borderRadius={'md'} size="xs" /></SidebarIcon>
                            <SidebarItemLabel>{(user.name !== userData.userData?.name) ? user.full_name : user.full_name + ' (You)'}</SidebarItemLabel>
                        </HStack>
                    </Button>
                )}
            </SidebarGroupList>
        </SidebarGroup>
    )
}