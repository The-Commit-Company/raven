import { memo, useContext, useMemo, useRef, useState } from 'react'
import { FileMessage, ImageMessage, Message, TextMessage, PollMessage } from '../../../../../../types/Messaging/Message'
import { IonIcon, IonSkeletonText, IonText } from '@ionic/react'
import { UserFields } from '@/utils/users/UserListProvider'
import { ChannelMembersContext } from '../ChatInterface'
import { openOutline } from 'ionicons/icons'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { useIsUserActive } from '@/hooks/useIsUserActive'
import { useInView } from 'react-intersection-observer';
import { useLongPress } from "@uidotdev/usehooks";
import MessageReactions from './components/MessageReactions'
import parse from 'html-react-parser';
import clsx from 'clsx'
import { Avatar, Badge, Text, Theme } from '@radix-ui/themes'
import { useGetUser } from '@/hooks/useGetUser'
import { generateAvatarColor, getInitials } from '@/components/common/UserAvatar'
import { RiRobot2Fill } from 'react-icons/ri'
import { MdOutlineBarChart } from 'react-icons/md'
import { TiptapRenderer } from './components/TiptapRenderer/TiptapRenderer'
import PollMessageBlock from './components/PollMessage'
import { toDateMonthAtHourMinuteAmPm, toHourMinuteAmPm } from '@/utils/operations/dateConversions'

type Props = {
    message: Message,
    onMessageSelect: (message: Message) => void,
    isHighlighted?: boolean,
    onReplyMessageClick: (messageID: string) => void,
    isScrolling: boolean
}

export const useGetUserDetails = (userID: string) => {

    const user = useGetUser(userID)

    const isActive = useIsUserActive(userID)

    return { user, isActive }
}

export const MessageBlockItem = ({ message, onMessageSelect, isScrolling, isHighlighted = false, onReplyMessageClick }: Props) => {

    /**
     * Displays a message block in the chat interface
     * A message can have the following properties:
     * 1. Is Continuation - if it is, no need to show Avatar and timestamp
     * 2. Is Reply - if it is, show the reply message above the message in the same box
     * 3. Message Type - Text, Image, File - will need to show the content accordingly
     */

    return (
        <div className='px-2 my-0' id={`message-${message.name}`}>
            {message.is_continuation === 0 ? <NonContinuationMessageBlock
                message={message}
                isHighlighted={isHighlighted}
                isScrolling={isScrolling}
                onMessageSelect={onMessageSelect}
                onReplyMessageClick={onReplyMessageClick}
            /> :
                <ContinuationMessageBlock
                    message={message}
                    isScrolling={isScrolling}
                    isHighlighted={isHighlighted}
                    onReplyMessageClick={onReplyMessageClick}
                    onMessageSelect={onMessageSelect} />}
        </div>
    )
}

interface NonContinuationMessageBlockProps {
    message: Message,
    onMessageSelect: (message: Message) => void,
    isHighlighted: boolean,
    onReplyMessageClick: (messageID: string) => void,
    isScrolling: boolean
}

export const NonContinuationMessageBlock = ({ message, onMessageSelect, isScrolling, isHighlighted, onReplyMessageClick }: NonContinuationMessageBlockProps) => {

    const { user, isActive } = useGetUserDetails(message.is_bot_message && message.bot ? message.bot : message.owner)

    const [disableLongPress, setDisableLongPress] = useState(false)

    const scrollingRef = useRef<boolean>(isScrolling)

    scrollingRef.current = isScrolling

    const longPressEvent = useLongPress((e) => {
        if (scrollingRef.current) return
        if (disableLongPress) return
        Haptics.impact({
            style: ImpactStyle.Medium
        })
        onMessageSelect(message)
    })

    const isBot = user?.type === 'Bot'
    // const color = useMemo(() => generateAvatarColor(user?.full_name ?? userID), [user?.full_name, userID])
    return <div>
        <div className={clsx('px-2 mt-1 py-1 rounded-md select-none flex active:bg-gray-3 focus:bg-gray-3 focus-visible:bg-gray-3 focus-within:bg-gray-3',
            isHighlighted ? 'bg-yellow-300/20 dark:bg-yellow-300/20' : '',
            isScrolling ? `focus:bg-transparent active:bg-transparent` : '')} {...longPressEvent}>
            <MessageSenderAvatar user={user} userID={message.owner} isActive={isActive} />
            <div>
                <div className='flex items-baseline pb-1'>
                    <Text as='span' className='font-semibold' size='2'>{user?.full_name ?? message.owner}</Text>
                    {isBot && <Badge className='ml-2' color='gray'>Bot</Badge>}
                    <Text as='span' size='1' className='pl-1.5 text-gray-10'>{toHourMinuteAmPm(message.creation)}</Text>
                </div>
                <MessageContent
                    message={message}
                    onLongPressDisabled={() => setDisableLongPress(true)}
                    onLongPressEnabled={() => setDisableLongPress(false)}
                    onReplyMessageClick={onReplyMessageClick} />
                {message.is_edited === 1 && <Text size='1' color='gray'>(edited)</Text>}
            </div>
        </div>
        <div className='pl-12 m-1'>
            <MessageReactions messageID={message.name} channelID={message.channel_id} message_reactions={message.message_reactions} />
        </div>

    </div>
}

