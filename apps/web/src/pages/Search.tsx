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
import { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel"
import { UserFields } from "@raven/types/common/UserFields"

export default function Search() {

    const { searchValue } = useOutletContext<{ searchValue: string, setSearchValue: (v: string) => void }>()

    // Dummy users for UserFilter UI
    const dummyUsers = [
        {
            name: "john.doe",
            full_name: "John Doe",
            user_image: "https://randomuser.me/api/portraits/men/1.jpg",
            first_name: "John",
            enabled: 1,
            type: "User",
            availability_status: "Available",
            custom_status: "Working remotely"
        },
        {
            name: "jane.smith",
            full_name: "Jane Smith",
            user_image: "https://randomuser.me/api/portraits/women/2.jpg",
            first_name: "Jane",
            enabled: 1,
            type: "User",
            availability_status: "Away",
            custom_status: "In a meeting"
        },
        {
            name: "alex.johnson",
            full_name: "Alex Johnson",
            user_image: "https://randomuser.me/api/portraits/men/3.jpg",
            first_name: "Alex",
            enabled: 1,
            type: "User",
            availability_status: "Do not disturb",
            custom_status: "Focusing"
        },
        {
            name: "emily.chen",
            full_name: "Emily Chen",
            user_image: "https://randomuser.me/api/portraits/women/4.jpg",
            first_name: "Emily",
            enabled: 1,
            type: "User",
            availability_status: "Available",
            custom_status: "Happy to help!"
        },
        {
            name: "michael.brown",
            full_name: "Michael Brown",
            user_image: "https://randomuser.me/api/portraits/men/5.jpg",
            first_name: "Michael",
            enabled: 1,
            type: "User",
            availability_status: "Invisible",
            custom_status: ""
        },
        {
            name: "sophia.wilson",
            full_name: "Sophia Wilson",
            user_image: "https://randomuser.me/api/portraits/women/6.jpg",
            first_name: "Sophia",
            enabled: 1,
            type: "User",
            availability_status: "Available",
            custom_status: "On vacation soon"
        },
        {
            name: "liam.martinez",
            full_name: "Liam Martinez",
            user_image: "https://randomuser.me/api/portraits/men/7.jpg",
            first_name: "Liam",
            enabled: 1,
            type: "User",
            availability_status: "Away",
            custom_status: "Lunch break"
        },
        {
            name: "olivia.garcia",
            full_name: "Olivia Garcia",
            user_image: "https://randomuser.me/api/portraits/women/8.jpg",
            first_name: "Olivia",
            enabled: 1,
            type: "User",
            availability_status: "Available",
            custom_status: "Reviewing PRs"
        }
    ] as UserFields[]

    // Dummy channels for ChannelFilter UI
    const dummyChannels = [
        // Regular channels
        {
            creation: "2024-01-01T10:00:00Z",
            name: "general",
            modified: "2024-01-01T10:00:00Z",
            owner: "john.doe",
            modified_by: "john.doe",
            docstatus: 0,
            channel_name: "General",
            channel_description: "Company-wide announcements and work-based matters",
            type: "Public",
            is_direct_message: 0,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            last_message_timestamp: "2024-06-01T12:00:00Z",
            last_message_details: {},
            pinned_messages_string: "",
        },
        {
            creation: "2024-01-02T10:00:00Z",
            name: "engineering",
            modified: "2024-01-02T10:00:00Z",
            owner: "jane.smith",
            modified_by: "jane.smith",
            docstatus: 0,
            channel_name: "Engineering",
            channel_description: "Engineering team discussions",
            type: "Private",
            is_direct_message: 0,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            last_message_timestamp: "2024-06-01T13:00:00Z",
            last_message_details: {},
            pinned_messages_string: "",
        },
        {
            creation: "2024-01-03T10:00:00Z",
            name: "random",
            modified: "2024-01-03T10:00:00Z",
            owner: "alex.johnson",
            modified_by: "alex.johnson",
            docstatus: 0,
            channel_name: "Random",
            channel_description: "Non-work banter and fun stuff",
            type: "Open",
            is_direct_message: 0,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            last_message_timestamp: "2024-06-01T14:00:00Z",
            last_message_details: {},
            pinned_messages_string: "",
        },
        {
            creation: "2024-01-04T10:00:00Z",
            name: "design",
            modified: "2024-01-04T10:00:00Z",
            owner: "emily.chen",
            modified_by: "emily.chen",
            docstatus: 0,
            channel_name: "Design",
            channel_description: "Design team inspiration and reviews",
            type: "Public",
            is_direct_message: 0,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            last_message_timestamp: "2024-06-01T15:00:00Z",
            last_message_details: {},
            pinned_messages_string: "",
        },
        {
            creation: "2024-01-05T10:00:00Z",
            name: "marketing",
            modified: "2024-01-05T10:00:00Z",
            owner: "sophia.wilson",
            modified_by: "sophia.wilson",
            docstatus: 0,
            channel_name: "Marketing",
            channel_description: "Marketing plans and campaigns",
            type: "Private",
            is_direct_message: 0,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            last_message_timestamp: "2024-06-01T16:00:00Z",
            last_message_details: {},
            pinned_messages_string: "",
        },
        {
            creation: "2024-01-06T10:00:00Z",
            name: "support",
            modified: "2024-01-06T10:00:00Z",
            owner: "liam.martinez",
            modified_by: "liam.martinez",
            docstatus: 0,
            channel_name: "Support",
            channel_description: "Customer support and troubleshooting",
            type: "Open",
            is_direct_message: 0,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            last_message_timestamp: "2024-06-01T17:00:00Z",
            last_message_details: {},
            pinned_messages_string: "",
        },
        {
            creation: "2024-01-07T10:00:00Z",
            name: "ai-lab",
            modified: "2024-01-07T10:00:00Z",
            owner: "olivia.garcia",
            modified_by: "olivia.garcia",
            docstatus: 0,
            channel_name: "AI Lab",
            channel_description: "AI experiments and research",
            type: "Public",
            is_direct_message: 0,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            last_message_timestamp: "2024-06-01T18:00:00Z",
            last_message_details: {},
            pinned_messages_string: "",
        },
        // DM channels (one for each user except self)
        ...dummyUsers.map(user => ({
            creation: "2024-01-08T10:00:00Z",
            name: `dm-${user.name}`,
            modified: "2024-01-08T10:00:00Z",
            owner: "john.doe",
            modified_by: "john.doe",
            docstatus: 0,
            channel_name: user.full_name,
            channel_description: `Direct message with ${user.full_name}`,
            type: "Private",
            is_direct_message: 1,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            last_message_timestamp: "2024-06-01T19:00:00Z",
            last_message_details: {},
            pinned_messages_string: "",
            peer_user_id: user.name,
        }))
    ]

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
                        availableChannels={dummyChannels as RavenChannel[]}
                        availableUsers={dummyUsers as UserFields[]}
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