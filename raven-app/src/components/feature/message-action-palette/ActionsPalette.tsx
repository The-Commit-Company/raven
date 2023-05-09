import { Box, Button, HStack, IconButton, Link, Popover, PopoverContent, PopoverTrigger, Tooltip, useColorMode, useDisclosure, useToast } from '@chakra-ui/react'
import { BsDownload, BsEmojiSmile } from 'react-icons/bs'
import { DeleteMessageModal } from '../message-details/DeleteMessageModal'
import { EditMessageModal } from '../message-details/EditMessageModal'
import { useFrappeCreateDoc, useFrappeGetCall } from 'frappe-react-sdk'
import { ChannelData } from '../../../types/Channel/Channel'
import { useContext } from 'react'
import { ChannelContext } from '../../../utils/channel/ChannelProvider'
import { AiOutlineEdit } from 'react-icons/ai'
import { VscTrash } from 'react-icons/vsc'
import { IoBookmarkOutline } from 'react-icons/io5'
import { UserContext } from '../../../utils/auth/UserProvider'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface ActionButtonPaletteProps {
    name: string
    image?: string
    file?: string
    text?: string
    user: string
    showButtons: {}
}

export const ActionsPalette = ({ name, image, file, text, user, showButtons }: ActionButtonPaletteProps) => {

    const { channelMembers } = useContext(ChannelContext)
    const { data: channelList, error: channelListError } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")

    const allMembers = Object.values(channelMembers).map((member) => {
        return {
            id: member.name,
            value: member.full_name
        }
    })

    const allChannels = channelList?.message.map((channel) => {
        return {
            id: channel.name,
            value: channel.channel_name
        }
    })

    const { isOpen: isDeleteMessageModalOpen, onOpen: onDeleteMessageModalOpen, onClose: onDeleteMessageModalClose } = useDisclosure()
    const { isOpen: isEditMessageModalOpen, onOpen: onEditMessageModalOpen, onClose: onEditMessageModalClose } = useDisclosure()

    const { isOpen: showEmojiPicker, onToggle: onEmojiPickerToggle, onClose: onEmojiPickerClose } = useDisclosure()

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        saveReaction(emojiObject.emoji)
        onEmojiPickerClose()
    }

    const { colorMode } = useColorMode()
    const BGCOLOR = colorMode === 'light' ? 'white' : 'black'
    const BORDERCOLOR = colorMode === 'light' ? 'gray.200' : 'gray.700'

    const { currentUser } = useContext(UserContext)

    const { createDoc } = useFrappeCreateDoc()
    const toast = useToast()

    const saveReaction = (emoji: string) => {
        if (name) return createDoc('Raven Message Reaction', {
            reaction: emoji,
            user: currentUser,
            message: name
        }).then(() => {
            console.log('reaction saved')
        }).catch((error) => {
            toast({
                title: `Error reacting to message - ${error}`,
                status: 'error',
                duration: 1000,
                isClosable: true,
            })
        })
    }

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
                        isOpen={showEmojiPicker}
                        onClose={onEmojiPickerClose}
                        placement='top-end'
                        isLazy
                        lazyBehavior="unmount"
                        gutter={48}
                        closeOnBlur={false}>
                        <PopoverTrigger>
                            <Tooltip hasArrow label='find another reaction' size='xs' placement='top' rounded='md'>
                                <IconButton size='xs' aria-label={"pick emoji"} icon={<BsEmojiSmile />} onClick={onEmojiPickerToggle} />
                            </Tooltip>
                        </PopoverTrigger>
                        <PopoverContent border={'none'} rounded='lg'>
                            {/* @ts-ignore */}
                            <EmojiPicker onEmojiClick={onEmojiClick} lazyLoadEmojis theme={colorMode === 'light' ? 'light' : 'dark'} />
                        </PopoverContent>
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
                {image &&
                    <Tooltip hasArrow label='download' size='xs' placement='top' rounded='md'>
                        <IconButton
                            as={Link}
                            href={image}
                            isExternal
                            aria-label="download file"
                            icon={<BsDownload />}
                            size='xs' />
                    </Tooltip>
                }
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
            <DeleteMessageModal isOpen={isDeleteMessageModalOpen} onClose={onDeleteMessageModalClose} channelMessageID={name} />
            {text && <EditMessageModal isOpen={isEditMessageModalOpen} onClose={onEditMessageModalClose} channelMessageID={name} allMembers={allMembers} allChannels={allChannels ?? []} originalText={text} />}
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