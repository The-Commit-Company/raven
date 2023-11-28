import { Box, ContextMenu, Flex, HoverCard, Link, Separator, Text } from '@radix-ui/themes'
import { MessageBlock } from '../../../../../../types/Messaging/Message'
import { MessageContextMenu } from './MessageActions'
import { DateTooltip, DateTooltipShort } from './DateTooltip'
import { BoxProps } from '@radix-ui/themes/dist/cjs/components/box'
import { clsx } from 'clsx'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { UserFields } from '@/utils/users/UserListProvider'
import { BsFillCircleFill } from 'react-icons/bs'
import { MessageReactions } from './MessageReactions'

interface MessageBlockProps {
    message: MessageBlock['data']
}

export const MessageItem = ({ message }: MessageBlockProps) => {

    const { name, owner: userID, creation: timestamp, message_reactions, is_continuation, is_reply, linked_message } = message

    const { user, isActive } = useGetUserDetails(userID)

    //TODO:
    const updateMessages = () => {

    }

    return (
        <Box>
            <ContextMenu.Root>
                <ContextMenu.Trigger className='group 
                            hover:bg-[var(--accent-2)]
                            dark:hover:bg-[var(--gray-4)] 
                            hover:shadow-sm 
                            data-[state=open]:bg-[var(--accent-2)]
                            dark:data-[state=open]:bg-[var(--gray-4)]
                            data-[state=open]:shadow-sm
                            p-2
                            rounded-md'>
                    <Flex gap='2' >
                        <MessageLeftElement message={message} user={user} isActive={isActive} />
                        <Flex direction='column'>
                            {!is_continuation ? <Flex align='center' gap='2'>
                                <UserHoverCard user={user} userID={userID} isActive={isActive} />
                                <Separator orientation='vertical' />
                                <DateTooltip timestamp={timestamp} />
                            </Flex>
                                : null}
                            {/* Message content goes here */}
                            <MessageReactions
                                messageID={name}
                                updateMessages={updateMessages}
                                message_reactions={message_reactions}
                            />
                        </Flex>
                    </Flex>
                </ContextMenu.Trigger>
                <MessageContextMenu />
            </ContextMenu.Root>

        </Box>
    )
}

interface MessageLeftElementProps extends BoxProps {
    message: MessageBlock['data'],
    user?: UserFields,
    isActive?: boolean
}
const MessageLeftElement = ({ message, className, user, isActive, ...props }: MessageLeftElementProps) => {

    // If it's a continuation, then show the timestamp

    // Else, show the avatar
    return <Box className={clsx(message.is_continuation ? 'invisible group-hover:visible' : '', className)} {...props}>
        {message.is_continuation ?
            <DateTooltipShort timestamp={message.creation} />
            : <Avatar userID={message.owner} user={user} isActive={isActive} />
        }
    </Box>

}

const useGetUserDetails = (userID: string) => {

    const user = useGetUser(userID)

    const isActive = useIsUserActive(userID)

    return { user, isActive }
}

interface UserProps {
    user?: UserFields
    userID: string
    isActive?: boolean
}
const Avatar = ({ user, userID, isActive = false }: UserProps) => {

    return <UserAvatar
        src={user?.user_image}
        isActive={isActive}
        size='2'
        skeletonSize='6'
        alt={user?.full_name ?? userID} />
}

const UserHoverCard = ({ user, userID, isActive }: UserProps) => {

    return <HoverCard.Root>
        <HoverCard.Trigger>
            <Link className='text-[var(--gray-12)]' weight='medium' size='2'>
                {user?.full_name ?? userID}
            </Link>
        </HoverCard.Trigger>
        <HoverCard.Content>
            <Flex gap='2' align='center'>
                <UserAvatar src={user?.user_image} alt={user?.full_name ?? userID} size='4' />
                <Flex direction='column'>
                    <Flex gap='3' align='center'>
                        <Text className='text-[var(--gray-12)]' weight='bold' size='3'>{user?.full_name ?? userID}</Text>
                        {isActive && <Flex gap='1' align='center'>
                            <BsFillCircleFill className='text-green-400' size='8' />
                            <Text className='text-[var(--gray-10)]' size='1'>Online</Text>
                        </Flex>}
                    </Flex>
                    {user && <Text className='text-[var(--gray-11)]' size='1'>{user?.name}</Text>}
                </Flex>
            </Flex>

        </HoverCard.Content>
    </HoverCard.Root>
}