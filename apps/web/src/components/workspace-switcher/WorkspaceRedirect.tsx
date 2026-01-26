import { Navigate, useParams } from "react-router-dom"

/**
 * Redirects to the default channel for a workspace
 * Uses "general" as the default channel, or the last visited channel if available
 */
export const WorkspaceRedirect = () => {
    const { workspaceID } = useParams<{ workspaceID: string }>()
    
    if (!workspaceID) {
        return <Navigate to="/" replace />
    }

    // Try to get last channel from localStorage
    let lastChannel = ""
    try {
        lastChannel = JSON.parse(localStorage.getItem('ravenLastChannel') ?? '""') ?? ''
    } catch {
        // Ignore parse errors
    }

    const workspaceSlug = encodeURIComponent(workspaceID)
    const channelId = lastChannel || "general"
    
    return <Navigate to={`/${workspaceSlug}/channel/${encodeURIComponent(channelId)}`} replace />
}
