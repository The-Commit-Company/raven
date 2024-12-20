

import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router';

const Chat = () => {
    const { id } = useLocalSearchParams();

    console.log("Channel id: ", id);

    return (
        <View>
            <Text>{id}</Text>
        </View>
    )
}

export default Chat