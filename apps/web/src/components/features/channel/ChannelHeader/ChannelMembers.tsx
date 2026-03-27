import { GroupedAvatars } from "@components/ui/grouped-avatars"
import { Skeleton } from "@components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { useChannelMembers } from "@hooks/useChannelMembers"
import _ from "@lib/translate"

interface ChannelMembersProps {
    onClick?: () => void
    channelID: string
}

const ChannelMembers = ({ onClick, channelID }: ChannelMembersProps) => {

    const { members, isLoading } = useChannelMembers(channelID)
    console.log(members, isLoading)
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    onClick={onClick}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                    {isLoading ? <Skeleton className="h-6 w-6 rounded-full" /> : <GroupedAvatars size="sm" users={members} />}
                </div>
            </TooltipTrigger>
            <TooltipContent>
                {_("Channel Members")}
            </TooltipContent>
        </Tooltip>
    )
}

export default ChannelMembers