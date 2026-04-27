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

/**
 * Hook to search messages, files, links, polls and threads via the sqlite FTS index.
 *
 * Sqlite FTS only does prefix match for tokens >= 4 chars, so short queries return only
 * exact-token matches and feel broken (e.g. "he" misses "hello"). To smooth this over,
 * when the query is shorter than 4 chars we send an empty query to the server and
 * substring-filter the unfiltered result set client-side using `getSearchTextField`.
 *
 * @param query - User search input. Debounced 200ms before hitting the server.
 * @param filters - Server-side filters (channel, author, message_type, etc.).
 * @param limit - Max rows fetched. Default 20. Use 100+ when client-side filtering is enabled
 *                so the short-query fallback has enough rows to filter against.
 * @param getSearchTextField - callback to select the text to substring-match for short queries.
 *                             Omit to disable the short-query fallback. 
 */
export const useSqliteSearch = (
    query?: string,
    filters?: SearchFilters,
    limit: number = 20,
    getSearchTextField?: (r: SearchResult) => string | undefined,
) => {
    const trimmed = (query ?? '').trim()
    const longEnoughSearchQuery = trimmed.length >= 4 ? query : ''
    const debouncedQuery = useDebounce(longEnoughSearchQuery, 200)

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

    const rawResults = data?.message || []

    const results = useMemo(() => {
        if (longEnoughSearchQuery || !trimmed || !getSearchTextField) return rawResults
        const q = trimmed.toLowerCase()
        return rawResults.filter(r => getSearchTextField(r)?.toLowerCase().includes(q))
    }, [rawResults, trimmed, longEnoughSearchQuery, getSearchTextField])

    return {
        results,
        error,
        isLoading,
        mutate
    }
}
