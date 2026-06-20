import { Badge } from "@components/ui/badge"
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
import { Bell, BellOff, BellRing, Bot, ChevronDown, ChevronLeft, Command, Files, Headset, Link, MessageSquareText, Palmtree, Pin, SearchIcon, User, UserX } from "lucide-react"
import { useAtom, useSetAtom } from "jotai"
import { commandMenuOpenAtom } from "@components/features/cmdk/atoms"
import { useNavigate } from "react-router-dom"
import { channelDrawerAtom, type DrawerType } from "@utils/channelAtoms"
import { UserData } from "@db"
import _ from "@lib/translate"
import { useChannel } from "@hooks/useChannel"
import { useIsUserOnLeave } from "@hooks/useIsUserOnLeave"

interface DMChannelHeaderProps {
    /** Peer user info (name, avatar). When from API this can extend to peer_user_id, etc. */
    peer: UserData
    /** DM channel id (for drawer state) */
    channelID: string
}

export function DMChannelHeader({ peer, channelID }: DMChannelHeaderProps) {
    const navigate = useNavigate()
    const displayName = peer.full_name || peer.name
    const [, setDrawerType] = useAtom(channelDrawerAtom(channelID))
    const setCommandMenuOpen = useSetAtom(commandMenuOpenAtom)
    const { dmChannel } = useChannel(channelID)
    const pinnedCount = dmChannel?.pinned_messages_string ? dmChannel.pinned_messages_string.split("\n").length : 0
    const customStatus = peer.custom_status?.trim() || ""
    const isBot = peer.type === "Bot"
    const isDisabled = peer.enabled === 0
    const isOnLeave = useIsUserOnLeave(peer.name)

    const openTab = (tab: Exclude<DrawerType, "" | "members">) => {
        setDrawerType(tab)
    }

    return (
        <div
            // h-11 (not padding-driven): AppHeader matches this height on
            // mobile so list ↔ channel navigation doesn't jump the header
            className="flex h-11 w-full shrink-0 items-center justify-between border-b border-outline-gray-2 bg-surface-base px-2"
        >
            <div className="flex items-center gap-1 md:hidden">
                <Button
                    variant="ghost"
                    size="md"
                    isIconButton
                    onClick={() => navigate('/dm-channel')}
                    aria-label={_('Back')}
                >
                    <ChevronLeft />
                </Button>
            </div>

            {/* Left: Avatar/Name dropdown + pinned chip */}
            <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-0.5">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="px-1.5">
                            <Button
                                variant="ghost"
                                size="md"
                                className="gap-2 min-w-0 max-w-60 py-1"
                            >
                                <UserAvatar
                                    user={peer}
                                    size="sm"
                                />
                                <span className="text-sm font-medium truncate">{displayName}</span>
                                <ChevronDown className="size-4 shrink-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuItem onClick={() => openTab("info")}>
                                <User />
                                <span>{_("View profile")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openTab("files")}>
                                <Files />
                                <span>{_("Files")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openTab("links")}>
                                <Link />
                                <span>{_("Links")}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openTab("threads")}>
                                <MessageSquareText />
                                <span>{_("Threads")}</span>
                            </DropdownMenuItem>
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
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {isBot && (
                        <Badge size="md" variant="subtle" theme="violet">
                            <Bot />
                            {_("Bot")}
                        </Badge>
                    )}
                    {isDisabled && (
                        <Badge size="md" variant="subtle" theme="gray">
                            <UserX />
                            {_("Disabled")}
                        </Badge>
                    )}
                    {isOnLeave && (
                        <Badge size="md" variant="subtle" theme="orange">
                            <Palmtree />
                            {_("On Leave")}
                        </Badge>
                    )}
                    {customStatus && (
                        <Badge size="md" variant="subtle" theme="gray">
                            {customStatus}
                        </Badge>
                    )}

                    {pinnedCount > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2" onClick={() => openTab("pins")}>
                                    <Pin className="h-2 w-2 text-ink-gray-8/80" />
                                    <span className="sr-only">{_('Pinned')}</span>
                                    <span className="text-ink-gray-4 text-sm font-normal">{pinnedCount}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{_('Pinned Messages')}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* Right: Command menu (mobile) + Call */}
            <div className="items-center gap-1 ml-auto md:hidden flex">
                <Button
                    variant="ghost"
                    size="md"
                    isIconButton
                    onClick={() => setCommandMenuOpen(true)}
                    aria-label={_("Command Menu")}
                >
                    <SearchIcon />
                </Button>
                {/* <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" isIconButton>
                            <Headset className="h-4 w-4 md:h-3 md:w-3 text-ink-gray-8/80" />
                            <span className="sr-only">{_("Start call")}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{_("Start call")}</p>
                    </TooltipContent>
                </Tooltip> */}
            </div>
        </div>
    )
}
