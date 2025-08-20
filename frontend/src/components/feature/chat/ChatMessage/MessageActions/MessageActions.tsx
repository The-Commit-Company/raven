import { ContextMenu, Flex } from '@radix-ui/themes'
import { FileMessage, Message } from '../../../../../../../types/Messaging/Message'
import { useContext } from 'react'
import { UserContext } from '@/utils/auth/UserProvider'
import { BiBookmarkMinus, BiBookmarkPlus, BiCopy, BiDownload, BiLink, BiPaperclip, BiTrash } from 'react-icons/bi'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { useMessageCopy } from './useMessageCopy'
import { RetractVote } from './RetractVote'
import { ClosePoll } from './ClosePoll'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { AiOutlineEdit } from 'react-icons/ai'
import { LuForward, LuLink, LuReply } from 'react-icons/lu'
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { CreateThreadContextItem } from './QuickActions/CreateThreadButton'
import { RiPushpinLine, RiUnpinLine } from 'react-icons/ri'
import MessageActionSubMenu from './MessageActionSubMenu'
import { useParams } from 'react-router-dom'

export interface MessageContextMenuProps {
    message?: Message | null,
    onDelete: VoidFunction,
    onEdit: VoidFunction,
    onReply: VoidFunction,
    onForward: VoidFunction,
    onViewReaction?: VoidFunction,
    onAttachDocument: VoidFunction,
    showThreadButton?: boolean,
    selectedText?: string
}
export const MessageContextMenu = ({ message, onDelete, onEdit, onReply, onForward, showThreadButton, onAttachDocument, onViewReaction, selectedText }: MessageContextMenuProps) => {

    const copy = useMessageCopy(message, selectedText)
    const { currentUser } = useContext(UserContext)

    const isOwner = currentUser === message?.owner && !message?.is_bot_message

    const isReactionsAvailable = Object.keys(JSON.parse(message?.message_reactions ?? '{}')).length !== 0

    return (
        <ContextMenu.Content>
            {message ? <>

                {message && message.message_type === 'Poll' && <RetractVote message={message} />}
                {message && message.message_type === 'Poll' && <ClosePoll message={message} />}

                <ContextMenu.Item>
                    <Flex gap='2' width='100%' onClick={onReply}>
                        <LuReply size='18' />
                        Reply
                    </Flex>
                </ContextMenu.Item>

                <ContextMenu.Item>
                    <Flex gap='2' width='100%' onClick={onForward}>
                        <LuForward size='18' />
                        Forward
                    </Flex>
                </ContextMenu.Item>
                {message && !message.is_thread && showThreadButton && <CreateThreadContextItem messageID={message.name} />}
                <CopyMessageLink message={message} />
                <ContextMenu.Separator />
                <ContextMenu.Group>
                    {(message.text || selectedText) &&
                        <ContextMenu.Item>
                            <Flex gap='2' width='100%' onClick={copy}>
                                <BiCopy size='18' />
                                Copy {selectedText ? 'Selected Text' : ''}
                            </Flex>
                        </ContextMenu.Item>
                    }

                    {['File', 'Image'].includes(message.message_type) &&
                        <ContextMenu.Group>
                            <ContextMenu.Item>
                                <Flex gap='2' width='100%' onClick={copy}>
                                    <BiLink size='18' />
                                    Copy link
                                </Flex>
                            </ContextMenu.Item>

                            <ContextMenu.Item asChild>
                                <a download href={(message as FileMessage).file}>
                                    <Flex gap='2'>
                                        <BiDownload size='18' />
                                        Download
                                    </Flex>
                                </a>
                            </ContextMenu.Item>

                            <ContextMenu.Item>
                                <Flex gap='2' width='100%' onClick={onAttachDocument}>
                                    <BiPaperclip size='18' />
                                    Attach File to Document
                                </Flex>
                            </ContextMenu.Item>
                        </ContextMenu.Group>
                    }

                    {showThreadButton && <PinMessageAction message={message} />}
                    <SaveMessageAction message={message} />

                </ContextMenu.Group>

                {isReactionsAvailable && <ContextMenu.Group>
                    <ContextMenu.Separator />
                    <ContextMenu.Item>
                        <Flex gap='2' width='100%' onClick={onViewReaction}>
                            <MdOutlineEmojiEmotions size='18' />
                            View Reactions
                        </Flex>
                    </ContextMenu.Item>
                </ContextMenu.Group>}

                <MessageActionSubMenu messageID={message.name} />

                {isOwner && <ContextMenu.Group>
                    <ContextMenu.Separator />
                    {message.text ?
                        <ContextMenu.Item>
                            <Flex gap='2' width='100%' onClick={onEdit}>
                                <AiOutlineEdit size='18' />
                                Edit
                            </Flex>
                        </ContextMenu.Item>
                        : null}
                    <ContextMenu.Item color="red">
                        <Flex gap='2' width='100%' onClick={onDelete}>
                            <BiTrash size='18' />
                            Delete
                        </Flex>
                    </ContextMenu.Item>
                </ContextMenu.Group>}
            </> : null}
        </ContextMenu.Content>
    )
}

