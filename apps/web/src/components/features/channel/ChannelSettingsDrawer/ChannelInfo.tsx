import { Bell, BellOff, BellRing } from 'lucide-react'
import { UserAvatar } from '@components/features/message/UserAvatar'
import { useChannel } from '@hooks/useChannel'
import _ from '@lib/translate'
import { useUser } from '@hooks/useUser'
import { Button } from '@components/ui/button'
import { SettingsSection } from './SettingsSection'
import { LeaveChannelButton } from "./LeaveChannelButton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { EditChannelDescriptionButton } from './EditChannelDescriptionButton'
import { useMemo } from 'react'
import { hasRole } from '@lib/permissions'

const ChannelInfo = ({ channelID }: { channelID: string }) => {
    const { channel } = useChannel(channelID)
    const { data: user } = useUser(channel?.owner ?? "")

    if (!channel) {
        return null
    }

    const allowSettingChange = useMemo(() => {
    if (channel.is_admin == 1) {
      return true;
    }
    if (channel.member_id && hasRole("Raven Admin")) {
      return true;
    }
    return false;
    }, [channel]);

    return (
        <div className="px-1 space-y-2 pb-4 pt-2">
            {/* About Section */}
            <div className="space-y-2">
                <h3 className="font-semibold text-sm">{_("About")}</h3>

                {/* Channel Name and Description */}
                <div className="p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">
                                        {channel.channel_name}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground/90">
                                    {channel.name}
                                </div>

                                {channel.channel_description && (
                                    <>
                                        <div className="flex items-center gap-2 mb-1 mt-3.5">
                                            <span className="text-sm font-medium">
                                                {_("Channel description")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground/90 max-h-20 overflow-y-auto">
                                            {channel.channel_description}
                                        </p>
                                    </>
                                )}
                            </div>
                            {allowSettingChange && (<EditChannelDescriptionButton channel={channel} />)}
                        </div>
                        {user && user.name !== "Administrator" && (
                            <>
                        <div className="border-t border-border/50"></div>
                        <div className="flex items-center gap-2">
                            <UserAvatar user={user} size="xs" className="w-5 h-5 rounded-full" showStatusIndicator={false} showBotIndicator={false} />
                            <span className="text-[13px] text-muted-foreground/80">
                                {_(`Created by {0} on {1}`, [user.full_name, channel.creation.split(" ")[0]])}
                            </span>
                        </div>
                        </>)}
                    </div>
                </div>

                {/* Push Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-start p-3 h-auto cursor-pointer font-normal bg-transparent border border-border/70 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Bell className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{_("Push Notifications")}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuItem onClick={() => {}}>
                            <div className="flex items-center gap-2">
                                <BellRing className="h-3 w-3 text-foreground/80" />
                                <span>{_("All Notifications")}</span>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {}}>
                            <div className="flex items-center gap-2">
                                <Bell className="h-3 w-3 text-foreground/80" />
                                <span>{_("Mentions Only")}</span>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {}}>
                            <div className="flex items-center gap-2">
                                <BellOff className="h-3 w-3 text-foreground/80" />
                                <span>{_("Mute Channel")}</span>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            {/* Leave Channel */}
            {channel.type !== "Open" && <LeaveChannelButton channel={channel} />}
            </div>

            {/* Settings Section */}
            <SettingsSection channel={channel} allowSettingChange={allowSettingChange} />
        </div>
    )
}

export default ChannelInfo