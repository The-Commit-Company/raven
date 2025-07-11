import { SidebarTrigger } from "@components/ui/sidebar"
import { Separator } from "@components/ui/separator"
import { dummySavedMessages, dummyUsers, dummyChannels, dummyFileMessages, dummyAllMessages } from '@components/data/dummyData'
import { useMessageFilters, SearchFiltersComponent } from '@components/common/SearchFilters'
import type { SearchFilters } from '@components/common/SearchFilters'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import TabsBar, { SearchTab } from '@components/common/SearchFilters/TabsBar'
import SearchResultsAll from '@components/common/SearchFilters/SearchResultsAll'
import SearchResultsMessages from '@components/common/SearchFilters/SearchResultsMessages'
import SearchResultsFiles from '@components/common/SearchFilters/SearchResultsFiles'
import SearchResultsPeople from '@components/common/SearchFilters/SearchResultsPeople'
import SearchResultsChannelsThreads from '@components/common/SearchFilters/SearchResultsChannelsThreads'
import { MoreFilters } from '@components/common/SearchFilters/MoreFilters'

export default function Search() {

    const { searchValue } = useOutletContext<{ searchValue: string, setSearchValue: (v: string) => void }>()

    // Initialize filters state
    const [filters, setFilters] = useState<Omit<SearchFilters, 'searchQuery'>>({
        selectedChannel: 'all',
        selectedUser: 'all',
        channelType: 'all',
        messageType: 'all',
        fileType: [],
        dateRange: { from: undefined, to: undefined },
        isPinned: null,
        isSaved: null,
        isEdited: null,
        hasReactions: null,
        hasLink: null,
        inThread: null,
        isDirectMessage: null,
    })

    const [activeTab, setActiveTab] = useState<SearchTab>('all')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Convert dummyChannels to the format expected by SearchFilters
    const availableChannels = Object.entries(dummyChannels).map(([id, channel]) => ({
        id,
        name: channel.channel_name,
        type: channel.type.toLowerCase() as 'public' | 'private' | 'open' | 'dm',
        is_direct_message: channel.is_direct_message as 0 | 1,
        peer_user_id: 'peer_user_id' in channel ? channel.peer_user_id : undefined
    }))

    // Convert dummyUsers to the format expected by SearchFilters
    const availableUsers = Object.entries(dummyUsers).map(([id, user]) => ({
        id,
        name: user.name,
        full_name: user.full_name,
        user_image: user.user_image,
        type: user.type as 'User' | 'Bot',
        enabled: user.enabled,
        first_name: user.first_name,
        availability_status: user.availability_status,
        custom_status: user.custom_status
    }))

    // Compose the full filters object for useMessageFilters and SearchFilters
    const fullFilters: SearchFilters = {
        searchQuery: searchValue || '',
        ...filters
    }

    // Use the message filters hook for saved messages (used in 'all' tab)
    const filteredMessages = useMessageFilters(dummySavedMessages, fullFilters, dummyChannels)

    return (
        <div className="flex flex-col h-full">
            <header className="sticky top-(--app-header-height) flex items-center justify-between border-b bg-background py-2 px-2 z-20">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-6">
                            <Separator orientation="vertical" />
                        </div>
                    </div>
                    <span className="text-md font-medium">Search</span>
                </div>
            </header>
            <div className="flex flex-1 flex-row gap-0 p-0 overflow-hidden">
                {/* Main Content */}
                <div className={`transition-all duration-300 ${isDrawerOpen ? 'w-[calc(100%-340px)]' : 'w-full'} h-full flex flex-col p-4`}>
                    {/* Tabs Bar */}
                    <TabsBar activeTab={activeTab} setActiveTab={setActiveTab} />
                    {/* Search and Filter Component (no search bar) */}
                    <SearchFiltersComponent
                        filters={fullFilters}
                        onFiltersChange={newFilters => {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { searchQuery, ...rest } = newFilters
                            setFilters(rest)
                        }}
                        availableChannels={availableChannels}
                        availableUsers={availableUsers}
                        onOpenMoreFilters={() => setIsDrawerOpen(open => !open)}
                    />
                    <div className="mt-4">
                        {/* Results based on active tab */}
                        {activeTab === 'all' && (
                            <SearchResultsAll
                                filters={fullFilters}
                                messages={filteredMessages}
                                users={availableUsers}
                                channels={availableChannels}
                            />
                        )}
                        {activeTab === 'messages' && (
                            <SearchResultsMessages
                                filters={fullFilters}
                                messages={dummyAllMessages}
                                users={availableUsers}
                                channels={availableChannels}
                            />
                        )}
                        {activeTab === 'files' && (
                            <SearchResultsFiles
                                filters={fullFilters}
                                messages={dummyFileMessages}
                                users={availableUsers}
                                channels={availableChannels}
                            />
                        )}
                        {activeTab === 'people' && (
                            <SearchResultsPeople
                                filters={fullFilters}
                                users={availableUsers}
                            />
                        )}
                        {activeTab === 'channels_threads' && (
                            <SearchResultsChannelsThreads
                                filters={fullFilters}
                                channels={availableChannels}
                            />
                        )}
                    </div>
                </div>
                {/* Right Drawer */}
                {isDrawerOpen && (
                    <div className="w-[340px] h-full border-l bg-background shadow-lg transition-all duration-300 flex flex-col">
                        <MoreFilters
                            filters={fullFilters}
                            onFiltersChange={newFilters => {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                const { searchQuery, ...rest } = newFilters
                                setFilters(rest)
                            }}
                            availableChannels={availableChannels}
                            availableUsers={availableUsers}
                            onClose={() => setIsDrawerOpen(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
} 