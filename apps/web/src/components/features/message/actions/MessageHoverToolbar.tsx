import { Fragment, useState } from "react"
import { useSetAtom } from "jotai"
import { toast } from "sonner"
import { MoreHorizontal, Reply, SmilePlus } from "lucide-react"
import { Button } from "@components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { messageActionTargetAtom, replyToMessageAtom } from "@utils/channelAtoms"
import _ from "@lib/translate"
import { useMessageActions } from "./useMessageActions"
import type { Message } from "@raven/types/common/Message"

/** Slack-style defaults until frequently-used reactions land (layer 5). */
const QUICK_REACTIONS = ["👍", "✅", "👀"]

/**
 * The floating quick-action toolbar — ONE instance per stream, positioned over
 * the hovered message's top-right corner by MessageActionMenu's hover tracking.
 *
 * Carries the hovered message's data-message-id so the delegated hover handler
 * treats the toolbar as part of the message (otherwise hovering the toolbar
 * itself would clear the hover and dismiss it under the cursor).
 */
export const MessageHoverToolbar = ({
    message,
    top,
    onMenuOpenChange,
    onOpenFullMenu,
}: {
    message: Message
    /** Offset from the stream wrapper's top, computed at hover time. */
    top: number
    /** Lets the hover tracker keep the toolbar mounted while the menu is open. */
    onMenuOpenChange: (open: boolean) => void
    /** Mobile: the ellipsis opens the action bottom sheet instead of an inline dropdown. */
    onOpenFullMenu?: () => void
}) => {
    const actionGroups = useMessageActions(message)
    const setActionTarget = useSetAtom(messageActionTargetAtom)
    const setReplyTo = useSetAtom(replyToMessageAtom(message.channel_id))
    const [menuOpen, setMenuOpen] = useState(false)

    /** The ellipsis menu marks the message as the action target, like right-click does. */
    const handleMenuOpenChange = (open: boolean) => {
        setMenuOpen(open)
        setActionTarget(open ? message : null)
        onMenuOpenChange(open)
    }

    return (
        <div
            data-message-id={message.name}
            data-hover-toolbar
            // z-30: must float above the sticky date separators (z-20)
            className="absolute right-4 z-30 flex items-center gap-0.5 rounded-md border border-outline-gray-2 bg-surface-base p-0.5 shadow-xs"
            style={{ top }}
        >
            {QUICK_REACTIONS.map((emoji) => (
                <Button
                    key={emoji}
                    variant="ghost"
                    size="md"
                    isIconButton
                    aria-label={`${_("React with")} ${emoji}`}
                    // TODO(layer 5): optimistic toggle via reactions API + store.reactionsUpdated
                    onClick={() => toast.info(`${_("Reactions")} — ${_("coming soon")}`)}
                >
                    <span className="text-lg leading-none">{emoji}</span>
                </Button>
            ))}
            <Button
                variant="ghost"
                size="md"
                isIconButton
                aria-label={_("Add reaction")}
                // TODO(layer 5): emoji picker
                onClick={() => toast.info(`${_("Reactions")} — ${_("coming soon")}`)}
            >
                <SmilePlus />
            </Button>
            <Button
                variant="ghost"
                size="md"
                isIconButton
                aria-label={_("Reply")}
                onClick={() => setReplyTo(message)}
            >
                <Reply />
            </Button>

            {onOpenFullMenu ? (
                <Button
                    variant="ghost"
                    size="md"
                    isIconButton
                    aria-label={_("More actions")}
                    onClick={onOpenFullMenu}
                >
                    <MoreHorizontal />
                </Button>
            ) : (
                <DropdownMenu open={menuOpen} onOpenChange={handleMenuOpenChange}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="md" isIconButton aria-label={_("More actions")}>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        {actionGroups.map((group, index) => (
                            <Fragment key={index}>
                                {index > 0 && <DropdownMenuSeparator />}
                                <DropdownMenuGroup>
                                    {group.map((action) => (
                                        <DropdownMenuItem
                                            key={action.id}
                                            variant={action.danger ? "destructive" : "default"}
                                            onSelect={action.onSelect}
                                        >
                                            <action.icon />
                                            <span>{action.label}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                            </Fragment>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}
