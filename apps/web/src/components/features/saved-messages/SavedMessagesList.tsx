import { useMemo } from "react"
import { SavedMessagePreviewBox } from "./SavedMessagePreviewBox"
import { SavedMessage, SavedMessageStatus } from "../../../types/SavedMessage"
import { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel"
import { UserFields } from "@raven/types/common/UserFields"
import { useUser } from "@hooks/useUser"
import { getDateObject } from "@utils/date"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { DMChannelListItem } from "@raven/types/common/ChannelListItem"
import { Message } from "@raven/types/common/Message"

interface SavedMessagesListProps {
    /** Status filter */
    status: SavedMessageStatus
    /** Callback for marking as complete */
    onMarkComplete?: (message: SavedMessage) => void
    /** Callback for setting reminder */
    onSetReminder?: (message: SavedMessage, option: string) => void
    /** Callback for archiving */
    onArchive?: (message: SavedMessage) => void
    /** Callback for unsaving */
    onUnsave?: (message: SavedMessage) => void
    /** Search query filter */
    searchQuery?: string
    /** Channel filter */
    channelFilter?: string
}

// Dummy users matching those used in ThreadsList
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
    },
}

// Dummy saved messages - 3-4 messages per tab
const dummySavedMessages: SavedMessage[] = [
    // In progress tab - 4 messages
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
        name: "saved-thread-1",
        owner: "Desirae Lipshutz",
        poll_id: "",
        text: "I'd like to start this thread to discuss our AI integration strategy. We need to plan how we're going to implement the new features across different channels and ensure a consistent user experience.",
        thread_message_id: "thread-1",
        participants: [
            { user_id: "Brandon Franci" },
            { user_id: "Sarah Chen" },
            { user_id: "Mike Rodriguez" }
        ],
        workspace: "main",
        reply_count: 26,
        saved_at: "2025-06-27T10:05:00",
        status: "in_progress",
        is_thread: 1
    },
    {
        name: "saved-msg-1",
        owner: "Brandon Franci",
        channel_id: "general",
        creation: "2025-06-14T10:00:00",
        text: "We installed Raven at Complete Autos last week. Here's how they are using it to streamline their customer communication and improve response times.",
        message_type: "Text",
        is_thread: 0,
        saved_at: "2025-06-14T10:05:00",
        status: "in_progress"
    },
    {
        name: "saved-msg-2",
        owner: "Sarah Chen",
        channel_id: "development",
        creation: "2025-06-20T14:30:00",
        text: "Can someone help me understand the new API changes? I'm working on integrating the latest version and running into some authentication issues.",
        message_type: "Text",
        is_thread: 0,
        saved_at: "2025-06-20T14:35:00",
        status: "in_progress"
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
        name: "saved-thread-2",
        owner: "Brandon Franci",
        poll_id: "",
        text: "We installed Raven at Complete Autos last week. Here's how they are using it to streamline their customer communication and improve response times.",
        thread_message_id: "thread-2",
        participants: [
            { user_id: "Desirae Lipshutz" },
            { user_id: "Sarah Chen" },
            { user_id: "Mike Rodriguez" }
        ],
        workspace: "main",
        reply_count: 26,
        saved_at: "2025-06-14T10:05:00",
        status: "in_progress",
        is_thread: 1
    },
    // Archived tab - 3 messages
    {
        name: "saved-msg-3",
        owner: "Mike Rodriguez",
        channel_id: "engineering",
        creation: "2025-06-15T09:00:00",
        text: "I've been testing the new notification system and it looks really solid. The real-time updates are working smoothly.",
        message_type: "Text",
        is_thread: 0,
        saved_at: "2025-06-15T09:05:00",
        status: "archived"
    },
    {
        name: "saved-msg-4",
        owner: "Alfonso Vaccarol",
        channel_id: "devops",
        creation: "2025-06-18T09:15:00",
        text: "The performance improvements we discussed are now live. We've reduced response times by 40%.",
        message_type: "Text",
        is_thread: 0,
        saved_at: "2025-06-18T09:20:00",
        status: "archived"
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
        name: "saved-thread-3",
        owner: "Sarah Chen",
        poll_id: "",
        text: "I think we should discuss the deployment strategy for next week. What are everyone's thoughts on the timeline?",
        thread_message_id: "thread-3",
        participants: [
            { user_id: "Brandon Franci" },
            { user_id: "Mike Rodriguez" }
        ],
        workspace: "main",
        reply_count: 9,
        saved_at: "2025-06-22T09:35:00",
        status: "archived",
        is_thread: 1
    },
    // Completed tab - 3 messages
    {
        name: "saved-msg-5",
        owner: "Brandon Franci",
        channel_id: "general",
        creation: "2025-06-25T11:00:00",
        text: "Has anyone tried the new feature in the latest release? I'm curious about the performance improvements.",
        message_type: "Text",
        is_thread: 0,
        saved_at: "2025-06-25T11:05:00",
        status: "completed"
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
        name: "saved-thread-4",
        owner: "Mike Rodriguez",
        poll_id: "",
        text: "Great news! The performance improvements we discussed are now live. We've reduced response times by 40% and the new caching layer is working perfectly.",
        thread_message_id: "thread-4",
        participants: [
            { user_id: "Desirae Lipshutz" },
            { user_id: "Brandon Franci" },
            { user_id: "Sarah Chen" }
        ],
        workspace: "main",
        reply_count: 8,
        saved_at: "2025-06-18T09:20:00",
        status: "completed",
        is_thread: 1
    },
    {
        name: "saved-msg-6",
        owner: "Desirae Lipshutz",
        channel_id: "engineering",
        creation: "2025-06-16T16:45:00",
        text: "The new notification system is working smoothly and users seem to be responding well to the new UI.",
        message_type: "Text",
        is_thread: 0,
        saved_at: "2025-06-16T16:50:00",
        status: "completed"
    },
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

