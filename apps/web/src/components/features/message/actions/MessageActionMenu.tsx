import { Fragment, useRef, useState } from "react"
import { useAtom } from "jotai"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@components/ui/context-menu"
import { Drawer, DrawerContent, DrawerTitle } from "@components/ui/drawer"
import { channelMessagesStore } from "@stores/messages/store"
import { messageActionTargetAtom } from "@utils/channelAtoms"
import { useIsMobile } from "@hooks/use-mobile"
import { cn } from "@lib/utils"
import _ from "@lib/translate"
import { MessageAction, useMessageActions } from "./useMessageActions"
import { MessageHoverToolbar } from "./MessageHoverToolbar"
import type { Message } from "@raven/types/common/Message"

/** Two taps on the same message within this window open the quick-action toolbar. */
const DOUBLE_TAP_MS = 300

/**
 * One action surface for the whole stream, via event delegation on
 * `data-message-id`. Desktop: hover shows the quick-action toolbar,
 * right-click opens the context menu. Mobile: double tap shows the toolbar,
 * long-press opens the bottom sheet (and the toolbar's ellipsis does too).
 * The targeted message is held in `messageActionTargetAtom` so the stream
 * can highlight it while a menu is open.
 *
 * Messages themselves carry no menu machinery — this replaces a Radix
 * ContextMenu instance per message with a single one per stream.
 */
