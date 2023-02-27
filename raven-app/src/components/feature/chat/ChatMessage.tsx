import { Avatar, Box, HStack, Stack, StackDivider, Text } from "@chakra-ui/react"
import { useContext } from "react"
import TimeAgo from 'timeago-react'
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

    return (
        <Box py={4} px='2'>
            <HStack spacing={2} alignItems='flex-start'>
                <Avatar name={channelMembers?.[user]?.full_name ?? user} src={channelMembers?.[user]?.user_image} borderRadius={'md'} boxSize='40px' />
                <Stack spacing='1'>
                    <HStack divider={<StackDivider />} align='flex-start'>
                        <Text fontSize='sm' lineHeight={'0.9'} fontWeight="bold" as='span'>{channelMembers?.[user]?.full_name ?? user}</Text>
                        <Text fontSize="xs" lineHeight={'0.9'} color="gray.500">{DateObjectToTimeString(timestamp)}</Text>
                    </HStack>
                    <MarkdownRenderer content={text} />
                </Stack>
            </HStack>
        </Box>
    )
}