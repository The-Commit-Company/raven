import { useUser } from "@hooks/useUser"
import { Message } from "@raven/types/common/Message"
import { UserAvatar } from "../UserAvatar"
import { getDateObject } from "@lib/date"
import _ from "@lib/translate"
import { useMemo } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { ThreadButton, ThreadHeader } from "./ThreadMessage"
import { cn } from "@lib/utils"
import { useIntersectionObserver } from "usehooks-ts"
import { MessageContent } from "./MessageContent"

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

export const MessageItem = ({ message, onInView }: { message: Message; onInView?: (message: Message) => void }) => {

    const showThread = isThreadParent(message)

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


    // Pure render: interactivity (context menu, action sheet, dialogs) lives at
    // the stream level via event delegation on the data-message-id wrapper.
    return <div
        ref={ref}
        className="group/message-item w-full overflow-hidden relative hover:bg-surface-gray-1 py-2 rounded-md px-3.5 transition-all duration-200"
    >
        {showThread && <ThreadHeader displayName={"TODO: Wire this up"} threadTitle={"Do not forget"} />}
        {showThread && <div className={cn("absolute left-7.5 w-7 border-l border-b border-outline-gray-2 rounded-bl-lg z-0", message.is_continuation ? 'top-9 h-[calc(100%-64px)]' : 'top-[42px] h-[calc(100%-72px)]')} />}
        {message.is_continuation === 0 ? <NonContinuationMessageHeader
            message={message} shortTime={shortTime} longTime={longTime}
        /> :
            <ContinuationMessageHeader message={message} />}

        {showThread ? (
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
}

const NonContinuationMessageHeader = ({ message, shortTime, longTime }: { message: Message, shortTime: string, longTime: string }) => {

    const { data: user } = useUser(message.owner)
    const displayName = user?.full_name || user?.name || message.owner || _("User")

    return <div className="flex items-start gap-3">
        {user ? <UserAvatar user={user} size="md" /> : (
            <div className="h-8 w-8 shrink-0 rounded-full bg-surface-gray-2 flex items-center justify-center text-xs font-medium text-ink-gray-4">
                {displayName.slice(0, 2).toUpperCase()}
            </div>
        )}
        <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{displayName}</span>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger>
                        <span className="text-xs font-regular text-ink-gray-4">{shortTime}</span>
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
        <div className="w-8 min-w-8">
        </div>
        <MessageContent message={message} />
    </div>
}


