import { Avatar, AvatarBadge, HStack, useBoolean, useToast } from "@chakra-ui/react"
import { useFrappePostCall } from "frappe-react-sdk"
import { useContext, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarItemLabel, SidebarButtonItem } from "../../layout/Sidebar"
import { SidebarBadge, SidebarItem, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"
import { UserContext } from "../../../utils/auth/UserProvider"
import { useGetUser } from "@/hooks/useGetUser"
import { useIsUserActive } from "@/hooks/useIsUserActive"
import { ChannelListContext, ChannelListContextType, DMChannelListItem, ExtraUsersData, UnreadCountData } from "../../../utils/channel/ChannelListProvider"

export const DirectMessageList = ({ unread_count }: { unread_count?: UnreadCountData }) => {

    const { extra_users } = useContext(ChannelListContext) as ChannelListContextType

    const [showData, { toggle }] = useBoolean(true)

    return (
        <SidebarGroup spacing={1}>
            <SidebarGroupItem ml='2'>
                <SidebarViewMoreButton onClick={toggle} />
                <HStack w='71%' justifyContent='space-between'>
                    <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                    {!showData && unread_count && unread_count?.total_unread_count_in_dms > 0 && <SidebarBadge>{unread_count.total_unread_count_in_dms}</SidebarBadge>}
                </HStack>
            </SidebarGroupItem>
            <SidebarGroup>
                {showData &&
                    <SidebarGroupList>
                        <DirectMessageItemList unread_count={unread_count} />
                        {extra_users && extra_users.length && <ExtraUsersItemList />}
                    </SidebarGroupList>
                }
            </SidebarGroup>
        </SidebarGroup>
    )
}

const DirectMessageItemList = ({ unread_count }: { unread_count?: UnreadCountData }) => {
    const { dm_channels } = useContext(ChannelListContext) as ChannelListContextType

    return <>
        {dm_channels.map((channel) => <DirectMessageItem
            key={channel.name}
            channel={channel}
            unreadCount={unread_count?.channels ?? []}
        />)}
    </>
}

const DirectMessageItem = ({ channel, unreadCount }: { channel: DMChannelListItem, unreadCount: UnreadCountData['channels'] }) => {

    const { currentUser } = useContext(UserContext)
    const unreadCountForChannel = useMemo(() => unreadCount.find((unread) => unread.name == channel.name)?.unread_count, [channel.name, unreadCount])

    const userData = useGetUser(channel.peer_user_id)

    const isActive = useIsUserActive(channel.peer_user_id)

    return <SidebarItem to={channel.name} py={1}>
        <HStack w="full">
            <SidebarIcon>
                <Avatar name={userData?.full_name} src={userData?.user_image} borderRadius={'md'} size="xs">
                    <AvatarBadge hidden={!isActive} boxSize='0.88em' bg='green.500' />
                </Avatar>
            </SidebarIcon>
            <HStack justifyContent='space-between' w='full'>
                <SidebarItemLabel fontWeight={unreadCountForChannel ? 'bold' : 'normal'}>
                    {channel.peer_user_id !== currentUser ? userData?.full_name ?? channel.peer_user_id : `${userData?.full_name} (You)`}
                </SidebarItemLabel>
                {unreadCountForChannel && <SidebarBadge>{unreadCountForChannel}</SidebarBadge>}
            </HStack>
        </HStack>
    </SidebarItem>
}

const ExtraUsersItemList = () => {

    const { extra_users, mutate } = useContext(ChannelListContext) as ChannelListContextType
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

    return <>{extra_users.map((user) => <ExtraUsersItem
        key={user.name}
        user={user}
        createDMChannel={createDMChannel}
    />)}
    </>
}

const ExtraUsersItem = ({ user, createDMChannel }: { user: ExtraUsersData, createDMChannel: (user_id: string) => Promise<void> }) => {

    const [isLoading, setIsLoading] = useState(false)
    const { currentUser } = useContext(UserContext)

    const onButtonClick = () => {
        setIsLoading(true)
        createDMChannel(user.name)
            .finally(() => setIsLoading(false))
    }

    const isActive = useIsUserActive(user.name)
    return <SidebarButtonItem
        isLoading={isLoading}
        onClick={onButtonClick}
        py={1}
    >
        <HStack w="full">
            <SidebarIcon>
                <Avatar name={user.full_name} src={user.user_image} borderRadius={'md'} size="xs">
                    <AvatarBadge hidden={!isActive} boxSize='0.88em' bg='green.500' />
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
