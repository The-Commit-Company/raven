import { SidebarTrigger } from "@components/ui/sidebar"
import { Separator } from "@components/ui/separator"
import { SearchFilters } from '@components/common/SearchFilters/types'
import { SearchFilters as SearchFiltersComponent } from '@components/common/SearchFilters/SearchFilters'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import TabsBar, { SearchTab } from '@components/common/SearchFilters/TabsBar'
import SearchResultsChannelsThreads from '@components/common/SearchFilters/SearchResultsChannelsThreads'
import { MoreFiltersDrawer } from '@components/common/SearchFilters/MoreFiltersDrawer'
import SearchResultsPeople from "@components/common/SearchFilters/SearchResultsPeople"
import SearchResultsPolls from "@components/common/SearchFilters/SearchResultsPolls"
import SearchResultsFiles from "@components/common/SearchFilters/SearchResultsFiles"

export default function Search() {

    const { searchValue } = useOutletContext<{ searchValue: string, setSearchValue: (v: string) => void }>()

    // Initialize filters state
    const [filters] = useState<Omit<SearchFilters, 'searchQuery'>>({
        selectedChannel: '',
        selectedUser: '',
        channelType: '',
        messageType: '',
        fileType: [],
        dateRange: { from: undefined, to: undefined },
        isPinned: null,
        isSaved: null,
        hasReactions: null,
        hasLink: null,
        inThread: null,
        isDirectMessage: null,
    })

    const [activeTab, setActiveTab] = useState<SearchTab>('all')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Compose the full filters object for useMessageFilters and SearchFilters
    const fullFilters: SearchFilters = {
        searchQuery: searchValue || '',
        ...filters
    }

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
                    <span className="text-md font-semibold">Search</span>
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
                        availableChannels={[]}
                        availableUsers={[]}
                        onOpenMoreFilters={() => setIsDrawerOpen(open => !open)}
                    />
                    <div className="mt-4 flex-1 overflow-y-auto">
                        {/* Results based on active tab */}
                        {activeTab === 'all' && (
                            // <SearchResultsAll
                            //     filters={fullFilters}
                            //     messages={filteredMessages}
                            //     users={availableUsers}
                            //     channels={availableChannels}
                            // />
                            <></>
                        )}
                        {activeTab === 'messages' && (
                            // <SearchResultsMessages
                            //     filters={fullFilters}
                            //     messages={dummyAllMessages}
                            //     users={availableUsers}
                            //     channels={availableChannels}
                            // />
                            <></>
                        )}
                        {activeTab === 'files' && (
                            <SearchResultsFiles />
                        )}
                        {activeTab === 'polls' && (
                            <SearchResultsPolls />
                        )}
                        {activeTab === 'people' && (
                            <SearchResultsPeople />
                        )}
                        {activeTab === 'channels_threads' && (
                            <SearchResultsChannelsThreads />
                        )}
                    </div>
                </div>
                {/* Right Drawer */}
                {isDrawerOpen && (
                    <div className="w-[340px] h-full border-l bg-background shadow-lg transition-all duration-300 flex flex-col">
                        <MoreFiltersDrawer
                            filters={fullFilters}
                            onClose={() => setIsDrawerOpen(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
} 