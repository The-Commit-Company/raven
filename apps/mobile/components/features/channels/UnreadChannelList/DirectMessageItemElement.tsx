import { View } from "react-native"
import { Text } from "@components/nativewindui/Text"
import { DMChannelListItem } from "@raven/types/common/ChannelListItem"

const DirectMessageItemElement = ({ dm }: { dm: DMChannelListItem }) => {
    return <View>
        <Text>{dm.name}</Text>
    </View>
}

export default DirectMessageItemElement