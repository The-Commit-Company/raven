import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { ScrollArea } from '@components/ui/scroll-area';
import ChannelThreads from './ChannelThreads';
import ChannelFiles from './ChannelFiles';
import ChannelPins from './ChannelPins';
import ChannelLinks from './ChannelLinks';
import ChannelInfo from './ChannelInfo';

const ChannelSettingsDrawer = () => {

    const [activeTab, setActiveTab] = useState('info')

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

                    <TabsContent value="info">
                        <ChannelInfo />
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