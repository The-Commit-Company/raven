import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { MediaLightbox } from "./MediaLightbox"
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
    /** Raw message timestamp — MediaPreviewHeader formats it. */
    creation: string
    onClose: () => void
    onImageSelect: (index: number) => void
    onNext: () => void
    onPrev: () => void
}

const ViewImageModal = ({
    images,
    selectedImageIndex,
    user,
    creation,
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
        <MediaLightbox
            open={selectedImageIndex !== null}
            onOpenChange={(open) => !open && onClose()}
            title={currentImage?.file_name ?? _("Image")}
        >
            {/* Floating chrome over the scrim */}
            <div className="shrink-0 p-3">
                <MediaPreviewHeader
                    user={user}
                    creation={creation}
                    fileName={currentImage?.file_name ?? _("Image")}
                    fileSize={currentImage?.file_size}
                    onDownload={downloadImage}
                    onShare={shareImage}
                    onClose={onClose}
                >
                    {images.length > 1 && (
                        <span className="px-1 text-xs">
                            {_("{0} of {1}", [String(displayIndex + 1), String(images.length)])}
                        </span>
                    )}
                </MediaPreviewHeader>
            </div>

            {/* Image fills the viewport; clicking the dark backdrop closes */}
            <div
                className="relative flex min-h-0 flex-1 items-center justify-center px-4"
                onClick={onClose}
            >
                {images.length > 1 && (
                    <>
                        <Button
                            variant="subtle"
                            size="md"
                            isIconButton
                            onClick={(event) => {
                                event.stopPropagation()
                                onPrev()
                            }}
                            className="absolute left-4 top-1/2 z-10 -translate-y-1/2"
                            title={_("Previous image")}
                        >
                            <ChevronLeft />
                        </Button>
                        <Button
                            variant="subtle"
                            size="md"
                            isIconButton
                            onClick={(event) => {
                                event.stopPropagation()
                                onNext()
                            }}
                            className="absolute right-4 top-1/2 z-10 -translate-y-1/2"
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
                        className="max-h-full max-w-full object-contain"
                        onClick={(event) => event.stopPropagation()}
                    />
                )}
            </div>

            {/* Thumbnail filmstrip */}
            {images.length > 1 && (
                <div className="shrink-0 p-3">
                    <div className="flex max-w-full justify-center gap-2 overflow-x-auto">
                        {images.map((image, index) => (
                            <Tooltip key={image.name}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-200",
                                            index === displayIndex
                                                ? "border-outline-blue-4"
                                                : "border-transparent hover:border-outline-gray-3",
                                        )}
                                        onClick={() => onImageSelect(index)}
                                    >
                                        <img
                                            src={image.file_thumbnail || image.file_url}
                                            alt={image.file_name}
                                            className="h-12 w-12 object-cover"
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
        </MediaLightbox>
    )
}

export default ViewImageModal
