import { useContext, useMemo } from "react"
import { getDefaultStore, useSetAtom } from "jotai"
import { useNavigate, useParams } from "react-router-dom"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { toast } from "sonner"
import {
    Bookmark,
    Copy,
    Link,
    LucideIcon,
    MessageSquareText,
    Pencil,
    Pin,
    Reply,
    SmilePlus,
    Trash2,
} from "lucide-react"
import { editingMessageAtom, messageDialogAtom, replyToMessageAtom } from "@utils/channelAtoms"
import { resolveEditTarget } from "./editTarget"
import { channelMessagesStore } from "@stores/messages/store"
import { seedThreadMeta } from "@stores/threads/useThreadMeta"
import { getErrorMessage } from "@lib/frappe"
import _ from "@lib/translate"
import type { Message } from "@raven/types/common/Message"
import { useUserCookieData } from "@hooks/useUserCookieData"

export type MessageAction = {
    id: string
    label: string
    icon: LucideIcon
    onSelect: () => void
    /** Renders in the destructive style (delete). */
    danger?: boolean
}

const stub = (label: string) => () => toast.info(`${label} — ${_("coming soon")}`)

/** Strips rich-text markup so "Copy" puts plain text on the clipboard. */
const toPlainText = (html: string): string => {
    return new DOMParser().parseFromString(html, "text/html").body.textContent ?? ""
}

/**
 * Builds the action groups for a message — the single source of truth rendered
 * by the desktop context menu, the mobile bottom sheet, and (later) the hover
 * toolbar. Groups map to visual sections separated by dividers.
 *
 * Mutating actions (edit/delete/pin/save/reactions) follow the optimistic
 * contract when implemented: (1) apply to the channel message store
 * synchronously via its action methods, (2) fire the API call, (3) on failure,
 * resync the channel window and toast. The store's idempotent, monotonic
 * upserts make resync a safe universal rollback.
 */
export const useMessageActions = (message: Message | null): MessageAction[][] => {
    const { name: currentUser } = useUserCookieData()
    const setDialog = useSetAtom(messageDialogAtom)
    const navigate = useNavigate()
    const { call } = useContext(FrappeContext) as FrappeConfig
    // A thread is itself a channel whose id === the parent message id, so a thread
    // reply's channel_id equals the route's threadID. react-router scopes this param
    // to the thread route's subtree, so the channel stream never sees it — letting us
    // tell "inside a thread" apart from "inside a channel" without prop-drilling.
    const { threadID } = useParams()

    return useMemo(() => {
        if (!message) return []

        const isOwner = currentUser === message.owner && !message.is_bot_message
        const hasReactions = Object.keys(JSON.parse(message.message_reactions || "{}")).length > 0
        const inThread = message.channel_id === threadID

        // Respond: reply + thread creation (join/mute need membership context we don't load here)
        const respond: MessageAction[] = [
            {
                id: "reply",
                label: _("Reply"),
                icon: Reply,
                // Set the channel's reply target; the composer reads it and shows the banner.
                onSelect: () => getDefaultStore().set(replyToMessageAtom(message.channel_id), message),
            },
        ]
        // Create thread only inside a channel: not on a message that already has one
        // (is_thread), and not on a thread reply (inThread). The thread's id IS the
        // message id; a batch threads off its last/newest member (already this target).
        if (!message.is_thread && !inThread) {
            respond.push({
                id: "create-thread",
                label: _("Create thread"),
                icon: MessageSquareText,
                onSelect: () => {
                    const threadID = message.name
                    // Strip any open /thread/... so we navigate from the channel base.
                    const base = window.location.pathname.split("/thread")[0]
                    call.post("raven.api.threads.create_thread", { message_id: threadID })
                        .then(() => {
                            // Reflect the new thread on the parent (shows the pill) and seed an
                            // empty reply count, then open it.
                            channelMessagesStore.messageEdited(message.channel_id, threadID, { is_thread: 1 })
                            seedThreadMeta(threadID, 0)
                            navigate(`${base}/thread/${threadID}`)
                        })
                        .catch((e) => toast.error(_("Could not create thread"), { description: getErrorMessage(e) }))
                },
            })
        }

        // Clipboard & files
        const clipboard: MessageAction[] = []
        if (message.text || message.content) {
            clipboard.push({
                id: "copy",
                label: _("Copy"),
                icon: Copy,
                onSelect: () => {
                    navigator.clipboard.writeText(toPlainText(message.content ?? message.text ?? ""))
                    toast.success(_("Copied to clipboard"))
                },
            })
        }
        clipboard.push({
            id: "copy-link",
            label: _("Copy message link"),
            icon: Link,
            onSelect: () => {
                const url = `${window.location.origin}${window.location.pathname}?message_id=${encodeURIComponent(message.name)}`
                navigator.clipboard.writeText(url)
                toast.success(_("Link copied"))
            },
        })
        // No per-file Download here: it's ambiguous for a batch (which file?), and the
        // attachment preview / lightbox already offers an unambiguous per-file download.

        // Organize: pin, save, reactions
        const organize: MessageAction[] = [
            {
                id: "pin",
                label: message.is_pinned === 1 ? _("Unpin") : _("Pin"),
                icon: Pin,
                onSelect: stub(_("Pin")),
            },
            { id: "save", label: _("Save"), icon: Bookmark, onSelect: stub(_("Save")) },
        ]
        if (hasReactions) {
            organize.push({
                id: "reactions",
                label: _("View reactions"),
                icon: SmilePlus,
                onSelect: () => setDialog({ type: "reactions", message }),
            })
        }

        // Owner-only, destructive last
        const owner: MessageAction[] = []
        if (isOwner) {
            // Edit is inline (not a dialog): flag this message as the channel's edit
            // target and the body renderer swaps in the editor. Hidden when there's
            // no editable text (poll / caption-less file). A batch edits its caption.
            const editTarget = resolveEditTarget(message)
            if (editTarget) {
                owner.push({
                    id: "edit",
                    label: _("Edit"),
                    icon: Pencil,
                    onSelect: () => getDefaultStore().set(editingMessageAtom(editTarget.channel_id), editTarget.name),
                })
            }
            owner.push({
                id: "delete",
                label: _("Delete"),
                icon: Trash2,
                danger: true,
                onSelect: () => setDialog({ type: "delete", message }),
            })
        }

        return [respond, clipboard, organize, owner].filter((group) => group.length > 0)
    }, [message, currentUser, setDialog, navigate, call, threadID])
}
