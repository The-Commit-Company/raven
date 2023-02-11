import { Box } from "@chakra-ui/react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { useMemo } from "react"
import { useFrappeEventListener } from "../../../hooks/useFrappeEventListener"
import { AlertBanner } from "../../layout/AlertBanner"
import { ChatHistory } from "./ChatHistory"
import { ChatInput } from "./ChatInput"

interface Message {
    text: string
    user_id: string
    creation: string
    name: string
}

export const ChatInterface = () => {

    const channelID = '862bf4d1ce'
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

    if (error) {
        return <AlertBanner status='error' heading={error.message}>{error.httpStatus}: {error.httpStatusText}</AlertBanner>
    } else return (
        <Box p={4}>
            <ChatHistory messages={messages} />
            <ChatInput channelID={channelID} />
        </Box>
    )
}