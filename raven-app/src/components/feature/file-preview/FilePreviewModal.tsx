import { Avatar, Center, HStack, Link, Modal, ModalBody, Image, ModalFooter, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack, StackDivider, Text } from "@chakra-ui/react"
import { getFileName } from "../../../utils/operations"
import { FileMessage } from "../../../../../types/Messaging/Message"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { useTheme } from "@/ThemeProvider"
import { BiDownload } from "react-icons/bi"
import { HourMinuteAmPm } from "@/utils/dateConversions"

interface FilePreviewModalProps extends FileMessage {
    isOpen: boolean,
    onClose: () => void,
}

export const FilePreviewModal = ({ isOpen, onClose, owner, file, creation, message_type }: FilePreviewModalProps) => {

    const { appearance } = useTheme()
    const textColor = appearance === 'light' ? 'gray.800' : 'gray.50'

    const users = useGetUserRecords()

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='6xl' scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {owner &&
                        <HStack spacing={2} alignItems='center'>
                            <Avatar name={users?.[owner]?.full_name ?? owner} src={users?.[owner]?.user_image ?? ''} borderRadius={'md'} boxSize='40px' />
                            <Stack spacing={1}>
                                <HStack divider={<StackDivider borderColor="gray.200" />} spacing={2} alignItems='center'>
                                    <Text fontSize='md' lineHeight={'0.9'} fontWeight="bold" as='span' color={textColor}>{users?.[owner]?.full_name ?? owner}</Text>
                                    <Text fontSize="xs" lineHeight={'0.9'} color="gray.500"><HourMinuteAmPm date={creation} /></Text>
                                </HStack>
                                {file &&
                                    <HStack spacing='1' align='center'><BiDownload />
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
                    </Center>}
                    {message_type === 'File' && <iframe src={file} width="100%" height={'550px'} />}
                </ModalBody>
                <ModalFooter></ModalFooter>
            </ModalContent>
        </Modal>
    )
}