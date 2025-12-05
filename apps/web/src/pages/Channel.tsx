import ChannelHeader from '../components/features/channel/ChannelHeader/ChannelHeader';
import ChannelSettingsDrawer from '../components/features/channel/ChannelSettingsDrawer/ChannelSettingsDrawer';
import ChannelMembersDrawer from '../components/features/channel/ChannelMembersDrawer/ChannelMembersDrawer';
import ChatStream from "../components/features/message/ChatStream";
import ChatInput from '@components/features/ChatInput/ChatInput';
import { useAtomValue } from 'jotai';
import { channelDrawerAtom } from '@utils/channelAtoms';
import { useCurrentChannelID } from '@hooks/useCurrentChannelID';

export default function Channel() {

    const channelID = useCurrentChannelID()

    return (
        <div className="flex flex-col h-full">
            <ChannelHeader />
            <div className="flex flex-1 flex-row gap-0 p-0 overflow-hidden">
                {/* Main Content */}
                <div className={`transition-all duration-300 w-full h-full flex flex-col`}>
                    <ChatStream />
                    <ChatInput channelID={channelID} />
                </div>
                {/* Channel Drawer */}
                <ChannelDrawer />
            </div>
        </div>
    )
}

const ChannelDrawer = () => {

    const channelID = useCurrentChannelID()

    const drawerType = useAtomValue(channelDrawerAtom(channelID))

    const isDrawerOpen = drawerType !== ''

    return (
        <div className={`transition-all duration-300 h-full border-l bg-background shadow-lg flex flex-col ${isDrawerOpen ? 'w-[380px]' : 'w-0'}`}>
            {['info', 'files', 'links', 'threads', 'pins'].includes(drawerType) && <ChannelSettingsDrawer />}
            {drawerType === 'members' && <ChannelMembersDrawer />}
        </div>
    )
}