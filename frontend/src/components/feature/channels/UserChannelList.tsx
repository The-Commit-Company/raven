import { Loader } from '@/components/common/Loader'
import { UserAvatar } from '@/components/common/UserAvatar'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { useGetUser } from '@/hooks/useGetUser'
import { useChannelList } from '@/utils/channel/ChannelListProvider'
import { UserListContext } from '@/utils/users/UserListProvider'
import { Badge, Box, Flex, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import ChannelItem from './ChannelItem'


const UserChannelList = () => {
  const { dm_channels } = useChannelList()
  const { users } = useContext(UserListContext)

  const usersWithoutChannels = users?.filter(
    (user) => !dm_channels.find((channel) => channel.peer_user_id === user.name)
  )

  return (
    <div>
      <div>
        {dm_channels.map((channel) => (
          <ChannelItem
            key={channel.name}
            channelID={channel.name}
            channelName={channel.channel_name}
            peer_user_id={channel.peer_user_id}
          />
        ))}
        <br />
        <h5 className='text-sm mt-0 font-medium'>Những người chưa từng nhắn</h5>
        {usersWithoutChannels.map((user) => (
          <UserWithoutDMItem key={user.name} userID={user.name} />
        ))}
      </div>
    </div>
  )
}

const UserWithoutDMItem = ({ userID }: { userID: string }) => {
  const { workspaceID } = useParams()
  const user = useGetUser(userID)
  const navigate = useNavigate()

  const { call, loading } = useFrappePostCall<{ message: string }>(
    'raven.api.raven_channel.create_direct_message_channel'
  )

  const onClick = () => {
    call({ user_id: userID })
      .then((res) => {
        if (workspaceID) {
          navigate(`/${workspaceID}/${res?.message}`)
        } else {
          navigate(`/channel/${res?.message}`)
        }
      })
      .catch((err) => {
        toast.error('Không thể tạo được đoạn chat', {
          description: getErrorMessage(err)
        })
      })
  }

  return (
    <Box
      onClick={onClick}
      className={clsx('w-full text-left p-2 rounded cursor-pointer', 'hover:bg-gray-100 dark:hover:bg-gray-700')}
    >
      <Flex width='100%' justify='between' align='center'>
        <Flex gap='2' align='center'>
          <UserAvatar src={user?.user_image} isBot={user?.type === 'Bot'} alt={user?.full_name ?? userID} />
          <Text as='span' className={clsx('line-clamp-1 text-ellipsis', 'text-base md:text-sm xs:text-xs')}>
            {user?.full_name ?? userID}
          </Text>
        </Flex>

        {loading ? <Loader /> : null}

        {!user?.enabled && (
          <Badge color='gray' variant='soft'>
            Disabled
          </Badge>
        )}
      </Flex>
    </Box>
  )
}

export default UserChannelList
