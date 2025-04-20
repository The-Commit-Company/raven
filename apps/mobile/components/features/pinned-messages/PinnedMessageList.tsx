import { useColorScheme } from "@hooks/useColorScheme"
import { LegendList } from "@legendapp/list"
import { Message } from "@raven/types/common/Message"
import { useLocalSearchParams } from "expo-router"
import { useFrappeGetCall } from "frappe-react-sdk"
import { View } from "react-native"
import { Text } from '@components/nativewindui/Text';
import PinnedMessageItem from "./PinnedMessageItem"
import ErrorBanner from "@components/common/ErrorBanner"

const PinnedMessageList = () => {

    const { id } = useLocalSearchParams()
    const { colors } = useColorScheme()
    const { data, error } = useFrappeGetCall<{ message: Message[] }>("raven.api.raven_message.get_pinned_messages", { 'channel_id': id }, undefined, {
        revalidateOnFocus: false
    })

    if (error) {
        return (
            <View className="p-4">
                <ErrorBanner error={error} />
            </View>
        )
    }

    return (
        <LegendList
            data={data?.message ?? []}
            ListEmptyComponent={<PinnedMessagesEmptyState />}
            renderItem={({ item }) => <PinnedMessageItem message={item} />}
            keyExtractor={(item) => item.name}
            estimatedItemSize={100}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 32, backgroundColor: colors.background }}
        />
    )
}

const PinnedMessagesEmptyState = () => {
    return (
        <View className="flex-1 justify-center items-center p-4">
            <Text className="text-muted-foreground">No pinned messages</Text>
        </View>
    )
}
export default PinnedMessageList