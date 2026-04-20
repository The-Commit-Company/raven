import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { ScrollArea } from '@components/ui/scroll-area';
import { Button } from '@components/ui/button';
import { X } from 'lucide-react';
import ChannelThreads from './ChannelThreads';
import ChannelFiles from './ChannelFiles';
import ChannelPins from './ChannelPins';
import ChannelLinks from './ChannelLinks';
import ChannelInfo from './ChannelInfo';
import { UserProfileDrawer } from '@components/features/dm-channel/UserProfileDrawer';
import { useAtom } from 'jotai';
import { channelDrawerAtom } from '@utils/channelAtoms';
import { useCurrentChannelID } from '@hooks/useCurrentChannelID';
import type { UserData } from '@db';
import _ from '@lib/translate'

interface ChannelSettingsDrawerProps {
    peerUser?: UserData
}

const ChannelSettingsDrawer = ({ peerUser }: ChannelSettingsDrawerProps) => {

    const channelID = useCurrentChannelID()

    const [drawerType, setDrawerType] = useAtom(channelDrawerAtom(channelID))

    const onTabChange = (value: string) => {
        setDrawerType(value as '' | 'files' | 'pins' | 'links' | 'threads' | 'info')
    }

    const handleClose = () => {
        setDrawerType('')
    }

    return (
        <div className="flex flex-col h-full max-w-md w-95">
            <div className="flex-1 overflow-hidden p-3">
                <ScrollArea className="h-full">
                    <Tabs value={drawerType} onValueChange={onTabChange} className="w-full">
                        <div className="flex items-center justify-between">
                            <TabsList className="grid flex-1 grid-cols-5 gap-1 px-1 h-8">
                                {peerUser ? (
                                    <TabsTrigger value="info" className="text-xs h-6">{_('Profile')}</TabsTrigger>
                                ) : (
                                    <TabsTrigger value="info" className="text-xs h-6">{_('Info')}</TabsTrigger>
                                )}
                                <TabsTrigger value="files" className="text-xs h-6">{_('Files')}</TabsTrigger>
                                <TabsTrigger value="links" className="text-xs h-6">{_('Links')}</TabsTrigger>
                                <TabsTrigger value="threads" className="text-xs h-6">{_('Threads')}</TabsTrigger>
                                <TabsTrigger value="pins" className="text-xs h-6">{_('Pins')}</TabsTrigger>
                            </TabsList>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 ml-2 shrink-0"
                                onClick={handleClose}
                                aria-label="Close drawer"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>

                        <TabsContent value="info">
                            {peerUser ? (
                                <UserProfileDrawer user={peerUser} />
                            ) : (
                                <ChannelInfo channelID={channelID} />
                            )}
                        </TabsContent>

                        <TabsContent value="threads">
                            <ChannelThreads channelID={channelID} />
                        </TabsContent>

                        <TabsContent value="files">
                            <ChannelFiles channelID={channelID} />
                        </TabsContent>

                        <TabsContent value="links">
                            <ChannelLinks channelID={channelID} />
                        </TabsContent>

                        <TabsContent value="pins">
                            <ChannelPins channelID={channelID} />
                        </TabsContent>
                    </Tabs>
                </ScrollArea>
            </div>
        </div>
    )
}

export default ChannelSettingsDrawer