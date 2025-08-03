import { useState, useEffect, useRef } from "react"
import { UserFields } from "@raven/types/common/UserFields"
import { UserAvatar } from "../UserAvatar"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import ViewImageModal from "./ViewImageModal"

export interface ImageFile {
    name: string
    file_name: string
    file_url: string
    file_size: string
    file_type: string
    file_thumbnail?: string
}

export interface ImageMessageProps {
    user: UserFields
    images: ImageFile[]
    time: string
    message?: string
    name: string
}

const ImageCarousel = ({ images, onImageClick }: { images: ImageFile[], onImageClick: (image: ImageFile) => void }) => {

    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const carouselRef = useRef<HTMLDivElement>(null)

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle if this specific carousel is hovered
            if (!isHovered) return

            switch (event.key) {
                case "ArrowLeft":
                    event.preventDefault()
                    prevImage()
                    break
                case "ArrowRight":
                    event.preventDefault()
                    nextImage()
                    break
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isHovered])

    const currentImage = images[currentIndex]

    return (
        <div
            ref={carouselRef}
            className="relative group"
            tabIndex={0}
            role="region"
            aria-label="Image carousel"
            aria-live="polite"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Image */}
            <div
                className="relative cursor-pointer overflow-hidden rounded-lg border border-border/60"
                onClick={() => onImageClick(images[currentIndex])}
            >
                <img
                    src={currentImage.file_thumbnail || currentImage.file_url}
                    alt={currentImage.file_name}
                    className="w-full h-auto max-h-96 object-cover"
                    loading="lazy"
                />

                {/* Navigation arrows */}
                {images.length > 1 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full z-10"
                            onClick={(e) => {
                                e.stopPropagation()
                                prevImage()
                            }}
                            title="Previous image (←)"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full z-10"
                            onClick={(e) => {
                                e.stopPropagation()
                                nextImage()
                            }}
                            title="Next image (→)"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-20">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="flex gap-1 mt-2 overflow-x-auto">
                    {images.map((image, index) => (
                        <div
                            key={image.name}
                            className={cn(
                                "flex-shrink-0 cursor-pointer border-2 rounded overflow-hidden transition-all duration-200",
                                index === currentIndex
                                    ? "border-blue-500"
                                    : "border-transparent hover:border-border"
                            )}
                            onClick={() => setCurrentIndex(index)}
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
            )}
        </div>
    )
}

const ImageGrid = ({ images, onImageClick }: { images: ImageFile[], onImageClick: (image: ImageFile) => void }) => {
    const getGridClass = (count: number) => {
        return count === 1 ? "grid-cols-1" : "grid-cols-2"
    }

    const getImageClass = (index: number, count: number) => {
        if (count === 1) return "col-span-1"
        if (count === 2) return "col-span-1"
        if (count === 3) {
            // For 3 images: first image takes full width, other 2 below
            return index === 0 ? "col-span-2" : "col-span-1"
        }
        if (count === 4) {
            // For 4 images: 2x2 grid
            return "col-span-1"
        }
        return "col-span-1"
    }

    const displayImages = images.slice(0, 4)

    return (
        <div className={cn("grid gap-1", getGridClass(displayImages.length))}>
            {displayImages.map((image, index) => (
                <div
                    key={image.name}
                    className={cn(
                        "relative cursor-pointer overflow-hidden rounded-lg border border-border/60 group",
                        getImageClass(index, displayImages.length)
                    )}
                    onClick={() => onImageClick(image)}
                >
                    <img
                        src={image.file_thumbnail || image.file_url}
                        alt={image.file_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            ))}
        </div>
    )
}

const ImageMessage = ({ user, images, time, message, name }: ImageMessageProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

    const handleImageClick = (image: ImageFile) => {
        const index = images.findIndex(img => img.name === image.name)
        setSelectedImageIndex(index)
        console.log("Image clicked in message:", name, "image:", image.name)
    }

    const closeModal = () => {
        setSelectedImageIndex(null)
    }

    const nextImage = () => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex + 1) % images.length)
        }
    }

    const prevImage = () => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)
        }
    }

    return (
        <>
            <div className="flex items-start gap-3">
                <UserAvatar user={user} size="md" />
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm">{user?.full_name || user?.name || "User"}</span>
                        <span className="text-xs font-light text-muted-foreground/90">{time}</span>
                    </div>

                    {message && (
                        <div className="text-[13px] text-primary mb-2">{message}</div>
                    )}

                    {/* Image Display */}
                    <div className="max-w-2xl">
                        {images.length === 1 ? (
                            <div
                                className="cursor-pointer overflow-hidden rounded-lg border border-border/60"
                                onClick={() => handleImageClick(images[0])}
                            >
                                <img
                                    src={images[0].file_thumbnail || images[0].file_url}
                                    alt={images[0].file_name}
                                    className="w-full h-auto max-h-96 object-cover"
                                    loading="lazy"
                                />
                            </div>
                        ) : images.length <= 4 ? (
                            <ImageGrid images={images} onImageClick={handleImageClick} />
                        ) : (
                            <ImageCarousel images={images} onImageClick={handleImageClick} />
                        )}
                    </div>


                </div>
            </div>

            <ViewImageModal
                images={images}
                selectedImageIndex={selectedImageIndex}
                user={user}
                time={time}
                onClose={closeModal}
                onImageSelect={setSelectedImageIndex}
                onNext={nextImage}
                onPrev={prevImage}
            />
        </>
    )
}

export default ImageMessage 