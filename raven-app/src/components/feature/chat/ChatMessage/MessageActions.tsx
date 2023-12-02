import { ContextMenu, Flex } from '@radix-ui/themes'
import { FileMessage, Message } from '../../../../../../types/Messaging/Message'
import { UserFields } from '@/utils/users/UserListProvider'
import { useContext } from 'react'
import { UserContext } from '@/utils/auth/UserProvider'
import { BiBookmarkMinus, BiBookmarkPlus, BiCopy, BiDownload, BiEditAlt, BiLink, BiTrash } from 'react-icons/bi'
import { useToast } from '@/hooks/useToast'
import turndown from 'turndown'
import { HiReply } from 'react-icons/hi'
import { useFrappePostCall } from 'frappe-react-sdk'
interface MessageContextMenuProps {
    message: Message,
    onDelete: VoidFunction
    user?: UserFields,
    onEdit: VoidFunction,
    onReply: VoidFunction,
    updateMessages: VoidFunction
}

export const MessageContextMenu = ({ message, onDelete, onEdit, onReply, user, updateMessages }: MessageContextMenuProps) => {

    const { currentUser } = useContext(UserContext)

    const isOwner = currentUser === message.owner

    const { toast } = useToast()

    const copy = () => {
        if (message.message_type === 'Text') {

            // Remove all empty lines
            let text = message.text.replace(/^\s*[\r\n]/gm, "")

            var turndownService = new turndown({
                codeBlockStyle: 'fenced',
            })

            // We want the links to not be converted to markdown links

            turndownService.addRule('links', {
                filter: 'a',
                replacement: function (content, node, options) {
                    return content
                }
            })
            var markdown = turndownService.turndown(text)
            if (markdown) {
                navigator.clipboard.writeText(markdown)
                toast({
                    title: 'Text copied',
                    duration: 800,
                    variant: 'accent'
                })
            } else {
                toast({
                    title: 'Could not copy text',
                    duration: 800,
                    variant: 'destructive'
                })
            }

        } else {
            if (message.file.startsWith('http') || message.file.startsWith('https')) {
                navigator.clipboard.writeText(message.file)
            }
            else {
                navigator.clipboard.writeText(window.location.origin + message.file)
            }
            toast({
                title: 'Link copied',
                duration: 800,
                variant: 'accent'
            })
        }
    }
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

    const { call } = useFrappePostCall('frappe.desk.like.toggle_like')

    const handleLike = () => {
        call({
            doctype: 'Raven Message',
            name: message.name,
            add: isSaved ? 'No' : 'Yes'
        }).then((r) => updateMessages())
    }

    return <ContextMenu.Item onClick={handleLike}>
        <Flex gap='2'>
            {!isSaved && <BiBookmarkPlus size='18' />}
            {isSaved && <BiBookmarkMinus size='18' />}
            {!isSaved ? "Save" : "Unsave"} message
        </Flex>
    </ContextMenu.Item>


}