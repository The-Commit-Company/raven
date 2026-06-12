import { Navigate, useParams } from "react-router-dom"
import { useAtomValue } from "jotai"
import { useIsMobile } from "@hooks/use-mobile"
import { lastChannelAtom, lastWorkspaceAtom } from "@utils/lastVisitedAtoms"

/**
 * Redirects to the default channel for a workspace
 * Uses "general" as the default channel, or the last visited channel if available
 */
export const WorkspaceRedirect = () => {
    const { workspaceID } = useParams<{ workspaceID: string }>()
    const isMobile = useIsMobile()
    const lastWorkspace = useAtomValue(lastWorkspaceAtom)
    const lastChannel = useAtomValue(lastChannelAtom)

    if (!workspaceID) {
        return <Navigate to="/" replace />
    }

    // On mobile the channel sidebar IS the workspace index page — don't
    // auto-open a channel over it (same as DirectMessagesIndex)
    if (isMobile) {
        return null
    }

    // Only reuse the last channel if it was visited in THIS workspace —
    // channel ids don't transfer across workspaces
    const channelId = (lastWorkspace === workspaceID ? lastChannel : "") || "general"

    const workspaceSlug = encodeURIComponent(workspaceID)

    return <Navigate to={`/${workspaceSlug}/${encodeURIComponent(channelId)}`} replace />
}
