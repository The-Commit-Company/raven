import ChannelHeader from '../components/features/channel/ChannelHeader/ChannelHeader';
import ChannelSettingsDrawer from '../components/features/channel/ChannelSettingsDrawer/ChannelSettingsDrawer';
import ChannelMembersDrawer from '../components/features/channel/ChannelMembersDrawer/ChannelMembersDrawer';
import ChatStream from "../components/features/message/ChatStream";
import ChatInput from '@components/features/ChatInput/ChatInput';
import { useAtomValue } from 'jotai';
import { channelDrawerAtom } from '@utils/channelAtoms';
import { useCurrentChannelID } from '@hooks/useCurrentChannelID';
import { RefObject, useRef } from 'react';
import { useScrollToBottom } from '@hooks/useScrollToBottom';
import { useInView } from 'react-intersection-observer';
import { useGetMessages } from '@hooks/useGetMessages';

export default function Channel() {

    const channelID = useCurrentChannelID()

    return (
        <div className="flex flex-col h-full">
            <ChannelHeader />
            <div className="flex flex-1 flex-row gap-0 p-0 overflow-hidden">
                <ChannelContent channelID={channelID} />
                <ChannelDrawer />
            </div>
        </div>
    )
}

const ChannelContent = ({ channelID }: { channelID: string }) => {

    /** To track the resizing of the chat input if the user types a long message */
    const chatInputRef = useRef<HTMLFormElement>(null)
    const scrollableRef = useRef<HTMLDivElement>(null)

    const { data, isLoading: isMessagesFetching, error: isMessagesError } = useGetMessages(channelID)

    const [startRef] = useInView({
        // skip: isMessagesError || isMessagesFetching || isMessagesFetchingNextPage || !hasMessagesNextPage,
        // onChange: (startInView) => {
        //   if (!startInView) return

        //   messagesFetchNextPage()
        // }
    })
    const [endRef, endInView] = useInView()

    // this keeps the user scrolled to the bottom as new message come in
    useScrollToBottom({
        stickyRef: chatInputRef as RefObject<HTMLElement>,
        scrollElementRef: scrollableRef as RefObject<HTMLElement>,
    })

    return <div className={`transition-all duration-300 w-full h-full flex flex-col`}>
        <div ref={scrollableRef} className='relative flex flex-1 flex-col overflow-y-auto'>
            <div className='flex w-full flex-1 flex-col lg:mx-auto'>
                <div className='left-0 right-0 -mb-px h-px flex-none' ref={startRef} />

                {/* {hasMessagesNextPage && (
                <div
                    className={cn('flex flex-1 items-center justify-center py-4', {
                    'opacity-0': isMessagesLoading
                    })}
                >
                    <LoadingSpinner />
                </div>
                )} */}

                {/* TODO: Start of channel component */}
                <ChatStream messages={data?.messages} />
                <div className='left-0 right-0 -mt-px h-px flex-none' ref={endRef} />
            </div>
        </div>
        <div>
            <ChatInput channelID={channelID} ref={chatInputRef} />
        </div>
    </div>
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