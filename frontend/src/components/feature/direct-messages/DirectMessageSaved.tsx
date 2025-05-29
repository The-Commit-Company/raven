import { getInitials } from '@/components/common/UserAvatar'
import { SidebarIcon } from '@/components/layout/Sidebar/SidebarComp'
import { useSavedMessages } from '@/hooks/fetchers/useSavedMessages'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { useGetUser } from '@/hooks/useGetUser'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { formatLastChangedTime } from '@/utils/formatLastChangedTime'
import { Avatar, Flex, Text } from '@radix-ui/themes'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Message } from '../../../../../types/Messaging/Message'

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

  const alt = user?.full_name ?? user?.name

  const handleNavigate = () => {
    navigate(`/channel/${message.name}`)
  }

  return (
    <div
      onClick={handleNavigate}
      className='py-1.5 px-2.5 data-[state=open]:bg-gray-3 group relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2'
    >
      <SidebarIcon>
        <Avatar
          src={user?.user_image} // URL ảnh đại diện
          alt={alt} // Văn bản thay thế
          loading='lazy' // Tải ảnh một cách lười biếng
          fallback={getInitials(alt)} // Hiển thị chữ cái đầu nếu không có ảnh
          size={'2'} // Kích thước trung bình
          radius={'medium'} // Bo tròn vừa phải
        />
      </SidebarIcon>

      <Flex direction='column' justify='center' className='w-full'>
        <Flex justify='between' align='center'>
          <Text className='text-gray-12' weight='medium' size='2'>
            <span>{user?.full_name}</span> : {message.content}
          </Text>

          <Text size='1' color='gray' className='group-hover:hidden'>
            {formatLastChangedTime(message.creation)}
          </Text>
        </Flex>

        <Text size='1' color='gray' className='truncate'>
          {channelName}
        </Text>
      </Flex>
    </div>
  )
}
