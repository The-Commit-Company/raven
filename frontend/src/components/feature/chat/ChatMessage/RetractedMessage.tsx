import { UserFields } from '@/utils/users/UserListProvider'
import { Flex, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { RiEyeOffLine } from 'react-icons/ri'
import { Message } from '../../../../../../types/Messaging/Message'
import { UserHoverCard } from './MessageItem'
import { DateTooltip } from './Renderers/DateTooltip'

const RetractedMessage = ({
  message,
  user,
  currentUser,
  alignToRight,
  timestamp,
  is_continuation
}: {
  message: Message
  user: UserFields | undefined
  currentUser: string
  alignToRight: boolean
  timestamp: string
  is_continuation: any
}) => {
  const isOwnMessage = message.owner === currentUser

  return (
    <Flex
      direction={'column'}
      className={clsx(
        'relative w-fit sm:max-w-[32rem] max-w-[80vw] p-3 gap-1 rounded-md',
        'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'opacity-75'
      )}
    >
      {!is_continuation && !alignToRight && (
        <Flex align='center' gap='2'>
          <UserHoverCard user={user} userID={message.owner} isActive={false} />
          <DateTooltip timestamp={timestamp} />
        </Flex>
      )}

      <Flex align='center' gap='2'>
        <RiEyeOffLine size='14' className='text-gray-500 dark:text-gray-400' />
        <Text size='2' className='text-gray-600 dark:text-gray-400 italic'>
          {isOwnMessage ? 'Bạn đã thu hồi tin nhắn này' : `${user?.full_name || 'Người dùng'} đã thu hồi tin nhắn này`}
        </Text>
      </Flex>
    </Flex>
  )
}

export default RetractedMessage
