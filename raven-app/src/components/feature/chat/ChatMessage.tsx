import { Avatar, Box, ButtonGroup, HStack, IconButton, Stack, StackDivider, Text } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { DateObjectToTimeString } from "../../../utils/operations";
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer.tsx";

interface ChatMessageProps {
    text: string,
    user: string,
    timestamp: Date
}

export const ChatMessage = ({ text, user, timestamp }: ChatMessageProps) => {

    const { channelMembers } = useContext(ChannelContext)
    const [showButtons, setShowButtons] = useState({ display: 'none' });

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
                            <IconButton aria-label="edit message" icon={<RiEdit2Line />} size='xs' />
                            <IconButton aria-label="delete message" icon={<RiDeleteBinLine />} size='xs' />
                        </ButtonGroup>
                    </HStack>
                    <MarkdownRenderer content={text} />
                </Stack>
            </HStack>
        </Box>
    )
}