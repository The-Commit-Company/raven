import React from "react"
import { Stack } from "@chakra-ui/react"
import { Message } from "../../../types/Messaging/Message"
import { ChatMessage } from "./ChatMessage"
import { DividerWithText } from "../../layout/Divider/DividerWithText"
import { DateObjectToFormattedDateString } from "../../../utils/operations"

interface ChatHistoryProps {
    messages: Message[]
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {

    // If two consecutive messages are from the same user and are text messages,
    // then the second message is a continuation of the first message
    // if sent within 2 minutes of the first message
    const messagesWithContinuation = messages.reverse().map((message, index) => {
        if (index === 0) {
            return {
                ...message,
                isContinuation: false
            }
        }
        const previousMessage = messages[index - 1]
        if (message.owner === previousMessage.owner && message.message_type === 'Text' && previousMessage.message_type === 'Text') {
            const timeDifference = new Date(message.creation).getTime() - new Date(previousMessage.creation).getTime()
            if (timeDifference < 120000) {
                return {
                    ...message,
                    isContinuation: true
                }
            }
        }
        return {
            ...message,
            isContinuation: false
        }
    })

    // Group the messages by date
    const messageGroups: Record<string, Message[]> = {};
    messagesWithContinuation.forEach((message) => {
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
                        {DateObjectToFormattedDateString(new Date(date))}
                    </DividerWithText>
                </React.Fragment>
            ))}
        </Stack>
    )

}