import { Avatar, Button, Center, HStack, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, StackDivider, Text, useColorMode } from "@chakra-ui/react"
import { DateObjectToTimeString } from "../../../utils/operations"
import { useContext } from "react"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { BsDownload } from "react-icons/bs"
import ReactPanZoom from "react-image-pan-zoom-rotate"
import { Message } from "../../../types/Messaging/Message"

interface FilePreviewModalProps {
    isOpen: boolean,
    onClose: () => void,
    message: Message
}

export const FilePreviewModal = ({ isOpen, onClose, message }: FilePreviewModalProps) => {

    const { channelMembers } = useContext(ChannelContext)
    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='6xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {message && message.owner &&
                        <HStack spacing={2} alignItems='center'>
                            <Avatar name={channelMembers?.[message.owner]?.full_name ?? message.owner} src={channelMembers?.[message.owner]?.user_image} borderRadius={'md'} boxSize='40px' />
                            <Stack spacing={1}>
                                <HStack divider={<StackDivider borderColor="gray.200" />} spacing={2} alignItems='center'>
                                    <Text fontSize='md' lineHeight={'0.9'} fontWeight="bold" as='span' color={textColor}>{channelMembers?.[message.owner]?.full_name ?? message.owner}</Text>
                                    <Text fontSize="xs" lineHeight={'0.9'} color="gray.500">{DateObjectToTimeString(message.creation)}</Text>
                                </HStack>
                                <Text fontSize='xs'>File: "{message.file?.split('/')[3]}"</Text>
                            </Stack>
                        </HStack>
                    }
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    {message && message.message_type === 'Image' && message.file && <Center>
                        <div
                            style={{
                                width: '40vw',
                                position: "relative",
                                overflow: "hidden"
                            }}>
                            <ReactPanZoom
                                alt="uploaded image"
                                image={message.file}
                            />
                        </div>
                    </Center>
                    }
                    {message && message.message_type === 'File' && message.file && <iframe src={message.file} width="100%" height={'550px'} />}
                </ModalBody>

                {message && message.file &&
                    <ModalFooter>
                        <Button
                            as={Link}
                            href={message.file}
                            isExternal
                            aria-label="download file"
                            size='xs'
                            rightIcon={<BsDownload />}>
                            Download
                        </Button>
                    </ModalFooter>
                }

            </ModalContent>
        </Modal>
    )
}