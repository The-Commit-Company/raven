import { Avatar, Box, ButtonGroup, HStack, IconButton, Stack, StackDivider, Text, Tooltip, useDisclosure } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { DateObjectToTimeString } from "../../../utils/operations";
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer.tsx";
import { DeleteMessageModal } from "../message-details/DeleteMessageModal";

interface ChatMessageProps {
    name: string,
    text: string,
    user: string,
    timestamp: Date
}

export const ChatMessage = ({ name, text, user, timestamp }: ChatMessageProps) => {

    const { channelMembers } = useContext(ChannelContext)
    const [showButtons, setShowButtons] = useState({ display: 'none' })
    const { isOpen: isDeleteMessageModalOpen, onOpen: onDeleteMessageModalOpen, onClose: onDeleteMessageModalClose } = useDisclosure()

    return (
        <Box py={4} px='2'>
            <HStack spacing={2} alignItems='center'
                onMouseEnter={e => {
                    setShowButtons({ display: 'block' });
                }}
                onMouseLeave={e => {
                    setShowButtons({ display: 'none' })
                }}>
                <Avatar name={channelMembers?.[user]?.full_name ?? user} src={channelMembers?.[user]?.user_image} borderRadius={'md'} boxSize='40px' />
                <Stack spacing='1'>
                    <HStack>
                        <HStack divider={<StackDivider />} align='flex-start'>
                            <Text fontSize='sm' lineHeight={'0.9'} fontWeight="bold" as='span'>{channelMembers?.[user]?.full_name ?? user}</Text>
                            <Text fontSize="xs" lineHeight={'0.9'} color="gray.500">{DateObjectToTimeString(timestamp)}</Text>
                        </HStack>
                        <ButtonGroup style={showButtons}>
                            <Tooltip hasArrow label='edit' size='xs' placement='top'>
                                <IconButton aria-label="edit message" icon={<RiEdit2Line />} size='xs' />
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
                    <MarkdownRenderer content={text} />
                </Stack>
            </HStack>
            <DeleteMessageModal isOpen={isDeleteMessageModalOpen} onClose={onDeleteMessageModalClose} channelMessageID={name} />
        </Box>
    )
}