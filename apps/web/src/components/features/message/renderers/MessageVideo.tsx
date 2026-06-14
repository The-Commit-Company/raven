import type { Message } from "@raven/types/common/Message"

type VideoLikeMessage = Message & {
    file?: string
    thumbnail_width?: number
    thumbnail_height?: number
    image_width?: number
    image_height?: number
}

/**
 * Inline video players for one message or a batch's video members.
 *
 * When dimensions are stored, the box is reserved at the real aspect (any
 * orientation) — height is known before load, so the scroll engine never
 * shifts. Without them, the video sizes to its natural aspect, capped by
 * max-w/max-h — correct for portrait and landscape, at the cost of a one-time
 * reflow when metadata loads. (Capturing video dimensions at upload, like image
 * thumbnails, would make this deterministic too.)
 */
export const MessageVideo = ({ messages }: { messages: Message[] }) => (
    <div className="space-y-1">
        {(messages as VideoLikeMessage[]).map((message) => {
            return (
                <div key={message.name} data-message-id={message.name} data-media-root="" className="max-w-md lg:max-w-lg">
                    <video
                        src={message.file}
                        controls
                        preload="metadata"
                        className="max-h-96 max-w-full rounded-lg bg-surface-gray-2"
                    />
                </div>
            )
        })}
    </div>
)
