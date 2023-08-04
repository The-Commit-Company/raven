import { Avatar, AvatarBadge, HStack, useToast } from "@chakra-ui/react"
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk"
import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItemLabel, SidebarButtonItem } from "../../layout/Sidebar"
import { SidebarBadge, SidebarItem, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelListContext, ChannelListContextType, DMChannelData, ExtraUsersData, UnreadCountData } from "../../../utils/channel/ChannelListProvider"

export const DirectMessageList = ({ unread_count }: { unread_count?: UnreadCountData }) => {

    const { dm_channels, extra_users, mutate } = useContext(ChannelListContext) as ChannelListContextType
    const { call } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")

    const toast = useToast()
    const navigate = useNavigate()

    const createDMChannel = async (user_id: string) => {
        return call({ user_id })
            .then((r) => {
                navigate(`${r?.message}`)
                mutate()
            })
            .catch(() => {
                toast({
                    title: "Error",
                    description: "Could not create channel.",
                    status: "error",
                    duration: 2000,
                    isClosable: true,
                    position: 'top-right'
                })
            })

    }

    const [showData, setShowData] = useState(true)

    const { data } = useFrappeGetCall<{ message: string[] }>('raven.api.user_availability.get_active_users')

    return (
        <SidebarGroup spacing={1}>
            <SidebarGroupItem ml='2'>
                <SidebarViewMoreButton onClick={() => setShowData(!showData)} />
                <HStack w='71%' justifyContent='space-between'>
                    <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                    {!showData && unread_count && unread_count?.total_unread_count_in_dms > 0 && <SidebarBadge>{unread_count.total_unread_count_in_dms}</SidebarBadge>}
                </HStack>
            </SidebarGroupItem>
            <SidebarGroup>
                <SidebarGroupList>
                    {showData && dm_channels.map((channel) => <DirectMessageItem
                        key={channel.name}
                        channel={channel}
                        active_users={data?.message || []}
                        unreadCount={unread_count?.channels ?? []}
                    />)}
                    {showData && extra_users.map((user) => <ExtraUsersItem
                        key={user.name}
                        user={user}
                        active_users={data?.message || []}
                        createDMChannel={createDMChannel}
                    />)}
                </SidebarGroupList>
            </SidebarGroup>
        </SidebarGroup>
    )
}

const DirectMessageItem = ({ channel, active_users, unreadCount }: { channel: DMChannelData, active_users: string[], unreadCount: UnreadCountData['channels'] }) => {

    const { currentUser } = useContext(UserContext)
    const unreadCountForChannel = unreadCount.find((unread) => unread.name == channel.name)?.unread_count

    return <SidebarItem to={channel.name}
        py={1}
    >
        <HStack w="100%">
            <SidebarIcon>
                <Avatar name={channel.full_name} src={channel.user_image} borderRadius={'md'} size="xs">
                    <AvatarBadge hidden={!active_users.includes(channel.user_id)} boxSize='0.88em' bg='green.500' />
                </Avatar>
            </SidebarIcon>
            <HStack justifyContent='space-between' w='100%'>
                <SidebarItemLabel fontWeight={unreadCountForChannel ? 'bold' : 'normal'}>
                    {channel.user_id !== currentUser ? channel.full_name : `${channel.full_name} (You)`}
                </SidebarItemLabel>
                {unreadCountForChannel && <SidebarBadge>{unreadCountForChannel}</SidebarBadge>}
            </HStack>
        </HStack>
    </SidebarItem>
}

const ExtraUsersItem = ({ user, active_users, createDMChannel }: { user: ExtraUsersData, active_users: string[], createDMChannel: (user_id: string) => Promise<void> }) => {

    const [isLoading, setIsLoading] = useState(false)
    const { currentUser } = useContext(UserContext)

    const onButtonClick = () => {
        setIsLoading(true)
        createDMChannel(user.name)
            .finally(() => setIsLoading(false))
    }
    return <SidebarButtonItem
        isLoading={isLoading}
        onClick={onButtonClick}
        py={1}
    >
        <HStack w="100%">
            <SidebarIcon>
                <Avatar name={user.full_name} src={user.user_image} borderRadius={'md'} size="xs">
                    <AvatarBadge hidden={!active_users.includes(user.name)} boxSize='0.88em' bg='green.500' />
                </Avatar>
            </SidebarIcon>
            <HStack justifyContent='space-between' w='100%'>
                <SidebarItemLabel>
                    {user.name !== currentUser ? user.full_name : `${user.full_name} (You)`}
                </SidebarItemLabel>
            </HStack>
        </HStack>
    </SidebarButtonItem>
}
