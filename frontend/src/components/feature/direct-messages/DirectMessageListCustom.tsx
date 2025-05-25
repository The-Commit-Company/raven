import { UserAvatar } from '@/components/common/UserAvatar'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { useStickyState } from '@/hooks/useStickyState'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import { ContextMenu, Flex, Text } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { UserContext } from '../../../utils/auth/UserProvider'
import { ChannelInfo, useCircleUserList } from '@/utils/users/CircleUserListProvider'

import { ChannelListContext, ChannelListContextType } from '../../../utils/channel/ChannelListProvider'
import {
  SidebarBadge,
  SidebarButtonItem,
  SidebarGroup,
  SidebarGroupItem,
  SidebarGroupLabel,
  SidebarGroupList,
  SidebarIcon,
  SidebarItem,
  SidebarViewMoreButton
} from '../../layout/Sidebar/SidebarComp'
// import { replaceCurrentUserFromDMChannelName } from '@/utils/operations'
import { ChannelWithUnreadCount, DMChannelWithUnreadCount } from '@/components/layout/Sidebar/useGetChannelUnreadCounts'
import useUnreadMessageCount, { useFetchUnreadMessageCount } from '@/hooks/useUnreadMessageCount'
import { mapUnreadToDMChannels } from '@/hooks/useUnreadToDMChannels'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { __ } from '@/utils/translations'
import { useUnreadMessages } from '@/utils/layout/sidebar'
import { useChannelActions } from '@/hooks/useChannelActions'
import { useAtomValue } from 'jotai'
import { manuallyMarkedAtom } from '@/utils/atoms/manuallyMarkedAtom'

import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale/vi'

type UnifiedChannel = ChannelWithUnreadCount | DMChannelWithUnreadCount | any

interface DirectMessageListProps {
  dm_channels: DMChannelWithUnreadCount[] | any
}

export const useMergedUnreadCount = (
  selectedChannels: ChannelInfo[],
  unreadMessageList: { name: string; unread_count: number }[]
): ChannelInfo[] => {
  const manuallyMarked = useAtomValue(manuallyMarkedAtom)

  return selectedChannels.map((channel) => {
    const found = unreadMessageList.find((m) => m.name === channel.name)
    const count = found?.unread_count ?? 0
    const isManually = manuallyMarked.has(channel.name)

    return {
      ...channel,
      unread_count: isManually ? Math.max(count, 1) : count
    }
  })
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

  const unread_count = useUnreadMessages()

  const enrichedDMs = useMergedUnreadCount(dm_channels, unread_count?.message ?? [])

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

const DirectMessageItemList = ({ dm_channels }: DirectMessageListProps) => {
  return (
    <>
      {dm_channels.map((channel: DMChannelWithUnreadCount) => (
        <DirectMessageItem key={channel.name} dm_channel={channel} />
      ))}
    </>
  )
}

const DirectMessageItem = ({ dm_channel }: { dm_channel: DMChannelWithUnreadCount }) => {
  const { isPinned, togglePin, markAsUnread, isManuallyMarked } = useChannelActions()

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <main>
          <DirectMessageItemElement channel={dm_channel} />
        </main>
      </ContextMenu.Trigger>
      <ContextMenu.Content className='z-50 bg-white border shadow rounded p-1'>
        <ContextMenu.Item onClick={() => markAsUnread(dm_channel)}>
          {dm_channel.unread_count > 0 || isManuallyMarked(dm_channel.name) ? 'Đánh dấu đã đọc' : 'Đánh dấu chưa đọc'}
        </ContextMenu.Item>
        <ContextMenu.Item className='cursor-pointer rounded' onClick={() => togglePin(dm_channel)}>
          {isPinned(dm_channel.name) ? 'Unpin message' : 'Pin message to top'}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

const isDMChannel = (c: UnifiedChannel): c is DMChannelWithUnreadCount => {
  return 'peer_user_id' in c && typeof c.peer_user_id === 'string'
}

export const DirectMessageItemElement = ({ channel }: { channel: UnifiedChannel }) => {
  const { currentUser } = useContext(UserContext)
  const { channelID } = useParams()

  const isGroupChannel = !channel.is_direct_message && !channel.is_self_message
  const showUnread = channel.unread_count && channelID !== channel.name

  let userData: ReturnType<typeof useGetUser> | null = null
  let isActive = false

  if (isDMChannel(channel)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    userData = useGetUser(channel.peer_user_id)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    isActive = useIsUserActive(channel.peer_user_id)
  }

  if (!isGroupChannel && (!isDMChannel(channel) || !channel.peer_user_id || !userData?.enabled)) return null

  const displayName = userData
    ? channel.peer_user_id !== currentUser
      ? userData.full_name
      : `${userData.full_name} (You)`
    : 'channel_name' in channel
      ? channel.channel_name
      : channel.name

  // Parse last message
  let lastMessageText = ''
  let lastMessageOwner = ''
  try {
    const msg =
      typeof channel.last_message_details === 'string'
        ? JSON.parse(channel.last_message_details)
        : channel.last_message_details

    if (msg?.json_content) {
      try {
        const json = typeof msg.json_content === 'string' ? JSON.parse(msg.json_content) : msg.json_content
        // Giả sử bạn dùng tiptap editor: lấy text đầu tiên trong đoạn
        const paragraph = json?.content?.[0]?.content?.[0]
        if (paragraph?.text) {
          lastMessageText = paragraph.text
        }
      } catch (e) {
        lastMessageText = ''
      }
    } else if (msg?.content) {
      // fallback nếu không có json_content
      lastMessageText = msg.content.replace(/<[^>]+>/g, '')
      lastMessageOwner = msg.owner === currentUser ? 'Bạn' : msg.owner
    }
  } catch (err) {
    // fallback
  }

  const timeAgo = channel.last_message_timestamp
    ? formatDistanceToNow(new Date(channel.last_message_timestamp), { addSuffix: true, locale: vi })
    : ''

  return (
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
      <Flex direction='column' justify='center' className='w-full'>
        <Flex justify='between' align='center'>
          <Text
            size={{ initial: '3', md: '2' }}
            className='text-ellipsis line-clamp-1'
            as='span'
            weight={showUnread ? 'bold' : 'medium'}
          >
            {displayName}
          </Text>
          {timeAgo && (
            <Text size='1' color='gray'>
              {timeAgo}
            </Text>
          )}
        </Flex>
        <Text size='1' color='gray' className='truncate'>
          {lastMessageOwner && <>{lastMessageOwner}:</>} {lastMessageText}
        </Text>
      </Flex>
      {channel.unread_count > 0 && channelID !== channel.name && <SidebarBadge>{channel.unread_count}</SidebarBadge>}
    </SidebarItem>
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