const CopyMessageLink = ({ message }: { message: Message }) => {
    const { workspaceID, threadID } = useParams()

    const onClick = () => {
        let basePath = `${import.meta.env.VITE_BASE_NAME}`
        if (!window.location.origin.endsWith("/")) {
            basePath = "/" + basePath
        }

        const isMessageInThread = threadID === message.channel_id
        if (isMessageInThread) {
            navigator.clipboard.writeText(`${window.location.origin}${basePath}/${encodeURIComponent(workspaceID ?? 'channels')}/threads/${encodeURIComponent(threadID)}?message_id=${encodeURIComponent(message.name)}`)
        } else {
            navigator.clipboard.writeText(`${window.location.origin}${basePath}/${encodeURIComponent(workspaceID ?? 'channels')}/${encodeURIComponent(message.channel_id)}?message_id=${encodeURIComponent(message.name)}`)
        }
        toast.success('Message link copied to clipboard')
    }

    return <ContextMenu.Item>
        <Flex gap='2' width='100%' onClick={onClick}>
            <BiLink size='18' />
            Copy Message Link
        </Flex>
    </ContextMenu.Item>
}

const SaveMessageAction = ({ message }: { message: Message }) => {

    const { currentUser } = useContext(UserContext)
    const isSaved = JSON.parse(message._liked_by ? message._liked_by : '[]').includes(currentUser)

    const { call } = useContext(FrappeContext) as FrappeConfig

    const handleLike = () => {
        call.post('raven.api.raven_message.save_message', {
            // doctype: 'Raven Message',
            message_id: message.name,
            add: isSaved ? 'No' : 'Yes'
        }).then(() => {
            if (isSaved) {
                toast('Message unsaved')
            } else {
                toast.success('Message saved')
            }
        })
            .catch((e) => {
                toast.error('Could not perform the action', {
                    description: getErrorMessage(e)
                })
            })
    }

    return <ContextMenu.Item>
        <Flex gap='2' width='100%' onClick={handleLike}>
            {!isSaved && <BiBookmarkPlus size='18' />}
            {isSaved && <BiBookmarkMinus size='18' />}
            {!isSaved ? "Save" : "Unsave"} Message

        </Flex>
    </ContextMenu.Item>


}


const PinMessageAction = ({ message }: { message: Message }) => {

    const isPinned = message.is_pinned
    const { call } = useContext(FrappeContext) as FrappeConfig

    const handlePin = () => {
        call.post('raven.api.raven_channel.toggle_pin_message', {
            channel_id: message.channel_id,
            message_id: message.name,
        }).then(() => {
            toast.success(`Message ${isPinned ? 'unpinned' : 'pinned'}`)
        }).catch((e) => {
            toast.error('Could not perform the action', {
                description: getErrorMessage(e)
            })
        })
    }

    return <ContextMenu.Item>
        <Flex gap='2' width='100%' onClick={handlePin}>
            {!isPinned ? <RiPushpinLine size='18' /> : <RiUnpinLine size='18' />}
            {!isPinned ? "Pin" : "Unpin"}
        </Flex>
    </ContextMenu.Item>

}