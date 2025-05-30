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
import { useMemo } from 'react'
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
    <>
      {messages.map((message) => (
        <DirectMessageSaved key={message.name} message={message} />
      ))}
    </>
  )
}

const DirectMessageSaved = ({ message }: MessageBoxProps) => {
  const navigate = useNavigate()
  const { channel_id } = message

  const users = useGetUserRecords()

  const user = useGetUser(message.is_bot_message && message.bot ? message.bot : message.owner)

  const { channel } = useCurrentChannelData(channel_id)
  const isActive = useIsUserActive(user?.name)

  const { workspaceID } = useParams()

  const channelData = channel?.channelData

  const channelName = useMemo(() => {
    if (channelData) {
      if (channelData.is_direct_message) {
        const peer_user_name =
          users[(channelData as DMChannelListItem).peer_user_id]?.full_name ??
          (channelData as DMChannelListItem).peer_user_id
        return `From chat with ${peer_user_name}`
      } else {
        return channelData.channel_name
      }
    }
  }, [channelData])

  const handleNavigateToChannel = (channelID: string, workspace?: string, baseMessage?: string) => {
    let baseRoute = ''
    if (workspace) {
      baseRoute = `/${workspace}`
    } else {
      baseRoute = `/${workspaceID}`
    }

    navigate({
      pathname: `${baseRoute}/${channelID}`,
      search: `message_id=${baseMessage}`
    })
  }
  const isYoutube = isValidYoutubeUrl(message.content)

  const embedUrl = getEmbedUrlFromYoutubeUrl(message.content)

  return (
    <div
      className='py-1.5 px-2.5 data-[state=open]:bg-gray-3 group relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2'
      onClick={() => handleNavigateToChannel(channel_id, message.workspace, message.name)}
    >
      {/* Icon flag */}

      <TooltipProvider>
        <Popover.Root>
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover.Trigger asChild>
                <Box
                  className='absolute top-2 right-2 hover:bg-gray-3 p-1 rounded-lg cursor-pointer'
                  onClick={(e) => e.stopPropagation()}
                >
                  <HiFlag className='text-red-500 hover:text-red-600' />
                </Box>
              </Popover.Trigger>
            </TooltipTrigger>
            <TooltipContent
              side='top'
              align='center'
              sideOffset={5}
              className='px-2 py-1 text-sm text-white bg-neutral-600 rounded shadow-md z-50'
            >
              <span>Unflag</span>
              <TooltipArrow className='fill-neutral-600' />
            </TooltipContent>
          </Tooltip>
        </Popover.Root>
      </TooltipProvider>

      {/* User Info */}
      <div className='flex items-start space-x-3 w-full'>
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

        <div className='w-full overflow-hidden break-words max-w-full'>
          <Text className='text-gray-12' weight='medium' size='2'>
            <span>
              {user?.full_name}:{' '}
              {isValidUrl(message.content) ? (
                <a
                  href={message.content}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-link-1 hover:text-link-2 hover:underline break-words'
                  onClick={(e) => e.stopPropagation()}
                >
                  {message.content}
                </a>
              ) : (
                message.content
              )}
            </span>
          </Text>

          {/* YouTube Preview */}
          {isYoutube && embedUrl && (
            <div className='relative overflow-hidden w-full pt-[56.25%] mt-2 rounded-md'>
              <iframe
                src={embedUrl}
                title='YouTube video player'
                className='absolute w-full h-full inset-0 rounded-md'
                allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; modestbranding=1'
                referrerPolicy='strict-origin-when-cross-origin'
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Image, File, Poll Renderer */}
          {message.message_type === 'Image' && <ImageSavedMessage message={message} user={user} />}
          {message.message_type === 'File' && <FileMessageBlock message={message} user={user} />}
          {message.message_type === 'Poll' && <PollMessageBlock message={message} user={user} />}

          {/* Channel info */}
          <Text size='1' color='gray' className='mt-1 block truncate'>
            {channelName}
          </Text>
        </div>
      </div>
    </div>
  )
}
