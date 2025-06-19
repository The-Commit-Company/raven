import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { useNavigate, useParams } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '@/utils/auth/UserProvider'
import { replaceCurrentUserFromDMChannelName } from '@/utils/operations'
import { Badge, Box, Flex, Text } from '@radix-ui/themes'

import clsx from 'clsx'

const ChannelItem = ({
  channelID,
  peer_user_id,
  channelName
}: {
  channelID: string
  channelName: string
  peer_user_id: string
}) => {
  const { currentUser } = useContext(UserContext)
  const { workspaceID, channelID: currentChannelID } = useParams() // lấy segment sau workspaceID
  const user = useGetUser(peer_user_id)
  const navigate = useNavigate()

  const handleClick = () => {
    if (workspaceID) {
      navigate(`/${workspaceID}/${channelID}`)
    } else {
      navigate(`/channel/${channelID}`)
    }
  }

  const isActive = currentChannelID === channelID

  const userName = user?.full_name ?? peer_user_id ?? replaceCurrentUserFromDMChannelName(channelName, currentUser)

  return (
    <Box
      onClick={handleClick}
      className={clsx(
        'py-1.5 px-2.5 group relative cursor-pointer flex items-center space-x-2 touch-manipulation',
        isActive ? 'bg-gray-200 dark:bg-gray-600 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
    >
      <Flex gap='2' align='center' justify='between' width='100%'>
        <Flex gap='2' align='center'>
          <UserAvatar src={user?.user_image} alt={userName} isBot={user?.type === 'Bot'} />
          <Text as='span' className={clsx('line-clamp-1 text-ellipsis', 'text-base md:text-sm xs:text-xs')}>
            {userName}
          </Text>
        </Flex>
        {user && !user?.enabled && (
          <Badge color='gray' variant='soft'>
            Disabled
          </Badge>
        )}
        {!user && (
          <Badge color='gray' variant='soft'>
            Deleted
          </Badge>
        )}
      </Flex>
    </Box>
  )
}

export default ChannelItem
