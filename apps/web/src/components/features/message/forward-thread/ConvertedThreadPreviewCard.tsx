import { Hash, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { GroupedAvatars } from "@components/ui/grouped-avatars"
import type { ConvertedChannelPreview } from "@raven/types/common/Message"

/** Resolve relative image paths (e.g. /files/xxx) to absolute so avatars load correctly */
function avatarSrc(src: string | undefined): string | undefined {
    if (!src || typeof src !== "string") return undefined
    if (src.startsWith("http://") || src.startsWith("https://")) return src
    if (src.startsWith("/")) return window.location.origin + src
    return src
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

interface ConvertedThreadPreviewCardProps {
    channelId: string
    workspace: string | null
    /** Optional display name for the channel (e.g. "q1-planning") */
    channelName?: string
    /** Rich preview (participants, root message, replies) — when present, same layout as thread preview */
    preview?: ConvertedChannelPreview | null
    className?: string
}

export function ConvertedThreadPreviewCard({
    channelId,
    workspace,
    channelName,
    preview,
    className,
}: ConvertedThreadPreviewCardProps) {
    const to = workspace
        ? `/${encodeURIComponent(workspace)}/${encodeURIComponent(channelId)}`
        : "#"

    const replyCount = preview?.message_count ?? 0
    const previewReplies = preview?.preview_replies ?? []

    const content = (
        <div
            className={cn(
                "rounded-lg border border-outline-gray-2/50 bg-surface-white block",
                "border-l-4 border-l-primary/30",
                "p-3 no-underline text-inherit",
                workspace && "cursor-pointer",
                className
            )}
        >
            {/* Header: Thread — Converted to channel + participants + replies (same style as thread heading) */}
            <div className="flex items-center gap-1 text-xs mb-3 flex-wrap">
                <div className="flex items-center gap-0.5">
                    <Hash className="h-3 w-3 shrink-0" aria-hidden />
                    <span className="font-semibold">Thread</span>
                </div>
                <span className="text-ink-gray-4">—</span>
                <span className="text-ink-gray-4">Converted to channel</span>
                {preview?.participants && preview?.participants.length > 0 && (
                    <>
                        <GroupedAvatars users={preview.participants} max={4} size="xs" />
                        <span className="text-ink-gray-4">
                            {replyCount} {replyCount === 1 ? "reply" : "replies"}
                        </span>
                    </>
                )}
                {preview?.participants?.length === 0 && replyCount > 0 && (
                    <span className="text-ink-gray-4">
                        {replyCount} {replyCount === 1 ? "reply" : "replies"}
                    </span>
                )}
            </div>

            {/* Who started the thread: avatar + name */}
            {preview?.root_message_owner_name && (
                <div className="mb-3 flex items-center gap-2">
                    <Avatar className="h-6 w-6 shrink-0 rounded-full border border-outline-gray-2">
                        <AvatarImage src={avatarSrc(preview.root_message_owner_image)} alt={preview.root_message_owner_name} />
                        <AvatarFallback className="text-[9px] bg-surface-gray-2">
                            {getInitials(preview.root_message_owner_name)}
                        </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-ink-gray-4">
                        <span className="font-medium text-ink-gray-8">{preview.root_message_owner_name}</span>
                        <span> started the thread</span>
                    </p>
                </div>
            )}

            {previewReplies.length > 0 ? (
                previewReplies.slice(0, 2).map((reply, i) => (
                    <div key={i} className="flex gap-2.5 mb-2">
                        <Avatar className="h-6 w-6 shrink-0 rounded-full border border-outline-gray-2">
                            <AvatarImage src={avatarSrc(reply.owner_image)} alt={reply.owner_name} />
                            <AvatarFallback className="text-[9px] bg-surface-gray-2">
                                {getInitials(reply.owner_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-ink-gray-8">{reply.owner_name}</p>
                            <p className="text-sm text-ink-gray-4 line-clamp-1">
                                {reply.snippet}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-ink-gray-8 mb-3">
                    This thread was converted to a channel. You can continue the conversation there.
                </p>
            )}

            {/* Footer: Go to channel */}
            <div className="mt-3 pt-2 border-t border-outline-gray-2/50 flex items-center gap-1.5 text-xs font-medium text-ink-blue-3">
                <ExternalLink className="h-3.5 w-3.5" />
                Go to channel{channelName ? ` #${channelName}` : ""}
            </div>
        </div>
    )

    if (workspace) {
        return (
            <Link to={to} className="block no-underline text-inherit" onClick={(e) => e.stopPropagation()}>
                {content}
            </Link>
        )
    }

    return <div className="cursor-default">{content}</div>
}
