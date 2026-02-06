import { useParams } from "react-router"

/** Gets the current channel ID from the URL */
export const useCurrentChannelID = () => {
    const params = useParams<{ id?: string; dm_channel_id?: string }>()
    // DM route: /direct-messages/:dm_channel_id
    if (params.dm_channel_id) return params.dm_channel_id
    // Channel route: /:workspaceID/channel/:id
    return params.id || "general"
}
