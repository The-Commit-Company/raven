import { BadgeCheck, Bell, CreditCard, LogOut } from "lucide-react"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { Button } from "@components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"

const NavUserMenu = ({ user }: { user: { name: string, email: string, avatar: string } }) => {
    const userFields = {
        name: user.name,
        full_name: user.name,
        user_image: user.avatar,
        type: 'User' as const,
        availability_status: '' as const,
        custom_status: '',
        enabled: 1 as const,
        first_name: user.name.split(' ')[0],
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6.5 w-6.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <UserAvatar user={userFields} size="sm" className="rounded-sm" showStatusIndicator={false} showBotIndicator={false} />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Your Profile</p>
                        </TooltipContent>
                    </Tooltip>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md"
                side={"bottom"}
                align="end"
                sideOffset={4}>
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 p-1.5 text-left text-sm">
                        <UserAvatar user={userFields} size="md" className="rounded-md" showStatusIndicator={false} showBotIndicator={false} />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{user.name}</span>
                            <span className="truncate text-xs">{user.email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <BadgeCheck />
                        Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <CreditCard />
                        Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Bell />
                        Notifications
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <LogOut />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default NavUserMenu