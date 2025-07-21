import { useState } from 'react';
import ChannelHeader from '../components/features/channel/ChannelHeader/ChannelHeader';
import ChannelSettingsDrawer from '../components/features/channel/ChannelSettingsDrawer/ChannelSettingsDrawer';

export default function Channel() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <div className="flex flex-col h-full">
            <ChannelHeader onOpenSettings={() => setIsDrawerOpen(open => !open)} />
            <div className="flex flex-1 flex-row gap-0 p-0 overflow-hidden">
                {/* Main Content */}
                <div className={`transition-all duration-300 ${isDrawerOpen ? 'w-[calc(100%-340px)]' : 'w-full'} h-full flex flex-col`}>
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        {Array.from({ length: 24 }).map((_, index) => (
                            <div
                                key={index}
                                className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                            />
                        ))}
                    </div>
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