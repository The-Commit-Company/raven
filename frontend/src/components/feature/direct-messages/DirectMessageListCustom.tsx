/* eslint-disable react-hooks/rules-of-hooks */
import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { Box, ContextMenu, Flex, Text, Tooltip } from '@radix-ui/themes'
import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserContext } from '../../../utils/auth/UserProvider'

import { ChannelWithUnreadCount, DMChannelWithUnreadCount } from '@/components/layout/Sidebar/useGetChannelUnreadCounts'
import { useChannelActions } from '@/hooks/useChannelActions'
import { useChannelDone } from '@/hooks/useChannelDone'
import { useIsTablet } from '@/hooks/useMediaQuery'
import { manuallyMarkedAtom } from '@/utils/atoms/manuallyMarkedAtom'
import { useEnrichedChannels } from '@/utils/channel/ChannelAtom'
import { formatLastMessage } from '@/utils/channel/useFormatLastMessage'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { useSidebarMode } from '@/utils/layout/sidebar'
import { useAtomValue } from 'jotai'
import { HiCheck } from 'react-icons/hi'
import { SidebarBadge, SidebarGroup, SidebarIcon } from '../../layout/Sidebar/SidebarComp'
import { DoneChannelList } from '../channels/DoneChannelList'
import MentionList from '../chat/ChatInput/MentionListCustom'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import UserChannelList from '../channels/UserChannelList'
import ChatbotAIStream from '../chatbot-ai/ChatbotAIStream'
import LabelByUserList from '../labels/LabelByUserList'
import ThreadsCustom from '../threads/ThreadsCustom'
import { MessageSaved } from './DirectMessageSaved'

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
  const { title, labelID } = useSidebarMode()

  // Ưu tiên các component đặc biệt trước
  if (title === 'Đã gắn cờ') return <MessageSaved />
  if (title === 'Nhắc đến') return <MentionList />
  if (title === 'Xong') return <DoneChannelList key='done-list' />
  if (title === 'Chủ đề') return <ThreadsCustom />
  if (title === 'Thành viên') return <UserChannelList />
  if (title === 'Chatbot AI') return <ChatbotAIStream />
  if (title === 'Nhãn') return <LabelByUserList />

  // Nếu có nhãn ID thì lọc theo nhãn
  if (labelID) {
    const filtered = channel_list.filter((c: { user_labels?: string[] }) => c.user_labels?.includes(labelID))

    if (filtered.length === 0) {
      return <div className='text-gray-500 text-sm italic p-4 text-center'>Không có kênh nào gắn nhãn này</div>
    }

    return (
      <>
        {filtered.map((channel: DMChannelWithUnreadCount) => (
          <DirectMessageItem key={channel.name} dm_channel={channel} />
        ))}
      </>
    )
  }

  // Trường hợp không có nhãn → lọc theo các filter thông thường
  const getFilteredChannels = (): DMChannelWithUnreadCount[] => {
    switch (title) {
      case 'Trò chuyện nhóm':
        return channel_list.filter((c: { group_type: string }) => c.group_type === 'channel')
      case 'Cuộc trò chuyện riêng tư':
        return channel_list.filter((c: { group_type: string }) => c.group_type === 'dm')
      case 'Chưa đọc':
        return channel_list.filter((c: { unread_count: number }) => c.unread_count > 0)
      default:
        return channel_list
    }
  }

  const filteredChannels = getFilteredChannels()

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
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const { workspaceID, channelID } = useParams<{ workspaceID: string; channelID: string }>()
  const manuallyMarked = useAtomValue(manuallyMarkedAtom)
  const { clearManualMark } = useChannelActions()
  const { markAsDone, markAsNotDone } = useChannelDone()
  const isChannelDone = channel.is_done === 1

  const isGroupChannel = !channel.is_direct_message && !channel.is_self_message
  const isDM = isDMChannel(channel)
  const peerUserId = isDM ? channel.peer_user_id : null
  const peerUser = useGetUser(peerUserId || '')
  const isActive = peerUserId ? useIsUserActive(peerUserId) : false
  const isSelectedChannel = channelID === channel.name
  const isManuallyMarked = manuallyMarked.has(channel.name)

  if (!isGroupChannel && (!isDM || !peerUserId || !peerUser?.enabled)) {
    return null
  }

  // Parse người gửi cuối cùng
  const lastOwner = (() => {
    try {
      const raw =
        typeof channel.last_message_details === 'string'
          ? JSON.parse(channel.last_message_details)
          : channel.last_message_details
      return raw?.owner ?? ''
    } catch {
      return ''
    }
  })()

  const user = useGetUser(lastOwner)
  const formattedMessage = formatLastMessage(channel, currentUser, user?.full_name)

  const displayName = peerUser
    ? peerUserId !== currentUser
      ? peerUser.full_name
      : `${peerUser.full_name} (You)`
    : channel.channel_name || channel.name

  const shouldShowBadge = channel.unread_count > 0 || isManuallyMarked

  const handleNavigate = () => {
    navigate(`/${workspaceID}/${channel.name}`)
    clearManualMark(channel.name)
  }

  const bgClass = `
    ${isSelectedChannel ? 'bg-gray-300 dark:bg-gray-700' : ''}
    hover:bg-gray-100 dark:hover:bg-gray-600
  `

  return (
    <div onClick={handleNavigate} className={`group relative cursor-pointer flex items-center p-1 mb-2 ${bgClass}`}>
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
          <Text size='2' as='span' className={`${shouldShowBadge ? 'font-bold' : 'font-medium'} truncate`}>
            {displayName}
          </Text>
        </Flex>
        <Text size='1' color='gray' className='truncate'>
          {formattedMessage}
        </Text>
      </Flex>

      {channel.last_message_details && (
        <Tooltip content={isChannelDone ? 'Đánh dấu chưa xong' : 'Đánh dấu đã xong'} side='bottom'>
          <button
            onClick={(e) => {
              e.preventDefault()
              if (isDesktop) {
                e.stopPropagation()
              }
              isChannelDone ? markAsNotDone(channel.name) : markAsDone(channel.name)
            }}
            className='absolute z-99 right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-gray-200 hover:bg-gray-300 h-[20px] w-[20px] flex items-center justify-center cursor-pointer'
            title={isChannelDone ? 'Chưa xong' : 'Đã xong'}
          >
            <HiCheck
              className={`h-3 w-3 transition-colors duration-150 ${isChannelDone ? 'text-green-600' : 'text-gray-800'}`}
            />
          </button>
        </Tooltip>
      )}
    </div>
  )
}
