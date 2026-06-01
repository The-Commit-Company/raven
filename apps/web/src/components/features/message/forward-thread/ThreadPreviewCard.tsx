import { Hash, ExternalLink } from "lucide-react"
import type { ForwardedThreadMetadata } from "@raven/types/common/Message"
import { cn } from "@lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { GroupedAvatars } from "@components/ui/grouped-avatars"

/** Resolve relative image paths to absolute so avatars load correctly */
function avatarSrc(src: string | undefined): string | undefined {
    if (!src || typeof src !== "string") return undefined
    if (src.startsWith("http://") || src.startsWith("https://")) return src
    if (src.startsWith("/")) return window.location.origin + src
    return src
}

/** Build absolute URL for a thread (opens in new tab)
 * @param meta - Thread metadata
 * @param fullscreen - If true, appends ?fullscreen=1 so the thread opens at 100% width
 */
export function buildThreadUrl(meta: ForwardedThreadMetadata, fullscreen?: boolean): string {
    const base = window.location.origin + (import.meta.env.VITE_BASE_NAME || "")
    let path: string
    if (meta.is_source_dm) {
        path = `${base}/dm-channel/${encodeURIComponent(meta.source_channel_id)}/thread/${encodeURIComponent(meta.thread_id)}`
    } else {
        const workspace = meta.source_workspace ? encodeURIComponent(meta.source_workspace) : ""
        path = `${base}/${workspace}/${encodeURIComponent(meta.source_channel_id)}/thread/${encodeURIComponent(meta.thread_id)}`
    }
    return fullscreen ? `${path}?fullscreen=1` : path
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

interface ThreadPreviewCardProps {
    meta: ForwardedThreadMetadata
    /** When true, card is clickable and opens in new tab */
    clickable?: boolean
    /** Compact view (e.g. inside modal) */
    compact?: boolean
    className?: string
}

export function ThreadPreviewCard({
    meta,
    clickable = true,
    compact = false,
    className,
}: ThreadPreviewCardProps) {
    const url = buildThreadUrl(meta, true)
    const rootSnippet = meta.root_message_snippet?.slice(0, 200) || meta.title || ""
    const rootDisplay = rootSnippet.length > 200 ? rootSnippet + "…" : rootSnippet
    const startedByName = meta.root_message_owner_name || meta.last_message_owner_name || "Someone"
    const participants = meta.participants ?? []
    const previewReplies = meta.preview_replies ?? []

    const content = (
        <div
            className={cn(
                "rounded-lg border border-outline-gray-2/50 bg-surface-white transition-colors",
                "border-l-4 border-l-primary/30",
                clickable && "cursor-pointer",
                compact && "p-2.5",
                !compact && "p-3",
                className
            )}
        >
            {/* Header: Thread — participants + replies (same style as thread heading) */}
            <div className="flex items-center gap-1 text-xs mb-3 flex-wrap">
                <div className="flex items-center gap-0.5">
                    <Hash className="h-3 w-3 shrink-0" aria-hidden />
                    <span className="font-semibold">Thread</span>
                </div>
                <span className="text-ink-gray-4">—</span>
                {participants.length > 0 && (
                    <>
                        <GroupedAvatars users={participants} max={4} size="xs" />
                        <span className="text-ink-gray-4">
                            {meta.message_count} {meta.message_count === 1 ? "reply" : "replies"}
                        </span>
                    </>
                )}
                {participants.length === 0 && (
                    <span className="text-ink-gray-4">
                        {meta.message_count} {meta.message_count === 1 ? "reply" : "replies"}
                    </span>
                )}
            </div>

            {/* Root message: who started the thread + first message */}
            <div className="flex gap-2.5 mb-2">
                <Avatar className="h-7 w-7 shrink-0 rounded-full border border-outline-gray-2">
                    <AvatarImage src={avatarSrc(meta.root_message_owner_image)} alt={startedByName} />
                    <AvatarFallback className="text-[10px] bg-surface-gray-2">
                        {getInitials(startedByName)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-ink-gray-8">
                        {startedByName}
                        <span className="font-normal text-ink-gray-4"> started the thread</span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-gray-4 line-clamp-2">
                        {rootDisplay}
                    </p>
                </div>
            </div>

            {/* 1–2 reply previews */}
            {previewReplies.slice(0, 2).map((reply, i) => (
                <div key={i} className="flex gap-2.5 ml-9 mt-2">
                    <Avatar className="h-6 w-6 shrink-0 rounded-full border border-outline-gray-2">
                        <AvatarImage src={avatarSrc(reply.owner_image)} alt={reply.owner_name} />
                        <AvatarFallback className="text-[9px] bg-surface-gray-2">
                            {getInitials(reply.owner_name ?? "?")}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink-gray-8">{reply.owner_name}</p>
                        <p className="text-sm text-ink-gray-4 line-clamp-1">
                            {reply.snippet}
                        </p>
                    </div>
                </div>
            ))}

            {/* Footer: View thread */}
            {clickable && (
                <div className="mt-3 pt-2 border-t border-outline-gray-2/50 flex items-center gap-1.5 text-xs font-medium text-ink-blue-3">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View thread
                </div>
            )}
        </div>
    )

    if (clickable) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline"
                aria-label={`Open thread: ${meta.title}`}
            >
                {content}
            </a>
        )
    }

    return content
}
