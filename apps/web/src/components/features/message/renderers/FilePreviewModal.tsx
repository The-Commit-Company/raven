import { useRef } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { MediaPreviewHeader } from "./MediaPreviewHeader"
import { useUser } from "@hooks/useUser"
import { downloadFile, shareFile } from "@lib/file"
import _ from "@lib/translate"

export type FilePreview = {
    fileName: string
    fileUrl: string
    /** Sender + timestamp of the message the file belongs to. */
    owner: string
    creation: string
}

/**
 * In-app file preview (PDFs today — the iframe uses the browser's native PDF
 * viewer with the session cookie; other previewable types, e.g. spreadsheets,
 * can join later behind the same modal).
 *
 * Content renders from the last non-null `file` so the dialog's exit animation
 * plays with its content intact (the same close-flash fix as the image modal).
 * Never-opened instances render nothing and pay for no hooks.
 */
export const FilePreviewModal = ({ file, onClose }: { file: FilePreview | null; onClose: () => void }) => {
    const lastFileRef = useRef<FilePreview | null>(null)
    if (file) lastFileRef.current = file
    const displayFile = file ?? lastFileRef.current

    if (!displayFile) return null

    return <FilePreviewDialog file={displayFile} open={file !== null} onClose={onClose} />
}

const FilePreviewDialog = ({
    file,
    open,
    onClose,
}: {
    file: FilePreview
    open: boolean
    onClose: () => void
}) => {
    const { data: user } = useUser(file.owner)

    const share = async () => {
        if ((await shareFile(file.fileUrl, file.fileName)) === "copied") toast.success(_("Link copied"))
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                className="xl:min-w-7xl lg:min-w-6xl md:min-w-3xl flex h-[85vh] flex-col"
                showCloseButton={false}
                // Keep initial focus off the first button (Download) — it reads as pre-selected
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="sr-only">{file.fileName}</DialogTitle>
                    <DialogDescription className="sr-only">{_("File preview")}</DialogDescription>
                    <MediaPreviewHeader
                        user={user ?? undefined}
                        creation={file.creation}
                        fileName={file.fileName}
                        onDownload={() => downloadFile(file.fileUrl, file.fileName)}
                        onShare={share}
                        onClose={onClose}
                    />
                </DialogHeader>
                <iframe
                    src={file.fileUrl}
                    title={file.fileName}
                    className="min-h-0 w-full flex-1 rounded-md border border-outline-gray-2"
                />
            </DialogContent>
        </Dialog>
    )
}
