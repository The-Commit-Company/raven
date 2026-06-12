import { Download, Share2, X } from "lucide-react"
import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { UserAvatar } from "../UserAvatar"
import _ from "@lib/translate"
import type { UserData } from "@db"

/**
 * Shared header for the media preview modals (images, files) — sender
 * identity on the left, file identity in the middle, actions on the right.
 * `children` render between the file name and the action buttons (e.g. the
 * image slideshow's "2 of 5" counter).
 */
export const MediaPreviewHeader = ({
    user,
    time,
    fileName,
    fileSize,
    children,
    onDownload,
    onShare,
    onClose,
}: {
    user?: UserData
    time?: string
    fileName: string
    fileSize?: string
    children?: React.ReactNode
    onDownload: () => void
    onShare: () => void
    onClose: () => void
}) => (
    // Mobile: sender + actions share the first row, the file name wraps to its
    // own full-width row. Desktop: all three sit side by side.
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        {user && (
            <div className="order-1 flex min-w-0 items-center gap-2">
                <UserAvatar user={user} size="md" />
                <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="truncate text-sm font-medium text-ink-gray-8">
                        {user.full_name || user.name}
                    </h3>
                    {time && <span className="text-xs font-regular text-ink-gray-4">{time}</span>}
                </div>
            </div>
        )}

        <div className="order-3 flex min-w-0 basis-full flex-wrap items-baseline gap-2 sm:order-2 sm:basis-auto">
            <Tooltip>
                {/* asChild span: a focusable trigger would grab the dialog's
                    initial focus and auto-open the tooltip */}
                <TooltipTrigger asChild>
                    <span className="max-w-64 truncate text-base font-medium">{fileName}</span>
                </TooltipTrigger>
                <TooltipContent>{fileName}</TooltipContent>
            </Tooltip>
            {fileSize && (
                <Badge size="sm" variant="subtle" theme="gray">
                    {fileSize}
                </Badge>
            )}
        </div>

        <div className="order-2 flex shrink-0 items-center gap-2 sm:order-3">
            {children}
            <Button
                variant="ghost"
                size="sm"
                isIconButton
                title={_("Download")}
                aria-label={_("Download")}
                onClick={onDownload}
            >
                <Download />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                isIconButton
                title={_("Share")}
                aria-label={_("Share")}
                onClick={onShare}
            >
                <Share2 />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                isIconButton
                title={_("Close")}
                aria-label={_("Close")}
                onClick={onClose}
            >
                <X />
            </Button>
        </div>
    </div>
)
