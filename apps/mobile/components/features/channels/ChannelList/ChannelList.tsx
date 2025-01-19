import { View } from "react-native"
import AllChannelsList from "./AllChannelsList"
import PinnedChannelsList from "./PinnedChannelsList"
import { Divider } from "@components/layout/Divider"

const ChannelList = ({ workspace }: { workspace: string }) => {
    return (
        <View className="flex-1">
            <PinnedChannelsList workspace={workspace} />
            <Divider />
            <AllChannelsList workspace={workspace} />
        </View>
    )
}

export default ChannelList