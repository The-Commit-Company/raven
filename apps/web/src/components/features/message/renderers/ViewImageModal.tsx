import {
    X,
    Download,
    Share2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { UserAvatar } from "../UserAvatar"
import { UserData } from "@db"
import { useHotkeys } from "react-hotkeys-hook"
import _ from "@lib/translate"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"

export interface ImageFile {
    name: string
    file_name: string
    file_url: string
    file_size: string
    file_type: string
    file_thumbnail?: string
}

interface ViewImageModalProps {
    images: ImageFile[]
    selectedImageIndex: number | null
    user: UserData
    time: string
    onClose: () => void
    onImageSelect: (index: number) => void
    onNext: () => void
    onPrev: () => void
}

/** Fetches a (session-authenticated) file URL into a File for the Web Share API. */
const fetchAsFile = async (url: string, fileName: string): Promise<File | null> => {
    try {
        const response = await fetch(url, { credentials: "include" })
        if (!response.ok) return null
        const blob = await response.blob()
        return new File([blob], fileName || "image", { type: blob.type })
    } catch {
        return null
    }
}

const ViewImageModal = ({
    images,
    selectedImageIndex,
    user,
    time,
    onClose,
    onImageSelect,
    onNext,
    onPrev,
}: ViewImageModalProps) => {
    const currentImage =
        selectedImageIndex !== null ? images[selectedImageIndex] : null

    // Keyboard navigation — Escape is handled by the Radix Dialog itself
    const isOpen = selectedImageIndex !== null
    useHotkeys("left", onPrev, { enabled: isOpen, preventDefault: true }, [onPrev])
    useHotkeys("right", onNext, { enabled: isOpen, preventDefault: true }, [onNext])

    const downloadImage = () => {
        if (!currentImage) return
        const anchor = document.createElement("a")
        anchor.href = currentImage.file_url
        anchor.download = currentImage.file_name || ""
        anchor.rel = "noopener"
        anchor.click()
    }

    /**
     * Shares the image FILE itself where the platform allows it (the recipient
     * gets the image, not a link needing a Raven session). Falls back to a URL
     * share, then to copying the link. The image is already displayed at full
     * resolution, so the fetch is served from the browser cache.
     */
    const shareImage = async () => {
        if (!currentImage) return
        const url = new URL(currentImage.file_url, window.location.origin).href

        const file = await fetchAsFile(url, currentImage.file_name)
        if (file && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file] }).catch(() => {
                // user dismissed the share sheet — not a failure, no fallback
            })
            return
        }

        if (navigator.share) {
            await navigator.share({ title: currentImage.file_name, url }).catch(() => { })
            return
        }

        await navigator.clipboard.writeText(url)
        toast.success(_("Link copied"))
    }

    return (
        <Dialog open={selectedImageIndex !== null} onOpenChange={onClose}>
            {/* DialogContent mounts the portal + overlay itself — standard usage only */}
            <DialogContent className="lg:min-w-6xl md:min-w-4xl sm:min-w-lg" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="sr-only">
                        {currentImage?.file_name ?? _("Image")}
                    </DialogTitle>
                    <DialogDescription className="sr-only">{_("View Image")}</DialogDescription>

                    {/* Header */}
                    <div className="flex items-center justify-between pb-4">
                        <div className="flex items-center gap-2 min-w-0">
                            <UserAvatar user={user} size="md" />
                            <div className="min-w-0">
                                <div className="flex flex-col items-baseline gap-1">
                                    <h3 className="font-medium text-sm truncate text-ink-gray-8">
                                        {user?.full_name || user?.name || _("User")}
                                    </h3>
                                    <span className="text-xs text-ink-gray-4 font-regular">
                                        {time}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {currentImage && (
                            <div className="flex flex-wrap items-baseline gap-2">
                                <Tooltip>
                                    <TooltipTrigger className="truncate max-w-64 text-base font-medium">
                                        {currentImage.file_name}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {currentImage.file_name}
                                    </TooltipContent>
                                </Tooltip>

                                {currentImage.file_size && (
                                    <Badge size="sm" variant="subtle" theme="gray">
                                        {currentImage.file_size}
                                    </Badge>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {images.length > 1 && (
                                <>
                                    <span className="text-xs">
                                        {_("{0} of {1}", [String(selectedImageIndex! + 1), String(images.length)])}
                                    </span>
                                </>
                            )}
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" isIconButton title={_("Download")} aria-label={_("Download")} onClick={downloadImage}>
                                    <Download />
                                </Button>
                                <Button variant="ghost" size="sm" isIconButton title={_("Share")} aria-label={_("Share")} onClick={shareImage}>
                                    <Share2 />
                                </Button>
                                <Button variant="ghost" size="sm" isIconButton title={_("Close")} aria-label={_("Close")} onClick={onClose}>
                                    <X />
                                </Button>
                            </div>
                        </div>

                    </div>
                </DialogHeader>



                {/* Image viewer */}
                <div className="relative flex-1 flex items-center justify-center bg-surface-white">
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="subtle"
                                size="md"
                                isIconButton
                                onClick={onPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                                title={_("Previous image")}
                            >
                                <ChevronLeft />
                            </Button>
                            <Button
                                variant="subtle"
                                size="md"
                                isIconButton
                                onClick={onNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                                title={_("Next image")}
                            >
                                <ChevronRight />
                            </Button>
                        </>
                    )}

                    {currentImage && (
                        <img
                            src={currentImage.file_url}
                            alt={currentImage.file_name}
                            className="max-h-[65vh] max-w-full object-contain rounded-lg"
                        />
                    )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="p-2 border-t">
                        <div className="flex gap-3 overflow-x-auto max-w-full justify-center">
                            {images.map((image, index) => (
                                <div
                                    key={image.name}
                                    className={cn(
                                        "shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200",
                                        index === selectedImageIndex
                                            ? "border-outline-blue-4"
                                            : "border-transparent hover:border-outline-gray-2"
                                    )}
                                    onClick={() => onImageSelect(index)}
                                >
                                    <img
                                        src={image.file_thumbnail || image.file_url}
                                        alt={image.file_name}
                                        className="w-12 h-12 object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ViewImageModal
