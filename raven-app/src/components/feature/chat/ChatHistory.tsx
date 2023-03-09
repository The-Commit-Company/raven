import { Stack } from "@chakra-ui/react"
import { Message } from "../../../types/Messaging/Message"
import { ChatMessage } from "./ChatMessage"

interface ChatHistoryProps {
    messages: Message[]
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {
    return (
        <Stack spacing={4} justify='end' direction='column-reverse' overflow='scroll'>
            {messages.map((message) => {
                const { name, owner, creation, message_type, text, file } = message
                return (
                    <ChatMessage
                        key={name}
                        name={name}
                        user={owner}
                        timestamp={new Date(creation)}
                        text={message_type === 'Text' ? text : undefined}
                        file={message_type === 'File' ? file : undefined}
                        image={message_type === 'Image' ? file : undefined}
                    />
                )
            })}
        </Stack>
    )
}