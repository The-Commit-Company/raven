import { MainPageSkeleton } from "@components/features/main-page/MainPageSkeleton"
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert"
import { useIsMobile } from "@hooks/use-mobile"
import { useLoadUsers } from "@hooks/useLoadUsers"
import { hasRole } from "@lib/permissions"
import _ from "@lib/translate"
import { AlertCircle } from "lucide-react"
import { Outlet } from "react-router"
import PrimarySidebar from "./PrimarySidebar/PrimarySidebar"
import CommandMenu from "@components/features/cmdk/CommandMenu"
import { AttachmentPreviewModal } from "@components/features/message/renderers/AttachmentPreviewModal"

/**
 * The AppShell is used to wrap the entire application and provide all the utilities
 * 
 * It includes:
 * 1. Protected Route - if the user is not logged in, redirect to Frappe's login page with the correct route redirect
 * 2. User list fetching
 * 3. Realtime event listeners for the following:
 *  - user list
 *  - workspace list
 *  - channel membership update
 *  - unread message counts (threads, channels, DMs)
 * 4. Initialize push notifications
 * 5. BroadcastChannel listener for user session state updates from Frappe
 * 6. App Update listener to track app updates and show a notification to the user
 * 7. Realtime connection listeners to check if the websocket connection is working + retry mechanism to reconnect to channels once restored
 * 
 */
const AppShell = () => {
    return (
        <ProtectedRoute>
            <AppListeners>
                <AppShellLayout>
                    <Outlet />
                </AppShellLayout>
            </AppListeners>
        </ProtectedRoute>
    )
}

/** Check if the user has the Raven User role */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {

    const hasRavenUserRole = hasRole('Raven User')

    if (!hasRavenUserRole) {
        return <div className="h-screen w-screen flex justify-center items-center">
            <div>
                <Alert
                    theme="red"
                >
                    <AlertCircle />
                    <AlertTitle>{_('You cannot access Raven.')}</AlertTitle>
                    <AlertDescription>{_('You do not have the "Raven User" role. Please contact your system administrator.')}</AlertDescription>
                </Alert>
            </div >

        </div >
    }

    return children

}

const AppListeners = ({ children }: { children: React.ReactNode }) => {

    const isReady = useLoadUsers()

    // TODO: User list active state listener
    // TODO: Channel membership update listener
    // TODO: Unread message count listener
    // TODO: Push notification listener
    // TODO: App update listener
    // TODO: Websocket connection listener
    // TODO: Update user's active state using visibility change and idle timer

    if (!isReady) {
        return <MainPageSkeleton />
    }

    return <>
        {children}
        <CommandMenu />
        <AttachmentPreviewModal />
    </>
}

/** If opened on a desktop, show the primary sidebar at all times. If on mobile, don't show the sidebar at all - bottom bars will be controlled by the respective page */
const AppShellLayout = ({ children }: { children: React.ReactNode }) => {

    const isMobile = useIsMobile()

    if (isMobile) {
        return <div className="flex h-dvh flex-col overflow-hidden">
            {children}
        </div>
    }

    return <div className="flex h-dvh overflow-hidden">
        <PrimarySidebar />
        <main className="flex min-w-0 flex-1 flex-col">
            {children}
        </main>
    </div>
}

export default AppShell