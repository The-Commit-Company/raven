import { useMemo } from "react"
import { getDefaultStore, useSetAtom } from "jotai"
import { toast } from "sonner"
import {
    Bookmark,
    Copy,
    Download,
    Link,
    LucideIcon,
    MessageSquareText,
    Pencil,
    Pin,
    Reply,
    SmilePlus,
    Trash2,
} from "lucide-react"
import { messageDialogAtom, replyToMessageAtom } from "@utils/channelAtoms"
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

    return useMemo(() => {
        if (!message) return []

        const isOwner = currentUser === message.owner && !message.is_bot_message
        const hasFile = "file" in message && !!message.file
        const hasReactions = Object.keys(JSON.parse(message.message_reactions || "{}")).length > 0

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
        if (!message.is_thread) {
            // TODO(layer 5): raven.api.threads.create_thread(message_id), then navigate to thread/:id
            respond.push({
                id: "create-thread",
                label: _("Create thread"),
                icon: MessageSquareText,
                onSelect: stub(_("Create thread")),
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
        // No menu Download for image-album members: the right-clicked spot doesn't
        // reliably identify ONE image (gaps/captions resolve to the batch head),
        // and the slideshow modal has an unambiguous per-image Download anyway.
        const isImageBatchMember = message.message_type === "Image" && !!message.message_batch_id
        if (hasFile && !isImageBatchMember) {
            clipboard.push({
                id: "download",
                label: _("Download"),
                icon: Download,
                onSelect: () => {
                    const anchor = document.createElement("a")
                    anchor.href = (message as Message & { file: string }).file
                    anchor.download = ""
                    anchor.rel = "noopener"
                    anchor.click()
                },
            })
        }

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
        const owner: MessageAction[] = isOwner
            ? [
                {
                    id: "edit",
                    label: _("Edit"),
                    icon: Pencil,
                    onSelect: () => setDialog({ type: "edit", message }),
                },
                {
                    id: "delete",
                    label: _("Delete"),
                    icon: Trash2,
                    danger: true,
                    onSelect: () => setDialog({ type: "delete", message }),
                },
            ]
            : []

        return [respond, clipboard, organize, owner].filter((group) => group.length > 0)
    }, [message, currentUser, setDialog])
}
