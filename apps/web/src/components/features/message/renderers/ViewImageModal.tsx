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

    /** Native share sheet where available, copy-link fallback elsewhere. */
    const shareImage = async () => {
        if (!currentImage) return
        const url = new URL(currentImage.file_url, window.location.origin).href
        if (navigator.share) {
            try {
                await navigator.share({ title: currentImage.file_name, url })
            } catch {
                // user dismissed the share sheet
            }
        } else {
            await navigator.clipboard.writeText(url)
            toast.success(_("Link copied"))
        }
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
                    <div className="flex items-center justify-between border-b bg-surface-white pb-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <UserAvatar user={user} size="md" />
                            <div className="min-w-0">
                                <div className="flex items-baseline gap-2">
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
                                <span className="truncate max-w-45 text-base font-medium">
                                    {currentImage.file_name}
                                </span>
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
                                <Button variant="ghost" size="sm" isIconButton aria-label={_("Download")} onClick={downloadImage}>
                                    <Download />
                                </Button>
                                <Button variant="ghost" size="sm" isIconButton aria-label={_("Share")} onClick={shareImage}>
                                    <Share2 />
                                </Button>
                                <Button variant="ghost" size="sm" isIconButton aria-label={_("Close")} onClick={onClose}>
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
                                size="sm"
                                isIconButton
                                onClick={onPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                                title={_("Previous image")}
                            >
                                <ChevronLeft />
                            </Button>
                            <Button
                                variant="subtle"
                                size="sm"
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
