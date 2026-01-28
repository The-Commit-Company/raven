import { Hash } from "lucide-react"
import { GroupedAvatars } from "@components/ui/grouped-avatars"
import type { UserFields } from "@raven/types/common/UserFields"
import { useAtom } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { useNavigate, useLocation } from "react-router-dom"

interface ThreadHeaderProps {
    displayName: string
    threadTitle: string
}

export const ThreadHeader = ({ displayName, threadTitle }: ThreadHeaderProps) => (
    <div className="flex items-center gap-1 text-xs mb-3">
        <div className="flex items-center gap-0.5">
            <Hash className="h-3 w-3" />
            <span className="font-semibold">Thread</span>
        </div>
        <span className="text-muted-foreground">—</span>
        <span className="font-semibold">{displayName}</span>
        <span className="text-muted-foreground">started a thread:</span>
        <span className="font-semibold">{threadTitle}</span>
    </div>
)

interface MessageContentProps {
    displayName: string
    time: string
    message: string
}

const MessageContent = ({ displayName, time, message }: MessageContentProps) => (
    <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{displayName}</span>
            <span className="text-xs font-light text-muted-foreground/90">{time}</span>
        </div>
        <div className="text-[13px] text-primary">{message}</div>
    </div>
)

interface ThreadButtonProps {
    participants: UserFields[]
    messageCount: number
    threadID?: string
}

export const ThreadButton = ({ participants, messageCount, threadID }: ThreadButtonProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const channelID = useCurrentChannelID()
    const [, setDrawerType] = useAtom(channelDrawerAtom(channelID))

    const participantAvatars = participants.map(p => ({
        id: p.name,
        name: p.full_name || p.name,
        image: p.user_image
    }))

    const handleClick = () => {
        if (!threadID) return

        setDrawerType('')
        const basePath = location.pathname.split('/thread')[0]
        navigate(`${basePath}/thread/${threadID}`, { replace: true })
    }

    return (
        <div className="flex items-center ml-11 mt-2">
            <div
                className="inline-flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 hover:bg-accent/50 shadow-xs cursor-pointer"
                onClick={handleClick}
            >
                <GroupedAvatars users={participantAvatars} max={3} size="xs" />
                <span className="text-xs font-medium text-primary">
                    {messageCount} Messages
                </span>
                <span className="text-xs text-muted-foreground">
                    View thread
                </span>
            </div>
        </div>
    )
}