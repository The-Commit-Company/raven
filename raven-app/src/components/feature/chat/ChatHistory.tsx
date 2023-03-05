import { Stack } from "@chakra-ui/react"
import { Message } from "../../../types/Messaging/Message"
import { ChatMessage } from "./ChatMessage"

interface ChatHistoryProps {
    messages: Message[]
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {
    return (
        <Stack spacing={4} justify='end' direction={'column-reverse'} overflow={'scroll'}>
            {messages.map((message) => {
                if (message.message_type === 'Text') {
                    return <ChatMessage
                        key={message.name}
                        name={message.name}
                        text={message.text}
                        user={message.owner}
                        timestamp={new Date(message.creation)} />
                } else if (message.message_type === 'File') {
                    return <ChatMessage
                        key={message.name}
                        name={message.name}
                        file={message.file}
                        user={message.owner}
                        timestamp={new Date(message.creation)} />
                } else if (message.message_type === 'Image') {
                    return <ChatMessage
                        key={message.name}
                        name={message.name}
                        image={message.file}
                        user={message.owner}
                        timestamp={new Date(message.creation)} />
                }
            })}
        </Stack>
    )
}