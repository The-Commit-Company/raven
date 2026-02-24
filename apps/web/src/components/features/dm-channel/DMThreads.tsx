import { ScrollArea } from "@components/ui/scroll-area"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { UserFields } from "@raven/types/common/UserFields"
import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import { MessageSquareText, Search, Forward } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSetAtom } from "jotai"
import { forwardThreadModalAtom } from "@utils/channelAtoms"

interface Thread {
    name: string
    title: string
    message_count: number
    last_message: string
    last_message_owner: UserFields
    last_activity: string
    is_active: boolean
}

// Placeholder threads for this DM conversation (replace with API when available)
const dummyThreads: Thread[] = [
    {
        name: "dm-thread-1",
        title: "Follow-up on the design review",
        message_count: 5,
        last_message: "I've updated the mockups based on your feedback.",
        last_message_owner: {
            name: "john.doe",
            full_name: "John Doe",
            user_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            first_name: "John",
            enabled: 1,
            type: "User",
            availability_status: "Available",
            custom_status: undefined,
        },
        last_activity: "2 hours ago",
        is_active: true,
    },
    {
        name: "dm-thread-2",
        title: "Meeting notes",
        message_count: 3,
        last_message: "Here are the action items we discussed.",
        last_message_owner: {
            name: "jane.smith",
            full_name: "Jane Smith",
            user_image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            first_name: "Jane",
            enabled: 1,
            type: "User",
            availability_status: "Available",
            custom_status: undefined,
        },
        last_activity: "1 day ago",
        is_active: true,
    },
]

interface DMThreadsProps {
    channelId: string
}

export function DMThreads({ channelId }: DMThreadsProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const navigate = useNavigate()
    const setForwardThread = useSetAtom(forwardThreadModalAtom)

    const filteredThreads = dummyThreads.filter(
        (thread) =>
            thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            thread.last_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            thread.last_message_owner.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleThreadClick = (threadId: string) => {
        navigate(`/dm-channel/${encodeURIComponent(channelId)}/thread/${encodeURIComponent(threadId)}`, {
            replace: true,
        })
    }

    const handleForward = (e: React.MouseEvent, thread: Thread) => {
        e.stopPropagation()
        setForwardThread({
            threadId: thread.name,
            sourceChannelId: channelId,
            isSourceDm: true,
            sourceWorkspace: null,
            title: thread.title,
            messageCount: thread.message_count,
            rootMessageSnippet: thread.last_message,
            lastActivity: thread.last_activity,
            lastMessageOwnerName: thread.last_message_owner.full_name ?? thread.last_message_owner.name ?? "",
        })
    }

    return (
        <div className="flex h-full flex-col">
            <div className="px-1 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search threads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-md border border-border/70 bg-background py-2 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-2 px-1 pb-4">
                    {filteredThreads.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">No threads in this conversation yet.</p>
                    ) : (
                        filteredThreads.map((thread) => (
                            <div
                                key={thread.name}
                                className="group cursor-pointer rounded-lg border border-border/70 p-3 transition-colors hover:bg-muted/50"
                                tabIndex={0}
                                role="button"
                                onClick={() => handleThreadClick(thread.name)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        handleThreadClick(thread.name)
                                    }
                                }}
                                aria-label={`Open thread: ${thread.title}`}
                            >
                                <div className="mb-1 flex flex-1 items-start justify-between gap-3">
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                        <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                        <h3 className="truncate text-sm font-medium text-foreground">{thread.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0"
                                            onClick={(e) => handleForward(e, thread)}
                                            aria-label="Forward thread"
                                        >
                                            <Forward className="h-3.5 w-3.5" />
                                        </Button>
                                        <Badge variant="secondary" className="text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-300 bg-gray-100">
                                            {thread.message_count > 9 ? "9+" : thread.message_count}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="mb-2 line-clamp-2 text-[13px]">{thread.last_message}</div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                                    <UserAvatar user={thread.last_message_owner} size="xs" showStatusIndicator={false} />
                                    <span>{thread.last_message_owner.full_name}</span>
                                    <span>•</span>
                                    <span>{thread.last_activity}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
