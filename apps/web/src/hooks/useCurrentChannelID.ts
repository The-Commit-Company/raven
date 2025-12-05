import { useParams } from "react-router"

/** Gets the current channel ID from the URL */
export const useCurrentChannelID = () => {

    const { id } = useParams<{ id: string }>()

    // TODO: Remove this once we have a proper channel ID
    return id || "general"
}
