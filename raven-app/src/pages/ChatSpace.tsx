import { ChannelSpace } from "@/components/feature/chat/chat-space/ChannelSpace"
import { DirectMessageSpace } from "@/components/feature/chat/chat-space/DirectMessageSpace"
import { AlertBanner, ErrorBanner } from "@/components/layout/AlertBanner"
import { FullPageLoader } from "@/components/layout/Loaders"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { ChannelMembersProvider } from "@/utils/channel/ChannelMembersProvider"
import { Box } from "@chakra-ui/react"
import { useParams } from "react-router-dom"

export const ChatSpace = () => {

    // only if channelID is present render ChatSpaceArea component'
    const { channelID } = useParams<{ channelID: string }>()

    if (channelID) {
        return <ChatSpaceArea channelID={channelID} />
    }

    return <Box p={2}><AlertBanner status="error" heading="No channel found" /></Box>

}

const ChatSpaceArea = ({ channelID }: { channelID: string }) => {

    const { channel, error, isLoading } = useCurrentChannelData(channelID)

    if (isLoading) {
        <FullPageLoader />
    }

    if (error) {
        return <Box p={2}><ErrorBanner error={error} /></Box>
    }

    if (channel) {
        // depending on channel type render ChannelSpace or DirectMessageSpace
        return (
            <ChannelMembersProvider>
                {channel.type === "dm" ?
                    <DirectMessageSpace channelData={channel.channelData} />
                    : <ChannelSpace channelData={channel.channelData} />
                }
            </ChannelMembersProvider>
        )
    }

    return null
}