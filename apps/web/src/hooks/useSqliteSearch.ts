import { useDebounce } from "@raven/lib/hooks/useDebounce"
import { useFrappeGetCall } from "frappe-react-sdk"
import { useMemo } from "react"
import { expandFileTypeGroups } from "@components/common/SearchFilters/FileTypeFilter"
import { SearchFilters } from "@components/common/SearchFilters/types";

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
    is_thread_message?: 1 | 0;
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

type ApiFilters = Record<string, string | number | string[]>

const normalizeFilters = (filters: SearchFilters): ApiFilters => {
    // remove empty values and expand file type groups
    const out: ApiFilters = {}
    for (const [key, value] of Object.entries(filters)) {
        if (key === 'query') continue
        if (value === '' || value === null || value === undefined) continue
        if (Array.isArray(value) && value.length === 0) continue
        if (key === 'file_type' && Array.isArray(value)) {
            out[key] = expandFileTypeGroups(value)
        }
        else {
            out[key] = value as string | number | string[]
        }
    }
    return out
}

export const useSqliteSearch = (query?: string, filters?: SearchFilters, limit: number = 20) => {
    const debouncedQuery = useDebounce(query, 200)

    const apiFilters = useMemo(() => {
        if (filters) {
            return normalizeFilters(filters)
        }
    }, [JSON.stringify(filters)])

    const swrKey = useMemo(() =>
        `raven.api.search.sqlite_search?query=${debouncedQuery}&filters=${JSON.stringify(apiFilters)}&limit=${limit}`,
        [debouncedQuery, apiFilters, limit]
    )

    const { data, error, isLoading, mutate } = useFrappeGetCall<{
        message: SearchResult[]
    }>(
        'raven.api.search.sqlite_search',
        {
            query: debouncedQuery,
            filters: apiFilters,
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
