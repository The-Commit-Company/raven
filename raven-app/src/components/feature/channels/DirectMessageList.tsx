import { Avatar, AvatarBadge, HStack } from "@chakra-ui/react"
import { FrappeConfig, FrappeContext, useFrappeGetCall, useFrappeGetDocList, useFrappePostCall } from "frappe-react-sdk"
import { useFrappeEventListener } from "../../../hooks/useFrappeEventListener"
import { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { DMChannelData, UnreadCountData } from "../../../types/Channel/Channel"
import { User } from "../../../types/User/User"
import { AlertBanner } from "../../layout/AlertBanner"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItemLabel, SidebarButtonItem } from "../../layout/Sidebar"
import { SidebarBadge, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"

export const DirectMessageList = ({ userData }: { userData: User | null }) => {
    const { url } = useContext(FrappeContext) as FrappeConfig
    const { data: users, error: usersError } = useFrappeGetDocList<User>("User", {
        fields: ["full_name", "user_image", "name"],
        filters: [["name", "!=", "Guest"]]
    }, undefined, {
        revalidateOnFocus: false
    })
    const { call, error: channelError, loading, reset } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")
    const { data: DMChannels, error: DMChannelsError } = useFrappeGetCall<{ message: DMChannelData[] }>('raven.raven_channel_management.doctype.raven_channel.raven_channel.get_direct_message_channels_list', undefined, undefined, {
        revalidateOnFocus: false
    })
    const { data: unread_count, mutate: update_count } = useFrappeGetCall<{ message: UnreadCountData }>("raven.raven_messaging.doctype.raven_message.raven_message.get_unread_count_for_direct_message_channels")
    const navigate = useNavigate()
    const location = useLocation();
    const currentAddress = location.pathname

    const [showData, setShowData] = useState(true)
    const [selectedUser, setSelectedUser] = useState<string[]>([])

    useEffect(() => {
        reset()
    }, [])

    const gotoDMChannel = async (user: string) => {
        const DMChannel = DMChannels?.message.find((channel: DMChannelData) => channel.user_id === user)
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

    const [unreadCount, setUnreadCount] = useState<UnreadCountData>({
        total_unread_count: 0,
        channels: []
    })


    useFrappeEventListener('unread_dm_count_updated', () => {
        update_count()
    })

    useEffect(() => {
        setUnreadCount(unread_count.message)
    }, [unread_count])

    return (
        <SidebarGroup spacing={1}>
            <SidebarGroupItem ml='2'>
                <SidebarViewMoreButton onClick={() => setShowData(!showData)} />
                <HStack w='71%' justifyContent='space-between'>
                    <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                    {!showData && unreadCount.total_unread_count > 0 && <SidebarBadge>{unreadCount.total_unread_count}</SidebarBadge>}
                </HStack>
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
                    {showData && users && users.map((user: User) => {
                        const unreadChannelCount = unreadCount.channels?.find((unread) => unread.user_id == user.name)?.unread_count
                        return (
                            <SidebarButtonItem
                                onClick={() => gotoDMChannel(user.name)}
                                isLoading={loading}
                                key={user.name}
                                active={selectedUser.toString() == [user.name, currentAddress].toString()}
                                py={1}
                            >
                                <HStack w="100%">
                                    <SidebarIcon>
                                        <Avatar name={user.full_name} src={url + user.user_image} borderRadius={'md'} size="xs">
                                            {data?.message.includes(user.name) && !!!error && <AvatarBadge boxSize='0.88em' bg='green.500' />}
                                        </Avatar>
                                    </SidebarIcon>
                                    <HStack justifyContent='space-between' w='100%'>
                                        <SidebarItemLabel fontWeight={unreadChannelCount && unreadChannelCount > 0 ? 'bold' : 'normal'}>
                                            {user.name !== userData?.name ? user.full_name : `${user.full_name} (You)`}
                                        </SidebarItemLabel>
                                        {unreadChannelCount && unreadChannelCount > 0 && <SidebarBadge>{unreadChannelCount}</SidebarBadge>}
                                    </HStack>
                                </HStack>
                            </SidebarButtonItem>
                        )
                    })}
                </SidebarGroupList>
            </SidebarGroup>
        </SidebarGroup>
    )
}
