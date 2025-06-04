/* eslint-disable react-hooks/rules-of-hooks */
import { UserAvatar } from '@/components/common/UserAvatar'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { UserFields, UserListContext } from '@/utils/users/UserListProvider'
import { Box, ContextMenu, Flex, Text, Tooltip } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { UserContext } from '../../../utils/auth/UserProvider'
// import { ChannelInfo } from '@/utils/users/CircleUserListProvider'

import { ChannelWithUnreadCount, DMChannelWithUnreadCount } from '@/components/layout/Sidebar/useGetChannelUnreadCounts'
import { useChannelActions } from '@/hooks/useChannelActions'
import { manuallyMarkedAtom } from '@/utils/atoms/manuallyMarkedAtom'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import {
  LocalChannelListProvider,
  useLocalChannelList,
  useSidebarMode,
  useUnreadMessages
} from '@/utils/layout/sidebar'
import { __ } from '@/utils/translations'
import { useAtomValue } from 'jotai'
import { ChannelListContext, ChannelListContextType } from '../../../utils/channel/ChannelListProvider'
import { SidebarBadge, SidebarButtonItem, SidebarGroup, SidebarIcon } from '../../layout/Sidebar/SidebarComp'
import { formatLastMessage } from '@/utils/channel/useFormatLastMessage'
import { HiCheck } from 'react-icons/hi'
import { DoneChannelList } from '../channels/DoneChannelList'
import MentionList from '../chat/ChatInput/MentionListCustom'
import ThreadsList from '../threads/ThreadManager/ThreadsList'
import { MessageSaved } from './DirectMessageSaved'
import clsx from 'clsx'
import { useIsTablet } from '@/hooks/useMediaQuery'
// import { useChannelListRealtimeSync } from '@/utils/channel/useChannelListRealtimeSync'

type UnifiedChannel = ChannelWithUnreadCount | DMChannelWithUnreadCount | any



interface DirectMessageListProps {
  dm_channels: DMChannelWithUnreadCount[] | any
  isLoading?: boolean
}

const MAX_PREVIEW_LENGTH = 30 // hoặc bất kỳ độ dài bạn muốn

const truncateText = (text: string, maxLength: number = MAX_PREVIEW_LENGTH): string =>
  text.length > maxLength ? text.slice(0, maxLength) + '...' : text

export const useMergedUnreadCount = (
  selectedChannels: UnifiedChannel[],
  unreadMessageList: {
    name: string
    unread_count: number
    last_message_details?: any
    last_message_timestamp?: string
  }[]
) => {
  const manuallyMarked = useAtomValue(manuallyMarkedAtom)
  const { channelID } = useParams()
  const { state } = useLocation()

  return selectedChannels.map((channel) => {
    const found = unreadMessageList.find((m) => m.name === channel.name)
    const count = found?.unread_count ?? 0
    const isManually = manuallyMarked.has(channel.name)

    let mergedLastMessageDetails = found?.last_message_details || channel.last_message_details

    if (mergedLastMessageDetails?.content && typeof mergedLastMessageDetails.content === 'string') {
      mergedLastMessageDetails = {
        ...mergedLastMessageDetails,
        content: truncateText(mergedLastMessageDetails.content, MAX_PREVIEW_LENGTH)
      }
    }

    let finalUnreadCount = count

    const isCurrentChannel = channelID === channel.name
    const fromBaseMessage = !!state?.baseMessage
    const isTabVisible = !document.hidden

    if (channel.is_done === 1) {
      finalUnreadCount = 0
    } else if (isManually) {
      finalUnreadCount = Math.max(count, 1)
    }

    // ✅ Nếu đang ở đúng channel, tab đang mở, và không mở từ baseMessage → bỏ count
    if (isCurrentChannel && isTabVisible && !fromBaseMessage) {
      finalUnreadCount = 0
    }

    return {
      ...channel,
      unread_count: finalUnreadCount,
      last_message_details: mergedLastMessageDetails,
      last_message_timestamp: found?.last_message_timestamp ?? channel.last_message_timestamp
    }
  })
}

