import { Clock, Hash } from "lucide-react"
import { Button } from "@components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@components/ui/dropdown-menu"
import { UserAvatar } from '@components/features/message/UserAvatar'

type Recents = {
    channel_name: string,
    type: "Private" | "Public" | "Open",
    is_direct_message: 0 | 1,
    peer_full_name?: string,
    peer_avatar_url?: string
}

const Recents = () => {

    const recentlyVisitedChannels: Recents[] = [
        {
            channel_name: "general",
            type: "Open",
            is_direct_message: 0
        },
        {
            channel_name: "Administrator _ jane.smith@example.com",
            peer_full_name: "Jane Smith",
            peer_avatar_url: "https://i.pravatar.cc/150?u=jane.smith@example.com",
            type: "Private",
            is_direct_message: 1
        },
        {
            channel_name: "Developers",
            type: "Public",
            is_direct_message: 0
        }
    ]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm">
                    <Clock className="h-3 w-3" />
                    <span className="sr-only">Recents</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Recents</DropdownMenuLabel>
                {recentlyVisitedChannels.map((channel, index) => (
                    <DropdownMenuItem
                        key={index}
                        className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                        {channel.is_direct_message ? (
                            <UserAvatar
                                user={{
                                    name: channel.peer_full_name || '',
                                    full_name: channel.peer_full_name || '',
                                    user_image: channel.peer_avatar_url || '',
                                    type: 'User' as const,
                                    availability_status: '' as const,
                                    custom_status: '',
                                    enabled: 1 as const,
                                    first_name: channel.peer_full_name ? channel.peer_full_name.split(' ')[0] : '',
                                }}
                                size="xs"
                                className="h-5 w-5 rounded-sm"
                                showStatusIndicator={false}
                                showBotIndicator={false}
                            />
                        ) : (
                            <span className="flex h-5 w-5 items-center justify-center">
                                <Hash className="h-4 w-4" />
                            </span>
                        )}
                        <span className="truncate">
                            {channel.is_direct_message
                                ? channel.peer_full_name
                                : channel.channel_name}
                        </span>
                    </DropdownMenuItem>
                ))}

            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default Recents