// Wrapper component to handle data transformation for a single saved message
function SavedMessagePreviewBoxWrapper({
    message,
    channel,
    users,
    onMarkComplete,
    onSetReminder,
    onArchive,
    onUnsave
}: {
    message: SavedMessage
    channel?: RavenChannel
    users: UserFields[]
    onMarkComplete?: () => void
    onSetReminder?: (option: string) => void
    onArchive?: () => void
    onUnsave?: () => void
}) {
    // Get user data
    const { data: userFromHook } = useUser(message.owner)
    const user = userFromHook || users.find(u => u.name === message.owner) || null

    // Format date
    const formattedDate = useMemo(() => {
        try {
            const dateObj = getDateObject(message.creation)
            return dateObj.format('Do MMMM YYYY, hh:mm A')
        } catch {
            return message.creation
        }
    }, [message.creation])

    // Extract message content
    const messageContent = useMemo(() => {
        if (message.text) return message.text
        if (message.content) {
            const temp = document.createElement('div')
            temp.innerHTML = message.content
            return temp.textContent || temp.innerText || ''
        }
        return ''
    }, [message.text, message.content])

    // Format channel details
    const channelDetails = useMemo(() => {
        if (!channel) return { channelName: undefined, channelIcon: undefined, isDirectMessage: false }

        if (channel.is_direct_message) {
            const dmChannel = channel as unknown as DMChannelListItem
            return {
                channelName: `DM with ${dmChannel.peer_user_id ?? "Unknown"}`,
                channelIcon: undefined,
                isDirectMessage: true
            }
        }

        return {
            channelName: channel.channel_name || channel.name,
            channelIcon: <ChannelIcon type={channel.type as 'Public' | 'Private' | 'Open'} className="h-3.5 w-3.5" />,
            isDirectMessage: false
        }
    }, [channel])

    // Check if this is a thread message
    const isThreadMessage = 'thread_message_id' in message

    // Format participant users as UserFields array (only for thread messages)
    const participantUsers = useMemo(() => {
        if (!isThreadMessage || !message.participants || message.participants.length === 0) return []

        return message.participants
            .map(p => users.find(u => u.name === p.user_id))
            .filter((u): u is UserFields => u !== undefined)
    }, [message, users, isThreadMessage])

    const hasReminder = !!(message.reminder_date && message.reminder_time)

    // Convert SavedMessage to Message format for common components
    const messageAsMessage: Message = useMemo(() => {
        const textContent = message.text || ""
        // Extract plain text from HTML content if needed, otherwise use text
        let htmlContent = message.content || ""
        if (!htmlContent && textContent) {
            // If no HTML content, create simple HTML from text
            htmlContent = textContent.replace(/\n/g, '<br>')
        }
        // Ensure content is set to text if both are empty
        if (!htmlContent && !textContent) {
            htmlContent = ""
        }

        if (isThreadMessage) {
            // For thread messages, create a basic message structure
            return {
                name: message.name,
                owner: message.owner,
                _liked_by: "",
                channel_id: message.channel_id,
                creation: message.creation,
                modified: message.creation,
                message_type: message.message_type,
                message_reactions: null,
                is_continuation: 0,
                is_reply: 0,
                linked_message: null,
                link_doctype: "",
                link_document: "",
                is_edited: 0,
                is_forwarded: 0,
                replied_message_details: undefined,
                poll_id: "",
                is_bot_message: message.is_bot_message || 0,
                bot: message.bot || "",
                hide_link_preview: message.hide_link_preview || 0,
                is_thread: 1,
                is_pinned: 0,
                text: textContent,
                content: htmlContent || textContent
            } as Message
        } else {
            // For regular messages - ensure content is set
            return {
                name: message.name,
                owner: message.owner,
                _liked_by: "",
                channel_id: message.channel_id,
                creation: message.creation,
                modified: message.creation,
                message_type: message.message_type,
                message_reactions: null,
                is_continuation: 0,
                is_reply: 0,
                linked_message: null,
                link_doctype: "",
                link_document: "",
                is_edited: 0,
                is_forwarded: 0,
                replied_message_details: undefined,
                poll_id: "",
                is_bot_message: message.is_bot_message || 0,
                bot: message.bot || "",
                hide_link_preview: 0,
                is_thread: message.is_thread || 0,
                is_pinned: 0,
                text: textContent,
                content: htmlContent || textContent
            } as Message
        }
    }, [message, isThreadMessage])

    return (
        <SavedMessagePreviewBox
            message={messageAsMessage}
            user={user}
            channelName={channelDetails.channelName}
            channelIcon={channelDetails.channelIcon}
            participantUsers={participantUsers}
            isDirectMessage={channelDetails.isDirectMessage}
            isThread={isThreadMessage}
            replyCount={isThreadMessage ? (message.reply_count ?? 0) : 0}
            formattedDate={formattedDate}
            onMarkComplete={onMarkComplete}
            onSetReminder={onSetReminder}
            onArchive={onArchive}
            onUnsave={onUnsave}
            hasReminder={hasReminder}
        />
    )
}

