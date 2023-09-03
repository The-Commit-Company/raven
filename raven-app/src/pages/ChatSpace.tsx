import { ChannelSpace } from "@/components/feature/chat/ChatSpace/ChannelSpace"
import { DirectMessageSpace } from "@/components/feature/chat/ChatSpace/DirectMessageSpace"
import { AlertBanner, ErrorBanner } from "@/components/layout/AlertBanner"
import { FullPageLoader } from "@/components/layout/Loaders"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { Box } from "@chakra-ui/react"
import { useFrappeGetCall } from "frappe-react-sdk"
import { useParams } from "react-router-dom"

export const ChatSpace = () => {

    // only if channelID is present render ChatSpace component
    const { channelID } = useParams<{ channelID: string }>()

    if (channelID) {
        return <ChatSpaceArea channelID={channelID} />
    }

    return <Box p={2}><AlertBanner status="error" heading="No channel found" /></Box>

}

export type Member = {
    name: string
    full_name: string
    user_image: string | null
    first_name: string
    is_admin: 1 | 0
}

export type ChannelMembers = {
    [name: string]: Member
}

const ChatSpaceArea = ({ channelID }: { channelID: string }) => {

    const { channel, error, isLoading } = useCurrentChannelData(channelID)
    //TODO: create context for channel members
    const { data: channelMembers, error: errorFetchingMembers, isLoading: gettingMembers, mutate } = useFrappeGetCall<{ message: ChannelMembers }>('raven.raven_channel_management.doctype.raven_channel_member.raven_channel_member.get_channel_members', {
        channel_id: channelID
    }, undefined, {
        revalidateOnFocus: false
    })

    if (isLoading || gettingMembers) {
        <FullPageLoader />
    }

    if (error) {
        return <Box p={2}><ErrorBanner error={error} /></Box>
    }

    if (errorFetchingMembers) {
        return <Box p={2}><ErrorBanner error={errorFetchingMembers} /></Box>
    }

    if (channel) {
        // depending on whether channel is a DM or a channel, render the appropriate component
        if (channel.type === "dm") {
            return <DirectMessageSpace channelData={channel.channelData} channelMembers={channelMembers?.message ?? {}} />
        }
        return <ChannelSpace channelData={channel.channelData} channelMembers={channelMembers?.message ?? {}} updateMembers={mutate} />
    }

    return null
}