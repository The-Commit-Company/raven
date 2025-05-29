import { UserAvatar } from '@/components/common/UserAvatar'
import { SidebarIcon } from '@/components/layout/Sidebar/SidebarComp'
import { useSavedMessages } from '@/hooks/fetchers/useSavedMessages'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { useGetUser } from '@/hooks/useGetUser'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { UserContext } from '@/utils/auth/UserProvider'
import { DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Flex, Text } from '@radix-ui/themes'
import { useContext, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Message } from '../../../../../types/Messaging/Message'
import { FileMessageBlock } from '../chat/ChatMessage/Renderers/FileMessage'
import { ImageMessageBlock } from '../chat/ChatMessage/Renderers/ImageMessage'
import { PollMessageBlock } from '../chat/ChatMessage/Renderers/PollMessage'
import { TiptapRenderer } from '../chat/ChatMessage/Renderers/TiptapRenderer/TiptapRenderer'

type MessageBoxProps = {
  message: Message & { workspace?: string }
  forceHideLinkPreview?: boolean
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

const DirectMessageSaved = ({ message, forceHideLinkPreview = false }: MessageBoxProps) => {
  const navigate = useNavigate()
  const { channel_id } = message

  const { currentUser } = useContext(UserContext)

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
        return `DM with ${peer_user_name}`
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

  return (
    <div
      onClick={() => handleNavigateToChannel(channel_id, message.workspace, message.name)}
      className='py-1.5 px-2.5 data-[state=open]:bg-gray-3 group relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start space-x-2'
    >
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

      <Flex
        direction='column'
        justify='center'
        className='w-full flex flex-col gap-2 overflow-hidden break-words max-w-full'
      >
        <Flex justify='between' align='center'>
          <Text className='text-gray-12' weight='medium' size='2'>
            {message.message_type === 'Text' && (
              <TiptapRenderer
                message={{
                  ...message,
                  message_type: 'Text'
                }}
                user={user}
                currentUser={currentUser}
                showLinkPreview={forceHideLinkPreview ? false : message.hide_link_preview ? false : true}
              />
            )}
            {/* Hiển thị hình ảnh nếu loại tin nhắn là Image */}
            {message.message_type === 'Image' && <ImageMessageBlock message={message} user={user} />}

            {/* Hiển thị file đính kèm nếu loại tin nhắn là File */}
            {message.message_type === 'File' && <FileMessageBlock message={message} user={user} />}

            {/* Hiển thị khảo sát nếu loại tin nhắn là Poll */}
            {message.message_type === 'Poll' && <PollMessageBlock message={message} user={user} />}
          </Text>
        </Flex>

        <Text size='1' color='gray' className='truncate'>
          {channelName}
        </Text>
      </Flex>
    </div>
  )
}
