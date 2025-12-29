import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { ScrollArea } from '@components/ui/scroll-area';
import { Button } from '@components/ui/button';
import { X } from 'lucide-react';
import ChannelThreads from './ChannelThreads';
import ChannelFiles from './ChannelFiles';
import ChannelPins from './ChannelPins';
import ChannelLinks from './ChannelLinks';
import ChannelInfo from './ChannelInfo';
import { useAtom } from 'jotai';
import { channelDrawerAtom } from '@utils/channelAtoms';
import { useCurrentChannelID } from '@hooks/useCurrentChannelID';

const ChannelSettingsDrawer = () => {

    const channelID = useCurrentChannelID()

    const [drawerType, setDrawerType] = useAtom(channelDrawerAtom(channelID))

    const onTabChange = (value: string) => {
        setDrawerType(value as '' | 'files' | 'pins' | 'links' | 'threads' | 'info')
    }

    const handleClose = () => {
        setDrawerType('')
    }

    return (
        <div className="flex flex-col h-full max-w-md w-[380px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
                <h2 className="text-sm font-medium">Channel Settings</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleClose}
                    aria-label="Close drawer"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
            <div className="flex-1 overflow-hidden p-3">
                <ScrollArea className="h-full">
                <Tabs value={drawerType} onValueChange={onTabChange} className="w-full">
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
        </div>
    )
}

export default ChannelSettingsDrawer