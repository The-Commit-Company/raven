import { Stack } from "@chakra-ui/react"
import { ChatMessage } from "./ChatMessage"
import { DividerWithText } from "../../layout/Divider/DividerWithText"
import { DateObjectToFormattedDateString } from "../../../utils/operations"
import { Message, MessageWithContinuationCheck } from "../../../types/Messaging/Message"
import { EmptyStateForChannel, EmptyStateForDM } from "../../layout/EmptyState/EmptyState"
import { useState } from "react"

interface ChatHistoryProps {
    messages: Message[],
    isDM: number
}

export const ChatHistory = ({ messages, isDM }: ChatHistoryProps) => {

    // Sort the messages by creation date
    messages.sort((a, b) => {
        const timeA = new Date(a.creation).getTime()
        const timeB = new Date(b.creation).getTime()
        return timeA - timeB
    })

    // If two consecutive messages are from the same user and are of the same type,
    // then the second message is a continuation of the first message
    // if sent within 2 minutes of the first message
    const messagesWithContinuation = []
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        const previousMessage = messages[i - 1]
        const isContinuation = (
            previousMessage &&
            message.owner === previousMessage.owner &&
            new Date(message.creation).getTime() - new Date(previousMessage.creation).getTime() < 120000
        )
        messagesWithContinuation.push({
            ...message,
            isContinuation
        })
    }

    // Group the messages by date
    const messageGroups: Record<string, MessageWithContinuationCheck[]> = {}
    for (const message of messagesWithContinuation) {
        const date = new Date(message.creation).toDateString()
        if (!messageGroups[date]) {
            messageGroups[date] = []
        }
        messageGroups[date].push(message)
    }

    const [isScrollable, setScrollable] = useState<Boolean>(true)

    const handleScroll = (newState: boolean) => {
        setScrollable(newState);
    };

    return (
        <Stack spacing={4} justify="end" direction={"column-reverse"} overflowY={isScrollable ? "scroll" : "hidden"}>
            {Object.entries(messageGroups).reverse().map(([date, messages]) => (
                <Stack spacing={4} key={date}>
                    <DividerWithText>
                        {DateObjectToFormattedDateString(new Date(date))}
                    </DividerWithText>
                    <Stack spacing={0}>
                        {messages.map(({ name, owner, creation, message_type, text, file, message_reactions, isContinuation }) => (
                            <ChatMessage
                                key={name}
                                name={name}
                                user={owner}
                                timestamp={new Date(creation)}
                                text={message_type === 'Text' ? text : undefined}
                                file={message_type === 'File' ? file : undefined}
                                message_reactions={message_reactions}
                                image={message_type === 'Image' ? file : undefined}
                                isContinuation={isContinuation}
                                handleScroll={handleScroll}
                            />
                        ))}
                    </Stack>
                </Stack>
            ))}
            {isDM === 1 ? <EmptyStateForDM /> : <EmptyStateForChannel />}
        </Stack>
    )

}
