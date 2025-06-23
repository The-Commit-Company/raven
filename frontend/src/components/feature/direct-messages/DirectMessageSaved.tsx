import { UserAvatar } from '@/components/common/UserAvatar'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { SidebarIcon } from '@/components/layout/Sidebar/SidebarComp'
import { useSavedMessages } from '@/hooks/fetchers/useSavedMessages'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { useGetUser } from '@/hooks/useGetUser'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { savedMessageStore, useSavedMessageStore } from '@/hooks/useSavedMessageStore'
import { DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { getEmbedUrlFromYoutubeUrl, isValidUrl, isValidYoutubeUrl } from '@/utils/helpers'
import { updateSavedCount } from '@/utils/updateSavedCount'
import * as Popover from '@radix-ui/react-popover'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'
import { Box, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BiChevronDown, BiChevronRight } from 'react-icons/bi'
import { HiFlag } from 'react-icons/hi'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Message } from '../../../../../types/Messaging/Message'
import { FileMessageBlock } from '../chat/ChatMessage/Renderers/FileMessage'
import { ImageSavedMessage } from '../chat/ChatMessage/Renderers/ImageSavedMessage'
import { PollMessageBlock } from '../chat/ChatMessage/Renderers/PollMessage'
// import { AnimatePresence, motion } from 'framer-motion'

type MessageBoxProps = {
  message: Message & { workspace?: string }
  handleUnflagMessage: (message_id: string) => void
  channelName: string | null
  messageId: string
}

type MessageContentRendererProps = {
  message: Message & { workspace?: string }
  user: any
}

const MESSAGE_TYPES = {
  IMAGE: 'Image',
  FILE: 'File',
  POLL: 'Poll'
} as const

const COLLAPSED_KEY = 'raven_saved_collapsed_channel_ids'

const getCollapsedFromStorage = (): Set<string> => {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return new Set(parsed)
  } catch {
    return new Set()
  }
}

const updateCollapsedInStorage = (channelId: string, collapsed: boolean) => {
  const current = getCollapsedFromStorage()
  if (collapsed) {
    current.add(channelId)
  } else {
    current.delete(channelId)
  }
  localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...current]))
}

const createNavigationPath = (baseRoute: string, channelId: string, messageId: string) => ({
  pathname: `${baseRoute}/${channelId}`,
  search: `message_id=${messageId}`
})

const getChannelDisplayName = (channelData: any, users: Record<string, any>): string | null => {
  if (!channelData) return null

  if (channelData.is_direct_message) {
    const peerUserName =
      users[(channelData as DMChannelListItem).peer_user_id]?.full_name ??
      (channelData as DMChannelListItem).peer_user_id
    return `Từ cuộc trò chuyện với ${peerUserName}`
  }

  return `Trong ${channelData.channel_name}`
}

const UnflagButton = ({ onUnflag }: { onUnflag: (e: React.MouseEvent) => void }) => (
  <TooltipProvider>
    <Popover.Root>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover.Trigger asChild>
            <Box className='hover:bg-gray-3 p-1 rounded-lg cursor-pointer' onClick={onUnflag}>
              <HiFlag className='text-red-500 hover:text-red-600 w-4 h-4' />
            </Box>
          </Popover.Trigger>
        </TooltipTrigger>
        <TooltipContent
          side='top'
          align='center'
          sideOffset={5}
          className='px-2 py-1 text-sm text-white bg-neutral-600 rounded shadow-lg z-50'
        >
          <span>Unflag</span>
          <TooltipArrow className='fill-neutral-600' />
        </TooltipContent>
      </Tooltip>
    </Popover.Root>
  </TooltipProvider>
)

const MessageAvatar = ({ user, isActive }: { user: any; isActive: boolean }) => (
  <div className='flex-shrink-0'>
    <SidebarIcon>
      <UserAvatar
        src={user?.user_image}
        alt={user?.full_name}
        isBot={user?.type === 'Bot'}
        isActive={isActive}
        size={{ initial: '2', md: '1' }}
        availabilityStatus={user?.availability_status}
      />
    </SidebarIcon>
  </div>
)

