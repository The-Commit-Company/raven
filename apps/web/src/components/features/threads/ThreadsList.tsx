import { useMemo } from "react"
import { ThreadPreviewBox } from "./ThreadPreviewBox"
import { ThreadMessage } from "../../../types/ThreadMessage"
import { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel"
import { UserFields } from "@raven/types/common/UserFields"
import { useUser } from "@hooks/useUser"
import { getDateObject } from "@utils/date"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { DMChannelListItem } from "@raven/types/common/ChannelListItem"

interface ThreadsListProps {
    /** Whether to fetch AI threads */
    aiThreads?: 0 | 1
    /** Thread type: 'all' | 'participating' | 'other' | 'ai' */
    threadType?: 'all' | 'participating' | 'other' | 'ai'
    /** Callback when thread is clicked */
    onThreadClick?: (thread: ThreadMessage) => void
    /** Active thread ID */
    activeThreadID?: string
}

// Dummy users matching those used in ChatStream and Mentions
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

// Dummy participating threads
const dummyParticipatingThreads: ThreadMessage[] = [
    {
        bot: "",
        channel_id: "engineering",
        content: "",
        creation: "2025-06-27T10:00:00",
        file: "",
        hide_link_preview: 0,
        image_height: "",
        image_width: "",
        is_bot_message: 0,
        last_message_timestamp: "2025-06-27T10:00:00",
        link_doctype: "",
        link_document: "",
        message_type: "Text",
        name: "thread-1",
        owner: "Desirae Lipshutz",
        poll_id: "",
        text: "I'd like to start this thread to discuss our AI integration strategy. We need to plan how we're going to implement the new features across different channels and ensure a consistent user experience. I've been researching best practices and noticed some interesting patterns we could adopt.",
        thread_message_id: "thread-1",
        participants: [
            { user_id: "Brandon Franci" },
            { user_id: "Sarah Chen" },
            { user_id: "Mike Rodriguez" },
            { user_id: "Alfonso Vaccarol" }
        ],
        reply_count: 26
    },
    {
        bot: "",
        channel_id: "general",
        content: "",
        creation: "2025-06-14T10:00:00",
        file: "",
        hide_link_preview: 0,
        image_height: "",
        image_width: "",
        is_bot_message: 0,
        last_message_timestamp: "2025-06-14T10:00:00",
        link_doctype: "",
        link_document: "",
        message_type: "Text",
        name: "thread-2",
        owner: "Brandon Franci",
        poll_id: "",
        text: "We installed Raven at Complete Autos last week. Here's how they are using it to streamline their customer communication and improve response times. The team is really excited about the new features!",
        thread_message_id: "thread-2",
        participants: [
            { user_id: "Desirae Lipshutz" },
            { user_id: "Sarah Chen" },
            { user_id: "Mike Rodriguez" },
            { user_id: "Alfonso Vaccarol" }
        ],
        reply_count: 26
    },
    {
        bot: "",
        channel_id: "development",
        content: "",
        creation: "2025-06-20T14:30:00",
        file: "",
        hide_link_preview: 0,
        image_height: "",
        image_width: "",
        is_bot_message: 0,
        last_message_timestamp: "2025-06-20T14:30:00",
        link_doctype: "",
        link_document: "",
        message_type: "Text",
        name: "thread-3",
        owner: "Sarah Chen",
        poll_id: "",
        text: "Can someone help me understand the new API changes? I'm working on integrating the latest version and running into some authentication issues. The documentation mentions using OAuth 2.0 but I'm not sure about the exact flow.",
        thread_message_id: "thread-3",
        participants: [
            { user_id: "Desirae Lipshutz" },
            { user_id: "Brandon Franci" },
            { user_id: "Mike Rodriguez" }
        ],
        reply_count: 12
    },
    {
        bot: "",
        channel_id: "devops",
        content: "",
        creation: "2025-06-18T09:15:00",
        file: "",
        hide_link_preview: 0,
        image_height: "",
        image_width: "",
        is_bot_message: 0,
        last_message_timestamp: "2025-06-18T09:15:00",
        link_doctype: "",
        link_document: "",
        message_type: "Text",
        name: "thread-4",
        owner: "Mike Rodriguez",
        poll_id: "",
        text: "Great news! The performance improvements we discussed are now live. We've reduced response times by 40% and the new caching layer is working perfectly. Let me know if you notice any issues.",
        thread_message_id: "thread-4",
        participants: [
            { user_id: "Desirae Lipshutz" },
            { user_id: "Brandon Franci" },
            { user_id: "Sarah Chen" },
            { user_id: "Alfonso Vaccarol" }
        ],
        reply_count: 8
    },
    {
        bot: "",
        channel_id: "engineering",
        content: "",
        creation: "2025-06-15T16:45:00",
        file: "",
        hide_link_preview: 0,
        image_height: "",
        image_width: "",
        is_bot_message: 0,
        last_message_timestamp: "2025-06-15T16:45:00",
        link_doctype: "",
        link_document: "",
        message_type: "Text",
        name: "thread-5",
        owner: "Alfonso Vaccarol",
        poll_id: "",
        text: "I've been testing the new notification system and it looks really solid. The real-time updates are working smoothly and users seem to be responding well to the new UI. Should we schedule a demo for the rest of the team?",
        thread_message_id: "thread-5",
        participants: [
            { user_id: "Desirae Lipshutz" },
            { user_id: "Brandon Franci" },
            { user_id: "Sarah Chen" }
        ],
        reply_count: 15
    }
]

// Dummy other threads (user is not a participant but is a member of the channel)
const dummyOtherThreads: ThreadMessage[] = [
    {
        bot: "",
        channel_id: "general",
        content: "",
        creation: "2025-06-25T11:00:00",
        file: "",
        hide_link_preview: 0,
        image_height: "",
        image_width: "",
        is_bot_message: 0,
        last_message_timestamp: "2025-06-25T11:00:00",
        link_doctype: "",
        link_document: "",
        message_type: "Text",
        name: "thread-other-1",
        owner: "Brandon Franci",
        poll_id: "",
        text: "Has anyone tried the new feature in the latest release? I'm curious about the performance improvements.",
        thread_message_id: "thread-other-1",
        participants: [
            { user_id: "Sarah Chen" },
            { user_id: "Mike Rodriguez" }
        ],
        reply_count: 5
    },
    {
        bot: "",
        channel_id: "development",
        content: "",
        creation: "2025-06-22T09:30:00",
        file: "",
        hide_link_preview: 0,
        image_height: "",
        image_width: "",
        is_bot_message: 0,
        last_message_timestamp: "2025-06-22T09:30:00",
        link_doctype: "",
        link_document: "",
        message_type: "Text",
        name: "thread-other-2",
        owner: "Sarah Chen",
        poll_id: "",
        text: "I think we should discuss the deployment strategy for next week. What are everyone's thoughts on the timeline?",
        thread_message_id: "thread-other-2",
        participants: [
            { user_id: "Brandon Franci" },
            { user_id: "Mike Rodriguez" },
            { user_id: "Alfonso Vaccarol" }
        ],
        reply_count: 9
    },
    {
        bot: "",
        channel_id: "engineering",
        content: "",
        creation: "2025-06-19T14:20:00",
        file: "",
        hide_link_preview: 0,
        image_height: "",
        image_width: "",
        is_bot_message: 0,
        last_message_timestamp: "2025-06-19T14:20:00",
        link_doctype: "",
        link_document: "",
        message_type: "Text",
        name: "thread-other-3",
        owner: "Mike Rodriguez",
        poll_id: "",
        text: "The documentation needs updating for the new API endpoints. Can someone review the changes I made?",
        thread_message_id: "thread-other-3",
        participants: [
            { user_id: "Desirae Lipshutz" },
            { user_id: "Brandon Franci" }
        ],
        reply_count: 3
    }
]

// Dummy AI threads (DMs with AI)
const dummyAIThreads: ThreadMessage[] = [
    {
        bot: "Raven AI",
        channel_id: "dm-raven-ai",
        content: "",
        creation: "2025-06-26T10:00:00",
        file: "",
        hide_link_preview: 0,
        image_height: "",
        image_width: "",
        is_bot_message: 1,
        last_message_timestamp: "2025-06-26T10:00:00",
        link_doctype: "",
        link_document: "",
        message_type: "Text",
        name: "thread-ai-1",
        owner: "Desirae Lipshutz",
        poll_id: "",
        text: "I can help you with that. Based on your requirements, here's what I recommend for your project setup.",
        thread_message_id: "thread-ai-1",
        participants: [],
        reply_count: 12
    },
    {
        bot: "Raven AI",
        channel_id: "dm-raven-ai",
        content: "",
        creation: "2025-06-24T15:30:00",
        file: "",
        hide_link_preview: 0,
        image_height: "",
        image_width: "",
        is_bot_message: 1,
        last_message_timestamp: "2025-06-24T15:30:00",
        link_doctype: "",
        link_document: "",
        message_type: "Text",
        name: "thread-ai-2",
        owner: "Desirae Lipshutz",
        poll_id: "",
        text: "Let me analyze the code you shared. I've identified several potential improvements we could make.",
        thread_message_id: "thread-ai-2",
        participants: [],
        reply_count: 8
    },
    {
        bot: "Raven AI",
        channel_id: "dm-raven-ai",
        content: "",
        creation: "2025-06-21T08:45:00",
        file: "",
        hide_link_preview: 0,
        image_height: "",
        image_width: "",
        is_bot_message: 1,
        last_message_timestamp: "2025-06-21T08:45:00",
        link_doctype: "",
        link_document: "",
        message_type: "Text",
        name: "thread-ai-3",
        owner: "Desirae Lipshutz",
        poll_id: "",
        text: "Thanks for the question! Here's a detailed explanation of how that feature works.",
        thread_message_id: "thread-ai-3",
        participants: [],
        reply_count: 15
    }
]

// Dummy channels
const dummyChannels: RavenChannel[] = [
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

// Wrapper component to handle data transformation for a single thread
function ThreadPreviewBoxWrapper({
    thread,
    channel,
    users,
    unreadCount,
    onClick,
    isActive
}: {
    thread: ThreadMessage
    channel?: RavenChannel
    users: UserFields[]
    unreadCount: number
    onClick?: () => void
    isActive?: boolean
}) {
    // Get user data
    const { data: userFromHook } = useUser(thread.owner)
    const user = userFromHook || users.find(u => u.name === thread.owner) || null

    // Format date
    const formattedDate = useMemo(() => {
        try {
            const dateObj = getDateObject(thread.creation)
            return dateObj.format('Do MMMM YYYY, hh:mm A')
        } catch {
            return thread.creation
        }
    }, [thread.creation])

    // Extract message content
    const messageContent = useMemo(() => {
        if (thread.text) return thread.text
        if (thread.content) {
            const temp = document.createElement('div')
            temp.innerHTML = thread.content
            return temp.textContent || temp.innerText || ''
        }
        return ''
    }, [thread.text, thread.content])

    // Format channel details
    const channelDetails = useMemo(() => {
        if (!channel) return { channelName: undefined, channelIcon: undefined, isDirectMessage: false }

        if (channel.is_direct_message) {
            const dmChannel = channel as unknown as DMChannelListItem
            const isAIChannel = thread.is_bot_message === 1 || !!thread.bot || channel.name === "dm-raven-ai"

            if (isAIChannel) {
                return {
                    channelName: "DM with Raven AI",
                    channelIcon: undefined,
                    isDirectMessage: true
                }
            }

            const peerUser = users.find(u => u.name === dmChannel.peer_user_id)
            return {
                channelName: `DM with ${peerUser?.full_name ?? dmChannel.peer_user_id ?? "Unknown"}`,
                channelIcon: undefined,
                isDirectMessage: true
            }
        }

        return {
            channelName: channel.channel_name || channel.name,
            channelIcon: <ChannelIcon type={channel.type as 'Public' | 'Private' | 'Open'} className="h-3.5 w-3.5" />,
            isDirectMessage: false
        }
    }, [channel, users, thread.is_bot_message, thread.bot])

    // Check if this is an AI thread
    const isAIThread = thread.is_bot_message === 1 || !!thread.bot

    // Format participant users
    const participantUsers = useMemo(() => {
        if (isAIThread) return []
        if (!thread.participants || thread.participants.length === 0) return []

        return thread.participants
            .map(p => users.find(u => u.name === p.user_id))
            .filter((u): u is UserFields => u !== undefined)
            .map(u => ({
                id: u.name,
                name: u.full_name || u.name,
                image: u.user_image
            }))
    }, [thread.participants, users, isAIThread])

    // Get AI user for AI threads
    const aiUser = useMemo(() => {
        if (!isAIThread) return null
        return {
            name: thread.bot || thread.owner || "Raven AI",
            full_name: thread.bot || thread.owner || "Raven AI",
            user_image: "",
            first_name: "Raven",
            enabled: 1,
            type: "Bot" as const,
            availability_status: "Available" as const,
            custom_status: undefined
        } as UserFields
    }, [isAIThread, thread.bot, thread.owner])

    return (
        <ThreadPreviewBox
            user={user}
            messageContent={messageContent}
            formattedDate={formattedDate}
            replyCount={thread.reply_count ?? 0}
            unreadCount={unreadCount}
            channelName={channelDetails.channelName}
            channelIcon={channelDetails.channelIcon}
            participants={participantUsers}
            aiUser={aiUser}
            isDirectMessage={channelDetails.isDirectMessage}
            onClick={onClick}
            isActive={isActive}
        />
    )
}

export default function ThreadsList({
    aiThreads,
    threadType,
    onThreadClick,
    activeThreadID
}: ThreadsListProps) {
    // Determine thread type from props
    const determinedThreadType = threadType || (aiThreads === 1 ? 'ai' : 'participating')

    // Return appropriate dummy threads based on thread type
    const threads = useMemo(() => {
        let dummyData: ThreadMessage[]
        if (determinedThreadType === 'all') {
            // Combine all thread types for 'all' tab
            dummyData = [...dummyParticipatingThreads, ...dummyOtherThreads, ...dummyAIThreads]
        } else if (determinedThreadType === 'ai') {
            dummyData = dummyAIThreads
        } else if (determinedThreadType === 'other') {
            dummyData = dummyOtherThreads
        } else {
            dummyData = dummyParticipatingThreads
        }

        return dummyData.sort((a, b) =>
            new Date(b.creation).getTime() - new Date(a.creation).getTime()
        )
    }, [determinedThreadType])


    if (threads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <p className="text-base font-medium mb-2 text-foreground text-center max-w-sm">
                    No threads yet
                </p>
                <p className="text-xs text-muted-foreground text-center max-w-sm">
                    Create a thread by clicking on the thread icon on a message
                </p>
            </div>
        )
    }

    const usersArray = Object.values(dummyUsers)

    return (
        <div className="py-2">
            {threads.map((thread) => {
                const channelData = dummyChannels.find(c => c.name === thread.channel_id)
                const unreadCount = 0

                return (
                    <ThreadPreviewBoxWrapper
                        key={thread.name}
                        thread={thread}
                        channel={channelData}
                        users={usersArray}
                        unreadCount={unreadCount}
                        onClick={() => onThreadClick?.(thread)}
                        isActive={activeThreadID === thread.name}
                    />
                )
            })}
        </div>
    )
}
