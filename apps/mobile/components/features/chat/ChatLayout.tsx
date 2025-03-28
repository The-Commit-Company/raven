import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useEffect, useMemo, useRef } from 'react';
import { LegendListRef } from '@legendapp/list';
import MessageActionsBottomSheet from '@components/features/chat/ChatMessage/MessageActions/MessageActionsBottomSheet';
import { useSheetRef } from '@components/nativewindui/Sheet';
import { useAtom } from 'jotai';
import { messageActionsSelectedMessageAtom } from '@lib/ChatInputUtils';
import { Platform, View } from 'react-native';
import ChatStream from '../chat-stream/ChatStream';
import ChatInput from './ChatInput/ChatInput';
import { useCurrentChannelData } from '@hooks/useCurrentChannelData';
import { Member, useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';
import { JoinChannelBox } from './ChatFooter/JoinChannelBox';

const PADDING_BOTTOM = Platform.OS === 'ios' ? 20 : 0;

const useGradualAnimation = () => {
    const height = useSharedValue(PADDING_BOTTOM)
    useKeyboardHandler({
        onMove: (event) => {
            "worklet";
            height.value = Math.max(event.height, PADDING_BOTTOM)
        },
    }, [])

    return { height }
}
type Props = {
    channelID: string,
    isThread?: boolean
}

const ChatLayout = ({ channelID, isThread = false }: Props) => {

    const { height } = useGradualAnimation()

    const { channel } = useCurrentChannelData(channelID)
    const channelData = channel?.channelData
    const type = channel?.type

    const { myProfile } = useCurrentRavenUser()
    const { channelMembers, isLoading } = useFetchChannelMembers(channelID)

    const fakeView = useAnimatedStyle(() => {
        return {
            height: Math.abs(height.value),
            marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
        }
    })

    const scrollRef = useRef<LegendListRef>(null)

    const scrollToBottom = () => {
        scrollRef.current?.scrollToEnd({
            animated: true
        })
    }

    const onSendMessage = () => {
        scrollToBottom()
    }

    const messageActionsSheetRef = useSheetRef()

    const [selectedMessage, setSelectedMessage] = useAtom(messageActionsSelectedMessageAtom(isThread ? 'thread' : 'channel'))

    const handleSheetClose = () => {
        setSelectedMessage(null)
    }

    const channelMemberProfile: Member | null = useMemo(() => {
        if (myProfile?.name && channelMembers) {
            return channelMembers[myProfile?.name] ?? null
        }
        return null
    }, [myProfile?.name, channelMembers])

    const { canUserSendMessage, shouldShowJoinBox } = useMemo(() => {

        if (channelData?.is_archived) {
            return {
                canUserSendMessage: false,
                shouldShowJoinBox: false
            }
        }

        if (channelData?.type === 'Open') {
            return {
                canUserSendMessage: true,
                shouldShowJoinBox: false
            }
        }

        if (channelMemberProfile) {
            return {
                canUserSendMessage: true,
                shouldShowJoinBox: false
            }
        }

        const isDM = channelData?.is_direct_message === 1 || channelData?.is_self_message === 1

        // If the channel data is loaded and the member profile is loaded, then check for this, else don't show anything.
        if (!channelMemberProfile && !isDM && channelData && !isLoading) {
            return {
                shouldShowJoinBox: true,
                canUserSendMessage: false
            }
        }

        return { canUserSendMessage: false, shouldShowJoinBox: false }

    }, [channelMemberProfile, channelData, isLoading])

    useEffect(() => {
        return () => {
            setSelectedMessage(null)
        }
    }, [])

    useEffect(() => {
        if (selectedMessage) {
            messageActionsSheetRef.current?.present()
        } else {
            messageActionsSheetRef.current?.dismiss()
        }
    }, [selectedMessage])
    return (
        <>
            <View className='flex-1'>
                <ChatStream channelID={channelID} scrollRef={scrollRef} isThread={isThread} />
                {
                    canUserSendMessage &&
                    <>
                        <ChatInput channelID={channelID} onSendMessage={onSendMessage} />
                        <Animated.View style={fakeView} />
                    </>
                }
            </View>
            {
                shouldShowJoinBox &&
                <JoinChannelBox
                    channelData={channelData}
                    user={myProfile?.name ?? ""} />
            }
            <MessageActionsBottomSheet
                messageActionsSheetRef={messageActionsSheetRef}
                message={selectedMessage}
                handleClose={handleSheetClose}
            />
        </>
    )
}

export default ChatLayout