const MAX_LENGTH = 80

const truncate = (text: string, maxLength = MAX_LENGTH) =>
  text?.length > maxLength ? text.slice(0, maxLength).trim() + '...' : text

const TextContent = ({ content }: { content: string }) => {
  const display = truncate(content)
  if (isValidUrl(content)) {
    return (
      <a
        href={content}
        target='_blank'
        rel='noopener noreferrer'
        className='text-link-1 hover:text-link-2 hover:underline break-words transition-colors'
        onClick={(e) => e.stopPropagation()}
      >
        {display}
      </a>
    )
  }

  return (
    <span className='break-words' title={content}>
      {display}
    </span>
  )
}

const YouTubeEmbed = ({ embedUrl }: { embedUrl: string }) => (
  <div className='w-full max-w-2xl'>
    <div className='relative overflow-hidden rounded-lg shadow-sm bg-gray-100 dark:bg-gray-800'>
      <div className='aspect-video'>
        <iframe
          src={embedUrl}
          title='YouTube video player'
          className='absolute inset-0 w-full h-full rounded-lg'
          allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          referrerPolicy='strict-origin-when-cross-origin'
          allowFullScreen
          loading='lazy'
        />
      </div>
    </div>
  </div>
)

const MessageContentRenderer = ({ message, user }: MessageContentRendererProps) => {
  const renderByType = () => {
    switch (message.message_type) {
      case MESSAGE_TYPES.IMAGE:
        return <ImageSavedMessage message={message} user={user} />
      case MESSAGE_TYPES.FILE:
        return <FileMessageBlock message={message} user={user} />
      case MESSAGE_TYPES.POLL:
        return <PollMessageBlock message={message} user={user} />
      default:
        return null
    }
  }

  return renderByType()
}

const MessageContent = ({
  message,
  user
  // channelName
}: {
  message: Message & { workspace?: string }
  user: any
  channelName: string | null
}) => {
  const { isYoutube, embedUrl } = useMemo(
    () => ({
      isYoutube: isValidYoutubeUrl(message.content),
      embedUrl: getEmbedUrlFromYoutubeUrl(message.content)
    }),
    [message.content]
  )

  return (
    <div className='flex-1 min-w-0 space-y-2'>
      <Text className='text-gray-900 dark:text-gray-100' size='2'>
        <span className='font-semibold text-[13px]'>{user?.full_name}:</span>{' '}
        {message.is_retracted === 1 ? (
          <Text as='span' size='2' color='gray'>
            Tin nhắn đã được thu hồi
          </Text>
        ) : (
          message.content && <TextContent content={message.content} />
        )}
      </Text>

      {/* YouTube Embed */}
      {isYoutube && embedUrl && <YouTubeEmbed embedUrl={embedUrl} />}

      {/* Other message types (files, polls, etc.) */}
      <MessageContentRenderer message={message} user={user} />
    </div>
  )
}

const DirectMessageSaved = ({ message, handleUnflagMessage, messageId }: MessageBoxProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const { workspaceID } = useParams()
  const { channel_id } = message
  const messageParams = searchParams.get('message_id')

  const users = useGetUserRecords()
  const user = useGetUser(message.is_bot_message && message.bot ? message.bot : message.owner)
  const { channel } = useCurrentChannelData(channel_id)
  const isActive = useIsUserActive(user?.name)

  const channelName = useMemo(() => getChannelDisplayName(channel?.channelData, users), [channel?.channelData, users])

  const baseRoute = useMemo(
    () => (message.workspace ? `/${message.workspace}` : `/${workspaceID}`),
    [message.workspace, workspaceID]
  )

  const handleNavigateToChannel = useCallback(() => {
    const navigationPath = createNavigationPath(baseRoute, channel_id, message.name)
    navigate(navigationPath)
  }, [navigate, baseRoute, channel_id, message.name])

  const handleUnflagClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handleUnflagMessage(message.name)
    },
    [handleUnflagMessage, message.name]
  )

  return (
    <article
      className={`py-2 px-3 group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50
              transition-colors duration-150 ease-in-out rounded-lg mx-1
              ${messageId === messageParams ? 'bg-gray-100 dark:bg-gray-800/80' : ''}`}
      onClick={handleNavigateToChannel}
    >
      <div className='flex items-start gap-3 w-full pr-8'>
        <MessageAvatar user={user} isActive={isActive} />
        <MessageContent message={message} user={user} channelName={channelName} />
        <UnflagButton onUnflag={handleUnflagClick} />
      </div>
    </article>
  )
}

