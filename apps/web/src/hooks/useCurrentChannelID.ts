import { useParams } from "react-router"

/** Gets the current channel ID from the URL */
export const useCurrentChannelID = () => {
    const params = useParams<{ id?: string }>()
    // Channel route: /:workspaceID/channel/:id. DM route: /dm-channel/:id
    return params.id || "general"
}
