import { Stack } from "@chakra-ui/react"
import { ChatMessage } from "./ChatMessage/ChatMessage"
import { DividerWithText } from "../../layout/Divider/DividerWithText"
import { DateObjectToFormattedDateString } from "../../../utils/operations"
import { Message, MessagesWithDate } from "../../../types/Messaging/Message"
import { EmptyStateForChannel, EmptyStateForDM } from "../../layout/EmptyState/EmptyState"
import { useState } from "react"

interface ChatHistoryProps {
    parsed_messages: MessagesWithDate,
    isDM: number
}

export const ChatHistory = ({ parsed_messages, isDM }: ChatHistoryProps) => {

    const [isScrollable, setScrollable] = useState<boolean>(true)

    const handleScroll = (newState: boolean) => {
        setScrollable(newState)
    }

    return (
        <Stack spacing={4} justify="end" direction={"column-reverse"} overflowY={isScrollable ? "scroll" : "hidden"}>
            {Object.entries(parsed_messages).reverse().map(([date, messages]) => (
                <Stack spacing={4} key={date}>
                    <DividerWithText>
                        {DateObjectToFormattedDateString(new Date(date))}
                    </DividerWithText>
                    <Stack spacing={0}>
                        {messages.map(({ name, owner, creation, message_type, text, file, message_reactions, isContinuation }: Message) => (
                            <ChatMessage
                                key={name}
                                name={name}
                                user={owner}
                                timestamp={new Date(creation)}
                                text={message_type === 'Text' ? text : null}
                                file={message_type === 'File' ? file : null}
                                message_reactions={message_reactions}
                                image={message_type === 'Image' ? file : null}
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