const GroupedMessages = ({
  channelId,
  messages,
  handleUnflagMessage
}: {
  channelId: string
  messages: Message[]
  handleUnflagMessage: (id: string) => void
}) => {
  const { channel } = useCurrentChannelData(channelId)
  const users = useGetUserRecords()

  const channelName = useMemo(
    () => getChannelDisplayName(channel?.channelData, users) ?? 'Kênh không xác định',
    [channel?.channelData, users]
  )

  const initialCollapsed = useMemo(() => getCollapsedFromStorage().has(channelId), [channelId])
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  const toggleCollapse = () => {
    const newState = !collapsed
    setCollapsed(newState)
    updateCollapsedInStorage(channelId, newState)
  }

  return (
    <div>
      <div
        className='flex items-center justify-between px-3 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
        onClick={toggleCollapse}
      >
        <Text className='text-xs text-gray-700 dark:text-gray-300 truncate'>{channelName}</Text>
        {collapsed ? <BiChevronRight className='w-4 h-4' /> : <BiChevronDown className='w-4 h-4' />}
      </div>

      <div
        className={clsx(
          'transition-opacity duration-300 ease-in-out overflow-x-hidden overflow-y-auto',
          collapsed ? 'opacity-0 max-h-0 pointer-events-none' : 'opacity-100 max-h-[400px]'
        )}
      >
        <div className='space-y-0.5'>
          {messages?.map((msg) => (
            <DirectMessageSaved
              key={msg.name}
              message={msg}
              handleUnflagMessage={handleUnflagMessage}
              channelName={channelName}
              messageId={msg.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const MessageSaved = () => {
  const { messages: savedMessages, isLoading } = useSavedMessages()
  const { messages, setMessages } = useSavedMessageStore()
  const { call } = useFrappePostCall('raven.api.raven_message.save_message')

  useEffect(() => {
    if (savedMessages) {
      setMessages(() => savedMessages)
    }
  }, [savedMessages])

  const handleUnflagMessage = useCallback(
    (message_id: string) => {
      call({
        message_id,
        add: 'No'
      })
        .then(() => {
          savedMessageStore.removeMessage(message_id)
          updateSavedCount(-1)
          toast('Message unsaved')
        })
        .catch((error) => {
          toast.error('Could not perform the action', {
            description: getErrorMessage(error)
          })
        })
    },
    [call]
  )

  const groupedMessages = useMemo(() => {
    return messages.reduce<Record<string, Message[]>>((acc, msg) => {
      if (!acc[msg.channel_id]) {
        acc[msg.channel_id] = []
      }
      acc[msg.channel_id].push(msg)
      return acc
    }, {})
  }, [messages])

  if (!messages?.length || isLoading) {
    return <div className='text-gray-500 text-sm italic p-4 text-center'>Không có kết quả</div>
  }

  return (
    <div className='space-y-4'>
      {Object.entries(groupedMessages)?.map(([channelId, msgs]) => (
        <GroupedMessages
          key={channelId}
          channelId={channelId}
          messages={msgs}
          handleUnflagMessage={handleUnflagMessage}
        />
      ))}
    </div>
  )
}
