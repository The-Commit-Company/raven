import { useFrappePostCall } from "frappe-react-sdk"
import { useContext, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarButtonItem } from "../../layout/Sidebar"
import { SidebarBadge, SidebarItem, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"
import { UserContext } from "../../../utils/auth/UserProvider"
import { useGetUser } from "@/hooks/useGetUser"
import { useIsUserActive } from "@/hooks/useIsUserActive"
import { ChannelListContext, ChannelListContextType, DMChannelListItem, ExtraUsersData, UnreadCountData } from "../../../utils/channel/ChannelListProvider"
import { Flex, Text } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"
import { useToast } from "@/hooks/useToast"

export const DirectMessageList = ({ unread_count }: { unread_count?: UnreadCountData }) => {

    const { extra_users } = useContext(ChannelListContext) as ChannelListContextType

    const [showData, setShowData] = useState(true)

    const toggle = () => setShowData(d => !d)

    return (
        <SidebarGroup pb='4'>
            <SidebarGroupItem gap='2' className={'pl-1.5'}>
                <SidebarViewMoreButton onClick={toggle} />
                <Flex width='100%' justify='between' align='center' gap='2'>
                    <Flex gap='2' align='center'>
                        <SidebarGroupLabel className='cal-sans'>Direct Messages</SidebarGroupLabel>
                    </Flex>
                    {!showData && unread_count && unread_count?.total_unread_count_in_dms > 0 && <SidebarBadge>{unread_count.total_unread_count_in_dms}</SidebarBadge>}
                </Flex>
            </SidebarGroupItem>
            <SidebarGroup>
                {showData &&
                    <SidebarGroupList>
                        <DirectMessageItemList unread_count={unread_count} />
                        {extra_users && extra_users.length ? <ExtraUsersItemList /> : null}
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

    return <SidebarItem to={channel.name} className={'py-0.5'}>
        <SidebarIcon>
            <UserAvatar src={userData?.user_image} alt={userData?.full_name} isActive={isActive} size='1' />
        </SidebarIcon>
        <Flex justify='between' width='100%'>
            <Text size='2' className="text-ellipsis line-clamp-1" weight={unreadCountForChannel ? 'bold' : 'regular'}>
                {channel.peer_user_id !== currentUser ? userData?.full_name ?? channel.peer_user_id : `${userData?.full_name} (You)`}
            </Text>
            {unreadCountForChannel ? <SidebarBadge>{unreadCountForChannel}</SidebarBadge> : null}
        </Flex>
    </SidebarItem>
}

const ExtraUsersItemList = () => {

    const { extra_users, mutate } = useContext(ChannelListContext) as ChannelListContextType
    const { call } = useFrappePostCall<{ message: string }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.create_direct_message_channel")

    const { toast } = useToast()
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
                    variant: 'destructive',
                    duration: 2000,
                })
            })
    }

    return <>{extra_users.map((user) => <ExtraUsersItem
        key={user.name}
        user={user}
        createDMChannel={createDMChannel}
    />)}</>
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
        onClick={onButtonClick}>
        <SidebarIcon>
            <UserAvatar src={user.user_image} alt={user.full_name} isActive={isActive} />
        </SidebarIcon>
        <Flex justify='between' width='100%'>
            <Text size='2' className="text-ellipsis line-clamp-1">
                {user.name !== currentUser ? user.full_name : `${user.full_name} (You)`}
            </Text>
        </Flex>
    </SidebarButtonItem>
}
