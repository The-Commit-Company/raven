import { ContextMenu, Flex } from '@radix-ui/themes'
import { FileMessage, Message } from '../../../../../../../types/Messaging/Message'
import { useContext } from 'react'
import { UserContext } from '@/utils/auth/UserProvider'
import { BiBookmarkMinus, BiBookmarkPlus, BiCopy, BiDownload, BiEditAlt, BiLink, BiTrash } from 'react-icons/bi'
import { HiReply } from 'react-icons/hi'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { useMessageCopy } from './useMessageCopy'
import { useToast } from '@/hooks/useToast'

export interface MessageContextMenuProps {
    message: Message,
    onDelete: VoidFunction
    onEdit: VoidFunction,
    onReply: VoidFunction,
    updateMessages: VoidFunction,
    isOwner: boolean
}

export const MessageContextMenu = ({ message, onDelete, onEdit, onReply, updateMessages, isOwner }: MessageContextMenuProps) => {

    const copy = useMessageCopy(message)

    return (
        <ContextMenu.Content>
            <ContextMenu.Item onClick={onReply}>
                <Flex gap='2'>
                    <HiReply size='18' />
                    Reply
                </Flex>
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Group>
                {message.message_type === 'Text' &&
                    <ContextMenu.Item onClick={copy}>
                        <Flex gap='2'>
                            <BiCopy size='18' />
                            Copy
                        </Flex>
                    </ContextMenu.Item>
                }

                {['File', 'Image'].includes(message.message_type) &&
                    <ContextMenu.Group>
                        <ContextMenu.Item onClick={copy}>
                            <Flex gap='2'>
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
                    </ContextMenu.Group>
                }

            </ContextMenu.Group>

            <ContextMenu.Separator />
            <ContextMenu.Group>

                <SaveMessageAction message={message} updateMessages={updateMessages} />

                {/* <ContextMenu.Item>
                    <Flex gap='2'>
                        <HiOutlineDocumentAdd size='18' />
                        Link with document
                    </Flex>
                </ContextMenu.Item>

                <ContextMenu.Item>
                    <Flex gap='2'>
                        <BiMailSend size='18' />
                        Send in an email
                    </Flex>
                </ContextMenu.Item> */}

            </ContextMenu.Group>




            {isOwner && <ContextMenu.Group>
                <ContextMenu.Separator />
                {message.message_type === 'Text' &&
                    <ContextMenu.Item onClick={onEdit}>
                        <Flex gap='2'>
                            <BiEditAlt size='18' />
                            Edit
                        </Flex>
                    </ContextMenu.Item>
                }
                <ContextMenu.Item color="red" onClick={onDelete}>
                    <Flex gap='2'>
                        <BiTrash size='18' />
                        Delete
                    </Flex>
                </ContextMenu.Item>
            </ContextMenu.Group>}

        </ContextMenu.Content>
    )
}


const SaveMessageAction = ({ message, updateMessages }: { message: Message, updateMessages: VoidFunction }) => {

    const { currentUser } = useContext(UserContext)
    const isSaved = JSON.parse(message._liked_by ?? '[]').includes(currentUser)

    const { call } = useContext(FrappeContext) as FrappeConfig

    const { toast } = useToast()

    const handleLike = () => {
        call.post('frappe.desk.like.toggle_like', {
            doctype: 'Raven Message',
            name: message.name,
            add: isSaved ? 'No' : 'Yes'
        }).then(() => {
            toast({
                title: isSaved ? 'Message unsaved' : 'Message saved',
                variant: 'accent',
                duration: 800,
            })
            updateMessages()
        })
            .catch(() => {
                toast({
                    title: 'Could not perform the action',
                    variant: 'destructive',
                    duration: 800,
                })
            })
    }

    return <ContextMenu.Item onClick={handleLike}>
        <Flex gap='2'>
            {!isSaved && <BiBookmarkPlus size='18' />}
            {isSaved && <BiBookmarkMinus size='18' />}
            {!isSaved ? "Save" : "Unsave"} message

        </Flex>
    </ContextMenu.Item>


}