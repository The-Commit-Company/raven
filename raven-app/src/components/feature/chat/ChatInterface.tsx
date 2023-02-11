import { Box } from "@chakra-ui/react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { useContext, useMemo } from "react"
import { useFrappeEventListener } from "../../../hooks/useFrappeEventListener"
import { ChannelContext } from "../../../utils/channel/ChannelContext"
import { ChatHistory } from "./ChatHistory"
import { ChatInput } from "./ChatInput"

interface Message {
    text: string
    user_id: string
    creation: string
    name: string
}

export const ChatInterface = () => {
    const { channelID } = useContext(ChannelContext)

    const { data, error, mutate } = useFrappeGetDocList<Message>('Message', {
        fields: ["text", "creation", "name", "user_id"],
        filters: [["channel_id", "=", channelID]],
        orderBy: {
            field: "creation",
            order: 'asc'
        }
    })

    useFrappeEventListener('message_received', (data) => {
        if (data.channel_id === channelID) {
            mutate()
            console.log('message received')
        }
    })

    const messages: Message[] = useMemo(() => {
        if (data) {
            return data.map((message) => ({
                name: message.name,
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