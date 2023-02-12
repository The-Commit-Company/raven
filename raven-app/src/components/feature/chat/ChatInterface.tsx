import { Box, Stack } from "@chakra-ui/react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { useParams } from "react-router-dom"
import { useFrappeEventListener } from "../../../hooks/useFrappeEventListener"
import { ChannelProvider } from "../../../utils/channel/ChannelProvider"
import { AlertBanner } from "../../layout/AlertBanner"
import { ChatHistory } from "./ChatHistory"
import { ChatInput } from "./ChatInput"

interface Message {
    text: string,
    creation: string,
    name: string,
    owner: string
}

export const ChatInterface = () => {

    const { channelID } = useParams<{ channelID: string }>()
    const { data, error, mutate } = useFrappeGetDocList<Message>('Raven Message', {
        fields: ["text", "creation", "name", "owner"],
        filters: [["channel_id", "=", channelID ?? null]],
        orderBy: {
            field: "creation",
            order: 'desc'
        }
    })

    useFrappeEventListener('message_received', (data) => {
        if (data.channel_id === channelID) {
            mutate()
        }
    })

    if (error) {
        return (
            <Box p={4}>
                <AlertBanner status='error' heading={error.message}>{error.httpStatus}: {error.httpStatusText}</AlertBanner>
            </Box>
        )
    } else return (
        <ChannelProvider>
            <Stack h='100vh' justify={'space-between'} p={4} overflow='hidden'>
                {data &&
                    <ChatHistory messages={data} />
                }
                <ChatInput channelID={channelID ?? ''} />
            </Stack>
        </ChannelProvider>
    )
}