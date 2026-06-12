import { useState } from "react"
import { getFileName } from "@raven/lib/utils/operations"
import { useUser } from "@hooks/useUser"
import { getDateObject } from "@lib/date"
import ViewImageModal from "./ViewImageModal"
import { ImageCarousel, ImageFile, ImageGrid } from "./ImageMessage"
import { ReservedImage, fitImageBox } from "./ReservedImage"
import type { Message } from "@raven/types/common/Message"

/** A message whose `message_type` is Image — the fields the renderer needs. */
type ImageLikeMessage = Message & {
    file?: string
    file_thumbnail?: string
    thumbnail_width?: number
    thumbnail_height?: number
}

const toImageFile = (message: ImageLikeMessage): ImageFile => ({
    name: message.name,
    file_name: getFileName(message.file ?? ""),
    file_url: message.file ?? "",
    file_size: "",
    file_type: "image",
    file_thumbnail: message.file_thumbnail,
    width: message.thumbnail_width,
    height: message.thumbnail_height,
    message_id: message.name,
})

/**
 * Renders the images of one message or one batch: a single reserved box, a
 * grid (2–4), or a carousel (5+), with the slideshow modal across all of them.
 * Every box is fully sized before any image loads — message heights never
 * change after paint (the scroll engine depends on it).
 */
export const MessageImages = ({ messages }: { messages: Message[] }) => {
    const images = messages.map((message) => toImageFile(message as ImageLikeMessage))
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const { data: sender } = useUser(messages[0].owner)

    const openImage = (image: ImageFile) => {
        setSelectedIndex(images.findIndex((candidate) => candidate.name === image.name))
    }

    const single = images.length === 1 ? images[0] : null

    return (
        <>
            {single ? (
                // max-w-full: on narrow columns the box clamps and aspect-ratio
                // keeps the height proportional — still fully deterministic
                <div
                    // message_id: in a mixed batch a lone image renders here while
                    // the row belongs to the whole batch — delegation needs the member
                    data-message-id={single.message_id}
                    data-media-root=""
                    className="max-w-full cursor-pointer overflow-hidden rounded-lg"
                    style={fitImageBox(single.width, single.height)}
                    onClick={() => openImage(single)}
                >
                    <ReservedImage src={single.file_thumbnail || single.file_url} alt={single.file_name} />
                </div>
            ) : (
                // Inline media caps at a reading-friendly width by design (the modal
                // is the big-screen surface); desktops get a modestly higher cap
                <div data-media-root="" className="max-w-md lg:max-w-lg">
                    {images.length <= 4 ? (
                        <ImageGrid images={images} onImageClick={openImage} />
                    ) : (
                        <ImageCarousel images={images} onImageClick={openImage} />
                    )}
                </div>
            )}

            {sender && (
                <ViewImageModal
                    images={images}
                    selectedImageIndex={selectedIndex}
                    user={sender}
                    time={getDateObject(messages[0].creation).format("hh:mm A")}
                    onClose={() => setSelectedIndex(null)}
                    onImageSelect={setSelectedIndex}
                    onNext={() => selectedIndex !== null && setSelectedIndex((selectedIndex + 1) % images.length)}
                    onPrev={() =>
                        selectedIndex !== null && setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
                    }
                />
            )}
        </>
    )
}
