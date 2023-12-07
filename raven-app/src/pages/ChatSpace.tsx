import { ChannelSpace } from "@/components/feature/chat/chat-space/ChannelSpace"
import { DirectMessageSpace } from "@/components/feature/chat/chat-space/DirectMessageSpace"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { FullPageLoader } from "@/components/layout/Loaders"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { ChannelMembersProvider } from "@/utils/channel/ChannelMembersProvider"
import { useEffect } from "react"
import { Box } from '@radix-ui/themes'
import { useParams } from "react-router-dom"
import { useSWRConfig } from "frappe-react-sdk"

const ChatSpace = () => {

    // only if channelID is present render ChatSpaceArea component'
    const { channelID } = useParams<{ channelID: string }>()
    // const className = 'bg-white dark:from-accent-1 dark:to-95% dark:to-accent-2 dark:bg-gradient-to-b'

    return <Box>
        {channelID && <ChatSpaceArea channelID={channelID} />}
    </Box>

}

export const Component = ChatSpace

const ChatSpaceArea = ({ channelID }: { channelID: string }) => {

    const { channel, error, isLoading } = useCurrentChannelData(channelID)
    const { mutate, cache } = useSWRConfig()

    useEffect(() => {
        //If the cached value of unread message count is 0, then no need to update it
        const channels = cache.get('unread_channel_count')?.data?.message?.channels
        if (channels) {
            const cached_channel = channels.find((channel: any) => channel.name === channelID)
            if (cached_channel && cached_channel.unread_count === 0) {
            } else {
                mutate('unread_channel_count')
            }
        } else {
            mutate('unread_channel_count')
        }
    }, [channelID])

    return <Box>
        {isLoading && <FullPageLoader />}
        <ErrorBanner error={error} />
        {channel && <ChannelMembersProvider channelID={channelID}>
            {channel.type === "dm" ?
                <DirectMessageSpace channelData={channel.channelData} />
                : <ChannelSpace channelData={channel.channelData} />
            }
        </ChannelMembersProvider>}
    </Box>
}