import { Stack } from "@chakra-ui/react"
import { ChatMessage } from "./ChatMessage"

interface ChatHistoryProps {
    messages: { text: string, user_id: string, creation: string, name: string }[]
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {
    return (
        <Stack spacing={4} justify='end' direction={'column-reverse'} h='80vh' overflow={'scroll'}>
            {messages.map((message) => {
                return <ChatMessage key={message.name} text={message.text} user={message.user_id} timestamp={message.creation} />
            })}
        </Stack>
    )
}