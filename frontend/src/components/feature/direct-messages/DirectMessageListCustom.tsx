/* eslint-disable react-hooks/rules-of-hooks */
import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { Box, ContextMenu, Flex, Text, Tooltip } from '@radix-ui/themes'
import { useContext, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { UserContext } from '../../../utils/auth/UserProvider'

import { ChannelWithUnreadCount, DMChannelWithUnreadCount } from '@/components/layout/Sidebar/useGetChannelUnreadCounts'
import { useChannelActions } from '@/hooks/useChannelActions'
import { manuallyMarkedAtom } from '@/utils/atoms/manuallyMarkedAtom'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { useSidebarMode } from '@/utils/layout/sidebar'
import { __ } from '@/utils/translations'
import { useAtomValue } from 'jotai'
import { SidebarBadge, SidebarGroup, SidebarIcon } from '../../layout/Sidebar/SidebarComp'
import { HiCheck } from 'react-icons/hi'
import { DoneChannelList } from '../channels/DoneChannelList'
import MentionList from '../chat/ChatInput/MentionListCustom'
import { MessageSaved } from './DirectMessageSaved'
import clsx from 'clsx'
import { useIsTablet } from '@/hooks/useMediaQuery'
import UserChannelList from '../channels/UserChannelList'
import { useEnrichedChannels } from '@/utils/channel/ChannelAtom'
import ThreadsCustom from '../threads/ThreadsCustom'
import { formatLastMessage } from '@/utils/channel/useFormatLastMessage'
import { useChannelDone } from '@/hooks/useChannelDone'
import LabelByUserList from '../labels/LabelByUserList'

type UnifiedChannel = ChannelWithUnreadCount | DMChannelWithUnreadCount | any

export const DirectMessageList = () => {
  const enriched = useEnrichedChannels()  
  return (
    <SidebarGroup pb='4'>
      <SidebarGroup>
        <DirectMessageItemList channel_list={enriched} />
      </SidebarGroup>
    </SidebarGroup>
  )
}

export const DirectMessageItemList = ({ channel_list }: any) => {
  const { title } = useSidebarMode()

  const getFilteredChannels = (): DMChannelWithUnreadCount[] => {
    switch (title) {
      case 'Trò chuyện nhóm':
        return channel_list.filter(
          (c: { group_type: string; is_done: number }) => c.group_type === 'channel' && c.is_done === 0
        )
      case 'Cuộc trò chuyện riêng tư':
        return channel_list.filter(
          (c: { group_type: string; is_done: number }) => c.group_type === 'dm' && c.is_done === 0
        )
      case 'Chưa đọc':
        return channel_list.filter(
          (c: { unread_count: number; is_done: number }) => c.unread_count > 0 && c.is_done === 0
        )
      default:
        return channel_list.filter((c: { is_done: number }) => c.is_done === 0)
    }
  }

  const filteredChannels = getFilteredChannels()

  if (title === 'Đã gắn cờ') return <MessageSaved />
  if (title === 'Nhắc đến') return <MentionList />
  if (title === 'Xong') return <DoneChannelList />
  if (title === 'Chủ đề') return <ThreadsCustom />
  if (title === 'Thành viên') return <UserChannelList />
  if (title === 'Nhãn') return <LabelByUserList/>

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
        <main className='select-none'>
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
          {isPinned(dm_channel.name) ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn lên đầu'}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

const isDMChannel = (c: UnifiedChannel): c is DMChannelWithUnreadCount => {
  return 'peer_user_id' in c && typeof c.peer_user_id === 'string'
}

export const DirectMessageItemElement = ({ channel }: { channel: UnifiedChannel }) => {
  // 1. Gọi tất cả hooks ngay từ đầu
  const isTablet = useIsTablet()
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const { workspaceID, channelID } = useParams<{ workspaceID: string; channelID: string }>()
  const manuallyMarked = useAtomValue(manuallyMarkedAtom)
  const { clearManualMark } = useChannelActions()
  const { markAsDone, markAsNotDone } = useChannelDone()

  // 2. Tính toán các biến phụ (không gọi hook nữa ở đây)
  const isGroupChannel = !channel.is_direct_message && !channel.is_self_message
  const isDM = isDMChannel(channel)
  const peerUserId = isDM ? channel.peer_user_id : null
  const peerUser = useGetUser(peerUserId || '')
  const isActive = peerUserId ? useIsUserActive(peerUserId) : false
  const isSelectedChannel = channelID === channel.name
  const isManuallyMarked = manuallyMarked.has(channel.name)

  // 3. Nếu không thỏa điều kiện hiển thị thì return null (đã gọi xong hooks)
  if (!isGroupChannel && (!isDM || !peerUserId || !peerUser?.enabled)) {
    return null
  }


 const lastOwner = (() => {
    try {
      const raw = typeof channel.last_message_details === 'string'
        ? JSON.parse(channel.last_message_details)
        : channel.last_message_details
      return raw?.owner ?? ''
    } catch {
      return ''
    }
  })()

  const user = useGetUser(lastOwner)

  const formattedMessage = formatLastMessage(channel, currentUser, user?.full_name)


  // 4. Tính hiển thị
  const displayName = peerUser
    ? peerUserId !== currentUser
      ? peerUser.full_name
      : `${peerUser.full_name} (You)`
    : channel.channel_name || channel.name

  const shouldShowBadge = (channel.unread_count > 0 && channel.name !== channelID) || isManuallyMarked

  const handleNavigate = () => {
    clearManualMark(channel.name)
    navigate(`/${workspaceID}/${channel.name}`)
  }

  // 5. Render
  return (
    <div
      onClick={handleNavigate}
      className={`... group relative cursor-pointer flex items-center p-2 ${
        isSelectedChannel ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
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
            <ChannelIcon type={channel.type} className={isTablet ? 'w-[32px] h-[32px]' : 'w-[24px] h-[24px]'} />
          )}
          {shouldShowBadge && (
            <SidebarBadge className='absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[8px] rounded-full bg-red-500 text-white flex items-center justify-center'>
              {channel.unread_count > 9 ? '9+' : channel.unread_count || 1}
            </SidebarBadge>
          )}
        </Box>
      </SidebarIcon>

      <Flex direction='column' justify='center' className='flex-1 ml-2'>
        <Flex justify='between' align='center'>
          <Text as='span' className={`${shouldShowBadge ? 'font-bold' : 'font-medium'} truncate`}>
            {displayName}
          </Text>
        </Flex>
        <Text size='1' color='gray' className='truncate'>
          {formattedMessage}
        </Text>
      </Flex>

      {channel.last_message_details && (
        <Tooltip content={channel.is_done ? 'Đánh dấu chưa xong' : 'Đánh dấu đã xong'} side='bottom'>
          <button
            onClick={(e) => {
              e.stopPropagation()
              channel.is_done ? markAsNotDone(channel.name) : markAsDone(channel.name)
            }}
            className='absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-gray-200 hover:bg-gray-300 h-[20px] w-[20px] flex items-center justify-center cursor-pointer'
            title={channel.is_done ? 'Chưa xong' : 'Đã xong'}
          >
            <HiCheck
              className={`h-3 w-3 transition-colors duration-150 ${
                channel.is_done ? 'text-green-600' : 'text-gray-800'
              }`}
            />
          </button>
        </Tooltip>
      )}
    </div>
  )
}
