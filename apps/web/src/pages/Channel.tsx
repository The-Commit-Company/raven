import ChannelHeader from '../components/features/channel/ChannelHeader/ChannelHeader';
import ChannelSettingsDrawer from '../components/features/channel/ChannelSettingsDrawer/ChannelSettingsDrawer';
import ChannelMembersDrawer from '../components/features/channel/ChannelMembersDrawer/ChannelMembersDrawer';
import ChatStream from "../components/features/message/ChatStream";
import ChatInput from '@components/features/ChatInput/ChatInput';
import ThreadDrawer from '@components/features/message/ThreadDrawer';
import { PollDrawer } from '@components/features/message/renderers/PollDrawer';
import { useAtom, useAtomValue } from 'jotai';
import { channelDrawerAtom, pollDrawerAtom } from '@utils/channelAtoms';
import { useCurrentChannelID } from '@hooks/useCurrentChannelID';
import { RefObject, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useScrollToBottom } from '@hooks/useScrollToBottom';
import { useInView } from 'react-intersection-observer';
import { useGetMessages } from '@hooks/useGetMessages';
import { useLocation } from 'react-router-dom';

const SETTINGS_DRAWER_TYPES = ['info', 'files', 'links', 'threads', 'pins'] as const

export default function Channel() {
    const channelID = useCurrentChannelID()
    const location = useLocation()
    const isSearchPage = location.pathname === "/search"
    const { searchValue, setSearchValue } = useOutletContext<{ searchValue: string, setSearchValue: (v: string) => void }>()

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
    const { threadID } = useParams<{ threadID?: string }>()
    const drawerType = useAtomValue(channelDrawerAtom(channelID))
    const pollDrawerData = useAtomValue(pollDrawerAtom(channelID))
    const [, setPollDrawerData] = useAtom(pollDrawerAtom(channelID))

    if (!threadID && drawerType === '' && !pollDrawerData) {
        return <div className="w-0" />
    }

    const width = threadID ? 'w-1/2' : ''

    return (
        <div className={`transition-all duration-300 h-full border-l bg-background flex flex-col ${width}`}>
            {threadID ? (
                <ThreadDrawer />
            ) : pollDrawerData ? (
                <PollDrawer
                    user={pollDrawerData.user}
                    poll={pollDrawerData.poll}
                    currentUserVotes={pollDrawerData.currentUserVotes}
                    onClose={() => setPollDrawerData(null)}
                />
            ) : drawerType === 'members' ? (
                <ChannelMembersDrawer />
            ) : SETTINGS_DRAWER_TYPES.includes(drawerType as typeof SETTINGS_DRAWER_TYPES[number]) ? (
                <ChannelSettingsDrawer />
            ) : null}
        </div>
    )
}