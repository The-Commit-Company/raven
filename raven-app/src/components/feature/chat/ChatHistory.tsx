import React from "react"
import { Stack, Text } from "@chakra-ui/react"
import { Message } from "../../../types/Messaging/Message"
import { ChatMessage } from "./ChatMessage"
import { DividerWithText } from "../../layout/Divider/DividerWithText"
import { DateObjectToFormattedDateString } from "../../../utils/operations"

interface ChatHistoryProps {
    messages: Message[]
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {

    // Group the messages by date
    const messageGroups: Record<string, Message[]> = {};
    messages.forEach((message) => {
        const date = new Date(message.creation).toDateString()
        if (!messageGroups[date]) {
            messageGroups[date] = []
        }
        messageGroups[date].push(message)
    })

    return (
        <Stack spacing={4} justify="end" direction="column-reverse" overflowY="scroll">
            {Object.entries(messageGroups).map(([date, messages]) => (
                <React.Fragment key={date}>
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
                    <DividerWithText>
                        <Text fontSize="sm" color="gray.500">
                            {DateObjectToFormattedDateString(new Date(date))}
                        </Text>
                    </DividerWithText>
                </React.Fragment>
            ))}
        </Stack>
    )

}