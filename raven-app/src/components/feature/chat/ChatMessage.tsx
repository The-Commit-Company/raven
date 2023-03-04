import { Avatar, Box, ButtonGroup, HStack, IconButton, Stack, StackDivider, Text, Tooltip, useColorMode, useDisclosure } from "@chakra-ui/react"
import { useFrappeGetCall } from "frappe-react-sdk";
import { useContext, useState } from "react"
import { RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";
import { ChannelData } from "../../../types/Channel/Channel";
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { DateObjectToTimeString } from "../../../utils/operations";
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer.tsx";
import { DeleteMessageModal } from "../message-details/DeleteMessageModal";
import { EditMessageModal } from "../message-details/EditMessageModal";

interface ChatMessageProps {
    name: string,
    text: string,
    user: string,
    timestamp: Date
}

export const ChatMessage = ({ name, text, user, timestamp }: ChatMessageProps) => {

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
            _hover={{
                bg: colorMode === 'light' && 'gray.50' || 'gray.700',
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
                        <MarkdownRenderer content={text} />
                    </Stack>
                </HStack>
                <ButtonGroup style={showButtons}>
                    <Tooltip hasArrow label='edit' size='xs' placement='top'>
                        <IconButton
                            onClick={onEditMessageModalOpen}
                            aria-label="edit message"
                            icon={<RiEdit2Line />}
                            size='xs' />
                    </Tooltip>
                    <Tooltip hasArrow label='delete' size='xs' placement='top'>
                        <IconButton
                            onClick={onDeleteMessageModalOpen}
                            aria-label="delete message"
                            icon={<RiDeleteBinLine />}
                            size='xs' />
                    </Tooltip>
                </ButtonGroup>
            </HStack>
            <DeleteMessageModal isOpen={isDeleteMessageModalOpen} onClose={onDeleteMessageModalClose} channelMessageID={name} />
            <EditMessageModal isOpen={isEditMessageModalOpen} onClose={onEditMessageModalClose} channelMessageID={name} allMembers={allMembers} allChannels={allChannels ?? []} />
        </Box>
    )
}