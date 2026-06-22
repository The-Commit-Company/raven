import { X, MoreVertical, Bell, LogOut, Trash2, ChevronDown, ChevronUp, Paperclip } from "lucide-react"
import { Button } from "@components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import ChatInput from "@components/features/ChatInput/ChatInput"
import ChatStream from "@components/features/message/ChatStream"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { MessageContent } from "@components/features/message/renderers/MessageContent"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { useChannelById } from "@stores/channels/useChannelList"
import { focusComposer } from "@components/features/ChatInput/composerFocus"
import { useAtom } from "jotai"
import { pollDrawerAtom } from "@utils/channelAtoms"
import { PollDrawer } from "./renderers/PollDrawer"
import { useUser } from "@hooks/useUser"
import { channelMessagesStore } from "@stores/messages/store"
import type { Message } from "@raven/types/common/Message"
import { getDateObject } from "@lib/date"
import _ from "@lib/translate"
import { useCallback, useRef, useState, useSyncExternalStore } from "react"
import { useFrappeGetDoc } from "frappe-react-sdk"
import { useHotkeys } from "react-hotkeys-hook"
import { useNavigate, useParams } from "react-router-dom"

/**
 * The thread's root (parent) message. A thread's id IS that message's id, so when the thread
 * was opened from its channel the message is already in that channel's loaded window — read it
 * from the store and skip the fetch (v2 always refetched). Falls back to a single-doc fetch for
 * deep links / when the parent has scrolled out of the window.
 */
const useThreadRootMessage = (threadID: string, parentID: string): Message | undefined => {
    const fromStore = useSyncExternalStore(
        useCallback((cb) => channelMessagesStore.subscribe(parentID, cb), [parentID]),
        () => channelMessagesStore.getState(parentID).byId.get(threadID),
    )
    // Empty name disables the fetch when the store already has the message.
    const { data } = useFrappeGetDoc<Message>("Raven Message", fromStore ? "" : threadID, fromStore ? null : `raven_message:${threadID}`)
    return fromStore ?? data
}

/** The file URL on file/image messages (the Message union only has `file` on those variants). */
const messageFile = (message: Message): string | undefined =>
    "file" in message ? (message.file as string | undefined) : undefined

/** One-line text/file summary of the root message for the collapsed preview. */
const rootPreviewText = (message: Message): string => {
    const text = (message.content ?? "").trim()
    if (text) return text.split("\n")[0] // first line (e.g. a poll's question)
    const file = messageFile(message)
    if (file) return file.split("/").pop() ?? _("Attachment")
    return _("Message")
}

/**
 * The thread's root (parent) message, shown above the replies so you know what you're
 * replying to. Collapsed to a one-line preview by default (keeps the panel compact) with an
 * expand toggle that reveals the full message via the shared renderer.
 */
