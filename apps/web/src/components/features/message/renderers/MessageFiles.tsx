import { useMemo } from "react"
import { toast } from "sonner"
import { useSetAtom } from "jotai"
import FileMessage, { FileItem } from "@components/common/FileMessage/FileMessage"
import { getFileName } from "@raven/lib/utils/operations"
import { downloadFile, getFileExtension, shareFile } from "@lib/file"
import { useIsMobile } from "@hooks/use-mobile"
import { attachmentPreviewAtom, messagesToAttachments, type Attachment } from "@utils/attachmentPreview"
import _ from "@lib/translate"
import type { Message } from "@raven/types/common/Message"

/** A message whose `message_type` is File — the fields the renderer needs. */
type FileLikeMessage = Message & { file?: string }

/**
 * Renders the file pills of one message or one batch. Clicking a previewable
 * pill (PDF) opens the shared attachment viewer at that file, paging through
 * the set; everything else opens in a new tab. Every pill carries its
 * member's data-message-id and its own Download/Share.
 *
 * `attachments`: the batch's combined set (images + PDFs in send order),
 * passed by BatchMessageItem so a mixed batch pages as one. Omitted for a
 * standalone file message — it builds its own set.
 */
export const MessageFiles = ({ messages, attachments }: { messages: Message[]; attachments?: Attachment[] }) => {
    const setPreview = useSetAtom(attachmentPreviewAtom)
    const isMobile = useIsMobile()

    // Mobile can't inline-render <embed>, so PDFs are excluded from the set on
    // mobile and open in a new tab instead.
    const ownSet = useMemo(() => messagesToAttachments(messages, !isMobile), [messages, isMobile])
    const previewSet = attachments ?? ownSet

    const toFileItem = (message: FileLikeMessage): FileItem => {
        const url = message.file ?? ""
        const fileName = getFileName(url)
        const extension = getFileExtension(url)
        const absoluteUrl = new URL(url, window.location.origin).href
        return {
            messageId: message.name,
            fileName,
            fileType: extension,
            // TODO(layer 4): denormalize file size onto Raven Message at upload
            // (like thumbnail dims) so pills can show it without extra fetches
            onOpen: () => {
                const index = previewSet.findIndex((attachment) => attachment.id === message.name)
                if (index !== -1) {
                    setPreview({ attachments: previewSet, index })
                } else {
                    window.open(absoluteUrl, "_blank", "noopener")
                }
            },
            onDownload: () => downloadFile(url, fileName),
            onShare: async () => {
                if ((await shareFile(url, fileName)) === "copied") toast.success(_("Link copied"))
            },
        }
    }

    return <FileMessage files={messages.map((message) => toFileItem(message as FileLikeMessage))} />
}
