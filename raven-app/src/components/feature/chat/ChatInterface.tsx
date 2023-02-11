import { Box, Stack } from "@chakra-ui/react"
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
        fields: ["text", "creation", "name"],
        filters: [["channel_id", "=", channelID]],
        orderBy: {
            field: "creation",
            order: 'desc'
        }
    })

    useFrappeEventListener('message_received', (data) => {
        if (data.channel_id === channelID) {
            mutate()
            console.log('message received')
        }
    })

    if (error) {
        return <AlertBanner status='error' heading={error.message}>{error.httpStatus}: {error.httpStatusText}</AlertBanner>
    } else return (
        <Stack h='100vh' justify={'space-between'} p={4} overflow='hidden'>
            {data &&
                <ChatHistory messages={data} />
            }
            <ChatInput channelID={channelID} />
        </Stack>
    )
}