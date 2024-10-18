import { useFrappePostCall } from "frappe-react-sdk"
import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarIcon, SidebarButtonItem } from "../../layout/Sidebar/SidebarComp"
import { SidebarBadge, SidebarItem, SidebarViewMoreButton } from "../../layout/Sidebar/SidebarComp"
import { UserContext } from "../../../utils/auth/UserProvider"
import { useGetUser } from "@/hooks/useGetUser"
import { useIsUserActive } from "@/hooks/useIsUserActive"
import { ChannelListContext, ChannelListContextType } from "../../../utils/channel/ChannelListProvider"
import { Flex, Text } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"
import { toast } from "sonner"
import { getErrorMessage } from "@/components/layout/AlertBanner/ErrorBanner"
import { useStickyState } from "@/hooks/useStickyState"
import { UserFields, UserListContext } from "@/utils/users/UserListProvider"
import { replaceCurrentUserFromDMChannelName } from "@/utils/operations"
import { __ } from "@/utils/translations"
import { DMChannelWithUnreadCount } from "@/components/layout/Sidebar/useGetChannelUnreadCounts"

interface DirectMessageListProps {
    dm_channels: DMChannelWithUnreadCount[]
}

export const DirectMessageList = ({ dm_channels }: DirectMessageListProps) => {

    const [showData, setShowData] = useStickyState(true, 'expandDirectMessageList')

    const toggle = () => setShowData(d => !d)

    const ref = useRef<HTMLDivElement>(null)

    const [height, setHeight] = useState(ref?.current?.clientHeight ?? showData ? (dm_channels.length + (dm_channels.length < 5 ? 5 : 0)) * (34.79) : 0)

    useLayoutEffect(() => {
        setHeight(ref.current?.clientHeight ?? 0)
    }, [dm_channels])

    return (
        <SidebarGroup pb='4'>
            <SidebarGroupItem className={'gap-1 pl-1'}>
                <Flex width='100%' justify='between' align='center' gap='2' pr='2' className="group">
                    <Flex align='center' gap='2' width='100%' onClick={toggle} className="cursor-default select-none">
                        <SidebarGroupLabel className="pt-0.5">{__("Members")}</SidebarGroupLabel>
                    </Flex>
                    <SidebarViewMoreButton onClick={toggle} expanded={showData} />
                </Flex>
            </SidebarGroupItem>
            <SidebarGroup>
                <SidebarGroupList
                    style={{
                        height: showData ? height : 0
                    }}>
                    <div ref={ref} className="flex gap-1 flex-col fade-in">
                        <DirectMessageItemList dm_channels={dm_channels} />
                        {dm_channels.length < 5 ? <ExtraUsersItemList /> : null}
                    </div>
                </SidebarGroupList>
            </SidebarGroup>
        </SidebarGroup>
    )
}

const DirectMessageItemList = ({ dm_channels }: DirectMessageListProps) => {
    return <>
        {dm_channels.map((channel: DMChannelWithUnreadCount) => (
            <DirectMessageItem
                key={channel.name}
                dm_channel={channel}
            />
        ))}
    </>
}

const DirectMessageItem = ({ dm_channel }: { dm_channel: DMChannelWithUnreadCount }) => {
    return <DirectMessageItemElement channel={dm_channel} />
}

export const DirectMessageItemElement = ({ channel }: { channel: DMChannelWithUnreadCount }) => {

    const { currentUser } = useContext(UserContext)
    const userData = useGetUser(channel.peer_user_id)
    const isActive = useIsUserActive(channel.peer_user_id)

    const { channelID } = useParams()

    const showUnread = channel.unread_count && channelID !== channel.name

    if (!userData?.enabled) {
        // If the user does not exists or if the user exists, but is not enabled, don't show the item.
        return null
    }

    return <SidebarItem to={channel.name} className={'py-0.5 px-2'}>
        <SidebarIcon>
            <UserAvatar src={userData?.user_image}
                alt={userData?.full_name}
                isBot={userData?.type === 'Bot'}
                isActive={isActive}
                size={{
                    initial: '2',
                    md: '1'
                }}
                availabilityStatus={userData?.availability_status}
            />
        </SidebarIcon>
        <Flex justify='between' width='100%'>
            <Text size={{
                initial: '3',
                md: '2'
            }} className="text-ellipsis line-clamp-1" weight={showUnread ? 'bold' : 'medium'}>
                {channel.peer_user_id !== currentUser ? userData?.full_name ?? channel.peer_user_id ?? replaceCurrentUserFromDMChannelName(channel.channel_name, currentUser) : `${userData?.full_name} (You)`}
            </Text>
            {showUnread ? <SidebarBadge>{channel.unread_count}</SidebarBadge> : null}
        </Flex>
    </SidebarItem>
}

const ExtraUsersItemList = () => {

    const { dm_channels, mutate } = useContext(ChannelListContext) as ChannelListContextType

    const { enabledUsers } = useContext(UserListContext)
    const { call } = useFrappePostCall<{ message: string }>("raven.api.raven_channel.create_direct_message_channel")

    const navigate = useNavigate()

    const createDMChannel = async (user_id: string) => {
        return call({ user_id })
            .then((r) => {
                navigate(`${r?.message}`)
                mutate()
            })
            .catch((e) => {
                toast.error(__("Could not create channel"), {
                    description: getErrorMessage(e)
                })
            })
    }

    const filteredUsers = useMemo(() => {
        // Show only users who are not in the DM list
        return enabledUsers.filter((user) => !dm_channels.find((channel) => channel.peer_user_id === user.name)).slice(0, 5)
    }, [enabledUsers, dm_channels])

    return <>{filteredUsers.map((user) => <ExtraUsersItem
        key={user.name}
        user={user}
        createDMChannel={createDMChannel}
    />)}</>
}

const ExtraUsersItem = ({ user, createDMChannel }: { user: UserFields, createDMChannel: (user_id: string) => Promise<void> }) => {

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
            <UserAvatar src={user.user_image} alt={user.full_name} isActive={isActive} isBot={user?.type === 'Bot'}
                size={{
                    initial: '2',
                    md: '1'
                }}
                availabilityStatus={user.availability_status} />
        </SidebarIcon>
        <Flex justify='between' width='100%'>
            <Text size={{
                initial: '3',
                md: '2'
            }} className="text-ellipsis line-clamp-1" weight='medium'>
                {user.name !== currentUser ? user.full_name : `${user.full_name} (You)`}
            </Text>
        </Flex>
    </SidebarButtonItem>
}