export const DirectMessageList = ({ dm_channels, isLoading = false }: DirectMessageListProps) => {
  const newUnreadCount = useUnreadMessages()
  const enrichedDMs = useMergedUnreadCount(dm_channels, newUnreadCount?.message ?? [])

  return (
    <SidebarGroup pb='4'>
      <SidebarGroup>
        <div className='flex gap-3 flex-col fade-in'>
          {isLoading ? (
            <div className='p-3 text-sm text-gray-500 italic'>Đang tải danh sách...</div>
          ) : (
            <LocalChannelListProvider initialChannels={enrichedDMs as any}>
              <SyncLocalChannels enrichedDMs={enrichedDMs} />
              <DirectMessageItemList />
              {dm_channels.length < 1 && <ExtraUsersItemList />}
            </LocalChannelListProvider>
          )}
        </div>
      </SidebarGroup>
    </SidebarGroup>
  )
}

// ⬇️ Tách logic sync ra component riêng nằm bên trong Provider
const SyncLocalChannels = ({ enrichedDMs }: { enrichedDMs: any[] }) => {
  const { setChannels } = useLocalChannelList()

  useEffect(() => {
    const stored = localStorage.getItem('done_channels')
    const doneList: string[] = stored ? JSON.parse(stored) : []

    const syncedDMs = enrichedDMs.map((dm) => ({
      ...dm,
      is_done: doneList.includes(dm.name) ? 1 : 0
    }))

    setChannels(syncedDMs)
  }, [enrichedDMs, setChannels])

  return null
}

