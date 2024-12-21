

import { View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { Text } from '@components/nativewindui/Text';

const Chat = () => {
    const { id } = useLocalSearchParams();

    console.log("Channel id: ", id);

    return (
        <>
            <Stack.Screen options={{
                headerBackButtonDisplayMode: 'minimal',
                title: id as string,
            }} />
            <View>

                <Text>{id}</Text>
                <Button onPress={() => router.push('./channel-settings', { relativeToDirectory: true })} >
                    <Text>Go to Channel Settings</Text>
                </Button>
            </View>
        </>
    )
}

export default Chat