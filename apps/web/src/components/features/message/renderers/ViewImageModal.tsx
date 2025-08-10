import {
    X,
    Download,
    Share2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import { Dialog, DialogPortal, DialogOverlay } from "@components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { UserAvatar } from "../UserAvatar"
import { UserFields } from "@raven/types/common/UserFields"
import { useEffect } from "react"

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
    user: UserFields
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

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (selectedImageIndex === null) return

            switch (event.key) {
                case "ArrowLeft":
                    event.preventDefault()
                    onPrev()
                    break
                case "ArrowRight":
                    event.preventDefault()
                    onNext()
                    break
                case "Escape":
                    event.preventDefault()
                    onClose()
                    break
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [selectedImageIndex, onPrev, onNext, onClose])

    return (
        <Dialog open={selectedImageIndex !== null} onOpenChange={onClose}>
            <DialogPortal>
                <DialogOverlay />
                <DialogPrimitive.Content
                    className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border shadow-xl duration-200 sm:max-w-lg !max-w-6xl w-[90vw] h-[85vh] !max-h-none p-0 overflow-hidden bg-background">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
                        <div className="flex items-center gap-2 min-w-0">
                            <UserAvatar user={user} size="md" />
                            <div className="min-w-0">
                                <div className="flex items-baseline gap-2">
                                    <h3 className="font-medium text-sm truncate text-foreground">
                                        {user?.full_name || user?.name || "User"}
                                    </h3>
                                    <span className="text-xs text-muted-foreground/90 font-light">
                                        {time}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {currentImage && (
                            <div className="flex flex-wrap items-baseline gap-2">
                                <span className="truncate max-w-[180px] text-base font-medium">
                                    {currentImage.file_name}
                                </span>
                                <span className="text-xs bg-muted/80 px-1 py-0.5 rounded-sm">
                                    {currentImage.file_size}
                                </span>
                                <span className="text-xs bg-muted/80 px-1 py-0.5 rounded-sm uppercase">
                                    {currentImage.file_type}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {images.length > 1 && (
                                <>
                                    <span className="text-xs">
                                        {selectedImageIndex! + 1} of {images.length}
                                    </span>
                                </>
                            )}
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <Download className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <Share2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                    </div>

                    {/* Image viewer */}
                    <div className="relative flex-1 flex items-center justify-center bg-background">
                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={onPrev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full"
                                    title="Previous image (←)"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={onNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full"
                                    title="Next image (→)"
                                >
                                    <ChevronRight className="w-4 h-4" />
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
                                            "flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200",
                                            index === selectedImageIndex
                                                ? "border-blue-500 ring-2 ring-blue-300"
                                                : "border-transparent hover:border-border"
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
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    )
}

export default ViewImageModal
