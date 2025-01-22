import { View } from "react-native"
import AllChannelsList from "./AllChannelsList"
import PinnedChannelsList from "./PinnedChannelsList"
import UnreadChannelsList from "./UnreadChannelsList"

const ChannelList = ({ workspace }: { workspace: string }) => {
    return (
        <View className="flex-1">
            <UnreadChannelsList workspace={workspace} />
            <PinnedChannelsList workspace={workspace} />
            <AllChannelsList workspace={workspace} />
        </View>
    )
}

export default ChannelList