import { Box, Flex } from '@radix-ui/themes'
import { MessageContextMenuProps } from '../MessageActions'
import { QUICK_ACTION_BUTTON_CLASS, QuickActionButton } from './QuickActionButton'
import { BiDotsHorizontalRounded } from 'react-icons/bi'
import { MouseEventHandler, useContext, useRef } from 'react'
import { EmojiPickerButton } from './EmojiPickerButton'
import { UserContext } from '@/utils/auth/UserProvider'
import { AiOutlineEdit } from 'react-icons/ai'
import { LuReply } from 'react-icons/lu'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { CreateThreadActionButton } from './CreateThreadButton'
import clsx from 'clsx'
import { EmojiType, getTopFavoriteEmojis } from '../../../ChatInput/EmojiSuggestion'
import usePostMessageReaction from '@/hooks/usePostMessageReaction'

const topEmojis = getTopFavoriteEmojis(10)

const STANDARD_EMOJIS: EmojiType[] = [{
    id: '+1',
    emoji: '👍',
    name: 'Thumbs Up',
    shortcodes: ":+1:"
}, {
    id: 'white_check_mark',
    emoji: '✅',
    name: 'Check Mark Button',
    shortcodes: ":white_check_mark:"
},
{
    id: 'eyes',
    emoji: '👀',
    name: 'Eyes',
    shortcodes: ":eyes:"
},
{
    id: 'tada',
    emoji: '🎉',
    name: 'Party Popper',
    shortcodes: ":tada:"
}
]

// If we have frequently used emojis, then show them, else fill the rest with standard emojis - remove duplicates
const QUICK_EMOJIS = [...topEmojis, ...STANDARD_EMOJIS].filter((emoji, index, self) =>
    index === self.findIndex((t) => t.id === emoji.id)
).slice(0, 4)

interface QuickActionsProps extends MessageContextMenuProps {
    isEmojiPickerOpen: boolean,
    setIsEmojiPickerOpen: (open: boolean) => void,
    alignToRight?: boolean,
}

export const QuickActions = ({ message, onReply, onEdit, isEmojiPickerOpen, setIsEmojiPickerOpen, showThreadButton = true, alignToRight = false }: QuickActionsProps) => {

    const { currentUser } = useContext(UserContext)

    const isOwner = currentUser === message?.owner && !message?.is_bot_message
    const toolbarRef = useRef<HTMLDivElement>(null)

    /**
     * When the user clicks on the more button, we want to trigger a right click event
     * so that we open the context menu instead of duplicating the actions in a dropdown menu
     * @param e - MouseEvent
     */
    const onMoreClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()

        var evt = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: e.clientX,
            clientY: e.clientY,
            screenX: e.screenX,
            screenY: e.screenY,
            buttons: 2
        });
        e.target.dispatchEvent(evt);
    }

    const postReaction = usePostMessageReaction()

    const onEmojiReact = (emoji: string, is_custom: boolean = false, emoji_name?: string) => {
        if (message) {
            postReaction(message, emoji, is_custom, emoji_name).catch((err) => {
                toast.error("Could not react to message.", {
                    description: getErrorMessage(err)
                })
            })
        }
    }

    // @ts-ignore
    const CHAT_STYLE = window.frappe?.boot?.chat_style ?? 'Simple'

    return (
        <Box
            ref={toolbarRef}
            className={clsx('absolute group-hover:visible group-hover:transition-all ease-ease-out-quad group-hover:delay-100 z-50 p-1 shadow-md rounded-md bg-white dark:bg-gray-1 invisible',
                CHAT_STYLE === "Left-Right" ? alignToRight ? "-top-10 right-0" : "-top-10 left-0" : "-top-6 right-4"
            )}>
            <Flex gap='1'>
                {QUICK_EMOJIS.map((emoji) => {
                    if (emoji.emoji) {
                        return <QuickActionButton
                            key={emoji.id}
                            className={'text-base'}
                            tooltip={`React with ${emoji.emoji}`}
                            aria-label={`React with ${emoji.emoji}`}
                            onClick={() => {
                                onEmojiReact(emoji.emoji as string)
                            }}>
                            {/* @ts-expect-error */}
                            <em-emoji native={emoji.emoji} />
                        </QuickActionButton>
                    }
                    return null
                })}

                <EmojiPickerButton
                    isOpen={isEmojiPickerOpen}
                    setIsOpen={setIsEmojiPickerOpen}
                    saveReaction={onEmojiReact} />

                {isOwner && message.message_type === 'Text' ? <QuickActionButton
                    onClick={onEdit}
                    tooltip='Edit message'
                    aria-label='Edit message'>
                    <AiOutlineEdit size='18' />
                </QuickActionButton>
                    :
                    <QuickActionButton
                        tooltip='Reply'
                        aria-label='Reply to this message'
                        onClick={onReply}>
                        <LuReply size='18' />
                    </QuickActionButton>
                }

                {message && !message.is_thread && showThreadButton && <CreateThreadActionButton messageID={message.name} />}

                <QuickActionButton
                    aria-label='More actions'
                    variant='soft'
                    tooltip='More actions'
                    onClick={onMoreClick}
                    className={QUICK_ACTION_BUTTON_CLASS}>
                    <BiDotsHorizontalRounded size='18' />
                </QuickActionButton>
            </Flex>
        </Box>

    )
}