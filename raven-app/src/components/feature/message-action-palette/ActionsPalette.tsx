import { Box, Button, HStack, IconButton, Link, Popover, PopoverContent, PopoverTrigger, Portal, Tooltip, useColorMode } from '@chakra-ui/react'
import { BsDownload, BsEmojiSmile } from 'react-icons/bs'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { useContext, useEffect } from 'react'
import { AiOutlineEdit } from 'react-icons/ai'
import { VscTrash } from 'react-icons/vsc'
import { IoBookmarkOutline } from 'react-icons/io5'
import { UserContext } from '../../../utils/auth/UserProvider'
import { DeleteMessageModal } from '../message-details/DeleteMessageModal'
import { EditMessageModal } from '../message-details/EditMessageModal'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { ModalTypes, useModalManager } from '../../../hooks/useModalManager'

interface ActionButtonPaletteProps {
    name: string
    file?: string | null
    text?: string | null
    user: string
    showButtons: {}
    handleScroll: (newState: boolean) => void
}

export const ActionsPalette = ({ name, file, text, user, showButtons, handleScroll }: ActionButtonPaletteProps) => {

    const modalManager = useModalManager()

    const onDeleteMessageModalOpen = () => {
        modalManager.openModal(ModalTypes.DeleteMessage)
    }

    const onEditMessageModalOpen = () => {
        text && modalManager.openModal(ModalTypes.EditMessage)
    }

    const onEmojiPickerOpen = () => {
        modalManager.openModal(ModalTypes.EmojiPicker)
    }

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        saveReaction(emojiObject.emoji)
        modalManager.closeModal()
    }

    const { colorMode } = useColorMode()
    const BGCOLOR = colorMode === 'light' ? 'white' : 'black'
    const BORDERCOLOR = colorMode === 'light' ? 'gray.200' : 'gray.700'

    const { currentUser } = useContext(UserContext)
    const { createDoc } = useFrappeCreateDoc()

    const saveReaction = (emoji: string) => {
        if (name) return createDoc('Raven Message Reaction', {
            reaction: emoji,
            user: currentUser,
            message: name
        })
    }

    useEffect(() => {
        handleScroll(modalManager.modalType !== ModalTypes.EmojiPicker)
    }, [modalManager.modalType])

    return (
        <Box
            rounded='md'
            bgColor={BGCOLOR}
            p='1'
            style={showButtons}
            boxShadow='bottom'
            border='1px'
            borderColor={BORDERCOLOR}
            width='fit-content'
            zIndex={2}
            position='absolute'
            top={-4}
            right={2}>
            <HStack spacing={1}>
                <EmojiButton emoji={'✅'} label={'done'} onClick={() => saveReaction('✅')} />
                <EmojiButton emoji={'👀'} label={'looking into this...'} onClick={() => saveReaction('👀')} />
                <EmojiButton emoji={'🎉'} label={'great job!'} onClick={() => saveReaction('🎉')} />
                <Box>
                    <Popover
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
                                    {/* @ts-ignore */}
                                    <EmojiPicker onEmojiClick={onEmojiClick} lazyLoadEmojis theme={colorMode === 'light' ? 'light' : 'dark'} />
                                </PopoverContent>
                            </Box>
                        </Portal>
                    </Popover>
                </Box>
                {(user === currentUser) && text &&
                    <Tooltip hasArrow label='edit' size='xs' placement='top' rounded='md'>
                        <IconButton
                            onClick={onEditMessageModalOpen}
                            aria-label="edit message"
                            icon={<AiOutlineEdit fontSize={'0.82rem'} />}
                            size='xs' />
                    </Tooltip>
                }
                <Tooltip hasArrow label='save' size='xs' placement='top' rounded='md'>
                    <IconButton
                        aria-label="save message"
                        icon={<IoBookmarkOutline fontSize={'0.8rem'} />}
                        size='xs' />
                </Tooltip>
                {file &&
                    <Tooltip hasArrow label='download' size='xs' placement='top' rounded='md'>
                        <IconButton
                            as={Link}
                            href={file}
                            isExternal
                            aria-label="download file"
                            icon={<BsDownload />}
                            size='xs' />
                    </Tooltip>
                }
                {(user === currentUser) &&
                    <Tooltip hasArrow label='delete' size='xs' placement='top' rounded='md'>
                        <IconButton
                            onClick={onDeleteMessageModalOpen}
                            aria-label="delete message"
                            icon={<VscTrash fontSize={'0.9rem'} />}
                            size='xs' />
                    </Tooltip>
                }
            </HStack>
            <DeleteMessageModal
                isOpen={modalManager.modalType === ModalTypes.DeleteMessage}
                onClose={modalManager.closeModal}
                channelMessageID={name}
            />
            {text &&
                <EditMessageModal
                    isOpen={modalManager.modalType === ModalTypes.EditMessage}
                    onClose={modalManager.closeModal}
                    channelMessageID={name}
                    originalText={text}
                />
            }
        </Box>
    )
}

interface EmojiButtonProps {
    emoji: string,
    label: string,
    onClick?: () => void
}

const EmojiButton = ({ emoji, label, onClick }: EmojiButtonProps) => {
    return (
        <Tooltip hasArrow label={label} size='xs' placement='top' rounded='md'>
            <Button size='xs' fontSize='md' onClick={onClick}>
                {emoji}
            </Button>
        </Tooltip>
    )
}