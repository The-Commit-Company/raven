import { UserFields } from "@/utils/users/UserListProvider"
import { Message, MessageBlock } from "../../../../../../../types/Messaging/Message"
import { MessageContent, MessageSenderAvatar, UserHoverCard } from "../MessageItem"
import { Box, BoxProps, ContextMenu, Flex, Text } from "@radix-ui/themes"
import { MessageReactions } from "../MessageReactions"
import { DateTooltip, DateTooltipShort } from "../Renderers/DateTooltip"
import { RiPushpinFill, RiShareForwardFill } from "react-icons/ri"
import { ReplyMessageBox } from "../ReplyMessageBox/ReplyMessageBox"
import { useContext, useMemo, useState } from "react"
import clsx from "clsx"
import { DoctypeLinkRenderer } from "../Renderers/DoctypeLinkRenderer"
import { ThreadMessage } from "../Renderers/ThreadMessage"
import { UserContext } from "@/utils/auth/UserProvider"
import { Stack } from "@/components/layout/Stack"
import { useDoubleTap } from "use-double-tap"
import { useDebounce } from "@/hooks/useDebounce"
import { useIsDesktop } from "@/hooks/useMediaQuery"
import useOutsideClick from "@/hooks/useOutsideClick"
import { MessageContextMenu } from "../MessageActions/MessageActions"
import { QuickActions } from "../MessageActions/QuickActions/QuickActions"

export interface Props {
    message: Message
    user: UserFields | undefined
    isActive: boolean
    isHighlighted?: boolean
    onReplyMessageClick: (messageID: string) => void,
    onDelete: () => void,
    showThreadButton?: boolean,
    onEdit: () => void,
    onReply: () => void,
    onForward: () => void,
    onViewReaction: () => void,
    onAttachToDocument: () => void
}