export const DirectMessageItemList = () => {
  const { localChannels } = useLocalChannelList()
  const { title } = useSidebarMode()

  const getFilteredChannels = (): DMChannelWithUnreadCount[] => {
    switch (title) {
      case 'Trò chuyện nhóm':
        return localChannels.filter((c) => c.group_type === 'channel' && c.is_done === 0)
      case 'Cuộc trò chuyện riêng tư':
        return localChannels.filter((c) => c.group_type === 'dm' && c.is_done === 0)
      case 'Chưa đọc':
        return localChannels.filter((c) => c.unread_count > 0 && c.is_done === 0)
      default:
        return localChannels.filter((c) => c.is_done === 0)
    }
  }

  const filteredChannels = getFilteredChannels()

  if (title === 'Đã gắn cờ') return <MessageSaved />
  if (title === 'Nhắc đến') return <MentionList />
  if (title === 'Xong') return <DoneChannelList />
  if (title === 'Chủ đề') return <ThreadsList />

  if (filteredChannels.length === 0 && title !== 'Trò chuyện') {
    return <div className='text-gray-500 text-sm italic p-4 text-center'>Không có kết quả</div>
  }

  return (
    <>
      {filteredChannels.map((channel) => (
        <DirectMessageItem key={channel.name} dm_channel={channel} />
      ))}
    </>
  )
}
export const DirectMessageItem = ({ dm_channel }: { dm_channel: DMChannelWithUnreadCount }) => {
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
  const isTablet = useIsTablet()
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const { setChannels } = useLocalChannelList()
  const { workspaceID, channelID } = useParams()

  const manuallyMarked = useAtomValue(manuallyMarkedAtom)
  const isManuallyMarked = manuallyMarked.has(channel.name)

  const isGroupChannel = !channel.is_direct_message && !channel.is_self_message
  const isDM = isDMChannel(channel)

  const peerUserId = isDM ? channel.peer_user_id : null
  const peerUser = useGetUser(peerUserId || '')
  const isActive = peerUserId ? useIsUserActive(peerUserId) : false

  const isSelectedChannel = channelID === channel.name

  if (!isGroupChannel && (!isDM || !peerUserId || !peerUser?.enabled)) return null

  const displayName = peerUser
    ? peerUserId !== currentUser
      ? peerUser.full_name
      : `${peerUser.full_name} (You)`
    : 'channel_name' in channel
      ? channel.channel_name
      : channel.name

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

  const shouldShowBadge = channel.unread_count > 0 || isManuallyMarked

  const { clearManualMark } = useChannelActions()

  const handleNavigate = () => {
    clearManualMark(channel.name)
    navigate(`/${workspaceID}/${channel.name}`)
  }

  const markAsDone = () => {
    try {
      const stored = localStorage.getItem('done_channels')
      const doneList: string[] = stored ? JSON.parse(stored) : []

      if (!doneList.includes(channel.name)) {
        doneList.push(channel.name)
        localStorage.setItem('done_channels', JSON.stringify(doneList))
      }

      toast.success('Đánh dấu đã xong')
      setTimeout(() => {
        setChannels((prev) => prev.map((c) => (c.name === channel.name ? { ...c, is_done: 1 } : c)))
      }, 300)
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã xong', err)
      toast.error('Lỗi khi đánh dấu đã xong')
    }
  }

  const markAsNotDone = () => {
    try {
      const stored = localStorage.getItem('done_channels')
      const doneList: string[] = stored ? JSON.parse(stored) : []

      const updated = doneList.filter((name) => name !== channel.name)
      localStorage.setItem('done_channels', JSON.stringify(updated))

      toast.success('↩️ Đánh dấu chưa xong')
      setChannels((prev) => prev.map((c) => (c.name === channel.name ? { ...c, is_done: 0 } : c)))
    } catch (err) {
      console.error('❌ Lỗi khi đánh dấu chưa xong', err)
      toast.error('❌ Lỗi khi đánh dấu chưa xong')
    }
  }

  return (
    <div
      onClick={handleNavigate}
      className={clsx(
        'py-1.5 px-2.5 data-[state=open]:bg-gray-3 group relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 touch-manipulation',
        {
          ' bg-gray-300 dark:bg-gray-700': isSelectedChannel
        }
      )}
    >
      <SidebarIcon>
        <Box className='relative'>
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
            <ChannelIcon type={channel.type} className={`${isTablet ? 'w-[32px] h-[32px]' : 'w-[24px] h-[24px]'} text-center`} />
          )}
          {shouldShowBadge && (
            <SidebarBadge
              className={clsx(
                'absolute bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center top-0 right-0 w-[15px] h-[15px]',
                isTablet
                  ? 'translate-x-[30%] -translate-y-[185%]'
                  : 'translate-x-[40%] -translate-y-[150%]'
              )}
            >
              {channel.unread_count || 1}
            </SidebarBadge>
          )}
        </Box>
      </SidebarIcon>

      <Flex direction='column' justify='center' className='w-full'>
        <Flex justify='between' align='center'>
          <Text
            as='span'
            className={clsx(
              'line-clamp-1 text-ellipsis',
              'text-base md:text-sm xs:text-xs',
              shouldShowBadge ? 'font-bold' : 'font-medium'
            )}
          >
            {displayName}
          </Text>
        </Flex>

        <Text size='1' color='gray' className='truncate'>
          {formattedLastMessage}
        </Text>
      </Flex>

      {formattedLastMessage && (
        <Tooltip content={channel.is_done ? 'Đánh dấu chưa xong' : 'Đánh dấu đã xong'} side='bottom'>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              channel.is_done ? markAsNotDone() : markAsDone()
            }}
            className='cursor-pointer absolute top-1/2 right-0 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 hover:bg-gray-300 p-1 rounded-full flex items-center justify-center'
            title={channel.is_done ? 'Chưa xong' : 'Đã xong'}
          >
            <HiCheck className={`h-5 w-5 ${channel.is_done ? 'text-green-600' : 'text-gray-800'}`} />
          </button>
        </Tooltip>
      )}
    </div>
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
