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
import { channelDrawerAtom } from "@utils/channelAtoms";
import { useSetAtom } from "jotai";
import { useNavigate, useParams } from "react-router-dom";
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

const ChannelMenu = ({ channelID }: { channelID: string }) => {
    const { channel } = useChannel(channelID)
    if (!channel) {
        return null
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    {
                        <div className="flex items-center gap-1">
                            <ChannelIcon type={channel.type} className="h-4 w-4" />
                            <span className="text-base font-medium">
                                {channel.channel_name}
                            </span>
                        </div>
                    }
                    <ChevronDown className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                <SettingsButton channelID={channelID} />
                <ChannelFilesButton channelID={channelID} />
                <ChannelLinksButton channelID={channelID} />
                <ChannelThreadsButton channelID={channelID} />
                <MembersButton channelID={channelID} />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                        <Bell className="h-4 w-4 text-ink-gray-4" />
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

const SettingsButton = ({ channelID }: { channelID: string }) => {
    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const { workspaceID } = useParams()

    const onOpen = () => {
        if (isMobile) {
            navigate(`/${encodeURIComponent(workspaceID ?? '')}/${encodeURIComponent(channelID)}/settings?tab=info`)
        } else {
            setDrawerType('info')
        }
    }

    return (
        <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm" onClick={onOpen}>
            <Settings className="h-4 w-4" />
            <span>{_("Channel info")}</span>
        </DropdownMenuItem>
    )
}

export const ChannelFilesButton = ({ channelID }: { channelID: string }) => {
    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const { workspaceID } = useParams()

    const onOpen = () => {
        if (isMobile) {
            navigate(`/${encodeURIComponent(workspaceID ?? '')}/${encodeURIComponent(channelID)}/settings?tab=files`)
        } else {
            setDrawerType('files')
        }
    }

    return (
        <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm" onClick={onOpen}>
            <Files className="h-4 w-4" />
            <span>{_("Files")}</span>
        </DropdownMenuItem>
    )
}

export const ChannelLinksButton = ({ channelID }: { channelID: string }) => {
    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const { workspaceID } = useParams()

    const onOpen = () => {
        if (isMobile) {
            navigate(`/${encodeURIComponent(workspaceID ?? '')}/${encodeURIComponent(channelID)}/settings?tab=links`)
        } else {
            setDrawerType('links')
        }
    }

    return (
        <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm" onClick={onOpen}>
            <Link className="h-4 w-4" />
            <span>{_("Links")}</span>
        </DropdownMenuItem>
    )
}

export const ChannelThreadsButton = ({ channelID }: { channelID: string }) => {
    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const { workspaceID } = useParams()

    const onOpen = () => {
        if (isMobile) {
            navigate(`/${encodeURIComponent(workspaceID ?? '')}/${encodeURIComponent(channelID)}/settings?tab=threads`)
        } else {
            setDrawerType('threads')
        }
    }

    return (
        <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm" onClick={onOpen}>
            <MessageSquareText className="h-4 w-4" />
            <span>{_("Threads")}</span>
        </DropdownMenuItem>
    )
}

const MembersButton = ({ channelID }: { channelID: string }) => {
    const setDrawerType = useSetAtom(channelDrawerAtom(channelID))

    const onOpenMembers = () => {
        setDrawerType('members')
    }

    return (
        <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm" onClick={onOpenMembers}>
            <Users className="h-4 w-4" />
            <span>{_("Channel members")}</span>
        </DropdownMenuItem>
    )
}

export default ChannelMenu
