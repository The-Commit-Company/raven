import { UserAvatar } from '@/components/common/UserAvatar'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import { ContextMenu, Flex, Text } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useContext, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { UserContext } from '../../../utils/auth/UserProvider'
// import { ChannelInfo } from '@/utils/users/CircleUserListProvider'

import { ChannelListContext, ChannelListContextType } from '../../../utils/channel/ChannelListProvider'
import {
  SidebarBadge,
  SidebarButtonItem,
  SidebarGroup,
  SidebarGroupItem,
  SidebarGroupLabel,
  SidebarIcon,
  SidebarItem
} from '../../layout/Sidebar/SidebarComp'
import { ChannelWithUnreadCount, DMChannelWithUnreadCount } from '@/components/layout/Sidebar/useGetChannelUnreadCounts'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { __ } from '@/utils/translations'
import { useUnreadMessages } from '@/utils/layout/sidebar'
import { useChannelActions } from '@/hooks/useChannelActions'
import { useAtomValue } from 'jotai'
import { manuallyMarkedAtom } from '@/utils/atoms/manuallyMarkedAtom'

import { formatDistanceToNow, isValid } from 'date-fns'
import { vi } from 'date-fns/locale/vi'
import { formatLastMessage } from '@/utils/channel/useFormatLastMessage'
// import { useChannelListRealtimeSync } from '@/utils/channel/useChannelListRealtimeSync'

type UnifiedChannel = ChannelWithUnreadCount | DMChannelWithUnreadCount | any

interface DirectMessageListProps {
  dm_channels: DMChannelWithUnreadCount[] | any
  isLoading?: boolean
}

const MAX_PREVIEW_LENGTH = 20 // hoặc bất kỳ độ dài bạn muốn

const truncateText = (text: string, maxLength: number = MAX_PREVIEW_LENGTH): string =>
  text.length > maxLength ? text.slice(0, maxLength) + '...' : text

export const useMergedUnreadCount = (
  selectedChannels: {
    name: string
    unread_count?: number
    last_message_details?: any
    last_message_timestamp?: string
    [key: string]: any
  }[],
  unreadMessageList: {
    name: string
    unread_count: number
    last_message_details?: any
    last_message_timestamp?: string
  }[]
) => {
  const manuallyMarked = useAtomValue(manuallyMarkedAtom)

  return selectedChannels.map((channel) => {
    const found = unreadMessageList.find((m) => m.name === channel.name)
    const count = found?.unread_count ?? 0
    const isManually = manuallyMarked.has(channel.name)

    // Ưu tiên last_message_details từ unread list, fallback về channel
    let mergedLastMessageDetails = found?.last_message_details || channel.last_message_details

    // Nếu là chuỗi thuần, rút gọn
    if (mergedLastMessageDetails?.content && typeof mergedLastMessageDetails.content === 'string') {
      mergedLastMessageDetails = {
        ...mergedLastMessageDetails,
        content: truncateText(mergedLastMessageDetails.content, MAX_PREVIEW_LENGTH)
      }
    }

    return {
      ...channel,
      unread_count: isManually ? Math.max(count, 1) : count,
      last_message_details: mergedLastMessageDetails,
      last_message_timestamp: found?.last_message_timestamp ?? channel.last_message_timestamp
    }
  })
}
export const DirectMessageList = ({ dm_channels, isLoading = false }: DirectMessageListProps) => {
  // useChannelListRealtimeSync()
  const newUnreadCount = useUnreadMessages()
  const enrichedDMs = useMergedUnreadCount(dm_channels, newUnreadCount?.message ?? [])  

  return (
    <SidebarGroup pb='4'>
      <SidebarGroupItem className='gap-1 pl-1'>
        <Flex width='100%' justify='between' align='center' gap='2' pr='2' className='group'>
          <SidebarGroupLabel className='pt-0.5'>{__('Members')}</SidebarGroupLabel>
        </Flex>
      </SidebarGroupItem>
      <SidebarGroup>
        <div className='flex gap-1 flex-col fade-in'>
          {isLoading ? (
            <div className='p-3 text-sm text-gray-500 italic'>Đang tải danh sách...</div>
          ) : (
            <>
              <DirectMessageItemList dm_channels={enrichedDMs} />
              {dm_channels.length < 5 && <ExtraUsersItemList />}
            </>
          )}
        </div>
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
      <ContextMenu.Content className='z-50 bg-white dark:bg-gray-800 border dark:border-gray-600 shadow rounded p-1 text-black dark:text-white'>
        <ContextMenu.Item onClick={() => markAsUnread(dm_channel)} className='dark:hover:bg-gray-700 px-2 py-1 rounded'>
          {dm_channel.unread_count > 0 || isManuallyMarked(dm_channel.name) ? 'Đánh dấu đã đọc' : 'Đánh dấu chưa đọc'}
        </ContextMenu.Item>
        <ContextMenu.Item
          onClick={() => togglePin(dm_channel)}
          className='cursor-pointer dark:hover:bg-gray-700 px-2 py-1 rounded'
        >
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

  const manuallyMarked = useAtomValue(manuallyMarkedAtom)
  const isManuallyMarked = manuallyMarked.has(channel.name)

  const isGroupChannel = !channel.is_direct_message && !channel.is_self_message
  const isDM = isDMChannel(channel)

  const peerUserId = isDM ? channel.peer_user_id : null
  const peerUser = useGetUser(peerUserId || '')
  const isActive = peerUserId ? useIsUserActive(peerUserId) : false

  // Nếu không phải group và userDM invalid thì bỏ qua
  if (!isGroupChannel && (!isDM || !peerUserId || !peerUser?.enabled)) return null

  const displayName = peerUser
    ? peerUserId !== currentUser
      ? peerUser.full_name
      : `${peerUser.full_name} (You)`
    : 'channel_name' in channel
      ? channel.channel_name
      : channel.name

  // Lấy người gửi cuối cùng từ last_message_details
  let lastSenderId = ''
  try {
    const raw =
      typeof channel.last_message_details === 'string'
        ? JSON.parse(channel.last_message_details)
        : channel.last_message_details
    lastSenderId = raw?.owner || ''
  } catch {
    lastSenderId = ''
  }

  const lastSender = useGetUser(lastSenderId)

  const formattedLastMessage = useMemo(() => {
    return formatLastMessage(channel, currentUser, lastSender?.full_name)
  }, [channel, currentUser, lastSender?.full_name])

  const timeAgo =
    channel.last_message_timestamp && isValid(new Date(channel.last_message_timestamp))
      ? formatDistanceToNow(new Date(channel.last_message_timestamp), { addSuffix: true, locale: vi })
      : ''

  // Badge logic: vẫn hiển thị nếu mark thủ công, không phụ thuộc channelID === channel.name
  const shouldShowBadge = channel.unread_count > 0 || isManuallyMarked

  return (
    <SidebarItem to={channel.name} className='py-1.5 px-2.5 data-[state=open]:bg-gray-3'>
      <SidebarIcon>
        {peerUser ? (
          <UserAvatar
            src={peerUser.user_image}
            alt={peerUser.full_name}
            isBot={peerUser.type === 'Bot'}
            isActive={isActive}
            size={{ initial: '2', md: '1' }}
            availabilityStatus={peerUser.availability_status}
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
            weight={shouldShowBadge ? 'bold' : 'medium'}
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
          {formattedLastMessage}
        </Text>
      </Flex>

      {shouldShowBadge && <SidebarBadge>{channel.unread_count || 1}</SidebarBadge>}
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
