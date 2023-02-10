import { Avatar, Box, HStack, StackDivider, Text } from "@chakra-ui/react"
import TimeAgo from 'timeago-react'

interface ChatMessageProps {
    text: string,
    user: string,
    timestamp: string
}

export const ChatMessage = ({ text, user, timestamp }: ChatMessageProps) => {

    return (
        <Box p={4}>
            <HStack spacing={4}>
                <Avatar name={user} rounded='md' />
                <Box ml={2}>
                    <HStack divider={<StackDivider />}>
                        <Text fontWeight="bold">{user}</Text>
                        <Text fontSize="xs" color="gray.500"><TimeAgo datetime={new Date(timestamp)} opts={{ minInterval: 60 }} /></Text>
                    </HStack>
                    <Text fontSize="sm">{text}</Text>
                </Box>
            </HStack>
        </Box>
    )
}