import { Avatar, Box, HStack, StackDivider, Text } from "@chakra-ui/react"
import TimeAgo from 'timeago-react'
import { HtmlRenderer } from "../markdown-viewer/HTMLRenderer"

interface ChatMessageProps {
    text: string,
    user: string,
    timestamp: string
}

export const ChatMessage = ({ text, user, timestamp }: ChatMessageProps) => {

    return (
        <Box py={4} px='2'>
            <HStack spacing={4} alignItems='start'>
                <Avatar name={user} rounded='4px' boxSize='40px' />
                <Box>
                    <HStack divider={<StackDivider />}>
                        <Text fontWeight="bold">{user}</Text>
                        <Text fontSize="xs" color="gray.500"><TimeAgo datetime={new Date(timestamp)} opts={{ minInterval: 60 }} /></Text>
                    </HStack>
                    <HtmlRenderer htmlString={text} />
                </Box>
            </HStack>
        </Box>
    )
}