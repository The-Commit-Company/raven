import { useState, useCallback, useEffect, useRef, memo } from "react"
import { AtSignIcon, Check, MessageSquare } from "lucide-react"
import { cn } from "@lib/utils"
import { type NotificationObject, useNotifications } from "@hooks/useNotifications"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { useUser } from "@hooks/useUser"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"
import ChatDrawer from "@components/common/ChatDrawer"
import { formatRelativeDate } from "@lib/date"
import _ from "@lib/translate"
import { Label } from "@components/ui/label"
import { Switch } from "@components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@db"
import MarkdownRenderer from "@components/ui/markdown"

type NotificationTab = "all" | "mentions" | "reactions"

const TABS: { key: NotificationTab; label: string; type: "mention" | "reaction" | null }[] = [
    { key: "all", label: "All", type: null },
    { key: "mentions", label: "Mentions", type: "mention" },
    { key: "reactions", label: "Reactions", type: "reaction" },
]

const formatReactorNames = (names: string[], total: number): string => {
    if (total === 1) return names[0]
    if (total === 2) return _(`{0} and {1}`, [names[0], names[1]])
    if (total === 3) return _(`{0}, {1} and {2}`, [names[0], names[1], names[2]])
    return _(`{0}, {1} and {2} others`, [names[0], names[1], String(total - 2)])
}

type SelectedNotification = { name: string; channelID: string; messageID: string }

