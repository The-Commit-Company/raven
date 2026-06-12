import { Outlet, useMatch } from 'react-router'
import { ChannelSidebar } from '@components/channel-sidebar/ChannelSidebar'
import AppHeader from '@components/features/header/AppHeader'
import AppMobileFooter from '@components/features/header/AppMobileFooter'
import { useIsMobile } from '@hooks/use-mobile'

/**
 * Slack-style columns: the channel sidebar is a FULL-HEIGHT column with its
 * own header (workspace switcher + menu), and the AppHeader spans only the
 * content column — structure does the alignment, no positioning tricks.
 */
const WorkspaceLayout = () => {
    const isMobile = useIsMobile()
    // The layout mounts above the `:id` route, so useParams can't see the
    // channel (params only include matches up to this depth) — match the
    // path instead; end: false keeps matching with a thread drawer open
    const channelMatch = useMatch({ path: '/:workspaceID/:id', end: false })
    const hasChannelOpen = Boolean(channelMatch)

    // Desktop: sidebar always. Mobile: the sidebar IS the workspace page —
    // it hides when a channel is open (same pattern as DirectMessages)
    const shouldShowSidebar = !isMobile || !hasChannelOpen

    return (
        <div className='flex flex-col h-full min-h-0 w-full'>
            <div className='flex min-h-0 flex-1'>
                {shouldShowSidebar && (
                    <div className='md:w-(--sidebar-width) w-full shrink-0 min-h-0 border-r border-outline-gray-1'>
                        <ChannelSidebar />
                    </div>
                )}

                <div className='flex min-w-0 min-h-0 flex-1 flex-col'>
                    {/* Mobile gets its top bar from the sidebar header (list)
                        or the ChannelHeader (channel) — no AppHeader there */}
                    {!isMobile && <AppHeader />}
                    <Outlet />
                </div>
            </div>

            {!hasChannelOpen && <AppMobileFooter />}
        </div>
    )
}

export default WorkspaceLayout
