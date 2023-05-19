import { HStack, IconButton, Stack, Text, Image, useDisclosure } from "@chakra-ui/react"
import { useState } from "react"
import { BsFillCaretDownFill, BsFillCaretRightFill } from "react-icons/bs"
import { FilePreviewModal } from "../../file-preview/FilePreviewModal"

interface ImageMessageProps {
    image: string,
    owner: string,
    timestamp: Date
}

export const ImageMessage = ({ image, owner, timestamp }: ImageMessageProps) => {

    const [showImage, setShowImage] = useState<boolean>(true)
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <Stack spacing={0}>
            <HStack spacing={1}>
                <Text fontSize={'sm'} color={'gray.500'}>{image.split('/')[3]}</Text>
                <IconButton aria-label={"view"} size='xs' onClick={() => { setShowImage(!showImage) }} variant={'unstyled'}
                    icon={showImage ? <BsFillCaretDownFill fontSize={'0.6rem'} /> : <BsFillCaretRightFill fontSize={'0.6rem'} />} />
            </HStack>
            {showImage && <Image src={image} height='360px' rounded={'md'} onClick={onOpen} _hover={{ cursor: 'pointer' }} objectFit='cover' />}
            <FilePreviewModal
                isOpen={isOpen}
                onClose={onClose}
                file_url={image}
                file_owner={owner}
                timestamp={timestamp}
                message_type={"Image"} />
        </Stack>
    )
}