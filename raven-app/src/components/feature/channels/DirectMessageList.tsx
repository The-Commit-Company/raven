import { Avatar, AvatarBadge, HStack } from "@chakra-ui/react"
import { FrappeConfig, FrappeContext, useFrappeGetCall, useFrappeGetDocList, useFrappePostCall } from "frappe-react-sdk"
import { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { User } from "../../../types/User/User"
import { AlertBanner } from "../../layout/AlertBanner"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItemLabel, SidebarButtonItem } from "../../layout/Sidebar"
import { SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"

export const DirectMessageList = ({ userData }: { userData: User | null }) => {
    const { url } = useContext(FrappeContext) as FrappeConfig
    const { data: users, error: usersError } = useFrappeGetDocList<User>("User", {
        fields: ["full_name", "user_image", "name"],
        filters: [["name", "!=", "Guest"]]
    }, undefined, {
        revalidateOnFocus: false
    })
    const { call, error: channelError, loading, reset } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")
    const { data: DMChannels, error: DMChannelsError } = useFrappeGetCall<{ message: string }>('raven.raven_channel_management.doctype.raven_channel.raven_channel.get_direct_message_channels_list', undefined, undefined, {
        revalidateOnFocus: false
    })
    const navigate = useNavigate()
    const location = useLocation();
    const currentAddress = location.pathname

    const [showData, setShowData] = useState(true)
    const [selectedUser, setSelectedUser] = useState<string[]>([])

    useEffect(() => {
        reset()
    }, [])

    const gotoDMChannel = async (user: string) => {
        const DMChannel = DMChannels?.message.find((channel: { name: string, channel_name: string, full_name: string, user_id: string }) => channel.user_id === user)
        if (DMChannel) {
            navigate(`/channel/${DMChannel.name}`)
            setSelectedUser([user, `/channel/${DMChannel.name}`])
        }
        else {
            const result = await call({ user_id: user })
            navigate(`/channel/${result?.message}`)
            setSelectedUser([user, `/channel/${result?.message}`])
        }
    }

    const { data, error } = useFrappeGetCall<{ message: string }>('raven.api.user_availability.get_active_users', undefined, undefined, {
        revalidateOnFocus: false
    })

    return (
        <SidebarGroup spacing={1}>
            <SidebarGroupItem ml='2'>
                <SidebarViewMoreButton onClick={() => setShowData(!showData)} />
                <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
            </SidebarGroupItem>
            <SidebarGroup>
                <SidebarGroupList>
                    {usersError && (
                        <AlertBanner status="error" heading={usersError.message}>
                            {usersError.httpStatus} - {usersError.httpStatusText}
                        </AlertBanner>
                    )}
                    {channelError && (
                        <AlertBanner status="error" heading={channelError.message}>
                            {channelError.httpStatus} - {channelError.httpStatusText}
                        </AlertBanner>
                    )}
                    {DMChannelsError && (
                        <AlertBanner status="error" heading={DMChannelsError.message}>
                            {DMChannelsError.httpStatus} - {DMChannelsError.httpStatusText}
                        </AlertBanner>
                    )}
                    {showData && users && users.map((user: User) => (
                        <SidebarButtonItem
                            onClick={() => gotoDMChannel(user.name)}
                            isLoading={loading}
                            key={user.name}
                            active={selectedUser.toString() == [user.name, currentAddress].toString()}
                            py={1}
                        >
                            <HStack>
                                <SidebarIcon>
                                    <Avatar name={user.full_name} src={url + user.user_image} borderRadius={'md'} size="xs">
                                        {data?.message.includes(user.name) && !!!error && <AvatarBadge boxSize='0.88em' bg='green.500' />}
                                    </Avatar>
                                </SidebarIcon>
                                <SidebarItemLabel>
                                    {user.name !== userData?.name ? user.full_name : `${user.full_name} (You)`}
                                </SidebarItemLabel>
                            </HStack>
                        </SidebarButtonItem>
                    ))}
                </SidebarGroupList>
            </SidebarGroup>
        </SidebarGroup>
    )
}