interface UserProps {
    user?: UserFields
    userID: string,
    isActive?: boolean
}

export const MessageSenderAvatar = memo(({ user, userID, isActive = false }: UserProps) => {

    const alt = user?.full_name ?? userID

    const isBot = user?.type === 'Bot'
    const color = useMemo(() => generateAvatarColor(user?.full_name ?? userID), [user?.full_name, userID])
    return <Theme accentColor={color}>
        <div className='w-11 mt-1'>
            <span className="relative inline-block">
                <Avatar src={user?.user_image} alt={user?.full_name ?? userID} loading='lazy' fallback={getInitials(alt)} size={'2'} radius={'medium'} />
                {isActive &&
                    <span className={clsx("absolute block translate-x-1/2 translate-y-1/2 transform rounded-full", 'bottom-0.5 right-0.5')}>
                        <span className="block h-2.5 w-2.5 rounded-full border border-slate-2 bg-green-600 shadow-md" />
                    </span>
                }
                {isBot && <span className="absolute block translate-x-1/2 translate-y-1/2 transform rounded-full bottom-0.5 right-1">
                    <RiRobot2Fill className="text-accent-11 dark:text-accent-11" size="1rem" />
                </span>}
            </span>
        </div>
    </Theme>
})

interface ContinuationMessageBlockProps {
    message: Message,
    onMessageSelect: (message: Message) => void,
    isHighlighted: boolean
    onReplyMessageClick: (messageID: string) => void,
    isScrolling: boolean
}
const ContinuationMessageBlock = ({ message, onMessageSelect, isScrolling, isHighlighted, onReplyMessageClick }: ContinuationMessageBlockProps) => {

    const [disableLongPress, setDisableLongPress] = useState(false)

    const scrollingRef = useRef<boolean>(isScrolling)

    scrollingRef.current = isScrolling
    const longPressEvent = useLongPress((e) => {
        if (scrollingRef.current) return
        if (disableLongPress) return
        Haptics.impact({
            style: ImpactStyle.Medium
        })
        onMessageSelect(message)
    })

    return <div>
        <div className={clsx('px-2 py-1 flex rounded-md select-none active:bg-gray-3 focus:bg-gray-3 focus-visible:bg-gray-3 focus-within:bg-gray-3',
            isHighlighted ? 'bg-yellow-300/20 dark:bg-yellow-300/20' : '',
            isScrolling ? `focus:bg-transparent active:bg-transparent` : '')} {...longPressEvent}>
            <div className='w-11'>
            </div>
            <div>
                <MessageContent
                    message={message}
                    onLongPressDisabled={() => setDisableLongPress(true)}
                    onLongPressEnabled={() => setDisableLongPress(false)}
                    onReplyMessageClick={onReplyMessageClick} />
                {message.is_edited === 1 && <IonText className='text-xs' color={'medium'}>(edited)</IonText>}
            </div>

        </div>

        <div className='pl-12 m-1'>
            <MessageReactions messageID={message.name} channelID={message.channel_id} message_reactions={message.message_reactions} />
        </div>
    </div>
}

