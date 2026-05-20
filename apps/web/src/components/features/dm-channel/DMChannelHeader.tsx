import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { Bell, BellOff, BellRing, ChevronDown, FileText, Headset, Link, MessageSquareText, Pin, Star, User } from "lucide-react"
import { useAtom } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { UserData } from "@db"
import _ from "@lib/translate"
import { useChannel } from "@hooks/useChannel"
import { ChannelFilesButton, ChannelLinksButton, ChannelThreadsButton } from "../channel/ChannelHeader/ChannelMenu"

interface DMChannelHeaderProps {
    /** Peer user info (name, avatar). When from API this can extend to peer_user_id, etc. */
    peer: UserData
    /** DM channel id (for drawer state) */
    channelID: string
    /** Called when user chooses "View profile" in the dropdown */
    onViewProfile?: () => void
}

export function DMChannelHeader({ peer, channelID, onViewProfile }: DMChannelHeaderProps) {
    const displayName = peer.full_name ?? peer.name ?? "Unknown"
    const [drawerType, setDrawerType] = useAtom(channelDrawerAtom(channelID))
    const { dmChannel } = useChannel(channelID)
    const pinnedCount = dmChannel?.pinned_messages_string ? dmChannel.pinned_messages_string.split("\n").length : 0

    const onOpenPins = () => setDrawerType(drawerType === "pins" ? "" : "pins")
    const handleViewProfile = () => onViewProfile?.()

    return (
        <div
            className="fixed flex items-center justify-between gap-2 border-b bg-surface-white py-1.5 px-2 z-40 transition-[left,width] duration-200 ease-linear"
            style={{
                top: "var(--app-header-height, 36px)",
                left: "var(--sidebar-width, 380px)",
                width: "calc(100% - var(--sidebar-width, 380px))",
            }}
        >
            {/* Left: Star + Avatar/Name dropdown + Files + Links – aligned like channel header */}
            <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-0.5">
                    {/* <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm shrink-0">
                                <Star className="h-3 w-3 text-ink-gray-8/80" />
                                <span className="sr-only">Star</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Star</p>
                        </TooltipContent>
                    </Tooltip> */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="default"
                                className="h-8 rounded-sm gap-2 min-w-0 max-w-60 py-1"
                            >
                                <UserAvatar
                                    user={peer}
                                    size="sm"
                                    showStatusIndicator={false}
                                    showBotIndicator={false}
                                />
                                <span className="text-sm font-medium truncate">{displayName}</span>
                                <ChevronDown className="size-4 shrink-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuItem
                                className="flex cursor-pointer items-center gap-2 py-2 text-sm"
                                onSelect={handleViewProfile}
                            >
                                <User className="h-4 w-4" />
                                {_("View profile")}
                            </DropdownMenuItem>
                            <ChannelFilesButton channelID={channelID} />
                            <ChannelLinksButton channelID={channelID} />
                            <ChannelThreadsButton channelID={channelID} />
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

                    {pinnedCount > 0 && <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="default" className="h-7 gap-2 rounded-sm" onClick={onOpenPins}>
                                <Pin className="h-2 w-2 text-ink-gray-8/80" />
                                <span className="sr-only">{_('Pinned')}</span>
                                <span className="text-ink-gray-4 text-sm font-normal">{pinnedCount}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{_('Pinned Messages')}</p>
                        </TooltipContent>
                    </Tooltip>}

                    {/* <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 rounded-sm ${drawerType === "files" ? "bg-surface-gray-2" : ""}`}
                                onClick={onOpenFiles}
                            >
                                <FileText className="h-3 w-3 text-ink-gray-8/80" />
                                <span className="sr-only">Files</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Files</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 rounded-sm ${drawerType === "links" ? "bg-surface-gray-2" : ""}`}
                                onClick={onOpenLinks}
                            >
                                <Link className="h-3 w-3 text-ink-gray-8/80" />
                                <span className="sr-only">Links</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Links</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 rounded-sm ${drawerType === "threads" ? "bg-surface-gray-2" : ""}`}
                                onClick={onOpenThreads}
                            >
                                <MessageSquareText className="h-3 w-3 text-ink-gray-8/80" />
                                <span className="sr-only">Threads</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Threads</p>
                        </TooltipContent>
                    </Tooltip> */}
                </div>
            </div>

            {/* Right: Call */}
            <div className="flex shrink-0 items-center gap-1 ml-auto">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm">
                            <Headset className="h-3 w-3 text-ink-gray-8/80" />
                            <span className="sr-only">Start call</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Start call</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    )
}
