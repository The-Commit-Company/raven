import { Avatar, Box, ButtonGroup, HStack, Icon, IconButton, Image, Link, Stack, StackDivider, Text, Tooltip, useColorMode, useDisclosure } from "@chakra-ui/react"
import { useFrappeGetCall } from "frappe-react-sdk";
import { useContext, useState } from "react"
import { BsDownload } from "react-icons/bs";
import { RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";
import { ChannelData } from "../../../types/Channel/Channel";
import { UserContext } from "../../../utils/auth/UserProvider";
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { getFileExtensionIcon } from "../../../utils/layout/fileExtensionIcon";
import { DateObjectToTimeString } from "../../../utils/operations";
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer.tsx";
import { DeleteMessageModal } from "../message-details/DeleteMessageModal";
import { EditMessageModal } from "../message-details/EditMessageModal";

interface ChatMessageProps {
    name: string,
    user: string,
    timestamp: Date,
    text?: string,
    image?: string,
    file?: string
}

export const ChatMessage = ({ name, user, timestamp, text, image, file }: ChatMessageProps) => {

    const { currentUser } = useContext(UserContext)
    const { colorMode } = useColorMode()
    const { channelMembers } = useContext(ChannelContext)
    const [showButtons, setShowButtons] = useState({ display: 'none' })
    const { isOpen: isDeleteMessageModalOpen, onOpen: onDeleteMessageModalOpen, onClose: onDeleteMessageModalClose } = useDisclosure()
    const { isOpen: isEditMessageModalOpen, onOpen: onEditMessageModalOpen, onClose: onEditMessageModalClose } = useDisclosure()
    const { data: channelList, error: channelListError } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")


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
            py={4}
            px='2'
            zIndex={1}
            _hover={{
                bg: colorMode === 'light' && 'gray.50' || 'gray.800',
                cursor: 'pointer',
                borderRadius: 'md'
            }}
            rounded='md'
            onMouseEnter={e => {
                setShowButtons({ display: 'block' });
            }}
            onMouseLeave={e => {
                setShowButtons({ display: 'none' })
            }}>
            <HStack justifyContent='space-between' alignItems='flex-start'>
                <HStack spacing={2} alignItems='flex-start'>
                    <Avatar name={channelMembers?.[user]?.full_name ?? user} src={channelMembers?.[user]?.user_image} borderRadius={'md'} boxSize='40px' />
                    <Stack spacing='1'>
                        <HStack>
                            <HStack divider={<StackDivider />} align='flex-start'>
                                <Text fontSize='sm' lineHeight={'0.9'} fontWeight="bold" as='span'>{channelMembers?.[user]?.full_name ?? user}</Text>
                                <Text fontSize="xs" lineHeight={'0.9'} color="gray.500">{DateObjectToTimeString(timestamp)}</Text>
                            </HStack>
                        </HStack>
                        {text && <MarkdownRenderer content={text} />}
                        {image && <Box>
                            <Image src={image} height='200px' />
                        </Box>
                        }
                        {file && <HStack>
                            <Icon as={getFileExtensionIcon(file.split('.')[1])} />
                            <Text as={Link} href={file} isExternal>{file.split('/')[3]}</Text>
                        </HStack>}
                    </Stack>
                </HStack>
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
            {text && <EditMessageModal isOpen={isEditMessageModalOpen} onClose={onEditMessageModalClose} channelMessageID={name} allMembers={allMembers} allChannels={allChannels ?? []} originalText={text} />}
        </Box>
    )
}