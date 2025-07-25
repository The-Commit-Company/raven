import { useState } from 'react';
import ChannelHeader from '../components/features/channel/ChannelHeader/ChannelHeader';
import ChannelSettingsDrawer from '../components/features/channel/ChannelSettingsDrawer/ChannelSettingsDrawer';
import ChatStream from "../components/features/message/ChatStream";

export default function Channel() {

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    return (
        <div className="flex flex-col h-full">
            <ChannelHeader onOpenSettings={() => setIsDrawerOpen(open => !open)} />
            <div className="flex flex-1 flex-row gap-0 p-0 overflow-hidden">
                {/* Main Content */}
                <div className={`transition-all duration-300 ${isDrawerOpen ? 'w-[calc(100%-340px)]' : 'w-full'} h-full flex flex-col`}>
                    <ChatStream />
                </div>
                {/* Channel Settings Drawer */}
                {isDrawerOpen && (
                    <div className="w-[380px] h-full border-l bg-background shadow-lg transition-all duration-300 flex flex-col">
                        <ChannelSettingsDrawer />
                    </div>
                )}
            </div>
        </div>
    )
}