import { useColorScheme } from "@hooks/useColorScheme"
import { LegendList } from "@legendapp/list"
import { Message } from "@raven/types/common/Message"
import { useLocalSearchParams } from "expo-router"
import { useFrappeGetCall } from "frappe-react-sdk"
import { View } from "react-native"
import { Text } from '@components/nativewindui/Text';
import PinnedMessageItem from "./PinnedMessageItem"

const PinnedMessageList = () => {

    const { id } = useLocalSearchParams()
    const { colors } = useColorScheme()
    const { data, error } = useFrappeGetCall<{ message: Message[] }>("raven.api.raven_message.get_pinned_messages", { 'channel_id': id }, undefined, {
        revalidateOnFocus: false
    })

    console.log(data)

    return (
        <LegendList
            data={data?.message ?? []}
            ListEmptyComponent={<PinnedMessagesEmptyState />}
            renderItem={({ item }) => <PinnedMessageItem message={item} />}
            keyExtractor={(item) => item.name}
            contentContainerStyle={{ paddingTop: 8, backgroundColor: colors.background }}
        />
    )
}

const PinnedMessagesEmptyState = () => {
    const { colors } = useColorScheme()
    return (
        <View className="flex-1 justify-center items-center h-full">
            <Text className="text-foreground text-base font-medium">No pinned messages</Text>
        </View>
    )
}
export default PinnedMessageList