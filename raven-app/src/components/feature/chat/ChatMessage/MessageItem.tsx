import { Box, ContextMenu, Flex, HoverCard, Link, Separator, Text } from '@radix-ui/themes'
import { Message, MessageBlock } from '../../../../../../types/Messaging/Message'
import { MessageContextMenu } from './MessageActions/MessageActions'
import { DateTooltip, DateTooltipShort } from './Renderers/DateTooltip'
import { BoxProps } from '@radix-ui/themes/dist/cjs/components/box'
import { clsx } from 'clsx'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { UserFields } from '@/utils/users/UserListProvider'
import { BsFillCircleFill } from 'react-icons/bs'
import { MessageReactions } from './MessageReactions'
import { ImageMessageBlock } from './Renderers/ImageMessage'
import { FileMessageBlock } from './Renderers/FileMessage'
import { TiptapRenderer } from './Renderers/TiptapRenderer/TiptapRenderer'
import { QuickActions } from './MessageActions/QuickActions/QuickActions'
import { useContext } from 'react'
import { UserContext } from '@/utils/auth/UserProvider'

interface MessageBlockProps {
    message: MessageBlock['data'],
    setDeleteMessage: (message: Message) => void,
    setEditMessage: (message: Message) => void,
    replyToMessage: (message: Message) => void,
    updateMessages: () => void
}

export const MessageItem = ({ message, setDeleteMessage, setEditMessage, replyToMessage, updateMessages }: MessageBlockProps) => {

    const { name, owner: userID, creation: timestamp, message_reactions, is_continuation, is_reply, linked_message } = message

    const { user, isActive } = useGetUserDetails(userID)

    const onDelete = () => {
        setDeleteMessage(message)
    }

    const onEdit = () => {
        setEditMessage(message)
    }

    const onReply = () => {
        replyToMessage(message)
    }

    const { currentUser } = useContext(UserContext)

    const isOwner = currentUser === message.owner

    return (
        <Box className='relative'>
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
                    <Flex gap='3' >
                        <MessageLeftElement message={message} user={user} isActive={isActive} />
                        <Flex direction='column' gap='1' justify='center'>
                            {!is_continuation ? <Flex align='center' gap='2'>
                                <UserHoverCard user={user} userID={userID} isActive={isActive} />
                                <Separator orientation='vertical' />
                                <DateTooltip timestamp={timestamp} />
                            </Flex>
                                : null}
                            {/* Message content goes here */}

                            {/* If it's a reply, then show the linked message */}

                            {/* Show message according to type */}
                            <MessageContent message={message} user={user} className={clsx(message.is_continuation ? '-ml-[2px]' : '')} />
                            {message_reactions?.length &&
                                <MessageReactions
                                    messageID={name}
                                    updateMessages={updateMessages}
                                    message_reactions={message_reactions}
                                />
                            }
                        </Flex>
                        <QuickActions
                            message={message}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            isOwner={isOwner}
                            updateMessages={updateMessages}
                            onReply={onReply}
                        />
                    </Flex>

                </ContextMenu.Trigger>

                <MessageContextMenu
                    message={message}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    isOwner={isOwner}
                    updateMessages={updateMessages}
                    onReply={onReply}
                />
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
            <Link className='text-[var(--gray-11)]' weight='medium' size='2'>
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
interface MessageContentProps extends BoxProps {
    user?: UserFields
    message: Message
}
const MessageContent = ({ message, user, ...props }: MessageContentProps) => {

    return <Box {...props}>
        {message.message_type === 'Image' && <ImageMessageBlock message={message} user={user} />}
        {message.message_type === 'File' && <FileMessageBlock message={message} user={user} />}
        {message.message_type === 'Text' && <TiptapRenderer message={message} user={user} />}
    </Box>
}