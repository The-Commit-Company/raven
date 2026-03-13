import { useUser } from "@hooks/useUser"
import { Message, type ConvertedChannelPreview } from "@raven/types/common/Message"
import { UserAvatar } from "../UserAvatar"
import { getDateObject } from "@utils/date"
import { useMemo, useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { ExternalLink, ForwardIcon, LucideIcon, PencilIcon, PinIcon, UserPlus, BellOff, Hash } from "lucide-react"
import ReplyMessage from "./ReplyMessage"
import { ThreadButton, ThreadHeader } from "./ThreadMessage"
import { cn } from "@lib/utils"
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from "@components/ui/context-menu"
import { useIntersectionObserver } from "usehooks-ts"
import { useLocation } from "react-router-dom"
import { useSetAtom } from "jotai"
import { forwardThreadModalAtom } from "@utils/channelAtoms"
import { ForwardedThreadMessage } from "../forward-thread/ForwardedThreadMessage"
import { buildThreadUrl } from "../forward-thread/ThreadPreviewCard"
import { ConvertThreadToChannelDialog } from "../ConvertThreadToChannelDialog"
import { ConvertedThreadPreviewCard } from "../forward-thread/ConvertedThreadPreviewCard"

/**
 * Anatomy of a message
 *
 * A message "stream" is a list of messages separated by dates
 *
 * A date block is a simple divider with a date. Any message below the divider was sent on this date.
 * Two date blocks can never be adjacent to each other.
 *
 * A message block can be of multiple types depending on the message type + who sent it and when.
 *
 * If two messages are sent by the same person within 2 minutes of each other, they are grouped together.
 * The first message in such a group will have a User Avatar, Name and timestamp, and the rest will not.
 * Subsequent message blocks in this 'mini-block' will only show a timestamp on hover.
 *
 * The message block can be of the following types:
 * 1. Image - this will show a preview of the image. Clicking on it will open the image in a modal.
 * 2. File - this will show a small box with the file name with actions to copy the link or download the file.
 *      PDF - PDF files will also have an action to open the file in a modal.
 *      Video - A video file will have a preview of the video.
 * 3. Text - this will show the text message in a tiptap renderer. A text block can have multiple elements
 *     1. Text - this will show the text as is (p, h1, h2, h3, h4, h5, h6, blockquote, li, ul, ol)
 *     2. Code - this will show in a container with a quick action button to copy it
 *     3. Mention - this will show the mentioned user's name (highlighted) and hovering over them should show a card with their details
 *
 * A message can also be a reply to another message. In this case, the message will have a small box at the top with the message content and a click will jump to the message.
 *
 * Every message has reactions at the very bottom. Every reaction has a count and a list of users who reacted to it.
 *
 * Every message will have a context menu (right click) with the following options:
 * 1. Reply - this will open the reply box with the message quoted
 * 2. Edit - this will open the edit box with the message content
 * 3. Delete - this will delete the message
 * 4. Copy - this will copy the message content
 * 5. Copy Link - this will copy the message link (if file)
 * 6. Send in an email
 * 7. Link with document
 * 8. Bookmark
 *
 * Every message will have a hover menu with the following options:
 * 1. Reaction emojis with the frequently used emojis for that user on this channel
 * 2. Reply/Edit depending on the user
 * 3. Ellipsis to open the context menu
 *
 */

/** Treat is_thread as true for 1, true, or "1" so thread UI shows on both Channel and DM (API may return different types). */
function isThreadParent(message: Message): boolean {
    const v = message.is_thread as unknown
    return v === 1 || v === true || String(v) === "1"
}

/** Check if message has forwarded thread preview in json */
function hasForwardedThread(message: Message): boolean {
    const j = message.json
    if (!j) return false
    const parsed = typeof j === "string" ? (() => { try { return JSON.parse(j) } catch { return {} } })() : j
    return !!parsed?.forwarded_thread
}

function getConvertedToChannelId(message: Message): string | null {
    const j = message.json
    if (!j) return null
    const parsed = typeof j === "string" ? (() => { try { return JSON.parse(j) } catch { return {} } })() : j
    return (parsed?.converted_to_channel_id as string) || null
}

function getConvertedToChannelWorkspace(message: Message): string | null {
    const j = message.json
    if (!j) return null
    const parsed = typeof j === "string" ? (() => { try { return JSON.parse(j) } catch { return {} } })() : j
    return (parsed?.converted_to_channel_workspace as string) || null
}

function getConvertedChannelPreview(message: Message): ConvertedChannelPreview | null {
    const j = message.json
    if (!j) return null
    const parsed = typeof j === "string" ? (() => { try { return JSON.parse(j) } catch { return {} } })() : j
    const p = parsed?.converted_channel_preview
    return p && typeof p === "object" && p.root_message_owner_name && p.root_message_snippet != null ? (p as ConvertedChannelPreview) : null
}

export const MessageItem = ({ message, onInView }: { message: Message; onInView?: (message: Message) => void }) => {

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [convertDialogOpen, setConvertDialogOpen] = useState(false)
    const showThread = isThreadParent(message)
    const setForwardThread = useSetAtom(forwardThreadModalAtom)
    const convertedToChannelId = getConvertedToChannelId(message)
    const convertedToChannelWorkspace = getConvertedToChannelWorkspace(message)
    const convertedChannelPreview = getConvertedChannelPreview(message)
    const location = useLocation()

    const isDM = location.pathname.includes("/dm-channel/")
    const workspaceMatch = location.pathname.match(/^\/([^/]+)\/channel\//)
    const sourceWorkspace = workspaceMatch ? workspaceMatch[1] : null

    const handleForwardThread = () => {
        setForwardThread({
            threadId: message.name,
            sourceChannelId: message.channel_id,
            isSourceDm: isDM,
            sourceWorkspace: isDM ? null : sourceWorkspace ?? null,
            title: (message.text || message.content || "").slice(0, 100),
            messageCount: 0,
            rootMessageSnippet: (message.text || message.content || "").slice(0, 200),
            lastActivity: "",
            lastMessageOwnerName: "",
        })
    }

    const handleOpenThreadInNewTab = () => {
        const url = buildThreadUrl(
            {
                thread_id: message.name,
                source_channel_id: message.channel_id,
                is_source_dm: isDM,
                source_workspace: isDM ? null : sourceWorkspace ?? null,
                title: "",
                message_count: 0,
                root_message_snippet: "",
                last_activity: "",
                last_message_owner_name: "",
            },
            true // fullscreen when opening in new tab
        )
        window.open(url, "_blank", "noopener,noreferrer")
    }

    const handleJoinThread = () => {
        // TODO: Wire up join thread API
    }

    const handleMuteThread = () => {
        // TODO: Wire up mute thread API
    }

    const handleConvertThreadToChannel = () => {
        setConvertDialogOpen(true)
    }

    const handleConvertSuccess = () => {
        // Optionally invalidate messages so the list refetches and shows converted banner
        setConvertDialogOpen(false)
    }

    const { shortTime, longTime } = useMemo(() => {
        try {
            const dateObj = getDateObject(message.creation)
            return {
                shortTime: dateObj.format('hh:mm A'),
                longTime: dateObj.format('Do MMMM YYYY, hh:mm A'),
            }
        }
        catch (error) {
            return {
                shortTime: message.creation,
                longTime: message.creation,
            }
        }
    }, [message.creation])

    const { ref } = useIntersectionObserver({
        onChange: (isIntersecting) => {
            if (onInView && isIntersecting) {
                onInView(message)
            }
        }
    })


    return <ContextMenu onOpenChange={setIsMenuOpen}>
        <ContextMenuTrigger
            ref={ref}
            data-message-id={message.name}
            className={cn("group/message-item w-full overflow-hidden relative hover:bg-muted/30 py-3 rounded-md px-3.5 transition-all duration-200",
                "data-[state=open]:bg-muted/50"
            )}
        >
            <div>
                {showThread && !convertedToChannelId && <ThreadHeader displayName={"TODO: Wire this up"} threadTitle={"Do not forget"} />}
                {showThread && !convertedToChannelId && <div className={cn("absolute left-7.5 w-7 border-l border-b border-border rounded-bl-lg z-0", message.is_continuation ? 'top-[36px] h-[calc(100%-64px)]' : 'top-[42px] h-[calc(100%-72px)]')} />}
                {message.is_continuation === 0 ? <NonContinuationMessageHeader
                    message={message} shortTime={shortTime} longTime={longTime}
                /> :
                    <ContinuationMessageHeader message={message} />}

                {showThread && convertedToChannelId ? (
                    <div className="ml-11 mt-2">
                        <ConvertedThreadPreviewCard
                            channelId={convertedToChannelId}
                            workspace={convertedToChannelWorkspace}
                            preview={convertedChannelPreview}
                        />
                    </div>
                ) : showThread ? (
                    <ThreadButton
                        participants={[
                            { name: "Desirae Lipshutz", full_name: "Desirae Lipshutz", type: "User", user_image: "https://randomuser.me/api/portraits/women/44.jpg" },
                            { name: "Brandon Franci", full_name: "Brandon Franci", type: "User", user_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
                            { name: "Sarah Chen", full_name: "Sarah Chen", type: "User", user_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
                        ]}
                        messageCount={5}
                        threadID={message.name}
                    />
                ) : null}
            </div>
        </ContextMenuTrigger>
        <ContextMenuContent loop>
            {showThread && (
                <ContextMenuGroup>
                    <ContextMenuItem onClick={handleJoinThread}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join thread
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleOpenThreadInNewTab}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open thread in new tab
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleForwardThread}>
                        <ForwardIcon className="mr-2 h-4 w-4" />
                        Forward thread
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleMuteThread}>
                        <BellOff className="mr-2 h-4 w-4" />
                        Mute thread
                    </ContextMenuItem>
                    {!convertedToChannelId && (
                        <ContextMenuItem onClick={handleConvertThreadToChannel}>
                            <Hash className="mr-2 h-4 w-4" />
                            Convert thread to channel
                        </ContextMenuItem>
                    )}
                </ContextMenuGroup>
            )}
        </ContextMenuContent>

        {showThread && (
            <ConvertThreadToChannelDialog
                open={convertDialogOpen}
                onOpenChange={setConvertDialogOpen}
                threadId={message.name}
                onSuccess={handleConvertSuccess}
            />
        )}
    </ContextMenu>
}

const NonContinuationMessageHeader = ({ message, shortTime, longTime }: { message: Message, shortTime: string, longTime: string }) => {

    const { data: user } = useUser(message.owner)
    const displayName = user?.full_name || user?.name || message.owner || "User"

    return <div className="flex items-start gap-3">
        {user ? <UserAvatar user={user} size="md" /> : (
            <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                {displayName.slice(0, 2).toUpperCase()}
            </div>
        )}
        <div className="flex-1">
            <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{displayName}</span>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger>
                        <span className="text-xs font-light text-muted-foreground/90 tabular-nums">{shortTime}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        {longTime}
                    </TooltipContent>
                </Tooltip>
            </div>
            <MessageContent message={message} />
            {/* {firstValidUrl && (
            <LinkPreview
                href={firstValidUrl}
                data={getDummyPreviewData()}
                onHide={handleHidePreview}
            />
        )} */}
        </div>
    </div>
}

const ContinuationMessageHeader = ({ message }: { message: Message }) => {

    return <div className="flex items-start gap-3">
        <div className="w-8 h-8 min-w-8 min-h-8">
        </div>
        <MessageContent message={message} />
    </div>
}


const MessageContent = ({ message }: { message: Message }) => {

    const repliedMessageDetails = useMemo(() => {
        if (message.replied_message_details) {
            try {
                return JSON.parse(message.replied_message_details)
            } catch (error) {
                return null
            }
        }
        return null
    }, [message.replied_message_details])

    return <div className="flex-1 space-y-1">

        {message.is_pinned === 1 && <MessageAttributeIndicator attribute="Pinned" Icon={PinIcon} />}

        {message.is_forwarded === 1 && <MessageAttributeIndicator attribute="forwarded" Icon={ForwardIcon} />}

        {message.is_edited === 1 && <MessageAttributeIndicator attribute="edited" Icon={PencilIcon} />}

        {message.linked_message && repliedMessageDetails &&
            <ReplyMessage repliedMessage={repliedMessageDetails} />}


        {message.text && <div className="text-[13px] text-primary">{message.content}</div>}

        {message.is_forwarded === 1 && hasForwardedThread(message) && (
            <ForwardedThreadMessage message={message} />
        )}
    </div>
}

const MessageAttributeIndicator = ({ attribute, Icon }: { attribute: string, Icon: LucideIcon }) => {
    return <div className="text-muted-foreground flex items-center gap-1 py-0.5">
        <Icon className={"w-4 h-4 pb-0.5"} />
        <span className="text-xs">{attribute}</span>
    </div>
}