import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { ScrollArea } from '@components/ui/scroll-area';
import { Button } from '@components/ui/button';
import { X } from 'lucide-react';
import { useAtom } from 'jotai';
import { channelDrawerAtom } from '@utils/channelAtoms';
import { useCurrentChannelID } from '@hooks/useCurrentChannelID';
import ChannelMembersList from './ChannelMembersList.tsx';
import AddChannelMembers from './AddChannelMembers.tsx';

const ChannelMembersDrawer = () => {

    const [activeTab, setActiveTab] = useState('members')
    const channelID = useCurrentChannelID()
    const [, setDrawerType] = useAtom(channelDrawerAtom(channelID))

    const handleClose = () => {
        setDrawerType('')
    }

    return (
        <div className="flex flex-col h-full max-w-md w-[380px]">
            <div className="flex-1 overflow-hidden p-3">
                <ScrollArea className="h-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex items-center justify-between">
                            <TabsList className="grid flex-1 grid-cols-2 gap-1 px-1 h-8">
                                <TabsTrigger value="members" className="text-xs h-6">Members</TabsTrigger>
                                <TabsTrigger value="add" className="text-xs h-6">Add Members</TabsTrigger>
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

                        <TabsContent value="members">
                            <ChannelMembersList />
                        </TabsContent>

                        <TabsContent value="add">
                            <AddChannelMembers />
                        </TabsContent>
                    </Tabs>
                </ScrollArea>
            </div>
        </div>
    )
}

export default ChannelMembersDrawer 