import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { useChannel } from "@hooks/useChannel";
import { useCurrentChannelID } from "@hooks/useCurrentChannelID";
import { channelDrawerAtom } from "@utils/channelAtoms";
import { useSetAtom } from "jotai";
import {
  Bell,
  BellOff,
  BellRing,
  ChevronDown,
  Settings,
  Users,
} from "lucide-react";
import _ from "@lib/translate";

const ChannelMenu = ({ channelID }: { channelID: string }) => {
    const { channel } = useChannel(channelID)
    if (!channel) {
        return null
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="default" className="h-7 rounded-sm">
                    {
                        <div className="flex items-center gap-1">
                            <ChannelIcon type={channel.type} className="h-4 w-4" />
                            <span className="text-md font-medium">
                                {channel.channel_name}
                            </span>
                        </div>
                    }
                    <ChevronDown className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                <SettingsButton />
                <MembersButton />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span>{_("Push notifications")}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-44">
                        <DropdownMenuItem
                            className="flex cursor-pointer items-center gap-2 py-2 text-sm"
                            onClick={() => { }}
                        >
                            <BellRing className="h-4 w-4" />
                            <span>{_("All Notifications")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex cursor-pointer items-center gap-2 py-2 text-sm"
                            onClick={() => { }}
                        >
                            <Bell className="h-4 w-4" />
                            <span>{_("Mentions Only")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex cursor-pointer items-center gap-2 py-2 text-sm"
                            onClick={() => { }}
                        >
                            <BellOff className="h-4 w-4" />
                            <span>{_("Mute Channel")}</span>
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const SettingsButton = () => {

    const channelID = useCurrentChannelID()

    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))

    const onOpenSettings = () => {
        setDrawerType('info')
    }

    return (
        <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm" onClick={onOpenSettings}>
            <Settings className="h-4 w-4" />
            <span>{_("Channel settings")}</span>
        </DropdownMenuItem>
    )
}

const MembersButton = () => {

    const channelID = useCurrentChannelID()

    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))

    const onOpenMembers = () => {
        setDrawerType('members')
    }

    return <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm" onClick={onOpenMembers}>
        <Users className="h-4 w-4" />
        <span>{_("Channel members")}</span>
    </DropdownMenuItem>
}

export default ChannelMenu