import { GroupedAvatars } from "@components/ui/grouped-avatars"
import type { UserData } from "@db"
import { useAtom } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { useNavigate, useLocation } from "react-router-dom"

interface ThreadButtonProps {
    participants: UserData[]
    messageCount: number
    threadID?: string
}

export const ThreadButton = ({ participants, messageCount, threadID }: ThreadButtonProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const channelID = useCurrentChannelID()
    const [, setDrawerType] = useAtom(channelDrawerAtom(channelID))

    const handleClick = () => {
        if (!threadID) return

        setDrawerType('')
        const basePath = location.pathname.split('/thread')[0]
        navigate(`${basePath}/thread/${threadID}`, { replace: true })
    }

    // TODO: Use NavLink here

    return (
        <div className="flex items-center ml-11 mt-2 text-ink-gray-7 transition-colors duration-200 hover:text-ink-gray-8 cursor-pointer">
            <div
                className="inline-flex items-center gap-2 rounded-lg cursor-pointer"
                onClick={handleClick}
            >
                <GroupedAvatars users={participants} max={4} size="xs" />
                <span className="text-sm">
                    {messageCount} replies
                </span>
            </div>
        </div>
    )
}

// TODO(thread metadata): replace with real participants/count from the thread
// API. Both MessageItem and BatchMessageItem render through MessageThreadPill,
// so the wiring lands here once.
const PLACEHOLDER_PARTICIPANTS: UserData[] = [
    { name: "Desirae Lipshutz", full_name: "Desirae Lipshutz", type: "User", user_image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Brandon Franci", full_name: "Brandon Franci", type: "User", user_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
    { name: "Sarah Chen", full_name: "Sarah Chen", type: "User", user_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
] as UserData[]

/** The "N replies" affordance under any thread-parent message (single or batch member). */
export const MessageThreadPill = ({ threadID }: { threadID: string }) => (
    <ThreadButton participants={PLACEHOLDER_PARTICIPANTS} messageCount={5} threadID={threadID} />
)