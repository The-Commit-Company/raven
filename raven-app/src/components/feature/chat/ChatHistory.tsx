import { Stack } from "@chakra-ui/react"
import { ChatMessage } from "./ChatMessage/ChatMessage"
import { DividerWithText } from "../../layout/Divider/DividerWithText"
import { DateObjectToFormattedDateString } from "../../../utils/operations"
import { MessagesWithDate } from "../../../types/Messaging/Message"
import { EmptyStateForChannel, EmptyStateForDM } from "../../layout/EmptyState/EmptyState"
import { useEffect, useRef, useState } from "react"

interface ChatHistoryProps {
    parsed_messages: MessagesWithDate[],
    isDM: number
}

export const ChatHistory = ({ parsed_messages, isDM }: ChatHistoryProps) => {

    const [isScrollable, setScrollable] = useState<boolean>(true)

    const handleScroll = (newState: boolean) => {
        setScrollable(newState)
    }


    return (
        <Stack spacing={4} justify="end" direction="column-reverse" overflowY={isScrollable ? "scroll" : "hidden"} id={'scrollable-stack'}>
            {parsed_messages.map((block, index) => {
                if (block.block_type === "message_group") {
                    return block.data.map(({ name, owner, creation, message_type, text, file, message_reactions }) => (
                        <ChatMessage
                            key={name}
                            name={name}
                            user={owner}
                            timestamp={new Date(creation)}
                            text={message_type === 'Text' ? text : null}
                            file={message_type === 'File' ? file : null}
                            message_reactions={message_reactions}
                            image={message_type === 'Image' ? file : null}
                            handleScroll={handleScroll}
                        />
                    ))
                } else if (block.block_type === "message") {
                    return block.data.map(({ name, owner, creation, message_type, text, file, message_reactions }) => (
                        <ChatMessage
                            key={name}
                            name={name}
                            user={owner}
                            timestamp={new Date(creation)}
                            text={message_type === 'Text' ? text : null}
                            file={message_type === 'File' ? file : null}
                            message_reactions={message_reactions}
                            image={message_type === 'Image' ? file : null}
                            handleScroll={handleScroll}
                        />
                    ))
                } else if (block.block_type === "date") {
                    return (
                        <DividerWithText key={index}>
                            {DateObjectToFormattedDateString(new Date(block.data))}
                        </DividerWithText>
                    )
                } else {
                    return null
                }
            })}
            {isDM === 1 ? <EmptyStateForDM /> : <EmptyStateForChannel />}
        </Stack>
    )
}
