import { SidebarTrigger } from "@components/ui/sidebar";
import { Separator } from "@components/ui/separator";
import { UserAvatar } from "@components/features/message/UserAvatar";
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon";
import { Link } from "react-router-dom";
import type { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel";
import type { RavenMessage } from "@raven/types/RavenMessaging/RavenMessage";
import { AtSignIcon, MessageSquare, Check } from "lucide-react";
import { UserFields } from "@raven/types/common/UserFields";

interface MentionObject {
    /** ID of the message */
    name: string
    /** ID of the channel */
    channel_id: string
    /** Type of the channel */
    channel_type: RavenChannel['type']
    /** Name of the channel */
    channel_name: string
    /** Workspace name */
    workspace?: string
    /** Whether the channel is a thread */
    is_thread: 0 | 1
    /** Whether the channel is a direct message */
    is_direct_message: 0 | 1
    /** Date and time of the message */
    creation: string
    /** Type of the message */
    message_type: RavenMessage['message_type']
    /** Owner of the message */
    owner: string
    /** Text of the message */
    text: string
    /** Whether the mention has been read */
    is_read?: boolean
}

// Dummy users matching those used in ChatStream
const dummyUsers: Record<string, UserFields> = {
    "Desirae Lipshutz": {
        name: "Desirae Lipshutz",
        full_name: "Desirae Lipshutz",
        user_image: "https://randomuser.me/api/portraits/women/44.jpg",
        first_name: "Desirae",
        enabled: 1,
        type: "User",
        availability_status: "Available",
        custom_status: undefined
    },
    "Brandon Franci": {
        name: "Brandon Franci",
        full_name: "Brandon Franci",
        user_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        first_name: "Brandon",
        enabled: 1,
        type: "User",
        availability_status: "Available",
        custom_status: undefined
    },
    "Sarah Chen": {
        name: "Sarah Chen",
        full_name: "Sarah Chen",
        user_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        first_name: "Sarah",
        enabled: 1,
        type: "User",
        availability_status: "Available",
        custom_status: undefined
    },
    "Mike Rodriguez": {
        name: "Mike Rodriguez",
        full_name: "Mike Rodriguez",
        user_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        first_name: "Mike",
        enabled: 1,
        type: "User",
        availability_status: "Available",
        custom_status: undefined
    },
    "Alfonso Vaccarol": {
        name: "Alfonso Vaccarol",
        full_name: "Alfonso Vaccarol",
        user_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        first_name: "Alfonso",
        enabled: 1,
        type: "User",
        availability_status: "Available",
        custom_status: undefined
    }
}

// Sample data for messages with mentions (creation will be pre-formatted from backend in Slack style)
const sampleMentions: MentionObject[] = [
    {
        name: "msg-1",
        channel_id: "development",
        channel_type: "Public",
        channel_name: "Development",
        workspace: "main",
        is_thread: 0,
        is_direct_message: 0,
        creation: "10:30 AM",
        message_type: "Text",
        owner: "Sarah Chen",
        text: "Hey <span class=\"mention\">@Desirae Lipshutz</span>, can you review the latest PR? <span class=\"mention\">@Brandon Franci</span> might want to take a look too.",
        is_read: false
    },
    {
        name: "msg-2",
        channel_id: "devops",
        channel_type: "Private",
        channel_name: "DevOps",
        workspace: "main",
        is_thread: 0,
        is_direct_message: 0,
        creation: "9:15 AM",
        message_type: "Text",
        owner: "Alfonso Vaccarol",
        text: "<span class=\"mention\">@Desirae Lipshutz</span> The deployment is scheduled for tomorrow at 2 PM. Please make sure all tests pass.",
        is_read: false
    },
    {
        name: "msg-3",
        channel_id: "general",
        channel_type: "Public",
        channel_name: "General",
        workspace: "main",
        is_thread: 0,
        is_direct_message: 0,
        creation: "Yesterday at 4:45 PM",
        message_type: "Text",
        owner: "Brandon Franci",
        text: "Great work on the new feature <span class=\"mention\">@Desirae Lipshutz</span>! The client loved the demo.",
        is_read: true
    },
    {
        name: "msg-4",
        channel_id: "support",
        channel_type: "Open",
        channel_name: "Support",
        workspace: "main",
        is_thread: 0,
        is_direct_message: 0,
        creation: "Yesterday at 2:20 PM",
        message_type: "Text",
        owner: "Mike Rodriguez",
        text: "<span class=\"mention\">@Desirae Lipshutz</span> can you help debug this issue? I'm getting an error in the authentication flow.",
        is_read: false
    },
    {
        name: "msg-5",
        channel_id: "team-sync",
        channel_type: "Private",
        channel_name: "Team Sync",
        workspace: "main",
        is_thread: 0,
        is_direct_message: 0,
        creation: "Monday at 11:30 AM",
        message_type: "Text",
        owner: "Sarah Chen",
        text: "Meeting rescheduled to 3 PM <span class=\"mention\">@Desirae Lipshutz</span> <span class=\"mention\">@Brandon Franci</span> <span class=\"mention\">@Alfonso Vaccarol</span>",
        is_read: true
    },
    {
        name: "msg-6",
        channel_id: "documentation",
        channel_type: "Public",
        channel_name: "Documentation",
        workspace: "main",
        is_thread: 0,
        is_direct_message: 0,
        creation: "Jan 12 at 5:15 PM",
        message_type: "Text",
        owner: "Alfonso Vaccarol",
        text: "<span class=\"mention\">@Desirae Lipshutz</span> I've updated the documentation as per your feedback. Please take a look when you get a chance.",
        is_read: false
    }
];

const MentionItem = ({ mention }: { mention: MentionObject }) => {
    // Use dummy users for now, in production this would use useGetUser
    const user = dummyUsers[mention.owner]
    const senderName = user?.full_name ?? user?.name ?? mention.owner

    return (
        <Link
            to={`/channel/${mention.channel_id}?message_id=${mention.name}`}
            className={`group block px-6 py-3 hover:bg-accent/50 transition-colors relative ${!mention.is_read ? 'bg-muted/10' : ''
                }`}
        >
            {/* Indicator line */}
            {!mention.is_read && (
                <div className="absolute left-2 top-2 bottom-2 w-1 bg-notification rounded-full" />
            )}

            <div className="flex items-start gap-3">
                <UserAvatar user={user} size="md" />

                <div className="flex-1">
                    {/* Name and time - matching message header */}
                    <div className="flex items-baseline gap-2">
                        <span className={`text-sm ${!mention.is_read ? 'font-semibold' : 'font-medium'}`}>
                            {senderName}
                        </span>
                        <span className="text-xs font-light text-muted-foreground/90">
                            {mention.creation}
                        </span>

                        {mention.is_thread ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground/80">
                                <MessageSquare className="w-3 h-3" />
                                <span>Thread</span>
                            </div>
                        ) : !mention.is_direct_message && (
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-muted-foreground/80">in</span>
                                <ChannelIcon type={mention.channel_type} className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium text-foreground/70 group-hover:text-primary group-hover:underline transition-colors">
                                    {mention.channel_name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Message content - matching message text styling */}
                    <div
                        className="text-[13px] text-primary line-clamp-2 [&_.mention]:text-mention [&_.mention]:font-medium [&_.mention]:bg-blue-50 dark:[&_.mention]:bg-blue-950/50 [&_.mention]:px-1 [&_.mention]:py-0.5 [&_.mention]:rounded [&_p]:my-0"
                        dangerouslySetInnerHTML={{ __html: mention.text }}
                    />
                </div>
            </div>
        </Link>
    )
}

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-6">
        <div className="rounded-full bg-muted/80 p-8 mb-6">
            <AtSignIcon className="w-16 h-16 text-muted-foreground/60" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-semibold mb-2">No mentions yet</h3>
        <p className="text-muted-foreground text-center max-w-sm leading-relaxed">
            When someone mentions you in a message, it will appear here so you never miss important conversations.
        </p>
    </div>
)

export default function Mentions() {
    const isLoading = false
    const mentions = sampleMentions
    const unreadCount = mentions.filter(mention => !mention.is_read).length

    const handleMarkAllAsRead = () => {
        // In production, this would make an API call to mark all mentions as read
        console.log("Marking all mentions as read")
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
                    <div className="flex items-center gap-2">
                        <span className="text-md font-semibold">Mentions</span>
                        {unreadCount > 0 && (
                            <div className="bg-muted text-foreground rounded px-1.5 py-0.5 text-[10px] font-semibold min-w-[18px] text-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side - Mark as read button */}
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
                    >
                        <Check className="w-3 h-3" />
                        Mark all as read
                    </button>
                )}
            </header>

            <div className="flex flex-1 flex-row gap-0 p-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-muted-foreground">Loading mentions...</div>
                        </div>
                    ) : mentions.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="py-2">
                            {mentions.map((mention) => (
                                <MentionItem key={mention.name} mention={mention} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}