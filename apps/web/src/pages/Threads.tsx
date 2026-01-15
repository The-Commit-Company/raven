import { useState } from "react"
import { Search, X } from "lucide-react"
import { Switch } from "@components/ui/switch"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from "@components/ui/select"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import ParticipatingThreads from "@components/features/threads/ParticipatingThreads"
import OtherThreads from "@components/features/threads/OtherThreads"
import AIThreads from "@components/features/threads/AIThreads"
import ThreadViewDrawer from "@components/features/threads/ThreadViewDrawer"
import { ThreadMessage } from "../types/ThreadMessage"
import { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel"
import { cn } from "@lib/utils"

type ThreadTab = 'all' | 'participating' | 'ai' | 'other'


const TABS: { key: ThreadTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'participating', label: 'Participating' },
    { key: 'ai', label: 'AI Agents' },
    { key: 'other', label: 'Other' },
]

export default function Threads() {
    const [selectedThreadID, setSelectedThreadID] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<ThreadTab>('all')
    const [onlyShowUnread, setOnlyShowUnread] = useState(false)
    const [search, setSearch] = useState('')
    const [channel, setChannel] = useState('all')

    // Get dummy channels for filter
    const allChannels: RavenChannel[] = [
        {
            name: "engineering",
            channel_name: "Engineering",
            type: "Public",
            is_direct_message: 0,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            creation: "2025-01-01T10:00:00",
            modified: "2025-01-01T10:00:00",
            owner: "admin",
            modified_by: "admin",
            docstatus: 0,
            channel_description: "",
            last_message_timestamp: "2025-06-27T10:00:00",
            last_message_details: {},
            pinned_messages_string: ""
        },
        {
            name: "general",
            channel_name: "General",
            type: "Public",
            is_direct_message: 0,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            creation: "2025-01-01T10:00:00",
            modified: "2025-01-01T10:00:00",
            owner: "admin",
            modified_by: "admin",
            docstatus: 0,
            channel_description: "",
            last_message_timestamp: "2025-06-14T10:00:00",
            last_message_details: {},
            pinned_messages_string: ""
        },
        {
            name: "development",
            channel_name: "Development",
            type: "Public",
            is_direct_message: 0,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            creation: "2025-01-01T10:00:00",
            modified: "2025-01-01T10:00:00",
            owner: "admin",
            modified_by: "admin",
            docstatus: 0,
            channel_description: "",
            last_message_timestamp: "2025-06-20T14:30:00",
            last_message_details: {},
            pinned_messages_string: ""
        },
        {
            name: "devops",
            channel_name: "DevOps",
            type: "Private",
            is_direct_message: 0,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            creation: "2025-01-01T10:00:00",
            modified: "2025-01-01T10:00:00",
            owner: "admin",
            modified_by: "admin",
            docstatus: 0,
            channel_description: "",
            last_message_timestamp: "2025-06-18T09:15:00",
            last_message_details: {},
            pinned_messages_string: ""
        },
        {
            name: "dm-raven-ai",
            channel_name: "Raven AI",
            type: "Private",
            is_direct_message: 1,
            is_self_message: 0,
            is_archived: 0,
            workspace: "main",
            creation: "2025-01-01T10:00:00",
            modified: "2025-01-01T10:00:00",
            owner: "admin",
            modified_by: "admin",
            docstatus: 0,
            channel_description: "",
            last_message_timestamp: "2025-06-26T10:00:00",
            last_message_details: {},
            pinned_messages_string: ""
        }
    ]

    const channels = allChannels.filter(c => !c.is_direct_message)
    const selectedChannel = allChannels.find(c => c.name === channel)

    return (
        <div className="flex flex-col h-full">
            <header className="sticky top-0 flex items-center justify-between border-b bg-background py-1.5 px-2 z-30">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <span className="text-md font-medium">Threads</span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main content area */}
                <div className={cn(
                    "flex-1 flex flex-col transition-all duration-300",
                    selectedThreadID && "w-1/2 border-r border-border"
                )}>
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="px-4 pt-4 shrink-0 space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex gap-2">
                                    {TABS.map(tab => (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            className={cn(
                                                "px-4 py-1 rounded-md text-xs font-medium transition-colors border border-transparent",
                                                activeTab === tab.key
                                                    ? "bg-primary text-primary-foreground shadow"
                                                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            )}
                                            onClick={() => setActiveTab(tab.key)}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="unread-toggle" className="text-xs font-medium text-muted-foreground cursor-pointer">
                                        Unread only
                                    </Label>
                                    <Switch
                                        id="unread-toggle"
                                        checked={onlyShowUnread}
                                        onCheckedChange={setOnlyShowUnread}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-row items-end gap-2">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                    <Input
                                        placeholder="Search threads..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 pr-8 text-[13px]"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            aria-label="Clear search"
                                            onClick={() => setSearch("")}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                                <Select value={channel} onValueChange={setChannel}>
                                    <SelectTrigger className="w-fit min-w-[140px] sm:min-w-[180px] h-7 text-[13px] [&>span]:px-2">
                                        {selectedChannel && channel !== 'all' ? (
                                            <div className="flex items-center gap-1.5">
                                                {selectedChannel.is_direct_message === 1 ? (
                                                    <span className="h-3.5 w-3.5 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">?</span>
                                                ) : (
                                                    <ChannelIcon
                                                        type={selectedChannel.type as 'Public' | 'Private' | 'Open'}
                                                        className="h-3.5 w-3.5"
                                                    />
                                                )}
                                                <span className="text-xs font-medium">
                                                    {selectedChannel.channel_name || selectedChannel.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <SelectValue placeholder="Channel" />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any Channel</SelectItem>
                                        {channels.length > 0 && (
                                            <>
                                                <SelectSeparator />
                                                <SelectGroup>
                                                    <SelectLabel>Channels</SelectLabel>
                                                    {channels.map((channelItem: RavenChannel) => (
                                                        <SelectItem key={channelItem.name} value={channelItem.name}>
                                                            <div className="flex items-center gap-2">
                                                                <ChannelIcon
                                                                    type={channelItem.type as 'Public' | 'Private' | 'Open'}
                                                                    className="h-4 w-4"
                                                                />
                                                                <span>{channelItem.channel_name || channelItem.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {activeTab === 'all' && (
                                <ParticipatingThreads
                                    threadType="all"
                                    onThreadClick={(thread: ThreadMessage) => setSelectedThreadID(thread.name)}
                                    activeThreadID={selectedThreadID || undefined}
                                />
                            )}

                            {activeTab === 'participating' && (
                                <ParticipatingThreads
                                    onThreadClick={(thread: ThreadMessage) => setSelectedThreadID(thread.name)}
                                    activeThreadID={selectedThreadID || undefined}
                                />
                            )}

                            {activeTab === 'ai' && (
                                <AIThreads
                                    onThreadClick={(thread: ThreadMessage) => setSelectedThreadID(thread.name)}
                                    activeThreadID={selectedThreadID || undefined}
                                />
                            )}

                            {activeTab === 'other' && (
                                <OtherThreads
                                    onThreadClick={(thread: ThreadMessage) => setSelectedThreadID(thread.name)}
                                    activeThreadID={selectedThreadID || undefined}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Thread Drawer */}
                {selectedThreadID && (
                    <div className="w-1/2 shrink-0">
                        <ThreadViewDrawer
                            threadID={selectedThreadID}
                            onClose={() => setSelectedThreadID(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
