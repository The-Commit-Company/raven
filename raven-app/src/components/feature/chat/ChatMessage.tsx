import { Avatar, Box, Button, ButtonGroup, HStack, Icon, IconButton, Image, Link, Stack, StackDivider, Text, Tooltip, useColorMode, useDisclosure } from "@chakra-ui/react"
import { useFrappeGetCall } from "frappe-react-sdk";
import { useContext, useState } from "react"
import { BsDownload } from "react-icons/bs";
import { RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";
import { ChannelData } from "../../../types/Channel/Channel";
import { User } from "../../../types/User/User";
import { UserContext } from "../../../utils/auth/UserProvider";
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { getFileExtensionIcon } from "../../../utils/layout/fileExtensionIcon";
import { DateObjectToTimeString } from "../../../utils/operations";
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer";
import { DeleteMessageModal } from "../message-details/DeleteMessageModal";
import { EditMessageModal } from "../message-details/EditMessageModal";
import { SetUserStatus } from "../user-details/SetUserStatus";
import { UserProfileDrawer } from "../user-details/UserProfileDrawer";
import { ImagePreviewModal } from "../file-preview/ImagePreviewModal";
import { useNavigate } from "react-router-dom";

interface ChatMessageProps {
    name: string,
    user: string,
    timestamp: Date,
    text?: string,
    image?: string,
    file?: string,
    isContinuation?: boolean
    isSearchResult?: boolean
    creation?: string
}

export const ChatMessage = ({ name, user, timestamp, text, image, file, isContinuation, isSearchResult, creation }: ChatMessageProps) => {

    const { currentUser } = useContext(UserContext)
    const { colorMode } = useColorMode()
    const { channelMembers, channelData } = useContext(ChannelContext)
    const [showButtons, setShowButtons] = useState<{}>({ visibility: 'hidden' })
    const { isOpen: isDeleteMessageModalOpen, onOpen: onDeleteMessageModalOpen, onClose: onDeleteMessageModalClose } = useDisclosure()
    const { isOpen: isEditMessageModalOpen, onOpen: onEditMessageModalOpen, onClose: onEditMessageModalClose } = useDisclosure()
    const { isOpen: isUserProfileDetailsDrawerOpen, onOpen: onUserProfileDetailsDrawerOpen, onClose: onUserProfileDetailsDrawerClose } = useDisclosure()
    const { isOpen: isSetUserStatusModalOpen, onOpen: onSetUserStatusModalOpen, onClose: onSetUserStatusModalClose } = useDisclosure()
    const { isOpen: isImagePreviewModalOpen, onOpen: onImagePreviewModalOpen, onClose: onImagePreviewModalClose } = useDisclosure()
    const { data: channelList, error: channelListError } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")
    const navigate = useNavigate()
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'

    const allMembers = Object.values(channelMembers).map((member) => {
        return {
            id: member.name,
            value: member.full_name
        }
    })

    const allChannels = channelList?.message.map((channel) => {
        return {
            id: channel.name,
            value: channel.channel_name
        }
    })

    return (
        <Box
            pt={isContinuation ? 2 : 4}
            pb={2}
            px='2'
            zIndex={1}
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
            <HStack justifyContent='space-between' alignItems='flex-start'>
                {isContinuation &&
                    <HStack spacing={3}>
                        <Text pl='1' style={showButtons} fontSize={'xs'} color="gray.500">{DateObjectToTimeString(timestamp).split(' ')[0]}</Text>
                        {text && <MarkdownRenderer content={text} />}
                        {image && <Image src={image} height='360px' rounded={'md'} onClick={onImagePreviewModalOpen} />}
                        {file && <HStack>
                            <Icon as={getFileExtensionIcon(file.split('.')[1])} />
                            <Text as={Link} href={file} isExternal>{file.split('/')[3]}</Text>
                        </HStack>}
                    </HStack>
                }
                {!isContinuation &&
                    <HStack spacing={2} alignItems='flex-start'>
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
                            {text && <MarkdownRenderer content={text} />}
                            {image && <Image src={image} height='360px' rounded={'md'} onClick={onImagePreviewModalOpen} />}
                            {file && <HStack>
                                <Icon as={getFileExtensionIcon(file.split('.')[1])} />
                                <Text as={Link} href={file} isExternal>{file.split('/')[3]}</Text>
                            </HStack>}
                        </Stack>
                    </HStack>
                }
                {user == currentUser && <ButtonGroup style={showButtons}>
                    {image &&
                        <Tooltip hasArrow label='download' size='xs' placement='top'>
                            <IconButton
                                as={Link}
                                href={image}
                                isExternal
                                aria-label="download file"
                                icon={<BsDownload />}
                                size='xs' />
                        </Tooltip>
                    }
                    {file &&
                        <Tooltip hasArrow label='download' size='xs' placement='top'>
                            <IconButton
                                as={Link}
                                href={file}
                                isExternal
                                aria-label="download file"
                                icon={<BsDownload />}
                                size='xs' />
                        </Tooltip>
                    }
                    {text &&
                        <Tooltip hasArrow label='edit' size='xs' placement='top'>
                            <IconButton
                                onClick={onEditMessageModalOpen}
                                aria-label="edit message"
                                icon={<RiEdit2Line />}
                                size='xs' />
                        </Tooltip>
                    }
                    <Tooltip hasArrow label='delete' size='xs' placement='top'>
                        <IconButton
                            onClick={onDeleteMessageModalOpen}
                            aria-label="delete message"
                            icon={<RiDeleteBinLine />}
                            size='xs' />
                    </Tooltip>
                </ButtonGroup>}
            </HStack>
            <DeleteMessageModal isOpen={isDeleteMessageModalOpen} onClose={onDeleteMessageModalClose} channelMessageID={name} />
            <SetUserStatus isOpen={isSetUserStatusModalOpen} onClose={onSetUserStatusModalClose} />
            {image && <ImagePreviewModal isOpen={isImagePreviewModalOpen} onClose={onImagePreviewModalClose} file_owner={channelMembers?.[user].name} file_url={image} timestamp={timestamp} />}
            {selectedUser && <UserProfileDrawer isOpen={isUserProfileDetailsDrawerOpen} onClose={onUserProfileDetailsDrawerClose} user={selectedUser} openSetStatusModal={onSetUserStatusModalOpen} />}
            {text && <EditMessageModal isOpen={isEditMessageModalOpen} onClose={onEditMessageModalClose} channelMessageID={name} allMembers={allMembers} allChannels={allChannels ?? []} originalText={text} />}
        </Box>
    )
}