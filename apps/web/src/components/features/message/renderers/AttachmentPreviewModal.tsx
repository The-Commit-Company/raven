import { useRef } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { useHotkeys } from "react-hotkeys-hook"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { MediaLightbox } from "./MediaLightbox"
import { MediaPreviewHeader } from "./MediaPreviewHeader"
import { useUser } from "@hooks/useUser"
import { downloadFile, shareFile } from "@lib/file"
import { cn } from "@lib/utils"
import _ from "@lib/translate"
import { attachmentPreviewAtom, type AttachmentPreviewState } from "@utils/attachmentPreview"

/**
 * The single, app-wide attachment lightbox. Mounted once at the app shell;
 * any surface opens it by setting `attachmentPreviewAtom`. Pages through a
 * batch of images/PDFs with arrow keys, rendering each by kind.
 *
 * Renders nothing until first opened (one atom read + a ref), and content
 * survives the close animation via a last-state snapshot (the close-flash fix).
 */
export const AttachmentPreviewModal = () => {
    const state = useAtomValue(attachmentPreviewAtom)
    const lastStateRef = useRef<AttachmentPreviewState>(null)
    if (state) lastStateRef.current = state
    const display = state ?? lastStateRef.current

    if (!display) return null

    return <AttachmentPreviewContent display={display} open={state !== null} />
}

const AttachmentPreviewContent = ({
    display,
    open,
}: {
    display: NonNullable<AttachmentPreviewState>
    open: boolean
}) => {
    const setState = useSetAtom(attachmentPreviewAtom)
    const { attachments, index } = display
    const current = attachments[index] ?? attachments[0]
    const { data: user } = useUser(current.owner)

    const close = () => setState(null)
    // Wraps at the ends, matching the previous image slideshow behavior
    const step = (direction: 1 | -1) =>
        setState((prev) =>
            prev ? { ...prev, index: (prev.index + direction + prev.attachments.length) % prev.attachments.length } : prev,
        )
    const selectIndex = (next: number) => setState((prev) => (prev ? { ...prev, index: next } : prev))

    // Escape is handled by the dialog; arrows page through the set
    const hasMany = attachments.length > 1
    useHotkeys("left", () => step(-1), { enabled: open && hasMany, preventDefault: true }, [open, hasMany])
    useHotkeys("right", () => step(1), { enabled: open && hasMany, preventDefault: true }, [open, hasMany])

    const download = () => downloadFile(current.fileUrl, current.fileName)
    const share = async () => {
        if ((await shareFile(current.fileUrl, current.fileName)) === "copied") toast.success(_("Link copied"))
    }

    return (
        <MediaLightbox open={open} onOpenChange={(next) => !next && close()} title={current.fileName}>
            {/* Floating chrome over the scrim */}
            <div className="shrink-0 p-3">
                <MediaPreviewHeader
                    user={user ?? undefined}
                    creation={current.creation}
                    fileName={current.fileName}
                    onDownload={download}
                    onShare={share}
                    onClose={close}
                >
                    {hasMany && (
                        <span className="px-1 text-xs">
                            {_("{0} of {1}", [String(index + 1), String(attachments.length)])}
                        </span>
                    )}
                </MediaPreviewHeader>
            </div>

            {/* The current attachment; clicking the dark backdrop closes.
                p-4 (not px-4) gives a clickable frame on all sides — for the
                PDF <embed>, which fills its box and swallows its own clicks,
                that frame plus the width cap below is the only backdrop */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center p-4" onClick={close}>
                {hasMany && (
                    <>
                        <Button
                            variant="subtle"
                            size="md"
                            isIconButton
                            onClick={(event) => {
                                event.stopPropagation()
                                step(-1)
                            }}
                            className="absolute left-4 top-1/2 z-10 -translate-y-1/2"
                            title={_("Previous")}
                        >
                            <ChevronLeft />
                        </Button>
                        <Button
                            variant="subtle"
                            size="md"
                            isIconButton
                            onClick={(event) => {
                                event.stopPropagation()
                                step(1)
                            }}
                            className="absolute right-4 top-1/2 z-10 -translate-y-1/2"
                            title={_("Next")}
                        >
                            <ChevronRight />
                        </Button>
                    </>
                )}

                {current.kind === "image" ? (
                    <img
                        src={current.fileUrl}
                        alt={current.fileName}
                        className="max-h-full max-w-full object-contain"
                        onClick={(event) => event.stopPropagation()}
                    />
                ) : (
                    // <embed> = native PDF viewer (toolbar, zoom) at full height.
                    // Desktop only — callers route mobile PDFs to a new tab.
                    // max-w caps it so wide screens keep a dark backdrop to click.
                    <embed
                        src={current.fileUrl}
                        type="application/pdf"
                        className="h-full w-full max-w-5xl rounded-md"
                        onClick={(event) => event.stopPropagation()}
                    />
                )}
            </div>

            {/* Filmstrip: image thumbnails, icon tiles for PDFs. The empty
                space beside the tiles is backdrop — clicking it closes; the
                tiles stop propagation so clicking one only selects. */}
            {hasMany && (
                <div className="shrink-0 p-3" onClick={close}>
                    <div className="flex max-w-full justify-center gap-2 overflow-x-auto">
                        {attachments.map((attachment, thumbIndex) => (
                            <Tooltip key={attachment.id}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 bg-surface-gray-2 transition-all duration-200",
                                            thumbIndex === index
                                                ? "border-outline-blue-4"
                                                : "border-transparent hover:border-outline-gray-3",
                                        )}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            selectIndex(thumbIndex)
                                        }}
                                    >
                                        {attachment.kind === "image" ? (
                                            <img
                                                src={attachment.thumbnail || attachment.fileUrl}
                                                alt={attachment.fileName}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <FileText className="h-5 w-5 text-ink-gray-5" />
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>{attachment.fileName}</TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            )}
        </MediaLightbox>
    )
}
