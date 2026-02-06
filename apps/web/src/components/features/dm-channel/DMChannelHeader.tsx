import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { BellOff, ChevronDown, FileText, Headset, Link, Star, User } from "lucide-react"
import { useAtom } from "jotai"
import { dmDrawerAtom } from "@utils/channelAtoms"
import type { UserFields } from "@raven/types/common/UserFields"

/** Data for the peer user in a DM channel (name, avatar, etc.). full_name is optional for display. */
export type DMChannelPeer = Omit<UserFields, "full_name"> & { full_name?: string }

interface DMChannelHeaderProps {
    /** Peer user info (name, avatar). When from API this can extend to peer_user_id, etc. */
    peer: DMChannelPeer
    /** DM channel id (for drawer state) */
    channelId: string
    /** Called when user chooses "View profile" in the dropdown */
    onViewProfile?: () => void
}

export function DMChannelHeader({ peer, channelId, onViewProfile }: DMChannelHeaderProps) {
    const displayName = peer.full_name ?? peer.name ?? "Unknown"
    const [drawerType, setDrawerType] = useAtom(dmDrawerAtom(channelId))

    const onOpenFiles = () => setDrawerType(drawerType === "files" ? "" : "files")
    const onOpenLinks = () => setDrawerType(drawerType === "links" ? "" : "links")
    const handleViewProfile = () => onViewProfile?.()

    return (
        <div
            className="fixed flex items-center justify-between gap-2 border-b bg-background py-1.5 px-2 z-40 transition-[left,width] duration-200 ease-linear"
            style={{
                top: "var(--app-header-height, 36px)",
                left: "var(--sidebar-width, 380px)",
                width: "calc(100% - var(--sidebar-width, 380px))",
            }}
        >
            {/* Left: Star + Avatar/Name dropdown + Files + Links – aligned like channel header */}
            <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-0.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm shrink-0">
                                <Star className="h-3 w-3 text-foreground/80" />
                                <span className="sr-only">Star</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Star</p>
                        </TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="default"
                                className="h-8 rounded-sm gap-2 min-w-0 max-w-[240px] py-1"
                            >
                                <UserAvatar
                                    user={peer as UserFields}
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
                                View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                                <BellOff className="h-4 w-4" />
                                Mute conversation
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 rounded-sm ${drawerType === "files" ? "bg-muted" : ""}`}
                                onClick={onOpenFiles}
                            >
                                <FileText className="h-3 w-3 text-foreground/80" />
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
                                className={`h-7 w-7 rounded-sm ${drawerType === "links" ? "bg-muted" : ""}`}
                                onClick={onOpenLinks}
                            >
                                <Link className="h-3 w-3 text-foreground/80" />
                                <span className="sr-only">Links</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Links</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* Right: Call */}
            <div className="flex shrink-0 items-center gap-1 ml-auto">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm">
                            <Headset className="h-3 w-3 text-foreground/80" />
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
