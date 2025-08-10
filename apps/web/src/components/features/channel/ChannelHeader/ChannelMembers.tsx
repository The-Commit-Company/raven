import { GroupedAvatars } from "@components/ui/grouped-avatars"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"

interface ChannelMembersProps {
    onClick?: () => void
}

const ChannelMembers = ({ onClick }: ChannelMembersProps) => {

    const users = [
        { id: "1", name: "Alex Johnson", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
        { id: "2", name: "Sam Smith", image: undefined },
        { id: "3", name: "Taylor Reed", image: undefined },
        { id: "4", name: "John Doe", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
        { id: "5", name: "Jane Smith", image: "https://images.unsplash.com/photo-1494790108755-2616b612b5c3?w=150&h=150&fit=crop&crop=face" },
        { id: "6", name: "Desirae Lipshutz", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
        { id: "7", name: "Brandon Franci", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
    ]

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    onClick={onClick}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <GroupedAvatars size="sm" users={users} />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>Channel Members</p>
            </TooltipContent>
        </Tooltip>
    )
}

export default ChannelMembers