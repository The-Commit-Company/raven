import { Stack } from "@chakra-ui/react"
import { Message } from "../../../types/Messaging/Message"
import { ChatMessage } from "./ChatMessage"

interface ChatHistoryProps {
    messages: Message[]
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {
    return (
        <Stack spacing={4} justify='end' direction={'column-reverse'} h='80vh' overflow={'scroll'}>
            {messages.map((message) => {
                return <ChatMessage key={message.name} text={message.text} user={message.owner} timestamp={message.creation} />
            })}
        </Stack>
    )
}