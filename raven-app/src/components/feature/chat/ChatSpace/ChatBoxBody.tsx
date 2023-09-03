import { Box, Stack } from "@chakra-ui/react"
import { ChatHistory } from "../ChatHistory"
import { useFrappeEventListener, useFrappeGetCall } from "frappe-react-sdk"
import { Message, MessagesWithDate } from "../../../../../../types/Messaging/Message"
import { FullPageLoader } from "@/components/layout/Loaders"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { useState } from "react"
import { ChannelMembers } from "@/pages/ChatSpace"
import { ArchivedChannelBox } from "./ArchivedChannelBox"
import { ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { JoinChannelBox } from "./JoinChannelBox"
import { ChatInput } from "../ChatInput"
import { useUserData } from "@/hooks/useUserData"

interface ChatBoxBodyProps {
    channelData: ChannelListItem | DMChannelListItem,
    channelMembers: ChannelMembers,
    updateMembers?: () => void
}

export const ChatBoxBody = ({ channelData, channelMembers, updateMembers }: ChatBoxBodyProps) => {

    const { data, error, mutate, isLoading } = useFrappeGetCall<{ message: MessagesWithDate }>("raven.raven_messaging.doctype.raven_message.raven_message.get_messages_with_dates", {
        channel_id: channelData?.name
    }, undefined, {
        revalidateOnFocus: false
    })

    if (isLoading) {
        <FullPageLoader />
    }

    if (error) {
        <Box p={2}><ErrorBanner error={error} /></Box>
    }

    useFrappeEventListener('message_updated', (data) => {
        if (data.channel_id === channelData?.name) {
            mutate()
        }
    })

    const { name: user } = useUserData()

    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

    const handleReplyAction = (message: Message) => {
        setSelectedMessage(message)
    }

    const handleCancelReply = () => {
        setSelectedMessage(null)
    }

    if (data) {
        return (
            <Stack h='calc(100vh)' justify={'flex-end'} p={4} overflow='hidden' pt='16'>
                <ChatHistory
                    parsedMessages={data.message}
                    updateMessages={mutate}
                    replyToMessage={handleReplyAction}
                    channelID={channelData?.name}
                    channelMembers={channelMembers}
                    updateMembers={updateMembers} />
                {channelData?.is_archived == 0 && ((user && user in channelMembers) || channelData?.type === 'Open' ?
                    <ChatInput
                        channelID={channelData?.name}
                        selectedMessage={selectedMessage}
                        handleCancelReply={handleCancelReply} />
                    :
                    (updateMembers && <JoinChannelBox
                        channelData={channelData}
                        channelMembers={channelMembers}
                        updateMembers={updateMembers}
                        user={user} />))}
                {channelData && channelData.is_archived == 1 && <ArchivedChannelBox channel_name={channelData.channel_name} />}
            </Stack>
        )
    }

    return null
}