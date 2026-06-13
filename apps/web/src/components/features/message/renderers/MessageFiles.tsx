import { useState } from "react"
import { toast } from "sonner"
import FileMessage, { FileItem } from "@components/common/FileMessage/FileMessage"
import { FilePreview, FilePreviewModal } from "./FilePreviewModal"
import { getFileName } from "@raven/lib/utils/operations"
import { downloadFile, getFileExtension, shareFile } from "@lib/file"
import { useIsMobile } from "@hooks/use-mobile"
import _ from "@lib/translate"
import type { Message } from "@raven/types/common/Message"

/** A message whose `message_type` is File — the fields the renderer needs. */
type FileLikeMessage = Message & { file?: string }

/** Extensions that open in the in-app preview modal (spreadsheets etc. can join later). */
const PREVIEWABLE_EXTENSIONS = new Set(["pdf"])


/**
 * Renders the file pills of one message or one batch. Clicking a pill opens
 * the file — in the preview modal for previewable types, in a new tab
 * otherwise. Every pill carries its member's data-message-id (action
 * delegation + scroll targeting) and its own Download / Share buttons.
 */
export const MessageFiles = ({ messages }: { messages: Message[] }) => {
    const [preview, setPreview] = useState<FilePreview | null>(null)
    const isMobile = useIsMobile()

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
                // The preview lightbox uses <embed>, which mobile browsers
                // won't inline-render — on mobile, open the PDF in a new tab
                // (the native full-screen mobile PDF viewer) instead.
                if (PREVIEWABLE_EXTENSIONS.has(extension) && !isMobile) {
                    setPreview({ fileName, fileUrl: absoluteUrl, owner: message.owner, creation: message.creation })
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

    return (
        <>
            <FileMessage files={messages.map((message) => toFileItem(message as FileLikeMessage))} />
            <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
        </>
    )
}
