import { useRef } from "react"
import { toast } from "sonner"
import { MediaLightbox } from "./MediaLightbox"
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
 * In-app file preview lightbox (PDFs today; other previewable types can join
 * behind the same shell). Desktop only — the caller routes mobile PDFs to a
 * new tab, since mobile browsers won't inline-render <embed>.
 *
 * Content renders from the last non-null `file` so the exit animation plays
 * with its content intact (the same close-flash fix as the image lightbox).
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
        <MediaLightbox open={open} onOpenChange={(next) => !next && onClose()} title={file.fileName}>
            <div className="shrink-0 p-3">
                <MediaPreviewHeader
                    user={user ?? undefined}
                    creation={file.creation}
                    fileName={file.fileName}
                    onDownload={() => downloadFile(file.fileUrl, file.fileName)}
                    onShare={share}
                    onClose={onClose}
                />
            </div>
            {/* <embed> uses the browser's native PDF viewer (toolbar: zoom,
                pages, print) at full height — desktop only (mobile won't inline) */}
            <embed src={file.fileUrl} type="application/pdf" className="min-h-0 w-full flex-1 px-4 pb-4" />
        </MediaLightbox>
    )
}
