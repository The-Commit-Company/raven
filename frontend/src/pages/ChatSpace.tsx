import { ChannelSpace } from "@/components/feature/chat/chat-space/ChannelSpace"
import { DirectMessageSpace } from "@/components/feature/chat/chat-space/DirectMessageSpace"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { FullPageLoader } from "@/components/layout/Loaders/FullPageLoader"
import { OpsActivityRail } from "@/components/feature/ops/OpsActivityRail"
import { useRavenOpsFeed } from "@/hooks/useOpsMaturity"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { useCallback, useEffect } from "react"
import { Box, Grid } from '@radix-ui/themes'
import { Outlet, useParams, useSearchParams } from "react-router-dom"
import { useSWRConfig } from "frappe-react-sdk"
import { UnreadChannelCountItem, UnreadCountData } from "@/utils/channel/ChannelListProvider"
import { useIsMobile } from "@/hooks/useMediaQuery"
import { useSetAtom } from "jotai"
import { lastChannelAtom } from "@/utils/lastVisitedAtoms"

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

    const { threadID, workspaceID } = useParams()

    const isMobile = useIsMobile()

    const { channel, error, isLoading } = useCurrentChannelData(channelID)
    const { mutate, cache } = useSWRConfig()

    const [searchParams, setSearchParams] = useSearchParams()

    const baseMessage = searchParams.get('message_id')
    const selectedOpsEvent = searchParams.get('ops_event')

    const setLastChannel = useSetAtom(lastChannelAtom)
    const { data: ravenOpsFeed, error: ravenOpsError, isLoading: isLoadingOpsFeed } = useRavenOpsFeed(workspaceID, channelID, 12)
    const feed = ravenOpsFeed?.message
    const canShowOpsRail = !!feed?.is_ops_channel
    const showOpsRail = !!(!threadID && canShowOpsRail && searchParams.get('ops') === '1')

    const updateOpsRail = useCallback((nextOpen: boolean, eventName?: string | null) => {
        const nextParams = new URLSearchParams(searchParams)

        if (nextOpen) {
            nextParams.set('ops', '1')
            const nextEventName = eventName || feed?.events?.[0]?.name
            if (nextEventName) {
                nextParams.set('ops_event', nextEventName)
            }
        } else {
            nextParams.delete('ops')
            nextParams.delete('ops_event')
        }

        setSearchParams(nextParams, { replace: true })
    }, [feed?.events, searchParams, setSearchParams])

    const toggleOpsRail = useCallback(() => {
        updateOpsRail(!showOpsRail)
    }, [showOpsRail, updateOpsRail])

    const selectOpsEvent = useCallback((eventName: string) => {
        updateOpsRail(true, eventName)
    }, [updateOpsRail])

    useEffect(() => {

        // setting last visited channel in local storage
        setLastChannel(channelID)

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

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!canShowOpsRail) return
            if (event.key.toLowerCase() !== 'o' || !event.shiftKey || event.metaKey || event.ctrlKey) {
                return
            }
            event.preventDefault()
            toggleOpsRail()
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [canShowOpsRail, toggleOpsRail])

    return <>
        {showOpsRail && isMobile ? <OpsActivityRail
            compact
            feed={feed}
            error={ravenOpsError}
            isLoading={isLoadingOpsFeed}
            selectedEventName={selectedOpsEvent}
            onSelectEvent={selectOpsEvent}
            onClose={() => updateOpsRail(false)}
        /> : null}
        <Grid
            columns={threadID && !isMobile ? "2" : showOpsRail && !isMobile ? "minmax(0,1fr) 24rem" : "1"}
            gap="2"
            rows="repeat(2, 64px)"
            width="auto"
            className="dark:bg-gray-2 bg-white h-screen"
        >
            {threadID && isMobile ? null : <Box>
                {isLoading && <FullPageLoader />}
                <ErrorBanner error={error} />
                {channel ?
                    channel.type === "dm" ?
                        <DirectMessageSpace channelData={channel.channelData} />
                        : <ChannelSpace
                            channelData={channel.channelData}
                            canShowOpsRail={canShowOpsRail}
                            showOpsRail={showOpsRail}
                            onToggleOpsRail={toggleOpsRail}
                        />
                    : null}
            </Box>}
            {!threadID && showOpsRail && !isMobile ? <OpsActivityRail
                feed={feed}
                error={ravenOpsError}
                isLoading={isLoadingOpsFeed}
                selectedEventName={selectedOpsEvent}
                onSelectEvent={selectOpsEvent}
                onClose={() => updateOpsRail(false)}
            /> : null}
            <Outlet />
        </Grid>
    </>
}
