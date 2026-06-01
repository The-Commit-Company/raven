import { LogOut, Bell } from "lucide-react"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { Button } from "@components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import _ from "@lib/translate"
import { UserData } from "@db"

const NavUserMenu = ({ user }: { user: UserData }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" isIconButton>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <UserAvatar user={user} size="md" className="rounded-lg" showStatusIndicator={true} showBotIndicator={false} />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{_("Your Profile")}</p>
                        </TooltipContent>
                    </Tooltip>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md"
                side="right"
                align="end"
                sideOffset={8}
                alignOffset={16}
                collisionPadding={16}>
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 p-1.5 text-left text-sm">
                        <UserAvatar user={user} size="md" className="rounded-lg" showStatusIndicator={true} showBotIndicator={false} />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{user.full_name}</span>
                            <span className="truncate text-xs text-ink-gray-5">{user.name}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Bell className="h-4 w-4" />
                    <span>{_("Enable Notifications")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    <LogOut className="h-4 w-4" />
                    <span>{_("Log out")}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default NavUserMenu
