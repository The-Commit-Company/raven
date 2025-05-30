import { UserAvatar } from '@/components/common/UserAvatar'
import { SidebarIcon } from '@/components/layout/Sidebar/SidebarComp'
import { useSavedMessages } from '@/hooks/fetchers/useSavedMessages'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { useGetUser } from '@/hooks/useGetUser'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { getEmbedUrlFromYoutubeUrl, isValidUrl, isValidYoutubeUrl } from '@/utils/helpers'
import * as Popover from '@radix-ui/react-popover'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'
import { Box, Text } from '@radix-ui/themes'
import { useCallback, useMemo } from 'react'
import { HiFlag } from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import { Message } from '../../../../../types/Messaging/Message'
import { FileMessageBlock } from '../chat/ChatMessage/Renderers/FileMessage'
import { ImageSavedMessage } from '../chat/ChatMessage/Renderers/ImageSavedMessage'
import { PollMessageBlock } from '../chat/ChatMessage/Renderers/PollMessage'

type MessageBoxProps = {
  message: Message & { workspace?: string }
}

export const MessageSaved = () => {
  const { messages } = useSavedMessages()

  return (
    <div className='space-y-0.5'>
      {messages.map((message) => (
        <DirectMessageSaved key={message.name} message={message} />
      ))}
    </div>
  )
}

const DirectMessageSaved = ({ message }: MessageBoxProps) => {
  const navigate = useNavigate()
  const { channel_id } = message
  const { workspaceID } = useParams()

  const users = useGetUserRecords()
  const user = useGetUser(message.is_bot_message && message.bot ? message.bot : message.owner)
  const { channel } = useCurrentChannelData(channel_id)
  const isActive = useIsUserActive(user?.name)

  const channelData = channel?.channelData

  // Memoized channel name calculation
  const channelName = useMemo(() => {
    if (!channelData) return null

    if (channelData.is_direct_message) {
      const peerUserName =
        users[(channelData as DMChannelListItem).peer_user_id]?.full_name ??
        (channelData as DMChannelListItem).peer_user_id
      return `From chat with ${peerUserName}`
    }

    return channelData.channel_name
  }, [channelData, users])

  // Memoized YouTube detection
  const { isYoutube, embedUrl } = useMemo(
    () => ({
      isYoutube: isValidYoutubeUrl(message.content),
      embedUrl: getEmbedUrlFromYoutubeUrl(message.content)
    }),
    [message.content]
  )

  // Navigation handler
  const handleNavigateToChannel = useCallback(
    (channelID: string, workspace?: string, baseMessage?: string) => {
      const baseRoute = workspace ? `/${workspace}` : `/${workspaceID}`
      navigate({
        pathname: `${baseRoute}/${channelID}`,
        search: `message_id=${baseMessage}`
      })
    },
    [navigate, workspaceID]
  )

  // Content renderer based on message type
  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'Image':
        return <ImageSavedMessage message={message} user={user} />
      case 'File':
        return <FileMessageBlock message={message} user={user} />
      case 'Poll':
        return <PollMessageBlock message={message} user={user} />
      default:
        return null
    }
  }

  // Text content renderer
  const renderTextContent = () => {
    if (!message.content) return null

    if (isValidUrl(message.content)) {
      return (
        <a
          href={message.content}
          target='_blank'
          rel='noopener noreferrer'
          className='text-link-1 hover:text-link-2 hover:underline break-words transition-colors'
          onClick={(e) => e.stopPropagation()}
        >
          {message.content}
        </a>
      )
    }

    return <span className='break-words'>{message.content}</span>
  }

  return (
    <article
      className='py-2 px-3 group relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50
                 transition-colors duration-150 ease-in-out rounded-lg mx-1'
      onClick={() => handleNavigateToChannel(channel_id, message.workspace, message.name)}
    >
      {/* Unflag Button */}
      <TooltipProvider>
        <Popover.Root>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover.Trigger asChild>
                <Box
                  className='absolute top-2 right-2 hover:bg-gray-3 p-1 rounded-lg cursor-pointer'
                  onClick={(e) => e.stopPropagation()}
                >
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

      {/* Main Content */}
      <div className='flex items-start gap-3 w-full pr-8'>
        {/* Avatar */}
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

        {/* Message Content */}
        <div className='flex-1 min-w-0 space-y-2'>
          {/* User Name & Text Content */}
          {message.content && (
            <Text className='text-gray-900 dark:text-gray-100' weight='medium' size='2'>
              <span className='font-semibold'>{user?.full_name}:</span> {renderTextContent()}
            </Text>
          )}

          {/* YouTube Embed with Responsive Container */}
          {isYoutube && embedUrl && (
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
          )}

          {/* Message Type Renderers */}
          {renderMessageContent()}

          {/* Channel Info */}
          {channelName && (
            <Text size='1' color='gray' className='block truncate text-gray-500 dark:text-gray-400'>
              {channelName}
            </Text>
          )}
        </div>
      </div>
    </article>
  )
}
