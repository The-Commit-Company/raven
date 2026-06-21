import { LogOut, Bell, SettingsIcon } from "lucide-react"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { Button } from "@components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import _ from "@lib/translate"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { useUserCookieData } from "@hooks/useUserCookieData"
import { useMemo } from "react"
import { UserData } from "@db"
import { useSetAtom } from "jotai"
import { settingsDialogOpenTab } from "@components/features/settings/SettingsDialog"

const NavUserMenu = () => {

    const setOpenSettingsDialog = useSetAtom(settingsDialogOpenTab)

    const { myProfile } = useCurrentRavenUser()

    const userCookieData = useUserCookieData()

    const userData: UserData = useMemo(() => {
        if (myProfile) {
            return myProfile
        }
        return {
            name: userCookieData.name,
            full_name: userCookieData.full_name,
            user_image: userCookieData.user_image,
            type: 'User',
            availability_status: '',
            custom_status: '',
            enabled: 1,
            first_name: userCookieData.full_name?.split(' ')?.[0],
        }
    }, [myProfile, userCookieData])

    const logout = () => {
        // TODO: Implement logout

        // Log the user out, clear locsl storage keys, clear cache keys
    }

    // TODO: Implement notifications toggle

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" isIconButton>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <UserAvatar user={userData} size="md" className="rounded-lg" showStatusIndicator={true} showBotIndicator={false} addColoredFallback={false} />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{_("Your Profile")}</p>
                        </TooltipContent>
                    </Tooltip>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="right"
                align="end"
                sideOffset={12}
                collisionPadding={16}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 p-1.5 text-left text-sm">
                        <UserAvatar user={userData} size="md" className="rounded-lg" showStatusIndicator={true} showBotIndicator={false} addColoredFallback={false} />
                        <div className="flex flex-col gap-0.5 text-left text-sm">
                            <span className="truncate font-semibold text-ink-gray-8">{userData.full_name}</span>
                            <span className="truncate text-xs text-ink-gray-5">{userData.name}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setOpenSettingsDialog("profile")}>
                    <SettingsIcon />
                    <span>{_("Settings")}</span>
                </DropdownMenuItem>
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

