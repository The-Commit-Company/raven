import { useDebounce } from "@raven/lib/hooks/useDebounce"
import { useFrappeGetCall } from "frappe-react-sdk"
import { useMemo } from "react"

export type SearchResult = {
    name: string;
    id: string;
    score: number;
    original_rank: number;
    modified_rank: number;
    bm25_score: number | null;
    title: string;
    content: string;
    author: string;
    channel_id: string;
    creation: string;
    parent_channel_id?: string;
    mentions?: string;
    is_thread?: 1 | 0;
    message_type?: string;
    is_bot_message?: 1 | 0;
    bot?: string;
    poll_id?: string;
    file_type?: string;
    file_size?: number;
    internal_link?: string;
    has_link?: 1 | 0;
    preview_data?: string;
};

export const useSqliteSearch = (query: string, filters: Record<string, string | number | boolean | string[]>, limit: number = 20) => {
    const debouncedQuery = useDebounce(query, 200)

    const swrKey = useMemo(() =>
        `raven.api.search.sqlite_search?query=${debouncedQuery}&filters=${JSON.stringify(filters)}&limit=${limit}`,
        [debouncedQuery, JSON.stringify(filters), limit]
    )

    const { data, error, isLoading, mutate } = useFrappeGetCall<{
        message: SearchResult[]
    }>(
        'raven.api.search.sqlite_search',
        {
            query: debouncedQuery,
            filters,
            limit
        },
        swrKey,
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: true
        }
    )

    return {
        results: data?.message || [],
        error,
        isLoading,
        mutate
    }
}