interface MessageContentProps {
    message: Message,
    onReplyMessageClick: (messageID: string) => void
    onLongPressDisabled: () => void
    onLongPressEnabled: () => void
}
const MessageContent = ({ message, onReplyMessageClick, onLongPressDisabled, onLongPressEnabled }: MessageContentProps) => {
    const scrollToMessage = () => {
        if (message.linked_message) {
            Haptics.impact({
                style: ImpactStyle.Light
            })
            onReplyMessageClick(message.linked_message)
        }
    }
    return <div className='min-w-[100px] max-w-[320px]'>
        {message.is_reply === 1 && message.linked_message && message.replied_message_details &&
            <div role='button' onClick={scrollToMessage}>
                <ReplyBlock message={JSON.parse(message.replied_message_details)} />
            </div>
        }
        {message.text && <div><TextMessageBlock message={message as TextMessage} /></div>}
        {message.message_type === 'Image' && <ImageMessageBlock message={message} />}
        {message.message_type === 'File' && <FileMessageBlock message={message} />}
        {message.message_type === 'Poll' && <PollMessageBlock
            message={message}
            onModalClose={onLongPressEnabled}
            onModalOpen={onLongPressDisabled} />}
    </div>
}

const TextMessageBlock = ({ message, truncate = false }: { message: TextMessage, truncate?: boolean }) => {

    return <TiptapRenderer message={message} />
}
const options = {
    root: null,
    rootMargin: "100px",
    threshold: 0.5,
    triggerOnce: true
};

const ImageMessageBlock = ({ message }: { message: ImageMessage }) => {
    const { ref, inView } = useInView(options);

    const { width, height } = useMemo(() => {
        let height = message.thumbnail_height ?? 200
        let width = message.thumbnail_width ?? 300

        // Max width is 280px, so we need to adjust the height accordingly
        const aspectRatio = width / height

        if (width > 280) {
            width = 280
            height = width / aspectRatio
        }

        return {
            height: `${height}px`,
            width: `${width}px`
        }

    }, [message])


    // const height = `${message.thumbnail_height ?? 200}px`
    // const width = `${message.thumbnail_width ?? 300}px`
    return <div className='py-1.5 rounded-lg' ref={ref} style={{
        minWidth: width,
        minHeight: height
    }}>
        {inView ?
            <img src={message.file}
                alt={`Image`}
                loading='lazy'
                className='rounded-md object-cover bg-transparent'
                style={{
                    width: width,
                    height: height,
                }}
            />
            :
            <IonSkeletonText animated className='max-w-60 rounded-md' style={{
                width: width,
                height: height,
            }} />
        }
    </div>
}

const FileMessageBlock = ({ message }: { message: FileMessage }) => {

    return <div className='py-0.5 my-1 rounded-md bg-zinc-900'>
        <p className='p-2 text-sm text-zinc-300'>
            📎 &nbsp;{message.file?.split('/')[3]}
        </p>
        <div className='mt-2 text-center'>
            <a
                className='w-full py-2 flex 
                items-center 
                space-x-1.5 
                justify-center border-t-2
                rounded-b-md
                border-t-zinc-800
                text-blue-400
                text-sm
                active:bg-blue-500
                active:text-zinc-300'
                target='_blank'
                href={message.file}
            >
                <span>View File</span>
                <IonIcon icon={openOutline} className='inline-block ml-1' />
            </a>
        </div>
    </div>
}

const ReplyBlock = ({ message }: { message: Message }) => {
    const members = useContext(ChannelMembersContext)

    const user = useMemo(() => {
        if (message) {
            return members[message?.owner]
        } else {
            return undefined
        }
    }, [message])

    return <div className='px-2 py-1.5 my-2 rounded-e-sm bg-neutral-900 border-l-4 border-l-neutral-500'>
        {message && <div>
            <div className='flex items-baseline pb-1'>
                <p className='text-foreground font-medium text-sm leading-normal tracking-normal'>{user?.full_name ?? message.owner}</p>
                <p className='text-xs text-foreground/60 font-normal pl-1.5'>on {toDateMonthAtHourMinuteAmPm(message.creation)}</p>
            </div>
            {message.message_type === 'Text' && <div className='text-sm text-foreground/60 line-clamp-3'>{parse(message.content ?? '')}</div>}
            {message.message_type === 'Image' && <div className='flex items-center space-x-2'>
                <img src={message.file} alt={`Image`} className='inline-block w-10 h-10 rounded-md' />
                <p className='text-sm font-semibold'>📸 &nbsp;Image</p>
            </div>}
            {message.message_type === 'File' && <p
                className='text-sm font-semibold'>📎 &nbsp;{message.file?.split('/')[3]}</p>}
            {message.message_type === 'Poll' && <p className="text-sm font-semibold line-clamp-2 flex items-center">
                <MdOutlineBarChart size='14' className="inline mr-1" />
                Poll: {(message as PollMessage).content?.split("\n")?.[0]}</p>}
        </div>}
    </div>
}