export default function Notifications() {
    const [activeTab, setActiveTab] = useState<NotificationTab>("all")
    const [showUnread, setShowUnread] = useState(true)
    const [selected, setSelected] = useState<SelectedNotification | null>(null)

    const tabType = activeTab === "mentions" ? "mention" : activeTab === "reactions" ? "reaction" : null

    const {
        unreadCount,
        currentData,
        isLoading,
        isReachingEnd,
        isLoadingMore,
        setSize,
        markMessageRead,
        markAllRead,
    } = useNotifications(tabType, showUnread)

    const observerTarget = useRef<HTMLDivElement>(null)

    const loadMore = useCallback(() => {
        if (!isReachingEnd && !isLoadingMore) {
            setSize((s) => s + 1)
        }
    }, [isReachingEnd, isLoadingMore, setSize])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore()
            },
            { threshold: 0.1 },
        )
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => observer.disconnect()
    }, [loadMore])

    const onNotificationClick = useCallback((notification: NotificationObject) => {
        markMessageRead(notification.message_id)
        setSelected({
            name: notification.name,
            channelID: notification.channel_id,
            messageID: notification.message_id,
        })
    }, [markMessageRead])

    const onShowUnreadChange = useCallback((checked: boolean) => {
        setShowUnread(checked)
        setSelected(null)
    }, [])

    const onTabChange = useCallback((tab: NotificationTab) => {
        setActiveTab(tab)
        setSelected(null)
    }, [])

    const headerLeft = "var(--workspace-switcher-width, 60px)"
    const headerWidth = "calc(100% - var(--workspace-switcher-width, 60px))"

    return (
        <div
            className="flex flex-col h-screen overflow-hidden"
            style={{ "--workspace-switcher-width": "60px" } as React.CSSProperties}
        >
            <WorkspaceSwitcher standalone />
            <div
                className="flex flex-col h-full overflow-hidden"
                style={{ marginLeft: "var(--workspace-switcher-width, 60px)", width: headerWidth }}
            >
                <header
                    className="flex items-center justify-between border-b bg-surface-white py-1.5 px-2 z-10 fixed top-0 h-(--app-header-height) transition-[left,width] duration-200 ease-linear"
                    style={{ left: headerLeft, width: headerWidth }}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-md font-medium">{_("Notifications")}</span>
                        {unreadCount > 0 && (
                            <div className="bg-surface-gray-2 text-ink-gray-8 rounded px-1.5 py-0.5 text-[10px] font-semibold min-w-4.5 text-center">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </div>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-1 text-xs text-ink-gray-4 hover:text-ink-gray-8 transition-colors px-2 py-1 rounded hover:bg-surface-gray-2/50"
                        >
                            <Check className="w-3 h-3" />
                            {_("Mark all as read")}
                        </button>
                    )}
                </header>

                <div className="pt-9 flex flex-1 overflow-hidden">
                    <div className={cn(
                        "flex-1 flex flex-col transition-all duration-300",
                        selected && "w-1/2 border-r border-outline-gray-2"
                    )}>
                        <div className="px-4 pt-4 pb-2 shrink-0 flex items-center gap-4">
                            <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as NotificationTab)}>
                                <TabsList className="grid grid-cols-3 gap-1 px-1 h-8">
                                    {TABS.map((tab) => (
                                        <TabsTrigger key={tab.key} value={tab.key}>
                                            {_(tab.label)}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                            <div className="flex items-center gap-2 ml-auto">
                                <Label htmlFor="unread-toggle" className="text-xs font-medium text-ink-gray-4 cursor-pointer">
                                    {_("Unread only")}
                                </Label>
                                <Switch
                                    id="unread-toggle"
                                    checked={showUnread}
                                    onCheckedChange={onShowUnreadChange}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {currentData.length === 0 && !isLoading && !isLoadingMore ? (
                                <EmptyState showUnread={showUnread} />
                            ) : (
                                <div className="py-2">
                                    {currentData.map((item) =>
                                        item.notification_type === "mention" ? (
                                            <MentionItem
                                                key={item.name}
                                                notification={item}
                                                onSelect={onNotificationClick}
                                                isActive={selected?.name === item.name}
                                            />
                                        ) : (
                                            <ReactionItem
                                                key={item.name}
                                                notification={item}
                                                onSelect={onNotificationClick}
                                                isActive={selected?.name === item.name}
                                            />
                                        )
                                    )}
                                    <div ref={observerTarget} className="h-4" />
                                    {isLoadingMore && (
                                        <div className="text-center py-4 text-xs text-ink-gray-4">{_("Loading more notifications...")}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {selected && (
                        <div className="w-1/2 shrink-0">
                            <ChatDrawer
                                channelID={selected.channelID}
                                messageID={selected.messageID}
                                onClose={() => setSelected(null)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const ChannelContext = ({
    notification,
}: {
    notification: Pick<NotificationObject, "is_thread" | "is_direct_message" | "channel_type" | "channel_name">
}) => {
    if (notification.is_thread) {
        return (
            <div className="flex items-center gap-1 text-xs text-ink-gray-4/80">
                <MessageSquare className="w-3 h-3" />
                <span>{_("Thread")}</span>
            </div>
        )
    }
    if (!notification.is_direct_message) {
        return (
            <div className="flex items-center gap-1 text-xs">
                <span className="text-ink-gray-4/80">{_("in")}</span>
                <ChannelIcon type={notification.channel_type} className="h-3 w-3 text-ink-gray-4" />
                <span className="font-medium text-ink-gray-8/70 group-hover:text-primary group-hover:underline transition-colors">
                    {notification.channel_name}
                </span>
            </div>
        )
    }
    return null
}

const MentionItem = memo(({
    notification,
    onSelect,
    isActive,
}: {
    notification: NotificationObject
    onSelect: (notification: NotificationObject) => void
    isActive: boolean
}) => {
    const { data: sender } = useUser(notification.owner)

    return (
        <button
            type="button"
            onClick={() => onSelect(notification)}
            className={cn(
                "group block w-full text-left px-6 py-4 hover:bg-surface-gray-3/50 transition-colors cursor-pointer",
                !notification.is_read && "bg-surface-gray-2/10",
                isActive && "bg-surface-gray-3"
            )}
        >
            <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                    {sender && <UserAvatar user={sender} size="md" />}
                    {!notification.is_read && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={cn("text-sm", !notification.is_read ? "font-semibold" : "font-medium")}>
                            {sender?.full_name ?? notification.owner}
                        </span>
                        <span className="text-xs font-light text-ink-gray-4/90 shrink-0">
                            {formatRelativeDate(notification.creation)}
                        </span>
                        <ChannelContext notification={notification} />
                    </div>
                    <div className="text-[13px] text-primary line-clamp-2 mt-0.5 [&_.mention]:text-mention [&_.mention]:font-medium [&_.mention]:bg-blue-50 dark:[&_.mention]:bg-blue-950/50 [&_.mention]:px-1 [&_.mention]:py-0.5 [&_.mention]:rounded [&_p]:my-0">
                        <MarkdownRenderer content={notification.text} />
                    </div>
                </div>
            </div>
        </button>
    )
})

const ReactionItem = memo(({
    notification,
    onSelect,
    isActive,
}: {
    notification: NotificationObject
    onSelect: (notification: NotificationObject) => void
    isActive: boolean
}) => {
    const reactors = notification.reactors ?? []
    const total = reactors.length
    // formatReactorNames uses 3 names when total<=3, else only 2.
    const namesNeeded = total <= 3 ? total : 2
    const reactorsData = useLiveQuery(() => db.users.bulkGet(reactors.slice(0, namesNeeded)), [reactors]) || []

    const names = reactorsData.map((u, i) => u?.full_name ?? reactors[i])
    const reactorText = formatReactorNames(names, total)
    const displayReactions = (notification.reactions ?? []).slice(0, 5)

    return (
        <button
            type="button"
            onClick={() => onSelect(notification)}
            className={cn(
                "group block w-full text-left px-6 py-4 hover:bg-surface-gray-3/50 transition-colors cursor-pointer",
                !notification.is_read && "bg-surface-gray-2/10",
                isActive && "bg-surface-gray-3"
            )}
        >
            <div className="flex items-start gap-3">
                <div className="relative shrink-0 w-8 h-8">
                    {reactorsData[0] && (
                        <div className={cn("absolute", total > 1 ? "top-0 left-0 w-6 h-6" : "inset-0")}>
                            <UserAvatar user={reactorsData[0]} size={total > 1 ? "xs" : "md"} />
                        </div>
                    )}
                    {reactorsData[1] && total > 1 && (
                        <div className="absolute bottom-0 right-0 w-5 h-5 ring-1 ring-background rounded-full overflow-hidden">
                            <UserAvatar user={reactorsData[1]} size="xs" />
                        </div>
                    )}
                    {!notification.is_read && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={cn("text-sm", !notification.is_read ? "font-semibold" : "font-medium")}>
                            {reactorText}
                        </span>
                        <span className="text-xs font-light text-ink-gray-4/90 shrink-0">
                            {formatRelativeDate(notification.creation)}
                        </span>
                        <ChannelContext notification={notification} />
                    </div>
                    <p className="text-xs text-ink-gray-4 mt-0.5">
                        {_("reacted to your message")}
                        {displayReactions.length > 0 && (
                            <span className="ml-1">{displayReactions.join(" ")}</span>
                        )}
                    </p>
                    <div className="text-[13px] text-ink-gray-8/70 line-clamp-1 mt-0.5 [&_p]:my-0">
                        <MarkdownRenderer content={notification.text} />
                    </div>
                </div>
            </div>
        </button>
    )
})

const EmptyState = ({ showUnread }: { showUnread: boolean }) => (
    <div className="flex flex-col items-center justify-center min-h-80 px-6">
        <div className="rounded-full bg-surface-gray-2/80 p-8 mb-6">
            {showUnread
                ? <Check className="w-12 h-12 text-ink-gray-4/60" strokeWidth={1.5} />
                : <AtSignIcon className="w-12 h-12 text-ink-gray-4/60" strokeWidth={1.5} />
            }
        </div>
        <h3 className="text-lg font-semibold mb-1">
            {showUnread ? _("You're all caught up") : _("No notifications yet")}
        </h3>
        <p className="text-ink-gray-4 text-center text-sm max-w-xs leading-relaxed">
            {showUnread
                ? _("No unread notifications at the moment.")
                : _("Mentions and reactions to your messages will appear here.")
            }
        </p>
    </div>
)
