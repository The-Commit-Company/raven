import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { ScrollArea } from '@components/ui/scroll-area';
import ChannelMembersList from './ChannelMembersList.tsx';
import AddChannelMembers from './AddChannelMembers.tsx';

const ChannelMembersDrawer = () => {

    const [activeTab, setActiveTab] = useState('members')

    return (
        <div className="flex flex-col h-full p-3 max-w-md w-[380px]">
            <ScrollArea className="flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 gap-1 px-1 mb-2 h-8">
                        <TabsTrigger value="members" className="text-xs h-6">Members</TabsTrigger>
                        <TabsTrigger value="add" className="text-xs h-6">Add Members</TabsTrigger>
                    </TabsList>

                    <TabsContent value="members">
                        <ChannelMembersList />
                    </TabsContent>

                    <TabsContent value="add">
                        <AddChannelMembers />
                    </TabsContent>
                </Tabs>
            </ScrollArea>
        </div>
    )
}

export default ChannelMembersDrawer 