export default function SavedMessagesList({
    status,
    onMarkComplete,
    onSetReminder,
    onArchive,
    onUnsave,
    searchQuery = '',
    channelFilter = 'all'
}: SavedMessagesListProps) {
    // Filter messages by status, search query, and channel
    const messages = useMemo(() => {
        return dummySavedMessages
            .filter(msg => {
                // Filter by status
                if (msg.status !== status) return false

                // Filter by channel
                if (channelFilter !== 'all' && msg.channel_id !== channelFilter) return false

                // Filter by search query
                if (searchQuery) {
                    const query = searchQuery.toLowerCase()
                    const text = (msg.text || '').toLowerCase()
                    const content = (msg.content || '').toLowerCase()
                    if (!text.includes(query) && !content.includes(query)) return false
                }

                return true
            })
            .sort((a, b) =>
                new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
            )
    }, [status, searchQuery, channelFilter])

    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <p className="text-base font-medium mb-2 text-foreground text-center max-w-sm">
                    No saved messages {status === 'in_progress' ? 'in progress' : status === 'archived' ? 'archived' : 'completed'} yet
                </p>
                <p className="text-xs text-muted-foreground text-center max-w-sm">
                    {status === 'in_progress'
                        ? 'Save messages to view them here'
                        : status === 'archived'
                            ? 'Archived messages will appear here'
                            : 'Completed messages will appear here'}
                </p>
            </div>
        )
    }

    const usersArray = Object.values(dummyUsers)

    return (
        <div className="py-2">
            {messages.map((message) => {
                const channelData = dummyChannels.find(c => c.name === message.channel_id)

                return (
                    <SavedMessagePreviewBoxWrapper
                        key={message.name}
                        message={message}
                        channel={channelData}
                        users={usersArray}
                        onMarkComplete={() => onMarkComplete?.(message)}
                        onSetReminder={(option) => onSetReminder?.(message, option)}
                        onArchive={() => onArchive?.(message)}
                        onUnsave={() => onUnsave?.(message)}
                    />
                )
            })}
        </div>
    )
}

