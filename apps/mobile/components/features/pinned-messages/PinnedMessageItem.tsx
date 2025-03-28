import { Message } from "@raven/types/common/Message"
import { View } from "react-native"
import { Text } from '@components/nativewindui/Text'

const PinnedMessageItem = ({ message }: { message: Message }) => {
    return (
        <View>
            <Text>{message.name}</Text>
        </View>
    )
}

export default PinnedMessageItem