import { Box } from "@chakra-ui/react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { useContext, useMemo } from "react"
import { ChannelContext } from "../../../utils/channel/ChannelContext"
import { ChatHistory } from "./ChatHistory"
import { ChatInput } from "./ChatInput"

interface Message {
    text: string
    user_id: string
    creation: string
}

export const ChatInterface = () => {
    const { channelID } = useContext(ChannelContext)

    const { data } = useFrappeGetDocList<Message>('Message', {
        fields: ["text", "creation"],
        filters: [["channel_id", "=", channelID]]
    })

    const messages: Message[] = useMemo(() => {
        if (data) {
            return data.map((message) => ({
                text: message.text,
                user_id: message.user_id,
                creation: message.creation
            }))
        } else {
            return []
        }
    }, [data]);

    return (
        <Box p={4}>
            <ChatHistory messages={messages} />
            <ChatInput />
        </Box>
    )
}