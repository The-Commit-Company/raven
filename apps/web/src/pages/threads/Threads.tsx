import { useState } from "react"
import { Search, X } from "lucide-react"
import { Switch } from "@components/ui/switch"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs"
import { ChannelSelect } from "@components/common/ChannelSelect/ChannelSelect"
import ThreadsList from "@components/features/threads/ThreadsList"
import ChatDrawer from "@components/common/ChatDrawer"
import { ThreadMessage } from "../../types/ThreadMessage"
import { cn } from "@lib/utils"
import { useChannels } from "@hooks/useChannels"
import _ from "@lib/translate"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@db"
import { Button } from "@components/ui/button"
import AppHeader from "@components/features/header/AppHeader"
import AppMobileFooter from "@components/features/header/AppMobileFooter"

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

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <AppHeader title={_("Threads")} />

            <div className="flex flex-1 overflow-hidden">
                <div className={cn(
                    "flex-1 flex flex-col transition-all duration-300",
                    selectedThreadID && "w-1/2 border-r border-outline-gray-2"
                )}>
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="px-4 pt-4 pb-2 shrink-0 space-y-3 z-0">
                            <div className="flex items-center justify-between gap-4">
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ThreadTab)}>
                                    <TabsList className="grid grid-cols-3 gap-1 px-1 h-8">
                                        {TABS.map(tab => (
                                            <TabsTrigger key={tab.key} value={tab.key}>
                                                {_(tab.label)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="unread-toggle" className="text-xs font-medium text-ink-gray-4 cursor-pointer">
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
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-ink-gray-4 pointer-events-none" />
                                    <Input
                                        placeholder={_("Search threads...")}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 pr-8 text-sm"
                                    />
                                    {search && (
                                        <Button isIconButton variant="ghost" size="sm" aria-label={_("Clear search")} onClick={() => setSearch("")}>
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
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
            <AppMobileFooter />
        </div>
    )
}
