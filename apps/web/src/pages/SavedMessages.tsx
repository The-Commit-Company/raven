import { SidebarTrigger } from "@components/ui/sidebar";
import { Separator } from "@components/ui/separator";
import { useState } from "react"
import { Search, X, Plus } from "lucide-react"
import { Input } from "@components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from "@components/ui/select"
import { Button } from "@components/ui/button"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { cn } from "@lib/utils"
import SavedMessagesList from "@components/features/saved-messages/SavedMessagesList"
import { ReminderDialog } from "@components/features/saved-messages/ReminderDialog"
import { SavedMessage, SavedMessageStatus } from "../types/SavedMessage"
import { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel"

const TABS: { key: SavedMessageStatus; label: string }[] = [
    { key: 'in_progress', label: 'In progress' },
    { key: 'archived', label: 'Archived' },
    { key: 'completed', label: 'Completed' },
]

// Dummy channels
const dummyChannels: RavenChannel[] = [
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
        last_message_timestamp: "2025-12-18T17:18:00",
        last_message_details: {},
        pinned_messages_string: ""
    },
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
        last_message_timestamp: "2025-12-17T10:00:00",
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
        last_message_timestamp: "2025-12-16T14:30:00",
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
        last_message_timestamp: "2025-12-14T11:00:00",
        last_message_details: {},
        pinned_messages_string: ""
    },
]

export default function SavedMessages() {
    const [activeTab, setActiveTab] = useState<SavedMessageStatus>('in_progress')
    const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
    const [reminderMessage, setReminderMessage] = useState<SavedMessage | null>(null)
    const [search, setSearch] = useState('')
    const [channel, setChannel] = useState('all')

    const channels = dummyChannels.filter(c => !c.is_direct_message)
    const selectedChannel = dummyChannels.find(c => c.name === channel)

    const handleSetReminder = (message: SavedMessage, option: string) => {
        if (option === 'custom') {
            setReminderMessage(message)
            setReminderDialogOpen(true)
        } else {
            // Handle quick reminder options
            // This would typically call an API to set the reminder
            console.log('Setting reminder for message:', message.name, 'option:', option)
        }
    }

    const handleReminderSave = (data: { date: Date; time: string; description: string }) => {
        if (reminderMessage) {
            // This would typically call an API to save the reminder
            console.log('Saving reminder:', {
                messageID: reminderMessage.name,
                date: data.date,
                time: data.time,
                description: data.description
            })
            setReminderDialogOpen(false)
            setReminderMessage(null)
        }
    }

    const handleMarkComplete = (message: SavedMessage) => {
        // This would typically call an API to mark as complete
        console.log('Marking as complete:', message.name)
    }

    const handleArchive = (message: SavedMessage) => {
        // This would typically call an API to archive
        console.log('Archiving:', message.name)
    }

    const handleUnsave = (message: SavedMessage) => {
        // This would typically call an API to unsave
        console.log('Unsaving:', message.name)
    }

    // Get count for active tab
    const getTabCount = (status: SavedMessageStatus) => {
        if (status === 'in_progress') return 4
        if (status === 'archived') return 3
        if (status === 'completed') return 3
        return 0
    }

    return (
        <div className="flex flex-col">
            <header className="sticky top-0 flex items-center justify-between border-b bg-background py-1.5 px-2 z-30">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-6">
                            <Separator orientation="vertical" />
                        </div>
                    </div>
                    <span className="text-md font-medium">Saved Messages</span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 pt-4 shrink-0 space-y-3">
                        {/* Tabs */}
                        <div className="flex gap-2 items-center">
                            {TABS.map(tab => {
                                const count = getTabCount(tab.key)
                                return (
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
                                        {tab.label} {count > 0 && ` ${count}`}
                                    </button>
                                )
                            })}
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto h-7 text-xs"
                                onClick={() => setReminderDialogOpen(true)}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                Add reminder
                            </Button>
                        </div>

                        {/* Search and Channel Filter */}
                        <div className="flex flex-row items-end gap-2">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Search saved messages..."
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

                    {/* Messages list */}
                    <div className="flex-1 overflow-hidden">
                        <SavedMessagesList
                            status={activeTab}
                            onMarkComplete={handleMarkComplete}
                            onSetReminder={handleSetReminder}
                            onArchive={handleArchive}
                            onUnsave={handleUnsave}
                            searchQuery={search}
                            channelFilter={channel}
                        />
                    </div>
                </div>
            </div>

            {/* Reminder Dialog */}
            <ReminderDialog
                open={reminderDialogOpen}
                onOpenChange={setReminderDialogOpen}
                onSave={handleReminderSave}
                initialDate={reminderMessage?.reminder_date ? new Date(reminderMessage.reminder_date) : undefined}
                initialTime={reminderMessage?.reminder_time}
                initialDescription={reminderMessage?.reminder_description}
            />
        </div>
    )
}