const ThreadRootMessage = ({ message }: { message: Message }) => {
    const [expanded, setExpanded] = useState(false)
    const author = useUser(message.is_bot_message ? (message.bot ?? message.owner) : message.owner)
    const authorName = author?.full_name || author?.name || _("User")

    return (
        <div className="shrink-0 border-b border-outline-gray-2 px-4 py-2">
            <div className="flex items-start gap-2.5">
                {author ? (
                    <UserAvatar user={author} size="md" showStatusIndicator={false} />
                ) : (
                    <div className="size-7 rounded-md bg-surface-gray-2" />
                )}
                <div className="flex-1 min-w-0">
                    {/* Chevron lives on the header line (not beside the body), so it never
                        overlaps the expanded content regardless of how tall it grows. */}
                    <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-gray-9">{authorName}</span>
                        <span className="shrink-0 text-xs text-ink-gray-5">
                            {getDateObject(message.creation).format("MMM D, h:mm A")}
                        </span>
                        <Button
                            variant="ghost"
                            size="xs"
                            isIconButton
                            className="shrink-0"
                            onClick={() => setExpanded((v) => !v)}
                            aria-label={expanded ? _("Collapse message") : _("Expand message")}
                        >
                            {expanded ? <ChevronUp /> : <ChevronDown />}
                        </Button>
                    </div>
                    <div className="pt-1">
                        {expanded ? (
                            <MessageContent message={message} />
                        ) : (
                            <p className="flex items-center gap-1 truncate text-sm text-ink-gray-6">
                                {messageFile(message) && <Paperclip className="size-3.5 shrink-0 text-ink-gray-5" />}
                                <span className="truncate">{rootPreviewText(message)}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

/** Rendered as a child route (`:id/thread/:threadID`) inside the chat view's drawer slot. */
export default function ThreadDrawer() {
    // A thread IS a channel (its id = the original message id), so the stream + composer
    // target the threadID. The parent channel (the route :id) is only used to inherit
    // DM status for the composer's mention banner (thread channels aren't in the store).
    const { threadID } = useParams<{ threadID: string }>()
    const parentID = useCurrentChannelID()
    const parentIsDM = useChannelById(parentID)?.is_direct_message === 1
    // Hook called unconditionally (threadID is always set for this route); "" is a safe no-op.
    const rootMessage = useThreadRootMessage(threadID ?? "", parentID)
    const threadInputRef = useRef<HTMLFormElement>(null)
    const navigate = useNavigate()

    // A poll inside the thread opens its detail drawer keyed by the THREAD's id — the thread
    // occupies the only rail slot, so we host the drawer here (overlaying the thread), mirroring
    // ChatContentView for the channel. Closing it returns to the thread.
    const [threadPoll, setThreadPoll] = useAtom(pollDrawerAtom(threadID ?? ""))

    const handleClose = () => {
        // Route-relative: from `:id/thread/:threadID` back to the parent `:id` route
        navigate("..", { replace: true })
        // Return focus to the parent channel's composer (it stayed mounted). Same hook the
        // attach paths use — see composerFocus.
        focusComposer(parentID)
    }

    // Esc closes the thread's poll drawer first, then the thread. enableOnContentEditable
    // because the thread composer (ProseMirror) is a contentEditable, not a form tag — without
    // it the hotkey wouldn't fire while the (autofocused) editor has focus. The editor stops
    // propagation only when it actually cancels a reply, so otherwise Escape bubbles here. No
    // overlay gate needed: ChatContentView renders the thread only when no parent poll/context
    // drawer is up, so this can't double-fire.
    useHotkeys(
        "esc",
        () => {
            if (threadPoll) setThreadPoll(null)
            else handleClose()
        },
        { enableOnFormTags: true, enableOnContentEditable: true },
    )

    // A poll in this thread takes over the rail (its detail drawer overlays the thread).
    if (threadPoll) {
        return (
            <div className="flex flex-col h-full">
                <PollDrawer
                    user={threadPoll.user}
                    poll={threadPoll.poll}
                    currentUserVotes={threadPoll.currentUserVotes}
                    onClose={() => setThreadPoll(null)}
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
                <h2 className="text-sm font-medium">Thread</h2>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                isIconButton
                                aria-label="Thread settings"
                            >
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-48">
                            <DropdownMenuItem onClick={() => console.log("Toggle notifications")}>
                                <Bell className="h-4 w-4 mr-2" />
                                Enable Notifications
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log("Leave thread")}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Leave Thread
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log("Delete thread")}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Thread
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="ghost"
                        size="sm"
                        isIconButton
                        onClick={handleClose}
                        aria-label="Close thread"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Root message — what this thread is about (collapsed preview above the replies) */}
            {rootMessage && <ThreadRootMessage key={rootMessage.name} message={rootMessage} />}

            {/* Thread messages — ChatStream owns its own scroll/virtualization */}
            {threadID && <ChatStream channelID={threadID} />}

            {/* Message input — posts into the thread channel */}
            <div className="shrink-0">
                {threadID && <ChatInput channelID={threadID} ref={threadInputRef} isDirectMessage={parentIsDM} />}
            </div>
        </div>
    )
}
