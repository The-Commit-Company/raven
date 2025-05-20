import { useFrappePostCall } from 'frappe-react-sdk'
import { useContext, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  SidebarGroup,
  SidebarGroupItem,
  SidebarGroupLabel,
  SidebarGroupList,
  SidebarIcon,
  SidebarButtonItem
} from '../../layout/Sidebar/SidebarComp'
import { SidebarBadge, SidebarItem, SidebarViewMoreButton } from '../../layout/Sidebar/SidebarComp'
import { UserContext } from '../../../utils/auth/UserProvider'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { ChannelListContext, ChannelListContextType } from '../../../utils/channel/ChannelListProvider'
import { ContextMenu, Flex, Text } from '@radix-ui/themes'
import { UserAvatar } from '@/components/common/UserAvatar'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { useStickyState } from '@/hooks/useStickyState'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import { replaceCurrentUserFromDMChannelName } from '@/utils/operations'
import { __ } from '@/utils/translations'
import { ChannelWithUnreadCount, DMChannelWithUnreadCount } from '@/components/layout/Sidebar/useGetChannelUnreadCounts'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { useFetchUnreadMessageCount } from '@/hooks/useUnreadMessageCount'
import { mapUnreadToDMChannels } from '@/hooks/useUnreadToDMChannels'

type UnifiedChannel = ChannelWithUnreadCount | DMChannelWithUnreadCount

interface DirectMessageListProps {
  dm_channels: DMChannelWithUnreadCount[]
}

export const DirectMessageList = ({ dm_channels }: DirectMessageListProps) => {
  const [showData, setShowData] = useStickyState(true, 'expandDirectMessageList')

  const toggle = () => setShowData((d) => !d)

  const ref = useRef<HTMLDivElement>(null)

  const [height, setHeight] = useState(
    (ref?.current?.clientHeight ?? showData) ? (dm_channels.length + (dm_channels.length < 5 ? 5 : 0)) * 34.79 : 0
  )

  useLayoutEffect(() => {
    setHeight(ref.current?.clientHeight ?? 0)
  }, [dm_channels])

  const unread_count = useFetchUnreadMessageCount()

const enrichedDMs = unread_count?.message
  ? mapUnreadToDMChannels(dm_channels, unread_count.message)
  : dm_channels.map((c) => ({ ...c, unread_count: 0 }))

  console.log(enrichedDMs, unread_count);
  

  
  return (
    <SidebarGroup pb='4'>
      <SidebarGroupItem className={'gap-1 pl-1'}>
        <Flex width='100%' justify='between' align='center' gap='2' pr='2' className='group'>
          <Flex align='center' gap='2' width='100%' onClick={toggle} className='cursor-default select-none'>
            <SidebarGroupLabel className='pt-0.5'>{__('Members')}</SidebarGroupLabel>
          </Flex>
          <SidebarViewMoreButton onClick={toggle} expanded={showData} />
        </Flex>
      </SidebarGroupItem>
      <SidebarGroup>
        <SidebarGroupList
          style={{
            height: showData ? height : 0
          }}
        >
          <div ref={ref} className='flex gap-1 flex-col fade-in'>
            <DirectMessageItemList dm_channels={enrichedDMs} />
            {dm_channels.length < 5 ? <ExtraUsersItemList /> : null}
          </div>
        </SidebarGroupList>
      </SidebarGroup>
    </SidebarGroup>
  )
}

const DirectMessageItemList = ({ dm_channels: enrichedDMs }: DirectMessageListProps) => {
  return (
    <>
      {enrichedDMs.map((channel) => (
        <DirectMessageItem key={channel.name} dm_channel={channel} />
      ))}
    </>
  )
}

const DirectMessageItem = ({ dm_channel }: { dm_channel: UnifiedChannel }) => {
  return <DirectMessageItemElement channel={dm_channel} />
}

