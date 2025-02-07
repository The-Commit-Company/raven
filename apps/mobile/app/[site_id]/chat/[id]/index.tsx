import { TextInput, TouchableOpacity, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { Text } from '@components/nativewindui/Text';
import ChatStream from '@components/features/chat-stream/ChatStream';
import { useCurrentChannelData } from '@hooks/useCurrentChannelData';
import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon';
import { useColorScheme } from '@hooks/useColorScheme';
import ChevronLeftIcon from '@assets/icons/ChevronLeftIcon.svg';
import { useState } from 'react';
import ChannelInfoModal from '@components/features/channel-settings/ChannelInfoModal';

const Chat = () => {

    const { id } = useLocalSearchParams()
    const { channel } = useCurrentChannelData(id as string)
    const colors = useColorScheme()

    const [isModalVisible, setModalVisible] = useState(false)
    const handleOnTitlePress = () => {
        setModalVisible(true)
    }

    return (
        <>
            <Stack.Screen options={{
                headerLeft: () => {
                    return (
                        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
                            <ChevronLeftIcon stroke={colors.colors.foreground} />
                        </TouchableOpacity>
                    );
                },
                title: id as string,
                headerRight: undefined,
                headerTitle: () => {
                    return (
                        <TouchableOpacity
                            onPress={handleOnTitlePress}
                            className='flex-1'
                            activeOpacity={0.5}>
                            {channel && <View className='flex-row items-center rounded-md p-1'>
                                <ChannelIcon type={channel.type} fill={colors.colors.foreground} />
                                <Text className='ml-2 text-base font-semibold'>{id}</Text>
                            </View>}
                        </TouchableOpacity>
                    );
                }
            }} />
            <View className='flex-1'>
                <ChatStream channelID={id as string} />
                <View className='h-24 fixed bottom-0 w-full bg-card'>
                    <View className='px-4 py-2 flex-row h-full w-full gap-2 items-center justify-center'>
                        <TextInput
                            placeholder='Type a message...'
                            className='border h-12 border-border w-[80%] rounded-lg p-2' />
                        <Button size='icon'><Text>S</Text></Button>
                    </View>
                </View>
            </View>
            <ChannelInfoModal
                channel={channel}
                isModalVisible={isModalVisible}
                setModalVisible={setModalVisible} />
        </>
    )
}

export default Chat