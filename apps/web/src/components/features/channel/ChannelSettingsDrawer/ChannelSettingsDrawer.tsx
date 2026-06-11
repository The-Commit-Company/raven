import { useHotkeys } from 'react-hotkeys-hook';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
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

    const isDM = !!peerUser

    // useHotkeys keeps the callback fresh, so this always closes the drawer for the *current* channelID
    useHotkeys('esc', () => handleClose(), { enableOnFormTags: true })

    const onTabChange = (value: string) => {
        setDrawerType(value as '' | 'files' | 'pins' | 'links' | 'threads' | 'info')
    }

    const handleClose = () => {
        setDrawerType('')
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-hidden p-3">
                <Tabs value={drawerType} onValueChange={onTabChange} className="flex flex-col h-full w-full">
                    <div className="flex items-center justify-between shrink-0">
                        <TabsList variant="underline" className="grid flex-1 grid-cols-5 gap-1 px-1 h-8 border-0">
                            <TabsTrigger value="info">{isDM ? _('Profile') : _('Info')}</TabsTrigger>
                            <TabsTrigger value="files">{_('Files')}</TabsTrigger>
                            <TabsTrigger value="links">{_('Links')}</TabsTrigger>
                            <TabsTrigger value="threads">{_('Threads')}</TabsTrigger>
                            <TabsTrigger value="pins">{_('Pins')}</TabsTrigger>
                        </TabsList>
                        <Button
                            variant="ghost"
                            className="h-7 w-7 shrink-0"
                            onClick={handleClose}
                            aria-label="Close drawer"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
                    </div>
                </Tabs>
            </div>
        </div>
    )
}

export default ChannelSettingsDrawer