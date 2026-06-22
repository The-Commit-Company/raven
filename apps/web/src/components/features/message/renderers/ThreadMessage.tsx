import { useFrappeGetCall } from "frappe-react-sdk"
import { GroupedAvatars } from "@components/ui/grouped-avatars"
import type { UserData } from "@db"
import { useAtom } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { useUsersById } from "@hooks/useMessageRowLookups"
import { useHasBeenInView } from "@hooks/useHasBeenInView"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@lib/utils"
import _ from "@lib/translate"

interface ThreadButtonProps {
    participants: UserData[]
    messageCount: number
    threadID?: string
}

export const ThreadButton = ({ participants, messageCount, threadID }: ThreadButtonProps) => {
    const location = useLocation()
    const channelID = useCurrentChannelID()
    const [, setDrawerType] = useAtom(channelDrawerAtom(channelID))

    const content = (
        <>
            <GroupedAvatars users={participants} max={4} size="xs" />
            <span className="text-sm">{_("{0} replies", [String(messageCount)])}</span>
        </>
    )
    const className = "flex w-fit ml-11 mt-2 items-center gap-2 text-ink-gray-6 transition-colors duration-200 hover:text-ink-gray-8"

    // No threadID → render non-interactive (shouldn't happen for a real pill).
    if (!threadID) return <div className={cn("ml-11 mt-2", className)}>{content}</div>

    // Thread route is sibling to the channel: strip any open `/thread/...` to get the
    // channel base, then point at this thread. `replace` so the back button still exits
    // the channel rather than cycling threads. Closing the channel drawer is a click
    // side-effect (navigating to a thread shouldn't leave the members/files drawer open).
    const to = `${location.pathname.split("/thread")[0]}/thread/${threadID}`

    return (
        <NavLink to={to} replace onClick={() => setDrawerType("")} className={({ isActive }) => cn(className, isActive && "text-ink-gray-9")}>
            {content}
        </NavLink>
    )
}

/** Placeholder pill (reserves the row's height) shown until the thread details load. */
const ThreadPillSkeleton = () => (
    <div className="ml-11 mt-2 flex w-fit items-center gap-2 text-ink-gray-5">
        <div className="flex -space-x-2 text-xs">
            <span className="size-6 rounded-full border-2 border-surface-base bg-surface-gray-3" />
            <span className="size-6 rounded-full border-2 border-surface-base bg-surface-gray-3" />
        </div>
        <span className="text-sm">{_("View thread")}</span>
    </div>
)

type ThreadDetails = { members: Record<string, unknown>; message_count: number }

const LoadedThreadPill = ({ threadID }: { threadID: string }) => {
    // Mounted only once the parent message is in view → fetch fires lazily.
    const { data } = useFrappeGetCall<{ message: ThreadDetails }>(
        "raven.api.threads.get_thread_details",
        { thread_id: threadID },
        ["thread_details", threadID],
        { revalidateOnFocus: false },
    )
    const usersById = useUsersById()

    if (!data) return <ThreadPillSkeleton />

    // members is the get_channel_members map (keyed by user id); resolve to UserData
    // from the store for the avatars.
    const participants = Object.keys(data.message.members ?? {})
        .map((id) => usersById.get(id))
        .filter((u): u is UserData => !!u)

    return <ThreadButton participants={participants} messageCount={data.message.message_count} threadID={threadID} />
}

/**
 * The "N replies" affordance under any thread-parent message (single or batch member).
 * Lazily fetches the thread's members + reply count only once the message scrolls into
 * view — a channel full of threads doesn't fire a request per thread on load.
 */
export const MessageThreadPill = ({ threadID }: { threadID: string }) => {
    const { ref, hasBeenInView } = useHasBeenInView()
    return <div ref={ref}>{hasBeenInView ? <LoadedThreadPill threadID={threadID} /> : <ThreadPillSkeleton />}</div>
}
