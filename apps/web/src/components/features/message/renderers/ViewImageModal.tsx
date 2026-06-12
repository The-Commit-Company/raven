import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { MediaPreviewHeader } from "./MediaPreviewHeader"
import { UserData } from "@db"
import { useRef } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { downloadFile, shareFile } from "@lib/file"
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
    /**
     * Content renders from the last non-null index: when closing, Radix keeps
     * the dialog mounted through its exit animation while selectedImageIndex
     * is already null — without this, the image and header empty out and the
     * dialog visibly flashes as it animates away.
     */
    const lastIndexRef = useRef(0)
    if (selectedImageIndex !== null) lastIndexRef.current = selectedImageIndex
    const displayIndex = selectedImageIndex ?? lastIndexRef.current
    const currentImage = images[displayIndex] ?? null

    // Keyboard navigation — Escape is handled by the Radix Dialog itself
    const isOpen = selectedImageIndex !== null
    useHotkeys("left", onPrev, { enabled: isOpen, preventDefault: true }, [onPrev])
    useHotkeys("right", onNext, { enabled: isOpen, preventDefault: true }, [onNext])

    const downloadImage = () => {
        if (!currentImage) return
        downloadFile(currentImage.file_url, currentImage.file_name)
    }

    const shareImage = async () => {
        if (!currentImage) return
        if ((await shareFile(currentImage.file_url, currentImage.file_name)) === "copied") {
            toast.success(_("Link copied"))
        }
    }

    return (
        <Dialog open={selectedImageIndex !== null} onOpenChange={onClose}>
            {/* DialogContent mounts the portal + overlay itself — standard usage only */}
            <DialogContent
                className="lg:min-w-6xl md:min-w-4xl sm:min-w-lg"
                showCloseButton={false}
                // Keep initial focus off the first button (Download) — it reads as pre-selected
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="sr-only">
                        {currentImage?.file_name ?? _("Image")}
                    </DialogTitle>
                    <DialogDescription className="sr-only">{_("View Image")}</DialogDescription>

                    <MediaPreviewHeader
                        user={user}
                        time={time}
                        fileName={currentImage?.file_name ?? _("Image")}
                        fileSize={currentImage?.file_size}
                        onDownload={downloadImage}
                        onShare={shareImage}
                        onClose={onClose}
                    >
                        {images.length > 1 && (
                            <span className="text-xs px-1">
                                {_("{0} of {1}", [String(displayIndex + 1), String(images.length)])}
                            </span>
                        )}
                    </MediaPreviewHeader>
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
                                <Tooltip key={image.name}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200",
                                                index === displayIndex
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
                                    </TooltipTrigger>
                                    <TooltipContent>{image.file_name}</TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ViewImageModal
