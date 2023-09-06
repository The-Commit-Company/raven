import { Box, Stack } from "@chakra-ui/react"
import { ChatHistory } from "./ChatHistory"
import { useFrappeEventListener, useFrappeGetCall } from "frappe-react-sdk"
import { Message, MessagesWithDate } from "../../../../../../types/Messaging/Message"
import { FullPageLoader } from "@/components/layout/Loaders"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { useContext, useMemo, useState } from "react"
import { ArchivedChannelBox } from "../chat-footer/ArchivedChannelBox"
import { ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { JoinChannelBox } from "../chat-footer/JoinChannelBox"
import { ChatInput } from "../chat-input"
import { useUserData } from "@/hooks/useUserData"
import { ChannelMembersContext, ChannelMembersContextType } from "@/utils/channel/ChannelMembersProvider"

interface ChatBoxBodyProps {
    channelData: ChannelListItem | DMChannelListItem
}

export const ChatBoxBody = ({ channelData }: ChatBoxBodyProps) => {

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
    const { channelMembers } = useContext(ChannelMembersContext) as ChannelMembersContextType

    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

    const handleReplyAction = (message: Message) => {
        setSelectedMessage(message)
    }

    const handleCancelReply = () => {
        setSelectedMessage(null)
    }

    const isUserInChannel = useMemo(() => {
        if (user && channelMembers) {
            return user in channelMembers
        }
        return false
    }, [user, channelMembers])

    if (data) {
        return (
            <Stack h='calc(100vh)' justify={'flex-end'} p={4} overflow='hidden' pt='16'>
                <ChatHistory
                    parsedMessages={data.message}
                    updateMessages={mutate}
                    replyToMessage={handleReplyAction}
                    channelData={channelData} />
                {channelData?.is_archived == 0 && ((isUserInChannel || channelData?.type === 'Open') &&
                    <ChatInput
                        channelID={channelData?.name}
                        selectedMessage={selectedMessage}
                        handleCancelReply={handleCancelReply}
                        channelData={channelData}
                        channelMembers={channelMembers} />)}
                {channelData?.is_archived == 0 && (!isUserInChannel && channelData?.type !== 'Open' &&
                    <JoinChannelBox
                        channelData={channelData}
                        channelMembers={channelMembers}
                        user={user} />)}
                {channelData && channelData.is_archived == 1 && <ArchivedChannelBox channelData={channelData} />}
            </Stack>
        )
    }

    return null
}