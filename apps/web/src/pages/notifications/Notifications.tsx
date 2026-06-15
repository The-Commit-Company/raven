import { useState, useCallback, useEffect, useRef, memo } from "react"
import { AtSignIcon, Check, MessageSquare } from "lucide-react"
import { cn } from "@lib/utils"
import { type NotificationObject, useNotifications } from "@hooks/useNotifications"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { useUsersById } from "@hooks/useMessageRowLookups"
import ChatDrawer from "@components/common/ChatDrawer"
import { formatRelativeDate } from "@lib/date"
import _ from "@lib/translate"
import { Label } from "@components/ui/label"
import { Switch } from "@components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs"
import { useLiveQuery } from "dexie-react-hooks"
import { db, UserData } from "@db"
import MarkdownRenderer from "@components/ui/markdown"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@components/ui/empty"
import { H4 } from "@components/ui/typography"
import { Outlet, useNavigate, useParams } from "react-router"
import AppHeader from "@components/features/header/AppHeader"
import AppMobileFooter from "@components/features/header/AppMobileFooter"

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

    const { id } = useParams<{ id?: string }>()

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

    const usersById = useUsersById()

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

    const navigate = useNavigate()

    const onNotificationClick = useCallback((notification: NotificationObject) => {
        markMessageRead(notification.message_id)
        navigate(`/notifications/${notification.message_id}`)
    }, [markMessageRead])

    const onShowUnreadChange = useCallback((checked: boolean) => {
        setShowUnread(checked)
        navigate(`/notifications`)
    }, [])

    const onTabChange = useCallback((tab: NotificationTab) => {
        setActiveTab(tab)
        navigate(`/notifications`)
    }, [])

    return (
        <div className="flex flex-col h-full overflow-hidden w-full">
            <AppHeader
                title={_("Notifications")}
                leftSlot={
                    <>{unreadCount > 0 && (
                        <Badge variant="subtle" size="sm" theme="gray">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}</>
                }
                rightSlot={
                    <>{unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllRead}>
                            <Check />
                            {_("Mark all as read")}
                        </Button>
                    )}</>
                } />

            <div className="flex">
                <div
                    className={cn(
                        "flex-1 flex flex-col transition-all duration-300",
                        "w-1/2 border-r border-outline-gray-2"
                    )}>
                    <div className="flex items-center gap-4">
                        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as NotificationTab)}>
                            <div className="flex items-center gap-2">
                                <TabsList variant="subtle">
                                    {TABS.map((tab) => (
                                        <TabsTrigger key={tab.key} value={tab.key}>
                                            {_(tab.label)}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
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
                        </Tabs>

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
                                            sender={usersById.get(item.owner)}
                                            onSelect={onNotificationClick}
                                            isActive={id === item.message_id}
                                        />
                                    ) : (
                                        <ReactionItem
                                            key={item.name}
                                            notification={item}
                                            onSelect={onNotificationClick}
                                            isActive={id === item.message_id}
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

                <div className="w-1/2 shrink-0">
                    <Outlet />
                    {/* <ChatDrawer
                            channelID={selected.channelID}
                            messageID={selected.messageID}
                            onClose={() => setSelected(null)}
                        /> */}
                </div>
            </div>
            <AppMobileFooter />
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
                <span className="font-medium text-ink-gray-8/70 group-hover:text-ink-gray-9 group-hover:underline transition-colors">
                    {notification.channel_name}
                </span>
            </div>
        )
    }
    return null
}

const MentionItem = memo(({
    notification,
    sender,
    onSelect,
    isActive,
}: {
    notification: NotificationObject
    sender?: UserData
    onSelect: (notification: NotificationObject) => void
    isActive: boolean
}) => {
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
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-surface-blue-5" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={cn("text-sm", !notification.is_read ? "font-semibold" : "font-medium")}>
                            {sender?.full_name ?? notification.owner}
                        </span>
                        <span className="text-xs font-regular text-ink-gray-4/90 shrink-0">
                            {formatRelativeDate(notification.creation)}
                        </span>
                        <ChannelContext notification={notification} />
                    </div>
                    <div className="text-sm text-ink-gray-8 line-clamp-2 mt-0.5 [&_.mention]:text-mention [&_.mention]:font-medium [&_.mention]:bg-surface-blue-2 dark:[&_.mention]:bg-blue-950/50 [&_.mention]:px-1 [&_.mention]:py-0.5 [&_.mention]:rounded [&_p]:my-0">
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
                        <div className="absolute bottom-0 right-0 w-5 h-5 ring-1 ring-surface-gray-1 rounded-full overflow-hidden">
                            <UserAvatar user={reactorsData[1]} size="xs" />
                        </div>
                    )}
                    {!notification.is_read && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-surface-blue-5" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={cn("text-sm", !notification.is_read ? "font-semibold" : "font-medium")}>
                            {reactorText}
                        </span>
                        <span className="text-xs font-regular text-ink-gray-4/90 shrink-0">
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
                    <div className="text-sm text-ink-gray-8/70 line-clamp-1 mt-0.5 [&_p]:my-0">
                        <MarkdownRenderer content={notification.text} />
                    </div>
                </div>
            </div>
        </button>
    )
})

const EmptyState = ({ showUnread }: { showUnread: boolean }) => (
    <Empty>
        <EmptyHeader>
            <EmptyTitle>{showUnread ? _("You're all caught up") : _("No notifications yet")}</EmptyTitle>
            <EmptyDescription>
                {showUnread
                    ? _("No unread notifications at the moment.")
                    : _("Mentions and reactions to your messages will appear here.")
                }
            </EmptyDescription>
        </EmptyHeader>
    </Empty>
)
