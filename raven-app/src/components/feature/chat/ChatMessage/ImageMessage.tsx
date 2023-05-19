import { HStack, IconButton, Stack, Text, Image } from "@chakra-ui/react"
import { useState } from "react"
import { BsFillCaretDownFill, BsFillCaretRightFill } from "react-icons/bs"
import { Message } from "../../../../types/Messaging/Message"

interface ImageMessageProps {
    message: Message,
    onFilePreviewModalOpen: (message: Message) => void
}

export const ImageMessage = ({ message, onFilePreviewModalOpen }: ImageMessageProps) => {

    const [showImage, setShowImage] = useState<boolean>(true)

    return (
        <Stack spacing={0}>
            <HStack spacing={1}>
                {message.file && <Text fontSize={'sm'} color={'gray.500'}>{message.file.split('/')[3]}</Text>}
                <IconButton aria-label={"view"} size='xs' onClick={() => { setShowImage(!showImage) }} variant={'unstyled'}
                    icon={showImage ? <BsFillCaretDownFill fontSize={'0.6rem'} /> : <BsFillCaretRightFill fontSize={'0.6rem'} />} />
            </HStack>
            {message && message.file && showImage &&
                <Image src={message.file} height='360px' rounded={'md'}
                    onClick={() => onFilePreviewModalOpen(message)}
                    _hover={{ cursor: 'pointer' }} objectFit='cover' />}
        </Stack>
    )
}