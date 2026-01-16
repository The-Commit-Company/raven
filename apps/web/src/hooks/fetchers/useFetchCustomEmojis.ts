import { useFrappeGetDocList } from "frappe-react-sdk"
import { RavenCustomEmoji } from '@raven/types/RavenMessaging/RavenCustomEmoji'
import { PaginationState, SortingState } from "src/types/DataTable"


export const useFetchCustomEmojis = (sorting?: SortingState, pagination?: PaginationState) => {
    const { data, isLoading, error, mutate } = useFrappeGetDocList<RavenCustomEmoji>("Raven Custom Emoji", {
        fields: ["name", "emoji_name", "image", "keywords", "owner", "creation"],
        orderBy: sorting ? {
            field: sorting.field,
            order: sorting.order
        } : undefined,
        limit_start: pagination?.pageIndex ?? 0,
        limit: pagination?.pageSize ?? 5
    }, undefined, {
        errorRetryCount: 2
    })

    return { data, isLoading, error, mutate }
}
