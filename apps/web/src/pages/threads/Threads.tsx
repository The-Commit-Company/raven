import { useState } from "react"
import { Search, X } from "lucide-react"
import { Switch } from "@components/ui/switch"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import { ChannelSelect } from "@components/common/ChannelSelect/ChannelSelect"
import ThreadsList from "@components/features/threads/ThreadsList"
import ChatDrawer from "@components/common/ChatDrawer"
import { ThreadMessage } from "../../types/ThreadMessage"
import { cn } from "@lib/utils"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"
import { useChannels } from "@hooks/useChannels"
import _ from "@lib/translate"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@db"

type ThreadTab = 'participating' | 'ai' | 'other'

const TABS: { key: ThreadTab; label: string }[] = [
    { key: 'participating', label: 'Participating' },
    { key: 'other', label: 'Other' },
    { key: 'ai', label: 'AI Agents' },
]

export default function Threads() {
    const [selectedThreadID, setSelectedThreadID] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<ThreadTab>('participating')
    const [onlyShowUnread, setOnlyShowUnread] = useState(false)
    const [search, setSearch] = useState('')
    const [channel, setChannel] = useState('*all')
    const users = useLiveQuery(() => db.users.toArray(), [])
    const { channels, dm_channels } = useChannels()

    const headerLeft = "var(--workspace-switcher-width, 60px)"
    const headerWidth = "calc(100% - var(--workspace-switcher-width, 60px))"

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ "--workspace-switcher-width": "60px" } as React.CSSProperties}>
            <WorkspaceSwitcher standalone />
            <div className="flex flex-col h-full overflow-hidden" style={{ marginLeft: "var(--workspace-switcher-width, 60px)", width: "calc(100% - var(--workspace-switcher-width, 60px))" } as React.CSSProperties}>
                <header
                    className="flex items-center justify-between border-b bg-background py-1.5 px-2 z-20 fixed top-0 h-(--app-header-height) transition-[left,width] duration-200 ease-linear"
                    style={{
                        left: headerLeft,
                        width: headerWidth,
                    }}
                >
                    <div className="flex items-center gap-4">
                        <span className="text-md font-medium">{_("Threads")}</span>
                    </div>
                </header>

                <div className="pt-9 flex flex-1 overflow-hidden">
                    <div className={cn(
                        "flex-1 flex flex-col transition-all duration-300",
                        selectedThreadID && "w-1/2 border-r border-border"
                    )}>
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <div className="px-4 pt-4 shrink-0 space-y-3 z-0">
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
                                                {_(tab.label)}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="unread-toggle" className="text-xs font-medium text-muted-foreground cursor-pointer">
                                            {_("Unread only")}
                                        </Label>
                                        <Switch
                                            id="unread-toggle"
                                            checked={onlyShowUnread}
                                            onCheckedChange={setOnlyShowUnread}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-row items-end gap-2">
                                    <div className="relative flex-1 min-w-50 max-w-200">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                        <Input
                                            placeholder={_("Search threads...")}
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-8 pr-8 text-[13px]"
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                aria-label={_("Clear search")}
                                                onClick={() => setSearch("")}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <ChannelSelect
                                        channels={channels}
                                        dmChannels={dm_channels}
                                        users={users}
                                        value={channel}
                                        onValueChange={setChannel}
                                        placeholder={_("Channel")}
                                        allowAll
                                        allLabel={_("Any Channel")}
                                        searchable
                                        dropdownClassName="w-68"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <ThreadsList
                                    users={users ?? []}
                                    threadType={activeTab}
                                    searchQuery={search}
                                    channelFilter={channel}
                                    onlyShowUnread={onlyShowUnread}
                                    onThreadClick={(thread: ThreadMessage) => setSelectedThreadID(thread.name)}
                                    activeThreadID={selectedThreadID || undefined}
                                />
                            </div>
                        </div>
                    </div>

                    {selectedThreadID && (
                        <div className="w-1/2 shrink-0">
                            <ChatDrawer
                                channelID={selectedThreadID}
                                onClose={() => setSelectedThreadID(null)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
