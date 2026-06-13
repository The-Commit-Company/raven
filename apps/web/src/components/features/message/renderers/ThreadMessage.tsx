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