export const DirectMessageItemElement = ({ channel }: { channel: UnifiedChannel }) => {
  const { currentUser } = useContext(UserContext)
  const { channelID } = useParams()

  const isGroupChannel = !channel.is_direct_message && !channel.is_self_message
  const showUnread = channel.unread_count && channelID !== channel.name

  // Nếu là direct message (có peer_user_id), dùng userData
  const userData = 'peer_user_id' in channel ? useGetUser(channel.peer_user_id) : null
  const isActive = 'peer_user_id' in channel ? useIsUserActive(channel.peer_user_id) : false

  // Nếu là DM và user không hợp lệ thì bỏ qua
  if (!isGroupChannel && (!channel.peer_user_id || !userData?.enabled)) return null

  const displayName = userData
    ? channel.peer_user_id !== currentUser
      ? userData.full_name
      : `${userData.full_name} (You)`
    : 'channel_name' in channel
      ? channel.channel_name
      : channel.name

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <SidebarItem to={channel.name} className='py-1.5 px-2.5 data-[state=open]:bg-gray-3'>
          <SidebarIcon>
            {userData ? (
              <UserAvatar
                src={userData.user_image}
                alt={userData.full_name}
                isBot={userData.type === 'Bot'}
                isActive={isActive}
                size={{ initial: '2', md: '1' }}
                availabilityStatus={userData.availability_status}
              />
            ) : (
              <ChannelIcon type={channel.type} size='18' />
            )}
          </SidebarIcon>
          <Flex justify='between' align='center' width='100%'>
            <Text
              size={{ initial: '3', md: '2' }}
              className='text-ellipsis line-clamp-1'
              as='span'
              weight={showUnread ? 'bold' : 'medium'}
            >
              {displayName}
            </Text>
            {showUnread ? <SidebarBadge>{channel.unread_count}</SidebarBadge> : null}
          </Flex>
        </SidebarItem>
      </ContextMenu.Trigger>
      <ContextMenu.Content>{/* Tuỳ chọn mở rộng menu (block, view profile...) */}</ContextMenu.Content>
    </ContextMenu.Root>
  )
}

const ExtraUsersItemList = () => {
  const { dm_channels, mutate } = useContext(ChannelListContext) as ChannelListContextType

  const { enabledUsers } = useContext(UserListContext)
  const { call } = useFrappePostCall<{ message: string }>('raven.api.raven_channel.create_direct_message_channel')

  const navigate = useNavigate()

  const createDMChannel = async (user_id: string) => {
    return call({ user_id })
      .then((r) => {
        navigate(`${r?.message}`)
        mutate()
      })
      .catch((e) => {
        toast.error(__('Could not create channel'), {
          description: getErrorMessage(e)
        })
      })
  }

  const filteredUsers = useMemo(() => {
    // Show only users who are not in the DM list
    return enabledUsers.filter((user) => !dm_channels.find((channel) => channel.peer_user_id === user.name)).slice(0, 5)
  }, [enabledUsers, dm_channels])

  return (
    <>
      {filteredUsers.map((user) => (
        <ExtraUsersItem key={user.name} user={user} createDMChannel={createDMChannel} />
      ))}
    </>
  )
}

const ExtraUsersItem = ({
  user,
  createDMChannel
}: {
  user: UserFields
  createDMChannel: (user_id: string) => Promise<void>
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useContext(UserContext)

  const onButtonClick = () => {
    setIsLoading(true)
    createDMChannel(user.name).finally(() => setIsLoading(false))
  }

  const isActive = useIsUserActive(user.name)
  return (
    <SidebarButtonItem isLoading={isLoading} onClick={onButtonClick}>
      <SidebarIcon>
        <UserAvatar
          src={user.user_image}
          alt={user.full_name}
          isActive={isActive}
          isBot={user?.type === 'Bot'}
          size={{
            initial: '2',
            md: '1'
          }}
          availabilityStatus={user.availability_status}
        />
      </SidebarIcon>
      <Flex justify='between' width='100%'>
        <Text
          size={{
            initial: '3',
            md: '2'
          }}
          className='text-ellipsis line-clamp-1'
          weight='medium'
        >
          {user.name !== currentUser ? user.full_name : `${user.full_name} (You)`}
        </Text>
      </Flex>
    </SidebarButtonItem>
  )
}
