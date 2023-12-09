import { Box, Flex, Tooltip } from '@radix-ui/themes'
import { MessageContextMenuProps } from '../MessageActions'
import { QUICK_ACTION_BUTTON_CLASS, QuickActionButton } from './QuickActionButton'
import { BiDotsHorizontal, BiEditAlt } from 'react-icons/bi'
import { HiReply } from 'react-icons/hi'
import { MouseEventHandler, useContext, useRef } from 'react'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { EmojiPickerButton } from './EmojiPickerButton'

const QUICK_EMOJIS = ['👍', '✅', '👀', '🎉']

export const QuickActions = ({ message, onReply, onEdit, updateMessages, isOwner }: MessageContextMenuProps) => {

    const toolbarRef = useRef<HTMLDivElement>(null)

    const { call } = useContext(FrappeContext) as FrappeConfig

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

    const onEmojiReact = (emoji: string) => {
        call.post('raven.api.reactions.react', {
            message_id: message.name,
            reaction: emoji
        }).then(() => updateMessages())
    }

    return (
        <Box ref={toolbarRef} className='absolute 
        -top-6 
        right-4
        group-hover:visible
        group-hover:transition-all
        group-hover:delay-100
        z-50 
        p-1
        shadow-md
        rounded-md
        bg-white
        dark:bg-gray-1
        invisible'>
            <Flex gap='1'>
                {QUICK_EMOJIS.map((emoji) => {
                    return <QuickActionButton
                        key={emoji}
                        className={'text-base'}
                        tooltip={`React with ${emoji}`}
                        aria-label={`React with ${emoji}`}
                        onClick={() => {
                            onEmojiReact(emoji)
                        }}>
                        {emoji}
                    </QuickActionButton>
                })}

                <EmojiPickerButton saveReaction={onEmojiReact} />

                {isOwner && message.message_type === 'Text' ? <QuickActionButton
                    onClick={onEdit}
                    tooltip='Edit message'
                    aria-label='Edit message'>
                    <BiEditAlt size='18' />
                </QuickActionButton>
                    :
                    <QuickActionButton
                        tooltip='Reply'
                        aria-label='Reply to this message'
                        onClick={onReply}>
                        <HiReply size='18' />
                    </QuickActionButton>
                }

                <QuickActionButton
                    aria-label='More actions'
                    variant='soft'
                    tooltip='More actions'
                    onClick={onMoreClick}
                    className={QUICK_ACTION_BUTTON_CLASS}>
                    <BiDotsHorizontal size='18' />
                </QuickActionButton>
            </Flex>
        </Box>

    )
}