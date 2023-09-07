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
import { UserContext } from "@/utils/auth/UserProvider"

interface ChatBoxBodyProps {
    channelData: ChannelListItem | DMChannelListItem
}

export const ChatBoxBody = ({ channelData }: ChatBoxBodyProps) => {

    const { currentUser } = useContext(UserContext)
    const { data, error, mutate, isLoading } = useFrappeGetCall<{ message: MessagesWithDate }>("raven.raven_messaging.doctype.raven_message.raven_message.get_messages_with_dates", {
        channel_id: channelData.name
    }, `get_messages_for_channel_${channelData.name}`, {
        revalidateOnFocus: false
    })

    useFrappeEventListener('message_updated', (data) => {
        //If the message is sent on the current channel
        if (data.channel_id === channelData.name) {
            //If the sender is not the current user
            if (data.sender !== currentUser) {
                mutate()
            }
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

    if (isLoading) {
        return <FullPageLoader />
    }

    if (error) {
        return <Box p={2}><ErrorBanner error={error} /></Box>
    }

    if (data) {
        return (
            <Stack h='calc(100vh)' justify={'flex-end'} p={4} overflow='hidden' pt='16'>
                <ChatHistory
                    parsedMessages={data.message}
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
                {channelData && channelData.is_archived == 1 && <ArchivedChannelBox channelData={channelData} channelMembers={channelMembers} />}
            </Stack>
        )
    }

    return null
}