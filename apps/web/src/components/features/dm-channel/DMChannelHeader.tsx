import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { OnLeaveBadge } from "@components/common/OnLeaveBadge"
import { Bot, ChevronDown, ChevronLeft, Files, Link, MessageSquareText, Pin, SearchIcon, User, UserX } from "lucide-react"
import { useSetAtom } from "jotai"
import { commandMenuOpenAtom } from "@components/features/cmdk/atoms"
import { useNavigate } from "react-router-dom"
import { type DrawerType } from "@utils/channelAtoms"
import { useOpenChannelDrawer } from "@hooks/useChannelDrawer"
import { UserData } from "@db"
import _ from "@lib/translate"
import { useChannel } from "@hooks/useChannel"

interface DMChannelHeaderProps {
    /** Peer user info (name, avatar). When from API this can extend to peer_user_id, etc. */
    peer: UserData
    /** DM channel id (for drawer state) */
    channelID: string
}

export function DMChannelHeader({ peer, channelID }: DMChannelHeaderProps) {
    const navigate = useNavigate()
    const displayName = peer.full_name || peer.name
    const setDrawerType = useOpenChannelDrawer(channelID)
    const setCommandMenuOpen = useSetAtom(commandMenuOpenAtom)
    const { dmChannel } = useChannel(channelID)
    const pinnedCount = dmChannel?.pinned_messages_string ? dmChannel.pinned_messages_string.split("\n").length : 0
    const customStatus = peer.custom_status?.trim() || ""
    const isBot = peer.type === "Bot"
    const isDisabled = peer.enabled === 0

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
                <div className="flex items-center gap-1">
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
                            <DropdownMenuItem onClick={() => openTab("files")}>
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
                            {/* <DropdownMenuSub>
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
                            </DropdownMenuSub> */}
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
                    <OnLeaveBadge userID={peer.name} size="md" />
                    {customStatus && (
                        <Badge size="md" variant="subtle" theme="gray" title={customStatus} className="max-w-96 md:flex hidden justify-start truncate">
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
