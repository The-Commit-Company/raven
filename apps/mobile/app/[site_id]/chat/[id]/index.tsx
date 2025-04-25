import { Stack, useLocalSearchParams } from 'expo-router';
import { useCurrentChannelData } from '@hooks/useCurrentChannelData';
import { useColorScheme } from '@hooks/useColorScheme';
import DMChannelHeader from '@components/features/chat/ChatHeader/DMChannelHeader';
import ChannelHeader from '@components/features/chat/ChatHeader/ChannelHeader';
import HeaderBackButton from '@components/common/Buttons/HeaderBackButton';
import ChatLayout from '@components/features/chat/ChatLayout';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';

const Chat = () => {

    const { id } = useLocalSearchParams()
    const { channel } = useCurrentChannelData(id as string)
    const { colors } = useColorScheme()

    return (
        <>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: colors.background },
                headerLeft: () => <HeaderBackButton />,
                title: id as string,
                headerTitle: () => {
                    return (
                        <>
                            {channel && <>
                                {channel.type === 'dm' ?
                                    <DMChannelHeader channelData={channel.channelData} /> :
                                    <ChannelHeader channelData={channel.channelData} />
                                }
                            </>}
                        </>
                    )
                }
            }} />

            <ChatLayout channelID={id as string} pinnedMessagesString={channel?.channelData.pinned_messages_string} />

        </>
    )
}

export default Chat

export const ErrorBoundary = CommonErrorBoundary