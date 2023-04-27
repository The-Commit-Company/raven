import { Avatar, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack, Text, useColorMode, Image, Center, ModalFooter } from "@chakra-ui/react"
import { useContext } from "react"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { ImageViewer } from "./ImageViewer"

interface ImagePreviewProps {
    isOpen: boolean,
    onClose: () => void,
    file_url: string,
    file_owner: string
}

export const ImagePreviewModal = ({ isOpen, onClose, file_url, file_owner }: ImagePreviewProps) => {

    const { channelMembers } = useContext(ChannelContext)
    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='6xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <HStack spacing={2} alignItems='center'>
                        <Avatar name={channelMembers?.[file_owner]?.full_name ?? file_owner} src={channelMembers?.[file_owner]?.user_image} borderRadius={'md'} boxSize='40px' />
                        <Stack spacing={1}>
                            <Text fontSize='md' lineHeight={'0.9'} fontWeight="bold" as='span' color={textColor}>{channelMembers?.[file_owner]?.full_name ?? file_owner}</Text>
                            <Text fontSize='xs'>File: "{file_url.split('/')[3]}"</Text>
                        </Stack>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <Center>
                        <Image src={file_url} h='74vh' />
                    </Center>
                </ModalBody>

                <ModalFooter></ModalFooter>

            </ModalContent>
        </Modal>
    )
}