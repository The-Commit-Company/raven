import { Box, HStack, Stack, Text } from "@chakra-ui/react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { useContext } from "react"
import { BiHash, BiLockAlt } from "react-icons/bi"
import { useParams } from "react-router-dom"
import { useFrappeEventListener } from "../../../hooks/useFrappeEventListener"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { AlertBanner } from "../../layout/AlertBanner"
import { PageHeader } from "../../layout/Heading/PageHeader"
import { PageHeading } from "../../layout/Heading/PageHeading"
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
    const { channelData } = useContext(ChannelContext)
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
    }

    else return (
        <>
            <PageHeader>
                {channelData &&
                    <PageHeading>
                        <HStack>
                            {channelData[0]?.type === 'Private' ? <BiLockAlt /> : <BiHash />}
                            <Text>{channelData[0]?.channel_name}</Text>
                        </HStack>
                    </PageHeading>
                }
            </PageHeader>
            <Stack h='100vh' justify={'space-between'} p={4} overflow='hidden' mt='16'>
                {data &&
                    <ChatHistory messages={data} />
                }
                <ChatInput channelID={channelID ?? ''} />
            </Stack>
        </>
    )
}