export const LeftRightLayout = ({ message, user, isActive, isHighlighted, onReplyMessageClick, onDelete, showThreadButton, onEdit, onReply, onForward, onViewReaction, onAttachToDocument }: Props) => {

    const { name, owner: userID, is_bot_message, bot, creation: timestamp, message_reactions, is_continuation, linked_message, replied_message_details } = message

    const { currentUser } = useContext(UserContext)

    const replyMessageDetails = useMemo(() => {
        if (typeof replied_message_details === 'string') {
            return JSON.parse(replied_message_details)
        } else {
            return replied_message_details
        }
    }, [replied_message_details])

    const isDesktop = useIsDesktop()
    const [isHovered, setIsHovered] = useState(false)
    const isHoveredDebounced = useDebounce(isHovered, isDesktop ? 400 : 200)
    const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false)

    // For mobile, we want to show the quick actions on double tap
    const bind = useDoubleTap((event) => {
        if (!isDesktop)
            setIsHovered(!isHovered)
    });
    const ref = useOutsideClick(() => {
        if (!isDesktop)
            setIsHovered(false)
    });

    const onMouseEnter = () => {
        if (isDesktop) {
            setIsHovered(true)
        }
    }

    const onMouseLeave = () => {
        if (isDesktop) {
            setIsHovered(false)
        }
    }

    // @ts-ignore
    const CHAT_STYLE = window.frappe?.boot?.chat_style ?? 'Simple'

    const alignToRight = CHAT_STYLE === "Left-Right" && currentUser === userID && !is_bot_message

    const [selectedText, setSelectedText] = useState('')

    const onContextMenuChange = (open: boolean) => {
        if (open) {
            // Get the selection that te user is actually highlighting
            const selection = document.getSelection()
            if (selection) {
                setSelectedText(selection.toString().trim())
            }
        } else {
            setSelectedText('')
        }
    }

    return (
        <div className={clsx('flex py-0.5', alignToRight ? 'justify-end mr-4' : 'justify-start')}>
            <Flex align={'start'} gap={'2'}>
                {!alignToRight && <MessageLeftElement message={message} user={user} isActive={isActive} className="mt-[5px]" />}
                <ContextMenu.Root modal={false} onOpenChange={onContextMenuChange}>
                    <ContextMenu.Trigger
                        {...bind}
                        ref={ref}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        className="group"
                    >
                        <Stack gap={'0'} align={'end'}>
                            {alignToRight && !is_continuation && <Box className="text-right pr-1 pb-0.5"><DateTooltip timestamp={timestamp} /></Box>}
                            <Flex direction={'column'} className={clsx("relative w-fit sm:max-w-[32rem] max-w-[80vw] bg-gray-2 dark:bg-gray-3 p-3 gap-1 rounded-md",
                                isHighlighted ? 'bg-yellow-50 hover:bg-yellow-50 dark:bg-yellow-300/20 dark:hover:bg-yellow-300/20' : !isDesktop && isHovered ? 'bg-gray-2 dark:bg-gray-3' : ''
                            )}>
                                {!is_continuation && !alignToRight ? <Flex align='center' gap='2'>
                                    <UserHoverCard
                                        user={user}
                                        userID={userID}
                                        isActive={isActive} />
                                    <DateTooltip timestamp={timestamp} />
                                </Flex> : null}

                                {message.is_forwarded === 1 && <Flex className='text-gray-10 text-xs' gap={'1'} align={'center'}><RiShareForwardFill size='12' /> forwarded</Flex>}
                                {message.is_pinned === 1 && <Flex className='text-accent-9 text-xs' gap={'1'} align={'center'}><RiPushpinFill size='12' /> Pinned</Flex>}
                                {linked_message && replied_message_details && <ReplyMessageBox
                                    className='sm:max-w-[32rem] max-w-[80vw] cursor-pointer mb-1'
                                    role='button'
                                    onClick={() => onReplyMessageClick(linked_message)}
                                    message={replyMessageDetails} />
                                }

                                <MessageContent
                                    message={message}
                                    user={user}
                                />

                                {message.link_doctype && message.link_document && <Box className={clsx(message.is_continuation ? 'ml-0.5' : '-ml-0.5')}>
                                    <DoctypeLinkRenderer doctype={message.link_doctype} docname={message.link_document} />
                                </Box>}

                                {message.is_edited === 1 && <Text size='1' className='text-gray-10'>(edited)</Text>}

                                {message_reactions?.length &&
                                    <MessageReactions
                                        message={message}
                                        message_reactions={message_reactions}
                                    />
                                }

                                {message.is_thread === 1 ? <ThreadMessage thread={message} /> : null}

                                {(isHoveredDebounced || isEmojiPickerOpen) &&
                                    <QuickActions
                                        message={message}
                                        onDelete={onDelete}
                                        isEmojiPickerOpen={isEmojiPickerOpen}
                                        setIsEmojiPickerOpen={setEmojiPickerOpen}
                                        onEdit={onEdit}
                                        onReply={onReply}
                                        onForward={onForward}
                                        showThreadButton={showThreadButton}
                                        onAttachDocument={onAttachToDocument}
                                        alignToRight={alignToRight}
                                    />
                                }
                            </Flex>

                        </Stack>
                    </ContextMenu.Trigger>
                    <MessageContextMenu
                        message={message}
                        onDelete={onDelete}
                        showThreadButton={showThreadButton}
                        onEdit={onEdit}
                        selectedText={selectedText}
                        onReply={onReply}
                        onForward={onForward}
                        onViewReaction={onViewReaction}
                        onAttachDocument={onAttachToDocument}
                    />
                </ContextMenu.Root>
            </Flex>
        </div >
    )
}


type MessageLeftElementProps = BoxProps & {
    message: MessageBlock['data'],
    user?: UserFields,
    isActive?: boolean
}
const MessageLeftElement = ({ message, className, user, isActive, ...props }: MessageLeftElementProps) => {

    // If it's a continuation, then show the timestamp

    // Else, show the avatar
    return <Box className={clsx(message.is_continuation ? 'flex items-center w-[38px] sm:w-[34px]' : '', className)} {...props}>
        {message.is_continuation ?
            null
            : <MessageSenderAvatar userID={message.owner} user={user} isActive={isActive} />
        }
    </Box>

}