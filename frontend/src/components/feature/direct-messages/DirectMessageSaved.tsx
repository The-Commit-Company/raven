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
import * as Popover from '@radix-ui/react-popover'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'
import { Box, Text } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useEffect, useMemo } from 'react'
import { HiFlag } from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Message } from '../../../../../types/Messaging/Message'
import { FileMessageBlock } from '../chat/ChatMessage/Renderers/FileMessage'
import { ImageSavedMessage } from '../chat/ChatMessage/Renderers/ImageSavedMessage'
import { PollMessageBlock } from '../chat/ChatMessage/Renderers/PollMessage'

type MessageBoxProps = {
  message: Message & { workspace?: string }
  handleUnflagMessage: (message_id: string) => void
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
    return `From chat with ${peerUserName}`
  }

  return channelData.channel_name
}

const UnflagButton = ({ onUnflag }: { onUnflag: (e: React.MouseEvent) => void }) => (
  <TooltipProvider>
    <Popover.Root>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover.Trigger asChild>
            <Box className='absolute top-2 right-2 hover:bg-gray-3 p-1 rounded-lg cursor-pointer' onClick={onUnflag}>
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

const TextContent = ({ content }: { content: string }) => {
  if (isValidUrl(content)) {
    return (
      <a
        href={content}
        target='_blank'
        rel='noopener noreferrer'
        className='text-link-1 hover:text-link-2 hover:underline break-words transition-colors'
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </a>
    )
  }

  return <span className='break-words'>{content}</span>
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
  user,
  channelName
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
      {/* Text Content */}
      {message.content && (
        <Text className='text-gray-900 dark:text-gray-100' weight='medium' size='2'>
          <span className='font-semibold'>{user?.full_name}:</span> <TextContent content={message.content} />
        </Text>
      )}

      {/* YouTube Embed */}
      {isYoutube && embedUrl && <YouTubeEmbed embedUrl={embedUrl} />}

      {/* Message Type Content */}
      <MessageContentRenderer message={message} user={user} />

      {/* Channel Info */}
      {channelName && (
        <Text size='1' color='gray' className='block truncate text-gray-500 dark:text-gray-400'>
          {channelName}
        </Text>
      )}
    </div>
  )
}

const DirectMessageSaved = ({ message, handleUnflagMessage }: MessageBoxProps) => {
  const navigate = useNavigate()
  const { workspaceID } = useParams()
  const { channel_id } = message

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
      className='py-2 px-3 group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50
                 transition-colors duration-150 ease-in-out rounded-lg mx-1'
      onClick={handleNavigateToChannel}
    >
      <UnflagButton onUnflag={handleUnflagClick} />

      <div className='flex items-start gap-3 w-full pr-8'>
        <MessageAvatar user={user} isActive={isActive} />
        <MessageContent message={message} user={user} channelName={channelName} />
      </div>
    </article>
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

  if (!messages?.length || isLoading) {
    return <div className='text-center py-8 text-gray-500 dark:text-gray-400'>No saved messages</div>
  }

  return (
    <div className='space-y-0.5'>
      {messages.map((message) => (
        <DirectMessageSaved key={message.name} message={message} handleUnflagMessage={handleUnflagMessage} />
      ))}
    </div>
  )
}
