import { Avatar, Box, Button, HStack, Icon, Image, Link, Stack, StackDivider, Tag, Text, useColorMode, useDisclosure } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { User } from "../../../types/User/User"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { getFileExtensionIcon } from "../../../utils/layout/fileExtensionIcon"
import { DateObjectToTimeString } from "../../../utils/operations"
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer"
import { SetUserStatus } from "../user-details/SetUserStatus"
import { UserProfileDrawer } from "../user-details/UserProfileDrawer"
import { ImagePreviewModal } from "../file-preview/ImagePreviewModal"
import { PDFPreviewModal } from "../file-preview/PDFPreviewModal"
import { ActionsPalette } from "../message-action-palette/ActionsPalette"
import { useNavigate } from "react-router-dom";

interface ChatMessageProps {
    name: string,
    user: string,
    timestamp: Date,
    text?: string,
    image?: string,
    file?: string,
    message_reactions?: string,
    isContinuation?: boolean,
    isSearchResult?: boolean,
    creation?: string
}

export const ChatMessage = ({ name, user, timestamp, text, image, file, message_reactions, isContinuation, isSearchResult, creation }: ChatMessageProps) => {

    const { colorMode } = useColorMode()
    const { channelMembers, channelData } = useContext(ChannelContext)
    const [showButtons, setShowButtons] = useState<{}>({ visibility: 'hidden' })
    const { isOpen: isUserProfileDetailsDrawerOpen, onOpen: onUserProfileDetailsDrawerOpen, onClose: onUserProfileDetailsDrawerClose } = useDisclosure()
    const { isOpen: isSetUserStatusModalOpen, onOpen: onSetUserStatusModalOpen, onClose: onSetUserStatusModalClose } = useDisclosure()
    const { isOpen: isImagePreviewModalOpen, onOpen: onImagePreviewModalOpen, onClose: onImagePreviewModalClose } = useDisclosure()
    const { isOpen: isPDFPreviewModalOpen, onOpen: onPDFPreviewModalOpen, onClose: onPDFPreviewModalClose } = useDisclosure()
    const navigate = useNavigate()
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'

    return (
        <Box
            pt={isContinuation ? 2 : 4}
            pb={2}
            px='2'
            zIndex={1}
            position={'relative'}
            _hover={{
                bg: colorMode === 'light' && 'gray.50' || 'gray.800',
                borderRadius: 'md'
            }}
            rounded='md'
            onMouseEnter={e => {
                setShowButtons({ visibility: 'visible' })
            }}
            onMouseLeave={e => {
                setShowButtons({ visibility: 'hidden' })
            }}>
            {isSearchResult && creation && <HStack pb='8px'><Text fontWeight='bold' fontSize='md'>{channelData?.channel_name}</Text><Text fontSize='sm'>- {new Date(creation).toDateString()}</Text><Button variant='link' style={showButtons} fontWeight='light' size='sm' onClick={() => navigate(`/channel/${channelData?.name}`)}>View Channel</Button></HStack>}
            {isContinuation ?
                <HStack spacing={3}>
                    <Text pl='1' style={showButtons} fontSize={'xs'} color="gray.500">{DateObjectToTimeString(timestamp).split(' ')[0]}</Text>
                    <DisplayMessageContent text={text} image={image} file={file} onImagePreviewModalOpen={onImagePreviewModalOpen} onPDFPreviewModalOpen={onPDFPreviewModalOpen} />
                    <DisplayReactions message_reactions={message_reactions} />
                </HStack>
                : <HStack spacing={2} alignItems='flex-start'>
                    <Avatar name={channelMembers?.[user]?.full_name ?? user} src={channelMembers?.[user]?.user_image} borderRadius={'md'} boxSize='36px' />
                    <Stack spacing='1'>
                        <HStack>
                            <HStack divider={<StackDivider />} align='flex-start'>
                                <Button variant='link' onClick={() => {
                                    setSelectedUser(channelMembers?.[user])
                                    onUserProfileDetailsDrawerOpen()
                                }}>
                                    <Text fontSize='sm' lineHeight={'0.9'} fontWeight="bold" as='span' color={textColor}>{channelMembers?.[user]?.full_name ?? user}</Text>
                                </Button>
                                <Text fontSize="xs" lineHeight={'0.9'} color="gray.500">{DateObjectToTimeString(timestamp)}</Text>
                            </HStack>
                        </HStack>
                        <DisplayMessageContent text={text} image={image} file={file} onImagePreviewModalOpen={onImagePreviewModalOpen} onPDFPreviewModalOpen={onPDFPreviewModalOpen} />
                        <DisplayReactions message_reactions={message_reactions} />
                    </Stack>
                </HStack>
            }
            <ActionsPalette name={name} text={text} image={image} file={file} user={user} showButtons={showButtons} />
            <SetUserStatus isOpen={isSetUserStatusModalOpen} onClose={onSetUserStatusModalClose} />
            {image && <ImagePreviewModal isOpen={isImagePreviewModalOpen} onClose={onImagePreviewModalClose} file_owner={channelMembers?.[user].name} file_url={image} timestamp={timestamp} />}
            {file && <PDFPreviewModal isOpen={isPDFPreviewModalOpen} onClose={onPDFPreviewModalClose} file_owner={channelMembers?.[user].name} file_url={file} timestamp={timestamp} />}
            {selectedUser && <UserProfileDrawer isOpen={isUserProfileDetailsDrawerOpen} onClose={onUserProfileDetailsDrawerClose} user={selectedUser} openSetStatusModal={onSetUserStatusModalOpen} />}
        </Box>
    )
}

interface DisplayMessageContentProps {
    text?: string,
    image?: string,
    file?: string,
    onImagePreviewModalOpen: () => void,
    onPDFPreviewModalOpen: () => void
}

const DisplayMessageContent = ({ text, image, file, onImagePreviewModalOpen, onPDFPreviewModalOpen }: DisplayMessageContentProps) => {
    if (text) {
        return <MarkdownRenderer content={text} />
    } else if (image) {
        return <Image src={image} height='360px' rounded={'md'} onClick={onImagePreviewModalOpen} _hover={{ cursor: 'pointer' }} />
    } else if (file) {
        return <HStack>
            <Icon as={getFileExtensionIcon(file.split('.')[1])} />
            {file.split('.')[1].toLowerCase() === 'pdf' ?
                <Text onClick={onPDFPreviewModalOpen} _hover={{ cursor: 'pointer', textDecoration: 'underline' }}>{file.split('/')[3]}</Text> :
                <Text as={Link} href={file} isExternal>{file.split('/')[3]}</Text>
            }
        </HStack>
    }
    return <></>
}

const DisplayReactions = ({ message_reactions }: { message_reactions?: string }) => {

    const { colorMode } = useColorMode()
    const bgColor = colorMode === 'light' ? 'white' : 'gray.700'

    if (message_reactions) {
        const reactions = JSON.parse(message_reactions)
        return <HStack>
            {Object.keys(reactions).map((reaction, index) => {
                return <Tag
                    fontSize='xs'
                    variant='subtle'
                    _hover={{ cursor: 'pointer', border: '1px', borderColor: 'blue.500', backgroundColor: bgColor }}
                    key={index}>
                    {reaction} {reactions[reaction]}
                </Tag>
            })}
        </HStack>
    }
    return <></>
}