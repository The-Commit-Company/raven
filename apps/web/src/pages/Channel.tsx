import { useState } from 'react';
import ChannelHeader from '../components/features/channel/ChannelHeader/ChannelHeader';
import ChannelSettingsDrawer from '../components/features/channel/ChannelSettingsDrawer/ChannelSettingsDrawer';
import ChannelMembersDrawer from '../components/features/channel/ChannelMembersDrawer/ChannelMembersDrawer';
import ChatStream from "../components/features/message/ChatStream";
import ChatInput from '@components/features/ChatInput/ChatInput';

export default function Channel() {

    const [drawerType, setDrawerType] = useState<'settings' | 'members' | null>(null)

    const handleOpenDrawer = (type: 'settings' | 'members') => {
        console.log('Opening drawer:', type)
        setDrawerType(drawerType === type ? null : type)
    }

    const isDrawerOpen = drawerType !== null

    const channelID = "general"

    return (
        <div className="flex flex-col h-full">
            <ChannelHeader
                onOpenSettings={() => handleOpenDrawer('settings')}
                onOpenMembers={() => handleOpenDrawer('members')}
            />
            <div className="flex flex-1 flex-row gap-0 p-0 overflow-hidden">
                {/* Main Content */}
                <div className={`transition-all duration-300 ${isDrawerOpen ? 'w-[calc(100%-340px)]' : 'w-full'} h-full flex flex-col`}>
                    <ChatStream />
                    <ChatInput channelID={channelID} />
                </div>
                {/* Channel Drawer */}
                {isDrawerOpen && (
                    <div className="w-[380px] h-full border-l bg-background shadow-lg transition-all duration-300 flex flex-col">
                        {drawerType === 'settings' && <ChannelSettingsDrawer />}
                        {drawerType === 'members' && <ChannelMembersDrawer />}
                    </div>
                )}
            </div>
        </div>
    )
}