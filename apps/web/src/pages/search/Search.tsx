import { useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, X } from 'lucide-react'

import SearchTabsBar, { SearchTab } from '@components/features/search/SearchTabsBar'
import { SearchFiltersBar } from '@components/features/search/SearchFiltersBar'
import { SearchActiveBadges } from '@components/features/search/SearchActiveBadges'
import SearchMessageResults from '@components/features/search/results/SearchMessageResults'
import SearchFileResults from '@components/features/search/results/SearchFileResults'
import SearchLinkResults from '@components/features/search/results/SearchLinkResults'
import SearchPollResults from '@components/features/search/results/SearchPollResults'
import { SearchFilters } from '@components/features/search/types'

import { useChannels } from '@hooks/useChannels'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@db'
import { Input } from '@components/ui/input'
import _ from '@lib/translate'

interface SearchOutletContext {
    searchValue: string
    setSearchValue: (v: string) => void
}

export default function Search() {
    const { searchValue, setSearchValue } = useOutletContext<SearchOutletContext>()
    const [searchParams, setSearchParams] = useSearchParams()

    const channelFromURL = searchParams.get('channel') ?? ''
    const userFromURL = searchParams.get('user') ?? ''
    const fileTypeFromURL = searchParams.get('file_type')?.split(',').filter(Boolean) ?? []
    const channelTypeFromURL = searchParams.get('channel_type') ?? ''
    const isDMFromURL = searchParams.get('is_dm') ? 1 : null
    const excludeDMs = channelTypeFromURL === 'Private' ? 0 : null
    const isThreadMessageFromURL = searchParams.get('is_thread_message') ? 1 : null
    const savedFromURL = searchParams.get('saved') ? 1 : null
    const isPinnedFromURL = searchParams.get('is_pinned') ? 1 : null
    const hasReactionsFromURL = searchParams.get('has_reactions') ? 1 : null
    const mentionsMeFromURL = searchParams.get('mentions_me') ? 1 : null
    const tabFromURL = (searchParams.get('tab') as SearchTab) || 'messages'

    const [activeTab, setActiveTab] = useState<SearchTab>(tabFromURL)

    const filters: SearchFilters = {
        query: searchValue || '',
        channel_id: channelFromURL,
        owner: userFromURL,
        file_type: fileTypeFromURL,
        channel_type: channelTypeFromURL,
        is_direct_message: isDMFromURL ?? excludeDMs,
        saved: savedFromURL,
        is_pinned: isPinnedFromURL,
        is_thread: null,
        is_thread_message: isThreadMessageFromURL,
        is_bot_message: null,
        has_reactions: hasReactionsFromURL,
        mentions_me: mentionsMeFromURL,
    }

    const { channels, dm_channels } = useChannels()
    const users = useLiveQuery(() => db.users.toArray(), [])

    const onTabChange = (tab: SearchTab) => {
        setActiveTab(tab)
        setSearchParams((prev) => {
            prev.set('tab', tab)
            return prev
        }, { replace: true })
    }

    const setChannelFilter = (channelId: string) => {
        setSearchParams((prev) => {
            if (channelId !== '*all') prev.set('channel', channelId)
            else prev.delete('channel')
            return prev
        }, { replace: true })
    }

    const setUserFilter = (userId: string) => {
        setSearchParams((prev) => {
            if (userId && userId !== 'all') prev.set('user', userId)
            else prev.delete('user')
            return prev
        }, { replace: true })
    }

    const searchInput = (
        <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-gray-4 pointer-events-none" />
            <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={_('Search messages, files, links, polls')}
                className="pl-9 pr-9 h-8 text-base"
                autoFocus
            />
            {searchValue && (
                <button
                    type="button"
                    onClick={() => setSearchValue('')}
                    aria-label={_('Clear search')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-gray-4 hover:text-ink-gray-8"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    )


    // TODO: Add mobile search layout
    return (
        <div className="flex flex-col h-full overflow-hidden">

            <div className="shrink-0">
                <div className="mx-auto w-full px-2 pt-2 space-y-2">
                    {searchInput}
                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                        <SearchTabsBar activeTab={activeTab} setActiveTab={onTabChange} />
                        <div className="ml-auto">
                            <SearchFiltersBar
                                filters={filters}
                                channels={channels}
                                dmChannels={dm_channels}
                                onChannelChange={setChannelFilter}
                                onUserChange={setUserFilter}
                            />
                        </div>
                    </div>
                    <SearchActiveBadges
                        filters={filters}
                        channels={channels}
                        dmChannels={dm_channels}
                        users={users ?? []}
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 px-3 md:px-0 pb-2">
                <div className="mx-auto w-full h-full">
                    {activeTab === 'messages' && <SearchMessageResults searchValue={filters.query} filters={filters} />}
                    {activeTab === 'files' && <SearchFileResults searchValue={filters.query} filters={filters} />}
                    {activeTab === 'links' && <SearchLinkResults searchValue={filters.query} filters={filters} />}
                    {activeTab === 'polls' && <SearchPollResults searchValue={filters.query} filters={filters} />}
                </div>
            </div>

        </div>
    )
}
