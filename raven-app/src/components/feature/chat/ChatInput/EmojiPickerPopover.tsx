import { ModalTypes, useModalManager } from "@/hooks/useModalManager"
import { Popover, PopoverTrigger, Tooltip, IconButton, PopoverContent, useColorMode } from "@chakra-ui/react"
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"
import { FaRegSmile } from "react-icons/fa"

type Props = {
    text: string,
    setText: (text: string) => void
}

export const EmojiPickerPopover = ({ text, setText }: Props) => {

    const { colorMode } = useColorMode()

    const modalManager = useModalManager()

    const onEmojiPickerOpen = () => {
        modalManager.openModal(ModalTypes.EmojiPicker)
    }

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        // remove html tags from text
        const textWithoutHTML = text.replace(/<(?!\/?span)[^>]+>/gi, "")
        // add emoji to text
        const newText = `${textWithoutHTML} ${emojiObject.emoji}`
        // set text
        setText(newText)
        modalManager.closeModal()
    }

    return (
        <Popover
            isOpen={modalManager.modalType === ModalTypes.EmojiPicker}
            onClose={modalManager.closeModal}
            placement='top-end'
            isLazy
            lazyBehavior="unmount"
            gutter={48}>
            <PopoverTrigger>
                <Tooltip hasArrow label='add emoji' placement='top' rounded={'md'}>
                    <IconButton size='xs' variant='ghost' aria-label={"pick emoji"} icon={<FaRegSmile fontSize='1.0rem' />} onClick={onEmojiPickerOpen} />
                </Tooltip>
            </PopoverTrigger>
            <PopoverContent border={'none'} rounded='lg'>
                {/* @ts-ignore */}
                <EmojiPicker onEmojiClick={onEmojiClick} lazyLoadEmojis theme={colorMode === 'light' ? 'light' : 'dark'} />
            </PopoverContent>
        </Popover>
    )
}