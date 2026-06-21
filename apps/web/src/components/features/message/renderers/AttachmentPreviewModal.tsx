import { useRef } from "react"
import { useAtomValue, useSetAtom } from "jotai"
import { useHotkeys } from "react-hotkeys-hook"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, FileText, Film, Music, MusicIcon } from "lucide-react"
import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { MediaLightbox } from "./MediaLightbox"
import { MediaPreviewHeader } from "./MediaPreviewHeader"
import { AudioPlayer } from "./AudioPlayer"
import { useUser } from "@hooks/useUser"
import { useIsMobile } from "@hooks/use-mobile"
import { downloadFile, getFileExtension, shareFile } from "@lib/file"
import { formatBytes } from "@raven/lib/utils/operations"
import { cn } from "@lib/utils"
import _ from "@lib/translate"
import { attachmentPreviewAtom, type Attachment, type AttachmentPreviewState } from "@utils/attachmentPreview"
import FileTypeIcon from "@components/common/FileIcons/FileTypeIcon"

/** Minimum horizontal travel (px) for a touch swipe to count as paging. */
const SWIPE_THRESHOLD = 50

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
    const isMobile = useIsMobile()
    const { attachments, index } = display
    const isPreview = display.mode === "preview"
    const current = attachments[index] ?? attachments[0]
    const user = useUser(current.owner)

    // PDFs render inline via <embed> on desktop only — mobile browsers won't,
    // so they fall back to the download card alongside non-previewable files.
    const canEmbedPdf = current.kind === "pdf" && !isMobile

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

    // Touch swipe to page (mobile). Only fires on touch devices, so desktop
    // is unaffected. A child can opt out by stopping touchstart propagation
    // (the audio slider does, so dragging it doesn't get read as a page-swipe).
    const touchStart = useRef<{ x: number; y: number } | null>(null)
    const onTouchStart = (event: React.TouchEvent) => {
        const touch = event.touches[0]
        touchStart.current = { x: touch.clientX, y: touch.clientY }
    }
    const onTouchEnd = (event: React.TouchEvent) => {
        const start = touchStart.current
        touchStart.current = null
        if (!start || !hasMany) return
        const touch = event.changedTouches[0]
        const dx = touch.clientX - start.x
        const dy = touch.clientY - start.y
        // Horizontal-dominant swipe past the threshold = page; ignore vertical
        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
            step(dx < 0 ? 1 : -1)
        }
    }

    const download = () => downloadFile(current.fileUrl, current.fileName)
    const share = async () => {
        if ((await shareFile(current.fileUrl, current.fileName)) === "copied") toast.success(_("Link copied"))
    }

    return (
        <MediaLightbox open={open} onOpenChange={(next) => !next && close()} title={current.fileName}>
            {/* Floating chrome over the scrim */}
            <div className="shrink-0 p-3">
                <MediaPreviewHeader
                    // Preview mode (composer-staged files): no author, no download/share —
                    // just a "Preview" tag. View mode (sent messages): full chrome.
                    user={isPreview ? undefined : (user ?? undefined)}
                    creation={isPreview ? undefined : current.creation}
                    fileName={current.fileName}
                    fileSize={current.size ? formatBytes(current.size) : undefined}
                    badge={isPreview ? <Badge variant="subtle" theme="blue">{_("Preview")}</Badge> : undefined}
                    onDownload={isPreview ? undefined : download}
                    onShare={isPreview ? undefined : share}
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
            <div
                className="relative flex min-h-0 flex-1 items-center justify-center p-4"
                onClick={close}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
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
                        className="max-h-full max-w-[90%] object-contain"
                        onClick={(event) => event.stopPropagation()}
                    />
                ) : current.kind === "video" ? (
                    <video
                        src={current.fileUrl}
                        controls
                        className="max-h-full max-w-[90%]"
                        onClick={(event) => event.stopPropagation()}
                    />
                ) : current.kind === "audio" ? (
                    // Stop touchstart too, so dragging the seek slider isn't read as a page-swipe
                    <div className="w-full max-w-sm flex flex-col gap-2">
                        <div className="flex items-center justify-center aspect-square bg-surface-gray-1 rounded-lg">
                            <MusicIcon className="size-12" />
                        </div>
                        <div
                            className="rounded-lg bg-surface-gray-1 p-3"
                            onClick={(event) => event.stopPropagation()}
                            onTouchStart={(event) => event.stopPropagation()}
                        >
                            <AudioPlayer src={current.fileUrl} />
                        </div>
                    </div>

                ) : canEmbedPdf ? (
                    // <embed> = native PDF viewer (toolbar, zoom) at full height.
                    // max-w caps it so wide screens keep a dark backdrop to click.
                    <embed
                        src={current.fileUrl}
                        type="application/pdf"
                        className="h-full w-full max-w-5xl rounded-md"
                        onClick={(event) => event.stopPropagation()}
                    />
                ) : (
                    // No inline preview (non-previewable files, or a PDF paged
                    // into on mobile) — a download/open card, Google-Drive style
                    <DownloadCard attachment={current} isMobile={isMobile} />
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
                                            <ThumbIcon kind={attachment.kind} />
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

/** Filmstrip tile icon for non-image kinds. */
const ThumbIcon = ({ kind }: { kind: Attachment["kind"] }) => {
    const Icon = kind === "video" ? Film : kind === "audio" ? Music : FileText
    return <Icon className="h-5 w-5 text-ink-gray-5" />
}

/**
 * Centered "no preview" card for attachments we can't render inline — other
 * file types, and a PDF paged into on mobile (which can't embed). A mobile PDF
 * can still be viewed via the OS viewer, so it offers "Open" (new tab); other
 * files just "Download". Stops propagation so clicking the card doesn't close;
 * the surrounding backdrop still does.
 */
const DownloadCard = ({ attachment, isMobile }: { attachment: Attachment; isMobile: boolean }) => {
    const openInTab = isMobile && attachment.kind === "pdf"
    const action = () =>
        openInTab
            ? window.open(attachment.fileUrl, "_blank", "noopener")
            : downloadFile(attachment.fileUrl, attachment.fileName)

    return (
        <div
            className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg bg-surface-gray-1 p-10 text-center"
            onClick={(event) => event.stopPropagation()}
        >
            <FileTypeIcon fileType={getFileExtension(attachment.fileName)} size='4xl' />
            <div className="flex flex-col gap-1">
                <p className="font-medium text-ink-gray-8 break-all">{attachment.fileName}</p>
                <p className="text-sm text-ink-gray-5">{_("No preview available")}</p>
            </div>
            <Button variant="solid" theme="gray" onClick={action}>
                {openInTab ? _("Open") : _("Download")}
            </Button>
        </div>
    )
}
