import { SearchFilters } from '@components/common/SearchFilters/types'
import { SearchFilters as SearchFiltersComponent } from '@components/common/SearchFilters/SearchFilters'
import { useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import TabsBar, { SearchTab } from '@components/common/SearchFilters/TabsBar'
import { MoreFiltersDrawer } from '@components/common/SearchFilters/MoreFiltersDrawer'
import SearchResultsPolls from "@components/common/SearchFilters/SearchResultsPolls"
import SearchResultsFiles from "@components/common/SearchFilters/SearchResultsFiles"
import SearchResultsMessages from "@components/common/SearchFilters/SearchResultsMessages"
import SearchResultsLinks from "@components/common/SearchFilters/SearchResultsLinks"
import { useChannels } from '@hooks/useChannels'
import SearchResultsThreads from '@components/common/SearchFilters/SearchResultsThreads'

export default function Search() {

    const { searchValue } = useOutletContext<{ searchValue: string, setSearchValue: (v: string) => void }>()
    const [searchParams, setSearchParams] = useSearchParams()

    // Read filters from URL params
    const channelFromURL = searchParams.get('channel') ?? ''
    const userFromURL = searchParams.get('user') ?? ''
    const fileTypeFromURL = searchParams.get('file_type')?.split(',').filter(Boolean) ?? []
    const channelTypeFromURL = searchParams.get('channel_type') ?? ''
    const isDMFromURL = searchParams.get('is_dm') ? 1 : null
    // If Channel Type is Private, exclude DMs explicitly
    const excludeDMs = channelTypeFromURL === 'Private' ? 0 : null
    const isThreadMessageFromURL = searchParams.get('is_thread_message') ? 1 : null
    const savedFromURL = searchParams.get('saved') ? 1 : null
    const isPinnedFromURL = searchParams.get('is_pinned') ? 1 : null
    const hasReactionsFromURL = searchParams.get('has_reactions') ? 1 : null
    const mentionsMeFromURL = searchParams.get('mentions_me') ? 1 : null
    const tabFromURL = (searchParams.get('tab') as SearchTab) || 'messages'

    const [activeTab, setActiveTab] = useState<SearchTab>(tabFromURL)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

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

    const setChannelFilter = (channelId: string) => {
        setSearchParams((prev) => {
            if (channelId !== "*all") prev.set('channel', channelId)
            else prev.delete('channel')
            return prev
        })
    }

    const setUserFilter = (userId: string) => {
        setSearchParams((prev) => {
            if (userId && userId !== "all") prev.set('user', userId)
            else prev.delete('user')
            return prev
        })
    }

    return (
        <div className="flex flex-row h-full overflow-hidden pt-(--app-header-height)">
            {/* Main Content */}
            <div className={`transition-all duration-300 ${isDrawerOpen ? 'w-[calc(100%-340px)] pr-0' : 'w-full'} h-full flex flex-col p-4 pb-0`}>
                {/* Tabs Bar */}
                <TabsBar activeTab={activeTab} setActiveTab={setActiveTab} />
                {/* Search and Filter Component */}
                <SearchFiltersComponent
                    filters={filters}
                    channels={channels}
                    dmChannels={dm_channels}
                    onChannelChange={setChannelFilter}
                    onUserChange={setUserFilter}
                    onOpenMoreFilters={() => setIsDrawerOpen(open => !open)}
                />

                <div className="mt-2 flex-1 overflow-y-auto">
                    {/* Results based on active tab */}
                    {activeTab === 'messages' && (
                        <SearchResultsMessages searchValue={filters.query} filters={filters} />
                    )}
                    {activeTab === 'files' && (
                        <SearchResultsFiles searchValue={filters.query} filters={filters} />
                    )}
                    {activeTab === 'links' && (
                        <SearchResultsLinks searchValue={filters.query} filters={filters} />
                    )}
                    {activeTab === 'polls' && (
                        <SearchResultsPolls searchValue={filters.query} filters={filters} />
                    )}
                    {/* Threads have a separate page*/}
                    {/* {activeTab === 'threads' && (
                        <SearchResultsThreads searchValue={filters.query} filters={filters} />
                    )} */}
                </div>
            </div>
            {/* Right Drawer */}
            {isDrawerOpen && (
                <div className="w-85 h-full border-l bg-surface-white shadow-lg transition-all duration-300 flex flex-col">
                    <MoreFiltersDrawer
                        filters={filters}
                        onClose={() => setIsDrawerOpen(false)}
                    />
                </div>
            )}
        </div>
    )
} 