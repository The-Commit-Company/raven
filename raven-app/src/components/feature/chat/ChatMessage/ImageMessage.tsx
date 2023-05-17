import { HStack, IconButton, Stack, Text, Image, useDisclosure } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { BsFillCaretDownFill, BsFillCaretRightFill } from "react-icons/bs"
import { ImagePreviewModal } from "../../file-preview/ImagePreviewModal"
import { ChannelContext } from "../../../../utils/channel/ChannelProvider"

interface ImageMessageProps {
    image: string,
    user: string,
    timestamp: Date
}

export const ImageMessage = ({ image, user, timestamp }: ImageMessageProps) => {

    const { channelMembers } = useContext(ChannelContext)
    const [showImage, setShowImage] = useState<boolean>(true)
    const { isOpen: isImagePreviewModalOpen, onOpen: onImagePreviewModalOpen, onClose: onImagePreviewModalClose } = useDisclosure()

    return (
        <Stack spacing={0}>
            <HStack spacing={1}>
                <Text fontSize={'sm'} color={'gray.500'}>{image.split('/')[3]}</Text>
                <IconButton aria-label={"view"} size='xs' onClick={() => { setShowImage(!showImage) }} variant={'unstyled'}
                    icon={showImage ? <BsFillCaretDownFill fontSize={'0.6rem'} /> : <BsFillCaretRightFill fontSize={'0.6rem'} />} />
            </HStack>
            {showImage && <Image src={image} height='360px' rounded={'md'} onClick={onImagePreviewModalOpen} _hover={{ cursor: 'pointer' }} objectFit='cover' />}
            <ImagePreviewModal isOpen={isImagePreviewModalOpen} onClose={onImagePreviewModalClose} file_owner={channelMembers?.[user]?.name} file_url={image} timestamp={timestamp} />
        </Stack>
    )
}