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
import { Button } from "@components/ui/button"
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
 * Selections this soon after the menu opened are the tail of the opening
 * gesture: the menu mounts under the cursor, and releasing a slow right-click
 * lands on the first item, "selecting" it. Ignore them.
 */
const OPEN_GESTURE_GUARD_MS = 200

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
    /**
     * The target atom is cleared by several close paths (menu close, toolbar
     * dropdown close), and a clear can race a fresh right-click's set —
     * leaving Radix open over a null target, i.e. an empty menu. Rendering
     * from the last non-null target makes the content immune to that race;
     * the live atom still drives the highlight and open/close.
     */
    const lastTargetRef = useRef<Message | null>(null)
    if (target) lastTargetRef.current = target
    const menuMessage = target ?? lastTargetRef.current
    const actionGroups = useMessageActions(menuMessage)
    const lastTapRef = useRef({ messageID: "", time: 0 })
    const menuOpenedAtRef = useRef(0)
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
        if (!message) return null
        // A batch acts as one logical message: target its LAST (newest) member — where
        // the reply linkage already lives — regardless of which tile was hit, and anchor
        // the toolbar to the whole batch row so it doesn't jump between album tiles.
        if (message.message_batch_id) {
            const members = channelMessagesStore.batchMembers(channelID, message.message_batch_id)
            const target = members[members.length - 1] ?? message
            const root = (element.closest("[data-batch-root]") as HTMLElement | null) ?? element
            return { message: target, element: root }
        }
        return { message, element }
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
        menuOpenedAtRef.current = performance.now()
        // Mobile long-press: the bottom sheet opens via the target atom instead of Radix
        if (isMobile) {
            setHovered(null)
            event.preventDefault()
        }
    }

    /**
     * Runs an action — unless this "selection" is the release of the right-click that opened
     * the menu. That happens when the menu opens near the viewport bottom: Radix shifts it up
     * to fit, landing an item under the cursor, so the opening pointer-up fires onSelect on it.
     * preventDefault keeps Radix from closing the menu on that phantom select (without it the
     * menu would flash open and dismiss instantly); we just swallow the event.
     */
    const selectAction = (action: MessageAction, event: Event) => {
        if (performance.now() - menuOpenedAtRef.current < OPEN_GESTURE_GUARD_MS) {
            event.preventDefault()
            return
        }
        action.onSelect()
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

            {/* Keyed by target so right-clicking a DIFFERENT message while the menu is open
                remounts the content — Radix only re-anchors to the pointer on the closed→open
                transition, so without this the menu would stay put over the old message.
                collisionPadding keeps it off the viewport edge. */}
            <ContextMenuContent key={menuMessage?.name} className="w-56" collisionPadding={8}>
                {actionGroups.map((group, index) => (
                    <Fragment key={index}>
                        {index > 0 && <ContextMenuSeparator />}
                        <ContextMenuGroup>
                            {group.map((action) => (
                                <ContextMenuItem
                                    key={action.id}
                                    variant={action.danger ? "destructive" : "default"}
                                    onSelect={(event) => selectAction(action, event)}
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
    <Button
        variant="ghost"
        size="md"
        theme={action.danger ? "red" : "gray"}
        className={cn("w-full justify-start gap-3")}
        onClick={() => {
            action.onSelect()
            onDone()
        }}
    >
        <action.icon />
        {action.label}
    </Button>
)
