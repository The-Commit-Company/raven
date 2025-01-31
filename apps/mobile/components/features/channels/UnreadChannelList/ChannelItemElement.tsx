import { View } from "react-native"
import { Text } from "@components/nativewindui/Text"
import { ChannelListItem } from "@raven/types/common/ChannelListItem"

export const ChannelItemElement = ({ channel }: { channel: ChannelListItem }) => {
    return <View>
        <Text>{channel.name}</Text>
    </View>
}
