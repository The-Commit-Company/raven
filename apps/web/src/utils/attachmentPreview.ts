import { atom } from "jotai"
import { getFileName } from "@raven/lib/utils/operations"
import { getFileExtension } from "@lib/file"
import type { Message } from "@raven/types/common/Message"

/** A previewable message file. PDFs render via <embed> (desktop), images via <img>. */
export type AttachmentKind = "image" | "pdf"

export interface Attachment {
    /** The owning Raven Message id — unique within a set. */
    id: string
    fileName: string
    fileUrl: string
    kind: AttachmentKind
    /** Image thumbnail; absent for PDFs (the filmstrip shows an icon tile instead). */
    thumbnail?: string
    /** Stored image dimensions, when known. */
    width?: number
    height?: number
    /** Sender + timestamp of the message, for the viewer's header. */
    owner: string
    creation: string
}

/**
 * The single, app-wide attachment viewer state: the navigable set (one batch
 * /album worth) plus the current index. Null = closed. One `<AttachmentPreviewModal>`
 * mounted at the app shell reads this, so any surface — the stream, a thread
 * drawer, the saved-messages list — opens the same viewer via the setter.
 */
export type AttachmentPreviewState = { attachments: Attachment[]; index: number } | null

export const attachmentPreviewAtom = atom<AttachmentPreviewState>(null)

/** Message fields the attachment builder reads (Image/File messages). */
type MediaMessage = Message & {
    file?: string
    file_thumbnail?: string
    thumbnail_width?: number
    thumbnail_height?: number
}

/** File extensions that render inside the viewer (spreadsheets etc. can join later). */
const PREVIEWABLE_FILE_EXTENSIONS = new Set(["pdf"])

const toAttachment = (message: Message, includeFiles: boolean): Attachment | null => {
    const media = message as MediaMessage
    const url = media.file
    if (!url) return null

    const base = {
        id: media.name,
        fileName: getFileName(url),
        fileUrl: new URL(url, window.location.origin).href,
        owner: media.owner,
        creation: media.creation,
    }

    if (media.message_type === "Image") {
        return { ...base, kind: "image", thumbnail: media.file_thumbnail, width: media.thumbnail_width, height: media.thumbnail_height }
    }
    // Files only render inline on desktop (<embed>); includeFiles is false on mobile
    if (media.message_type === "File" && includeFiles && PREVIEWABLE_FILE_EXTENSIONS.has(getFileExtension(url))) {
        return { ...base, kind: "pdf" }
    }
    return null
}

/**
 * The ordered, navigable attachment set for a group of messages — a batch (so
 * a mixed image+PDF batch becomes ONE set you can arrow across) or a single
 * message. Images plus previewable files, in send order. Pass
 * `includeFiles: false` on mobile, where PDFs open in a new tab instead of the
 * viewer.
 */
export const messagesToAttachments = (messages: Message[], includeFiles: boolean): Attachment[] =>
    messages.map((message) => toAttachment(message, includeFiles)).filter((attachment): attachment is Attachment => attachment !== null)
