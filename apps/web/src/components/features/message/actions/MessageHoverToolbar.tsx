import { Fragment, useState } from "react"
import { useAtomValue, useSetAtom } from "jotai"
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
import { useToggleReaction } from "./useToggleReaction"
import { ReactionPicker } from "./ReactionPicker"
import type { Message } from "@raven/types/common/Message"
import { QuickEmojisAtom } from "@utils/preferences"

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
    const toggleReaction = useToggleReaction()
    const [menuOpen, setMenuOpen] = useState(false)

    /** The ellipsis menu marks the message as the action target, like right-click does. */
    const handleMenuOpenChange = (open: boolean) => {
        setMenuOpen(open)
        setActionTarget(open ? message : null)
        onMenuOpenChange(open)
    }

    const quickEmojis = useAtomValue(QuickEmojisAtom)

    return (
        <div
            data-message-id={message.name}
            data-hover-toolbar
            // z-30: must float above the sticky date separators (z-20)
            className="absolute right-4 z-40 flex items-center gap-0.5 rounded-md border border-outline-gray-2 bg-surface-base p-0.5 shadow-xs"
            style={{ top }}
        >
            {quickEmojis.map((emoji) => (
                <Button
                    key={emoji.id}
                    variant="ghost"
                    size="md"
                    isIconButton
                    aria-label={`${_("React with")} ${emoji}`}
                    onClick={() => toggleReaction(message, emoji.native ? emoji.native : emoji.src ?? "", emoji.src ? true : false, emoji.id)}
                >
                    {emoji.src ? (
                        <img
                            src={emoji.src}
                            alt={emoji.id}
                            loading="lazy"
                            className="h-4.5 w-4.5 object-contain"
                            aria-hidden="true"
                        />
                    ) : (
                        // em-emoji renders from the Apple set (initialized in
                        // App.tsx) so reactions look the same on every platform
                        <span className="flex h-4.5 w-4.5 items-center justify-center" aria-hidden="true">
                            <em-emoji native={emoji.native} set="apple" size="1.1em" fallback={emoji.id} />
                        </span>
                    )}
                </Button>
            ))}
            <ReactionPicker message={message} tooltip={_("Add reaction")} side="bottom" align="end" onOpenChange={onMenuOpenChange}>
                <Button variant="ghost" size="md" isIconButton aria-label={_("Add reaction")}>
                    <SmilePlus />
                </Button>
            </ReactionPicker>
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
