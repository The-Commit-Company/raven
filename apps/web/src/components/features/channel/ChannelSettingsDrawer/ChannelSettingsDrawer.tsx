import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Badge } from '@components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { ScrollArea } from '@components/ui/scroll-area';
import { User, Calendar, Star, Tag, Clock, ChevronRight } from 'lucide-react';
import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel';
import { RavenUser } from '@raven/types/Raven/RavenUser';
import ChannelThreads from './ChannelThreads';
import ChannelFiles from './ChannelFiles';
import ChannelPins from './ChannelPins';
import ChannelLinks from './ChannelLinks';

interface ChannelSettingsDrawerProps {
    channel?: RavenChannel
}

const ChannelSettingsDrawer: React.FC<ChannelSettingsDrawerProps> = ({ channel }) => {

    const [activeTab, setActiveTab] = useState('info')

    const mockChannel = channel || {
        channel_name: "Design Team",
        creation: "2024-05-28",
        owner: "andrew.miller",
        type: "Private" as const,
        channel_description: "Design team collaboration channel"
    }

    const mockCreator: RavenUser = {
        name: "andrew.miller",
        full_name: "Andrew M.",
        user_image: "",
        first_name: "Andrew",
        enabled: 1,
        type: "User",
        availability_status: "Available",
        custom_status: "",
        creation: "",
        modified: "",
        owner: "",
        modified_by: "",
        docstatus: 0
    }

    return (
        <div className="flex flex-col h-full p-3 max-w-md w-[380px]">
            <ScrollArea className="flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 gap-1 px-1 mb-2 h-8">
                        <TabsTrigger value="info" className="text-xs h-6">Info</TabsTrigger>
                        <TabsTrigger value="files" className="text-xs h-6">Files</TabsTrigger>
                        <TabsTrigger value="links" className="text-xs h-6">Links</TabsTrigger>
                        <TabsTrigger value="threads" className="text-xs h-6">Threads</TabsTrigger>
                        <TabsTrigger value="pins" className="text-xs h-6">Pins</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-6">
                        {/* Main info section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">Main info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Creator</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6">
                                            <AvatarImage src={mockCreator.user_image} />
                                            <AvatarFallback className="text-xs">
                                                {mockCreator.full_name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{mockCreator.full_name}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Date of creation</span>
                                    </div>
                                    <span className="text-sm">{mockChannel.creation}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Status</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                        Active
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Tags</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm">13</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Tasks</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm">4</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </TabsContent>

                    <TabsContent value="threads">
                        <ChannelThreads />
                    </TabsContent>

                    <TabsContent value="files">
                        <ChannelFiles />
                    </TabsContent>

                    <TabsContent value="links">
                        <ChannelLinks />
                    </TabsContent>

                    <TabsContent value="pins">
                        <ChannelPins />
                    </TabsContent>

                </Tabs>
            </ScrollArea>
        </div>
    )
}

export default ChannelSettingsDrawer