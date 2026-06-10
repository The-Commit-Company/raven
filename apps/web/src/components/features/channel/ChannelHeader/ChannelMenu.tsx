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
import { useIsMobile } from "@hooks/use-mobile";
import { channelDrawerAtom, type DrawerType } from "@utils/channelAtoms";
import { useSetAtom } from "jotai";
import {
    Bell,
    BellOff,
    BellRing,
    ChevronDown,
    Settings,
    Users,
    Files,
    Link,
    MessageSquareText
} from "lucide-react";
import _ from "@lib/translate";

export type NavProps = {
    setDrawerType: (type: DrawerType) => void
}

const ChannelMenu = ({ channelID }: { channelID: string }) => {
    const { channel } = useChannel(channelID)
    const isMobile = useIsMobile()
    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))

    if (!channel) return null

    const navProps: NavProps = { setDrawerType }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <div className="flex items-center gap-1">
                        <ChannelIcon type={channel.type} className="h-4 w-4" />
                        <span className="text-base font-medium">
                            {channel.channel_name}
                        </span>
                    </div>
                    <ChevronDown className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                <SettingsButton {...navProps} />
                <ChannelFilesButton {...navProps} />
                <ChannelLinksButton {...navProps} />
                <ChannelThreadsButton {...navProps} />
                <MembersButton {...navProps} />
                {!isMobile && (
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Bell />
                            <span>{_("Push notifications")}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-44">
                            <DropdownMenuItem onClick={() => { }}>
                                <BellRing />
                                <span>{_("All Notifications")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { }}>
                                <Bell />
                                <span>{_("Mentions Only")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { }}>
                                <BellOff />
                                <span>{_("Mute Channel")}</span>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const SettingsButton = ({ setDrawerType }: NavProps) => {
    const onOpen = () => setDrawerType('info')
    return (
        <DropdownMenuItem onClick={onOpen}>
            <Settings />
            <span>{_("Channel info")}</span>
        </DropdownMenuItem>
    )
}

export const ChannelFilesButton = ({ setDrawerType }: NavProps) => {
    const onOpen = () => setDrawerType('files')
    return (
        <DropdownMenuItem onClick={onOpen}>
            <Files />
            <span>{_("Files")}</span>
        </DropdownMenuItem>
    )
}

export const ChannelLinksButton = ({ setDrawerType }: NavProps) => {
    const onOpen = () => setDrawerType('links')
    return (
        <DropdownMenuItem onClick={onOpen}>
            <Link />
            <span>{_("Links")}</span>
        </DropdownMenuItem>
    )
}

export const ChannelThreadsButton = ({ setDrawerType }: NavProps) => {
    const onOpen = () => setDrawerType('threads')
    return (
        <DropdownMenuItem onClick={onOpen}>
            <MessageSquareText />
            <span>{_("Threads")}</span>
        </DropdownMenuItem>
    )
}

const MembersButton = ({ setDrawerType }: NavProps) => {
    const onOpen = () => setDrawerType('members')
    return (
        <DropdownMenuItem onClick={onOpen}>
            <Users />
            <span>{_("Channel members")}</span>
        </DropdownMenuItem>
    )
}

export default ChannelMenu
