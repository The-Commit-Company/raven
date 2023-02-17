import { Box, Button, HStack, Stack, Text, useDisclosure } from "@chakra-ui/react"
import { useFrappeGetCall, useFrappeGetDocList } from "frappe-react-sdk"
import { useContext } from "react"
import { BiHash, BiLockAlt } from "react-icons/bi"
import { useParams } from "react-router-dom"
import { useFrappeEventListener } from "../../../hooks/useFrappeEventListener"
import { ChannelListForUser } from "../../../types/Channel/Channel"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { AlertBanner } from "../../layout/AlertBanner"
import { PageHeader } from "../../layout/Heading/PageHeader"
import { PageHeading } from "../../layout/Heading/PageHeading"
import { FullPageLoader } from "../../layout/Loaders"
import { AddChannelMemberModal } from "../channels/AddChannelMemberModal"
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
    const { channelData, channelMembers } = useContext(ChannelContext)
    const { data: channelList, error: channelListError } = useFrappeGetCall<{ message: ChannelListForUser[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")
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

    const allMembers = Object.values(channelMembers).map((member) => {
        return {
            id: member.name,
            value: member.full_name
        }
    })

    const allChannels = channelList?.message.map((channel) => {
        return {
            id: channel.name,
            value: channel.channel_name
        }
    })

    const { isOpen, onOpen, onClose } = useDisclosure()

    if (error) {
        return (
            <Box p={4}>
                <AlertBanner status='error' heading={error.message}>{error.httpStatus}: {error.httpStatusText}</AlertBanner>
            </Box>
        )
    }

    else if (allChannels && allMembers) return (
        <>
            <PageHeader>
                {channelData &&
                    <PageHeading>
                        <HStack>
                            {channelData[0]?.type === 'Private' ? <BiLockAlt /> : <BiHash />}
                            <Text>{channelData[0]?.channel_name}</Text>
                        </HStack>
                        <Button onClick={onOpen}>add members</Button>
                    </PageHeading>
                }
            </PageHeader>
            <Stack h='100vh' justify={'space-between'} p={4} overflow='hidden' mt='16'>
                {data &&
                    <ChatHistory messages={data} />
                }
                <ChatInput channelID={channelID ?? ''} allChannels={allChannels} allMembers={allMembers} />
            </Stack>
            <AddChannelMemberModal isOpen={isOpen} onClose={onClose} channel_name={channelData[0]?.channel_name} type={channelData[0]?.type} channel_id={channelID ?? ''} />
        </>
    )

    else if (channelListError) return (
        <Box p={4}>
            <AlertBanner status='error' heading={channelListError.message}>{channelListError.httpStatus}: {channelListError.httpStatusText}</AlertBanner>
        </Box>
    )

    else return (
        <FullPageLoader />
    )
}