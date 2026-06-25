import { useCallback, useMemo, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { Search, X } from "lucide-react"
import { Switch } from "@components/ui/switch"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs"
import { ChannelSelect } from "@components/common/ChannelSelect/ChannelSelect"
import ThreadsList from "@components/features/threads/ThreadsList"
import NotificationChat, { type SelectedNotification } from "@pages/notifications/NotificationChat"
import { ThreadMessage } from "../../types/ThreadMessage"
import { cn } from "@lib/utils"
import { useChannelList } from "@stores/channels/useChannelList"
import { unreadThreadsStore } from "@stores/threads/unreadStore"
import _ from "@lib/translate"
import { useUsersById } from "@hooks/useMessageRowLookups"
import { PageHeader } from "@components/layout/PageHeader"
import AppMobileFooter from "@components/features/header/AppMobileFooter"

type ThreadTab = 'participating' | 'ai' | 'other'

const TABS: { key: ThreadTab; label: string }[] = [
    { key: 'participating', label: 'Participating' },
    { key: 'other', label: 'Other' },
    { key: 'ai', label: 'AI Agents' },
]

export default function Threads() {
    const [selected, setSelected] = useState<SelectedNotification | null>(null)
    const [activeTab, setActiveTab] = useState<ThreadTab>('participating')
    const [onlyShowUnread, setOnlyShowUnread] = useState(false)
    const [search, setSearch] = useState('')
    const [channel, setChannel] = useState('*all')
    const usersById = useUsersById()
    const users = useMemo(() => [...usersById.values()], [usersById])
    const { channels, dmChannels } = useChannelList()
    const hasSelection = !!selected

    // A thread IS a channel (id = thread.name); the pane renders its stream + composer.
    // Clicking the open row again collapses the pane back to a full-width list.
    const onThreadClick = useCallback((thread: ThreadMessage) => {
        // Engaging with a thread = reading it: clear its unread dot immediately (idempotent,
        // safe on a toggle-close too). The right-pane stream's read tracker flushes the
        // watermark to the server (track_visit); this is the optimistic local clear so the dot
        // doesn't linger until the next reconcile. Done outside setSelected so the store
        // notify isn't a side effect inside a state updater (which races the list re-render).
        unreadThreadsStore.remove(thread.name)
        setSelected(prev => prev?.channelID === thread.name ? null : {
            channelID: thread.name,
            messageID: '',
            isDirectMessage: thread.is_dm_thread === 1,
        })
    }, [])

    // Esc closes the pane (no visible close button — toggle the row or hit Esc).
    useHotkeys('esc', () => setSelected(null), { enableOnFormTags: true }, [])

    return (
        <div className={cn(
            "flex flex-col h-screen overflow-hidden",
            hasSelection && "bg-surface-gray-1"
        )}>
            <div className="flex flex-1 overflow-hidden">
                <div className={cn(
                    "flex flex-col min-w-0",
                    hasSelection ? "w-1/2 shrink-0" : "flex-1"
                )}>
                    <PageHeader title={_("Threads")} />
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="px-2 pt-2 pb-3 shrink-0 space-y-4 z-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-gray-4 pointer-events-none" />
                                <Input
                                    placeholder={_("Search threads...")}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className={cn("pl-9 pr-9 h-8 text-base",
                                        hasSelection && "bg-surface-gray-3 hover:bg-surface-gray-4"
                                    )}
                                    autoFocus
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        aria-label={_("Clear search")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-gray-4 hover:text-ink-gray-8"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ThreadTab)}>
                                    <TabsList variant="subtle" size="sm">
                                        {TABS.map(tab => (
                                            <TabsTrigger key={tab.key} value={tab.key}>
                                                {_(tab.label)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                                <div className="flex items-center gap-3">
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
                                    <ChannelSelect
                                        channels={channels}
                                        dmChannels={dmChannels}
                                        users={users}
                                        value={channel}
                                        onValueChange={setChannel}
                                        placeholder={_("Channel")}
                                        allowAll
                                        allLabel={_("Any Channel")}
                                        searchable
                                        size="sm"
                                        showLabel={false}
                                        dropdownClassName="w-68"
                                        triggerClassName="w-40"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0">
                            <ThreadsList
                                threadType={activeTab}
                                searchQuery={search}
                                channelFilter={channel}
                                onlyShowUnread={onlyShowUnread}
                                onThreadClick={onThreadClick}
                                activeThreadID={selected?.channelID || undefined}
                            />
                        </div>
                    </div>
                </div>

                {selected && (
                    <div className="w-1/2 shrink-0 flex flex-col min-h-0 bg-surface-gray-0">
                        <NotificationChat selected={selected} />
                    </div>
                )}
            </div>
            <AppMobileFooter />
        </div>
    )
}
