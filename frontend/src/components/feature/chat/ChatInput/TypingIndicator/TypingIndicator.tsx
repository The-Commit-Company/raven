import { useContext, useMemo } from 'react'
import useTypingIndicator from './useTypingIndicator'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { UserContext } from '@/utils/auth/UserProvider'
import { Text } from '@radix-ui/themes'
import { HStack } from '@/components/layout/Stack'

type Props = {
    channel: string
}

const TypingIndicator = ({ channel }: Props) => {

    const typingUsers = useTypingIndicator(channel)

    const userRecords = useGetUserRecords()

    const { currentUser } = useContext(UserContext)

    const typingString = useMemo(() => {

        const validTypingUsers = typingUsers.filter((user) => user !== currentUser).map((user) => userRecords[user]?.first_name ?? userRecords[user]?.full_name ?? user)

        if (validTypingUsers.length === 0) return ''

        if (validTypingUsers.length === 1) return validTypingUsers[0] + ' is typing...'

        if (validTypingUsers.length === 2) return validTypingUsers[0] + ' and ' + validTypingUsers[1] + ' are typing...'

        if (validTypingUsers.length === 3) return validTypingUsers[0] + ', ' + validTypingUsers[1] + ' and 1 other are typing...'

        return validTypingUsers[0] + ', ' + validTypingUsers[1] + ' and ' + (validTypingUsers.length - 2) + ' others are typing...'


    }, [typingUsers, userRecords, currentUser])

    if (typingString === '') return null

    return (
        <HStack className='gap-1.5 pl-0.5 pt-1 relative sm:bottom-0 bottom-16 sm:pb-0 pb-2' align='center'>
            <div className="flex items-center space-x-1 -mb-0.5">
                <div className="w-1.5 h-1.5 bg-gray-12 rounded-full animate-pulse-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-12 rounded-full animate-pulse-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-12 rounded-full animate-pulse-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <Text size={'1'} as='span'>{typingString}</Text>
        </HStack>
    )
}

export default TypingIndicator
