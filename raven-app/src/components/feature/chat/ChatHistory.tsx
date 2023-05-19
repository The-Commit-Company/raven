import { Stack } from "@chakra-ui/react"
import { DividerWithText } from "../../layout/Divider/DividerWithText"
import { DateObjectToFormattedDateString } from "../../../utils/operations"
import { Message, MessagesWithDate } from "../../../types/Messaging/Message"
import { EmptyStateForChannel, EmptyStateForDM } from "../../layout/EmptyState/EmptyState"
import { useState } from "react"
import { ChatMessageBox } from "./ChatMessage/ChatMessageBox"
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer"
import { FileMessage } from "./ChatMessage/FileMessage"
import { ImageMessage } from "./ChatMessage/ImageMessage"

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
                        {messages.map((message: Message) => (
                            <ChatMessageBox
                                key={message.name}
                                message={message}
                                handleScroll={handleScroll}
                            >
                                {message.message_type === 'Text' && message.text &&
                                    <MarkdownRenderer content={message.text} />
                                }
                                {message.message_type === 'File' && message.file &&
                                    <FileMessage file={message.file} owner={message.owner} timestamp={message.creation} />
                                }
                                {message.message_type === 'Image' && message.file &&
                                    <ImageMessage image={message.file} owner={message.owner} timestamp={message.creation} />
                                }
                            </ChatMessageBox>
                        ))}
                    </Stack>
                </Stack>
            ))}
            {isDM === 1 ? <EmptyStateForDM /> : <EmptyStateForChannel />}
        </Stack>
    )
}
