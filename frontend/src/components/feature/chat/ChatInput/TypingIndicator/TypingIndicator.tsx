import { HStack } from '@/components/layout/Stack'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { UserContext } from '@/utils/auth/UserProvider'
import { Text } from '@radix-ui/themes'
import { memo, useContext, useMemo } from 'react'
import { useTypingIndicator } from './useTypingIndicator'

type Props = {
  channel: string
  maxDisplay?: number
  showAnimation?: boolean
}

const TypingIndicator = memo(({ channel, maxDisplay = 3, showAnimation = true }: Props) => {
  const typingUsers = useTypingIndicator(channel)
  const userRecords = useGetUserRecords()
  const { currentUser } = useContext(UserContext)

  const typingString = useMemo(() => {
    // Filter out current user and get display names
    const validTypingUsers = typingUsers
      .filter((user) => user !== currentUser)
      ?.map((user) => {
        const userRecord = userRecords[user]
        return userRecord?.first_name ?? userRecord?.full_name ?? user
      })
      .filter(Boolean) // Remove any null/undefined values

    if (validTypingUsers?.length === 0) return ''

    // Handle different cases of typing users
    if (validTypingUsers?.length === 1) {
      return `${validTypingUsers[0]} đang nhập...`
    } else if (validTypingUsers?.length <= maxDisplay) {
      return `${validTypingUsers.join(' và ')} đang nhập...`
    } else {
      const displayUsers = validTypingUsers.slice(0, maxDisplay)
      const remainingCount = validTypingUsers?.length - maxDisplay
      return `${displayUsers.join(', ')} và ${remainingCount} người khác đang nhập...`
    }
  }, [typingUsers, userRecords, currentUser, maxDisplay])

  // Early return if no typing users
  if (!typingString) return null

  return (
    <HStack
      className='gap-1.5 pl-0.5 pt-1 relative sm:bottom-0 bottom-16 sm:pb-0 pb-2'
      align='center'
      role='status'
      aria-live='polite'
      aria-label='Typing indicator'
    >
      {showAnimation && (
        <div className='flex items-center space-x-1 -mb-0.5' aria-hidden='true'>
          {[0, 150, 300]?.map((delay, index) => (
            <div
              key={index}
              className='w-1.5 h-1.5 bg-gray-12 rounded-full animate-pulse-bounce'
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      )}
      <Text size='1' as='span' className='text-gray-11'>
        {typingString}
      </Text>
    </HStack>
  )
})

TypingIndicator.displayName = 'TypingIndicator'

export default TypingIndicator
