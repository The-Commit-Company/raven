import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Button } from '@components/ui/button';
import { Loader2, X } from 'lucide-react';
import { useAtom } from 'jotai';
import { channelDrawerAtom } from '@utils/channelAtoms';
import { useCurrentChannelID } from '@hooks/useCurrentChannelID';
import ChannelMembersList from './ChannelMembersList.tsx';
import AddChannelMembers from './AddChannelMembers.tsx';
import _ from '@lib/translate';
import { useChannelMembers } from '@hooks/useChannelMembers.tsx';
import { useChannel } from '@hooks/useChannel.ts';
import { hasRole } from '@lib/permissions.ts';

const ChannelMembersDrawer = () => {

    const [activeTab, setActiveTab] = useState('members')
    const channelID = useCurrentChannelID()
    const [, setDrawerType] = useAtom(channelDrawerAtom(channelID))
    const { channel } = useChannel(channelID)
    const { members, memberIds, isLoading } = useChannelMembers(channelID)

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

    const handleClose = () => {
        setDrawerType('')
    }

    const showTabs = channel?.type !== 'Open' && allowSettingChange

    return (
        <div className="flex flex-col h-full max-w-md w-[380px]">
            <div className="flex-1 overflow-hidden p-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col w-full h-[calc(100vh-6rem)]">
                    {showTabs && <div className="flex items-center justify-between shrink-0">
                        <TabsList className="grid flex-1 grid-cols-2 gap-1 px-1 h-8">
                            <TabsTrigger value="members" className="text-xs h-6">{_('Members')}</TabsTrigger>
                            <TabsTrigger value="add" className="text-xs h-6">{_('Add Members')}</TabsTrigger>
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
                    </div>}

                    {isLoading ?
                        <div className="flex items-center justify-center flex-1">
                            <Loader2 className="h-4 w-4 animate-spin text-foreground/80" />
                        </div> :
                        <TabsContent value="members">
                            <ChannelMembersList members={members} allowSettingChange={allowSettingChange} showCloseButton={!showTabs} onClose={handleClose} />
                        </TabsContent>}

                    <TabsContent value="add" className="flex-1 min-h-0 m-0 data-[state=inactive]:hidden">
                        <AddChannelMembers memberIds={memberIds} channelID={channelID} onClose={handleClose} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default ChannelMembersDrawer 