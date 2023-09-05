import { Box, Button, ButtonGroup, HStack, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Popover, PopoverContent, PopoverTrigger, Stack, useColorMode, useToast } from "@chakra-ui/react"
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { useCallback, useContext, useEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { FaRegSmile } from "react-icons/fa"
import { ErrorBanner } from "../../layout/AlertBanner"
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager"
import { UserListContext } from "@/utils/users/UserListProvider"
import { ChannelListContext, ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { QuillEditor } from "../chat/chat-input/QuillEditor"

interface EditMessageModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void,
    channelMessageID: string,
    originalText: string
}

type value = {
    id: string,
    value: string
}

export const EditMessageModal = ({ isOpen, onClose, channelMessageID, originalText }: EditMessageModalProps) => {

    const channels = useContext(ChannelListContext)
    const users = useContext(UserListContext)

    const allUsers: value[] = users ? users.users.map((user) => {
        return {
            id: user.name,
            value: user.full_name || user.name
        }
    }) : []

    const allChannels: value[] = channels ? Object.values(channels.channels).map((channel: ChannelListItem) => {
        return {
            id: channel.name,
            value: channel.channel_name || channel.name
        }
    }) : []

    const toast = useToast()
    const { updateDoc, error, loading, reset } = useFrappeUpdateDoc()

    useEffect(() => {
        reset()
    }, [isOpen, reset])

    const [text, setText] = useState(originalText)

    useHotkeys('enter', () => onSubmit(), {
        enabled: isOpen,
        preventDefault: true,
        enableOnFormTags: true,
    })

    const onSubmit = () => {
        updateDoc('Raven Message', channelMessageID,
            { text: text }).then(() => {
                onClose(true)
                toast({
                    title: "Message updated",
                    description: "Your message has been updated",
                    status: "success",
                    duration: 3000,
                    isClosable: true
                })
            }).catch((e) => {
                toast({
                    title: "Error",
                    description: e.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true
                })
            })
    }

    const handleClose = (refresh: boolean = false) => {
        reset()
        onClose(refresh)
    }

    const { colorMode } = useColorMode()

    const modalManager = useModalManager()

    const onEmojiPickerOpen = () => {
        modalManager.openModal(ModalTypes.EmojiPicker)
    }

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        // remove html tags from text but do not remove span with class mention
        const textWithoutHTML = text.replace(/<(?!\/?span)[^>]+>/gi, "")
        // add emoji to text
        const newText = `${textWithoutHTML} ${emojiObject.emoji}`
        // set text
        setText(newText)
        modalManager.closeModal()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Message</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <Box>
                        <ErrorBanner error={error} />
                        <Stack border='1px' borderColor={'gray.500'} rounded='lg' maxH='50vh' boxShadow='base' bg={colorMode === "light" ? "white" : "gray.800"} overflowY={'hidden'}>
                            <QuillEditor text={text} setText={setText} onSubmit={onSubmit} allUsers={allUsers} allChannels={allChannels} />
                            <HStack w='full' justify={'space-between'} px='2' pb='2'>
                                <Box>
                                    <Popover
                                        isOpen={modalManager.modalType === ModalTypes.EmojiPicker}
                                        onClose={modalManager.closeModal}
                                        placement='top-end'
                                        isLazy
                                        lazyBehavior="unmount"
                                        gutter={48}
                                        closeOnBlur={false}>
                                        <PopoverTrigger>
                                            <IconButton size='xs' variant='ghost' aria-label={"pick emoji"} icon={<FaRegSmile fontSize='1.0rem' />} onClick={onEmojiPickerOpen} />
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            {/* @ts-ignore */}
                                            <EmojiPicker onEmojiClick={onEmojiClick} lazyLoadEmojis height={335} width={350} previewConfig={{ showPreview: false }} skinTonesDisabled theme={colorMode === 'light' ? 'light' : 'dark'} />
                                        </PopoverContent>
                                    </Popover>
                                </Box>
                            </HStack>
                        </Stack>
                    </Box>

                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <Button variant='ghost' onClick={() => handleClose()} isDisabled={loading}>Cancel</Button>
                        <Button colorScheme='blue' type='submit' isLoading={loading} onClick={onSubmit}>Update</Button>
                    </ButtonGroup>
                </ModalFooter>

            </ModalContent>
        </Modal>
    )
}