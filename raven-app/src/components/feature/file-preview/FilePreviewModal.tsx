import { Avatar, Center, HStack, Link, Modal, ModalBody, Image, ModalFooter, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack, StackDivider, Text, useColorMode } from "@chakra-ui/react"
import { DateObjectToTimeString, getFileName } from "../../../utils/operations"
import { useContext } from "react"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { BsDownload } from "react-icons/bs"
import { FileMessage } from "../../../types/Messaging/Message"

interface FilePreviewModalProps extends FileMessage {
    isOpen: boolean,
    onClose: () => void
}

export const FilePreviewModal = ({ isOpen, onClose, owner, file, creation, message_type }: FilePreviewModalProps) => {

    const { channelMembers } = useContext(ChannelContext)
    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='6xl' scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {owner &&
                        <HStack spacing={2} alignItems='center'>
                            <Avatar name={channelMembers?.[owner]?.full_name ?? owner} src={channelMembers?.[owner]?.user_image} borderRadius={'md'} boxSize='40px' />
                            <Stack spacing={1}>
                                <HStack divider={<StackDivider borderColor="gray.200" />} spacing={2} alignItems='center'>
                                    <Text fontSize='md' lineHeight={'0.9'} fontWeight="bold" as='span' color={textColor}>{channelMembers?.[owner]?.full_name ?? owner}</Text>
                                    <Text fontSize="xs" lineHeight={'0.9'} color="gray.500">{DateObjectToTimeString(creation)}</Text>
                                </HStack>
                                {file &&
                                    <HStack spacing='1' align='center'><BsDownload size='12' />
                                        <Link textDecor='underline' _hover={{ color: 'blue.500' }} isExternal fontSize='xs' href={file}>{getFileName(file)}</Link>
                                    </HStack>
                                }
                            </Stack>
                        </HStack>
                    }
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    {message_type === 'Image' && <Center>
                        <Image src={file} alt="uploaded image" maxH={"70vh"} maxW="full" objectFit={'contain'} objectPosition={'center'} />
                    </Center>
                    }
                    {message_type === 'File' && <iframe src={file} width="100%" height={'550px'} />}
                </ModalBody>
                <ModalFooter></ModalFooter>
            </ModalContent>
        </Modal>
    )
}