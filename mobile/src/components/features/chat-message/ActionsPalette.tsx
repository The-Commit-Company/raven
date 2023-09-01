import { BsDownload, BsEmojiSmile } from 'react-icons/bs'
import { useFrappeCreateDoc, useFrappePostCall } from 'frappe-react-sdk'
import { useContext, useEffect } from 'react'
import { AiOutlineEdit } from 'react-icons/ai'
import { VscTrash } from 'react-icons/vsc'
import { IoBookmark, IoBookmarkOutline, IoChatboxEllipsesOutline } from 'react-icons/io5'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { FileMessage, Message, TextMessage } from '../../../../../types/Messaging/Message'
import { IonButton, IonCard } from '@ionic/react'
import { UserContext } from '../../../utils/auth/UserProvider'

interface ActionButtonPaletteProps {
    message: Message,
    showButtons: {}
    handleScroll: (newState: boolean) => void,
    is_continuation: 1 | 0,
    replyToMessage?: (message: Message) => void
    mutate: () => void
}

export const ActionsPalette = ({ message, showButtons, handleScroll, is_continuation, mutate, replyToMessage }: ActionButtonPaletteProps) => {

    const { name, owner, message_type } = message

    let text = ''
    let file = ''

    if (message_type === 'File' || message_type === 'Image') {
        const { file: fileValue } = message as FileMessage
        file = fileValue
    } else if (message_type === 'Text') {
        const { text: textValue } = message as TextMessage
        text = textValue
    }

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        saveReaction(emojiObject.emoji)
    }

    const { currentUser } = useContext(UserContext)
    const { createDoc } = useFrappeCreateDoc()

    const saveReaction = (emoji: string) => {
        if (name) return createDoc('Raven Message Reaction', {
            reaction: emoji,
            user: currentUser,
            message: name
        })
    }

    const onReplyClick = () => {
        replyToMessage && replyToMessage(message)
    }

    const { call } = useFrappePostCall('frappe.desk.like.toggle_like')

    const handleLike = (id: string, value: string) => {
        call({
            doctype: 'Raven Message',
            name: id,
            add: value
        }).then((r) => mutate())
    }

    const checkLiked = (likedBy: string) => {
        return JSON.parse(likedBy ?? '[]')?.length > 0 && JSON.parse(likedBy ?? '[]')?.includes(currentUser)
    }

    return (
        <IonCard>
            <div className="w-full ion-justify-content-between " style={{ display: 'flex', justifyContent: 'space-between' }}>
                <EmojiButton emoji={'✅'} onClick={() => saveReaction('✅')} />
                <EmojiButton emoji={'👀'} onClick={() => saveReaction('👀')} />
                <EmojiButton emoji={'🎉'} onClick={() => saveReaction('🎉')} />
                <div>
                    {/* <Popover
                        isOpen={modalManager.modalType === ModalTypes.EmojiPicker}
                        onClose={modalManager.closeModal}
                        placement='auto-end'
                        isLazy
                        lazyBehavior="unmount"
                        gutter={48}>
                        <PopoverTrigger>
                            <Tooltip hasArrow label='find another reaction' size='xs' placement='top' rounded='md'>
                                <IconButton size='xs' aria-label={"pick emoji"} icon={<BsEmojiSmile />} onClick={onEmojiPickerOpen} />
                            </Tooltip>
                        </PopoverTrigger>
                        <Portal>
                            <Box zIndex={10}>
                                <PopoverContent border={'none'} rounded='lg'>
                                    <EmojiPicker onEmojiClick={onEmojiClick} lazyLoadEmojis theme={colorMode === 'light' ? 'light' : 'dark'} />
                                </PopoverContent>
                            </Box>
                        </Portal>
                    </Popover> */}
                </div>
                <IonButton
                    onClick={onReplyClick}
                    aria-label="reply"
                    size='small'>
                    <IoChatboxEllipsesOutline fontSize={'0.8rem'} />
                </IonButton>
                {(owner === currentUser) && text &&
                    <IonButton
                        // onClick={onEditMessageModalOpen}
                        aria-label="edit message"
                        size='small'>
                        <AiOutlineEdit fontSize={'0.82rem'} />
                    </IonButton>
                }
                <IonButton
                    aria-label="save message"
                    size='small'
                    onClick={() => handleLike(message.name, checkLiked(message._liked_by) ? 'No' : 'Yes')}>
                    {checkLiked(message._liked_by) ? <IoBookmark fontSize={'0.8rem'} /> : <IoBookmarkOutline fontSize={'0.8rem'} />}
                </IonButton>
                {file &&
                    <IonButton
                        href={file}
                        aria-label="download file"
                        size='small'>
                        <BsDownload />
                    </IonButton>
                }
                {(owner === currentUser) &&
                    <IonButton
                        // onClick={onDeleteMessageModalOpen}
                        aria-label="delete message"
                        size='small'>
                        <VscTrash fontSize={'0.9rem'} />
                    </IonButton>
                }
            </div>
            {/* <DeleteMessageModal
                isOpen={modalManager.modalType === ModalTypes.DeleteMessage}
                onClose={modalManager.closeModal}
                channelMessageID={name}
            /> */}
            {/* {text &&
                <EditMessageModal
                    isOpen={modalManager.modalType === ModalTypes.EditMessage}
                    onClose={modalManager.closeModal}
                    channelMessageID={name}
                    originalText={text}
                />
            } */}
        </IonCard>
    )
}

interface EmojiButtonProps {
    emoji: string,
    onClick?: () => void
}

const EmojiButton = ({ emoji, onClick }: EmojiButtonProps) => {
    return (
        <IonButton size='small' onClick={onClick}>
            {emoji}
        </IonButton>
    )
}