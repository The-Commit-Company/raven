import { ChannelSpace } from "@/components/feature/chat/chat-space/ChannelSpace"
import { DirectMessageSpace } from "@/components/feature/chat/chat-space/DirectMessageSpace"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { FullPageLoader } from "@/components/layout/Loaders/FullPageLoader"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { useEffect } from "react"
import { Box, Grid } from '@radix-ui/themes'
import { Outlet, useParams, useSearchParams } from "react-router-dom"
import { useSWRConfig } from "frappe-react-sdk"
import { UnreadChannelCountItem, UnreadCountData } from "@/utils/channel/ChannelListProvider"
import { useIsMobile } from "@/hooks/useMediaQuery"

const ChatSpace = () => {

    // only if channelID is present render ChatSpaceArea component'
    const { channelID } = useParams<{ channelID: string }>()
    // const className = 'bg-white dark:from-accent-1 dark:to-95% dark:to-accent-2 dark:bg-gradient-to-b'
    return <div className="scroll-smooth">
        {channelID && <ChatSpaceArea channelID={channelID} />}
    </div>

}

export const Component = ChatSpace

const ChatSpaceArea = ({ channelID }: { channelID: string }) => {

    const { threadID } = useParams()

    const isMobile = useIsMobile()

    const { channel, error, isLoading } = useCurrentChannelData(channelID)
    const { mutate, cache } = useSWRConfig()

    const [searchParams] = useSearchParams()

    const baseMessage = searchParams.get('message_id')

    useEffect(() => {

        // setting last visited channel in local storage
        localStorage.setItem("ravenLastChannel", channelID)

        const unread_count = cache.get('unread_channel_count')

        // If unread count is present
        if (unread_count?.data) {
            // If the user entered the channel without a base message
            if (!baseMessage) {
                // Mutate the unread channel count to set the unread count of the current channel to 0
                //@ts-ignore
                mutate('unread_channel_count', (d: { message: UnreadCountData } | undefined) => {
                    if (d) {
                        const newChannels: UnreadChannelCountItem[] = d.message.map(c => {
                            if (c.name === channelID)
                                return {
                                    ...c,
                                    unread_count: 0
                                }
                            return c
                        })


                        return {
                            message: newChannels,
                        }
                    }
                    else {
                        return d
                    }


                }, {
                    revalidate: false
                })
            }
        }

    }, [channelID, baseMessage])

    return <Grid columns={threadID && !isMobile ? "2" : "1"} gap="2" rows="repeat(2, 64px)" width="auto" className="dark:bg-gray-2 bg-white h-screen">
        {threadID && isMobile ? null : <Box>
            {isLoading && <FullPageLoader />}
            <ErrorBanner error={error} />
            {channel ?
                channel.type === "dm" ?
                    <DirectMessageSpace channelData={channel.channelData} />
                    : <ChannelSpace channelData={channel.channelData} />
                : null}
        </Box>}
        <Outlet />
    </Grid>
}