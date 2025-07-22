import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Switch } from '@components/ui/switch';
import { User, Edit, Lock, Globe, Archive, Trash2, Bell } from 'lucide-react';

const ChannelInfo = () => {

    const mockCreator = {
        user_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        full_name: 'Janhvi Patil',
    }

    const mockChannel = {
        name: 'v3-ui-updates',
        description: 'A channel where you can critique the new UI and suggest improvements',
        creation: '2024-07-13',
        status: 'Active',
        type: 'Public',
        tags: 13,
        tasks: 4,
        pushNotifications: true,
    }

    return (
        <div className="px-1 space-y-2 pb-4">
            {/* About Section */}
            <div className="space-y-2">
                <h3 className="font-semibold text-sm">About</h3>

                {/* Channel Name and Description */}
                <div className="p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">Channel name</span>
                                </div>
                                <div className="text-sm text-muted-foreground/90 mb-3.5">{mockChannel.name}</div>

                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">Channel description</span>
                                </div>
                                <p className="text-sm text-muted-foreground/90">{mockChannel.description}</p>
                            </div>
                            <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground flex-shrink-0 mt-1" />
                        </div>

                        <div className="border-t border-border/50"></div>

                        <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5 rounded-full">
                                <AvatarImage src={mockCreator.user_image} />
                                <AvatarFallback className="text-xs">
                                    {mockCreator.full_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-[13px] text-muted-foreground/80">
                                Created by {mockCreator.full_name} on {mockChannel.creation}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Push Notifications */}
                <div className="p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Push Notifications</span>
                        </div>
                        <Switch checked={mockChannel.pushNotifications} />
                    </div>
                </div>
            </div>

            {/* Settings Section */}
            <div className="space-y-2 mt-6">
                <h3 className="font-semibold text-sm">Settings</h3>

                <div className="space-y-2">
                    {/* Change to Private Channel */}
                    <div className="p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Change to a private channel</span>
                        </div>
                    </div>

                    {/* Change to Open Channel */}
                    <div className="p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Change to an open channel</span>
                        </div>
                    </div>

                    {/* Archive Channel */}
                    <div className="p-3 border border-border/70 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Archive className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Archive channel</span>
                        </div>
                    </div>

                    {/* Leave Channel */}
                    <div className="p-3 border border-border/70 rounded-lg hover:bg-red-200/20 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-destructive" />
                            <span className="text-sm text-destructive">Leave channel</span>
                        </div>
                    </div>

                    {/* Delete Channel */}
                    <div className="p-3 border border-border/70 rounded-lg hover:bg-red-200/20 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <Trash2 className="w-4 h-4 text-destructive" />
                            <span className="text-sm text-destructive">Delete channel</span>
                        </div>
                    </div>
                </div>

                {/* Permissions Info */}
                <div className="space-y-1 px-1">
                    <p className="text-xs text-muted-foreground">Only channel admins are allowed to change the channel settings</p>
                    <p className="text-xs text-muted-foreground">General channel cannot be modified/ removed</p>
                </div>
            </div>
        </div>
    )
}

export default ChannelInfo