export const MessageActionMenu = ({ channelID, children }: { channelID: string; children: React.ReactNode }) => {
    const isMobile = useIsMobile()
    const [target, setTarget] = useAtom(messageActionTargetAtom)
    const actionGroups = useMessageActions(target)
    const lastTapRef = useRef({ messageID: "", time: 0 })
    const wrapperRef = useRef<HTMLDivElement>(null)
    /** Hovered message + its toolbar position; null hides the toolbar. */
    const [hovered, setHovered] = useState<{ message: Message; top: number } | null>(null)
    /** While the toolbar's ellipsis menu is open, hover-clearing is suspended. */
    const toolbarMenuOpenRef = useRef(false)

    const blockFromEvent = (event: React.MouseEvent): { message: Message; element: HTMLElement } | null => {
        const element = (event.target as HTMLElement).closest?.("[data-message-id]") as HTMLElement | null
        const messageID = element?.getAttribute("data-message-id")
        if (!element || !messageID) return null
        const message = channelMessagesStore.getState(channelID).byId.get(messageID)
        return message ? { message, element } : null
    }

    const messageFromEvent = (event: React.MouseEvent): Message | null => blockFromEvent(event)?.message ?? null

    const showToolbarFor = (message: Message, element: HTMLElement) => {
        if (!wrapperRef.current) return
        const top = element.getBoundingClientRect().top - wrapperRef.current.getBoundingClientRect().top - 14
        setHovered({ message, top: Math.max(top, 2) })
    }

    /** Desktop: tracks which message the pointer is over and positions the floating toolbar. */
    const onMouseOver = (event: React.MouseEvent) => {
        if (isMobile || toolbarMenuOpenRef.current) return
        const block = blockFromEvent(event)
        if (!block || block.message.name === hovered?.message.name) return
        showToolbarFor(block.message, block.element)
    }

    const onMouseLeave = () => {
        if (!toolbarMenuOpenRef.current) setHovered(null)
    }

    /** Positions go stale when the content scrolls under the pointer — hide until the next hover. */
    const onScrollCapture = () => {
        if (!toolbarMenuOpenRef.current) setHovered(null)
    }

    const onToolbarMenuOpenChange = (open: boolean) => {
        toolbarMenuOpenRef.current = open
        if (!open) setHovered(null)
    }

    /** Right-click (desktop) and long-press (mobile browsers fire contextmenu for it). */
    const onContextMenu = (event: React.MouseEvent) => {
        const message = messageFromEvent(event)
        if (!message) {
            // Empty areas/date separators: no menu. preventDefault also tells the
            // Radix trigger (which respects defaultPrevented) not to open.
            event.preventDefault()
            return
        }
        setTarget(message)
        // Mobile long-press: the bottom sheet opens via the target atom instead of Radix
        if (isMobile) {
            setHovered(null)
            event.preventDefault()
        }
    }

    /** Mobile taps: double tap shows the quick-action toolbar, any other tap dismisses it. */
    const onClick = (event: React.MouseEvent) => {
        if (!isMobile) return
        const element = event.target as HTMLElement
        // Taps on the toolbar itself are handled by its own buttons
        if (element.closest("[data-hover-toolbar]")) return
        if (hovered) setHovered(null)
        // A first tap on an interactive element already did something — don't
        // let a quick second tap also open the toolbar.
        if (element.closest("a, button, [role='button'], input, textarea")) return
        const block = blockFromEvent(event)
        if (!block) return
        const last = lastTapRef.current
        lastTapRef.current = { messageID: block.message.name, time: event.timeStamp }
        if (last.messageID === block.message.name && event.timeStamp - last.time < DOUBLE_TAP_MS) {
            lastTapRef.current = { messageID: "", time: 0 }
            showToolbarFor(block.message, block.element)
        }
    }

    const closeSheet = () => setTarget(null)

    return (
        <ContextMenu onOpenChange={(open) => !open && setTarget(null)}>
            <ContextMenuTrigger asChild disabled={isMobile}>
                {/* touch-action keeps double-tap from triggering browser zoom */}
                <div
                    ref={wrapperRef}
                    className="relative flex min-h-0 min-w-0 flex-1 flex-col [touch-action:manipulation]"
                    onContextMenu={onContextMenu}
                    onClick={onClick}
                    onMouseOver={onMouseOver}
                    onMouseLeave={onMouseLeave}
                    onScrollCapture={onScrollCapture}
                >
                    {children}
                    {hovered && (
                        <MessageHoverToolbar
                            message={hovered.message}
                            top={hovered.top}
                            onMenuOpenChange={onToolbarMenuOpenChange}
                            onOpenFullMenu={
                                isMobile
                                    ? () => {
                                          const message = hovered.message
                                          setHovered(null)
                                          setTarget(message)
                                      }
                                    : undefined
                            }
                        />
                    )}
                </div>
            </ContextMenuTrigger>

            <ContextMenuContent className="w-56">
                {actionGroups.map((group, index) => (
                    <Fragment key={index}>
                        {index > 0 && <ContextMenuSeparator />}
                        <ContextMenuGroup>
                            {group.map((action) => (
                                <ContextMenuItem
                                    key={action.id}
                                    variant={action.danger ? "destructive" : "default"}
                                    onClick={action.onSelect}
                                >
                                    <action.icon />
                                    <span>{action.label}</span>
                                </ContextMenuItem>
                            ))}
                        </ContextMenuGroup>
                    </Fragment>
                ))}
            </ContextMenuContent>

            {isMobile && (
                <Drawer open={!!target} onOpenChange={(open) => !open && closeSheet()}>
                    <DrawerContent>
                        <DrawerTitle className="sr-only">{_("Message actions")}</DrawerTitle>
                        <div className="flex flex-col gap-1 p-3 pb-6">
                            {actionGroups.map((group, index) => (
                                <Fragment key={index}>
                                    {index > 0 && <div className="my-1 border-t border-outline-gray-2" />}
                                    {group.map((action) => (
                                        <SheetActionRow key={action.id} action={action} onDone={closeSheet} />
                                    ))}
                                </Fragment>
                            ))}
                        </div>
                    </DrawerContent>
                </Drawer>
            )}
        </ContextMenu>
    )
}

const SheetActionRow = ({ action, onDone }: { action: MessageAction; onDone: () => void }) => (
    <button
        className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-surface-gray-2",
            action.danger ? "text-ink-red-3" : "text-ink-gray-8",
        )}
        onClick={() => {
            action.onSelect()
            onDone()
        }}
    >
        <action.icon className="h-4 w-4" />
        {action.label}
    </button>
)
