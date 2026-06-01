import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Button } from '@components/ui/button';
import { Loader2, X } from 'lucide-react';
import { useAtom } from 'jotai';
import { channelDrawerAtom } from '@utils/channelAtoms';
import { useCurrentChannelID } from '@hooks/useCurrentChannelID';
import ChannelMembersList from './ChannelMembersList.tsx';
import AddChannelMembers from './AddChannelMembers.tsx';
import _ from '@lib/translate';
import { useChannelMembers } from '@hooks/useChannelMembers';
import { useChannel } from '@hooks/useChannel.ts';
import { hasRole } from '@lib/permissions.ts';
import { useIsMobile } from '@hooks/use-mobile';

const ChannelMembersDrawer = () => {

    const [activeTab, setActiveTab] = useState('members')
    const channelID = useCurrentChannelID()
    const isMobile = useIsMobile()
    const [, setDrawerType] = useAtom(channelDrawerAtom(channelID))
    const { channel } = useChannel(channelID)
    const { members, memberIds, isLoading } = useChannelMembers(channelID)

    const allowSettingChange = useMemo(() => {
        if (channel?.is_admin == 1) {
            return true;
        }
        if (channel?.member_id && hasRole("Raven Admin")) {
            return true;
        }
        return false;
    }, [channel]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    const handleClose = () => {
        setDrawerType('')
    }

    if (isMobile) return null

    if (!channel) {
        return null
    }

    const showTabs = channel?.type !== 'Open' && allowSettingChange

    return (
        <div className="flex flex-col h-full max-w-md w-95">
            <div className="flex-1 overflow-hidden p-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col w-full h-full">
                    <div className="flex items-center justify-between shrink-0">
                        {showTabs ? (
                            <TabsList variant="underline" className="grid flex-1 grid-cols-2 px-1 h-8 border-0">
                                <TabsTrigger value="members">{_('Members')}</TabsTrigger>
                                <TabsTrigger value="add">{_('Add Members')}</TabsTrigger>
                            </TabsList>
                        ) : (
                            <span className="flex-1 text-sm font-medium text-ink-gray-8 px-1">{_('Members')}</span>
                        )}
                        <Button
                            variant="ghost"
                            className="h-7 w-7 shrink-0"
                            onClick={handleClose}
                            aria-label={_('Close drawer')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>

                    <div className="flex-1 min-h-0 flex flex-col overflow-x-hidden">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-4 w-4 animate-spin text-ink-gray-8/80" />
                            </div>
                        ) : (
                            <TabsContent value="members" className="flex flex-col min-h-0 m-0 data-[state=inactive]:hidden">
                                <ChannelMembersList members={members} channelID={channelID} allowSettingChange={allowSettingChange} />
                            </TabsContent>
                        )}

                        <TabsContent value="add" className="flex flex-col min-h-0 m-0 data-[state=inactive]:hidden">
                            <AddChannelMembers memberIds={memberIds} channelID={channelID} onClose={handleClose} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}

export default ChannelMembersDrawer
