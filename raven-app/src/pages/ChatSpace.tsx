import { ChannelSpace } from "@/components/feature/chat/ChatSpace/ChannelSpace"
import { DirectMessageSpace } from "@/components/feature/chat/ChatSpace/DirectMessageSpace"
import { AlertBanner, ErrorBanner } from "@/components/layout/AlertBanner"
import { FullPageLoader } from "@/components/layout/Loaders"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { Box } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

export const ChatSpace = () => {

    // only if channelID is present render ChatSpace component
    const { channelID } = useParams<{ channelID: string }>()

    if (channelID) {
        return <ChatSpaceArea channelID={channelID} />
    }

    return <Box p={2}><AlertBanner status="error" heading="No channel found" /></Box>

}

const ChatSpaceArea = ({ channelID }: { channelID: string }) => {

    const { channelData, error, isLoading } = useCurrentChannelData(channelID)

    if (isLoading) {
        <FullPageLoader />
    }

    if (error) {
        return <Box p={2}><ErrorBanner error={error} /></Box>
    }

    if (channelData) {
        // depending on whether channel is a DM or a channel, render the appropriate component
        if (channelData.is_direct_message) {
            return <DirectMessageSpace channelData={channelData} />
        }
        return <ChannelSpace channelData={channelData} />
    }

    return null
}