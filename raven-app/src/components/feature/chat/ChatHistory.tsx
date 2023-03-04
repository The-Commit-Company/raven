import { Stack } from "@chakra-ui/react"
import { Message } from "../../../types/Messaging/Message"
import { ChatMessage } from "./ChatMessage"

interface ChatHistoryProps {
    messages: Message[]
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {
    return (
        <Stack spacing={4} justify='end' direction={'column-reverse'} h='70vh' overflow={'scroll'}>
            {messages.map((message) => {
                return <ChatMessage key={message.name} name={message.name} text={message.text} user={message.owner} timestamp={new Date(message.creation)} />
            })}
        </Stack>
    )
}